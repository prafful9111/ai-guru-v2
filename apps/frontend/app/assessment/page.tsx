"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Sparkles,
  Globe,
  Volume2,
  CheckCircle2,
  Clock,
  ChevronRight,
  FileText,
  Info,
  X,
} from "lucide-react";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Scenario, AssessmentReport } from "../../types";
import { VoiceAgent } from "../../components/voice-agent";
import { Logo } from "../../components/logo";
import { getSystemInstruction } from "../../lib/prompts";
import { useAuth } from "../../context/auth-context";
import { generateReport, ReportResult } from "../../lib/generateReport";
import {
  createAssessmentSession,
  saveStageResult,
  completeAssessmentSession,
  uploadAudio,
  uploadVideo,
  getGeminiToken,
} from "../../lib/actions";
import { OnboardingGuide } from "../../components/onboarding-guide";

type Stage = "intro" | "roleplay" | "test" | "finished";
type AgentStage = Exclude<Stage, "finished">;

const AGENT_STAGES: AgentStage[] = ["intro", "roleplay", "test"];
const DEFAULT_LIVE_MODEL = "gemini-2.5-flash-native-audio-preview-12-2025";
const STAGE_LABELS: Record<AgentStage, string> = {
  intro: "Introduction",
  roleplay: "Roleplay Round",
  test: "Verbal Test",
};

const ROLEPLAY_DURATION_SECONDS = 240; // 4 minutes
const TEST_DURATION_SECONDS = 120; // 2 minutes

// Audio Helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel]! / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // Clamp values to [-1, 1] to prevent overflow when converting to Int16
    const s = Math.max(-1, Math.min(1, data[i]!));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: "audio/pcm;rate=16000",
  };
}

function AssessmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get("scenarioId");
  const level = searchParams.get("level");

  const { user: authUser, loading: authLoading } = useAuth();

  const activeStages = React.useMemo(
    () =>
      authUser?.isDemo
        ? (["intro", "roleplay"] as const)
        : (["intro", "roleplay", "test"] as const),
    [authUser?.isDemo],
  );

  // Local state for scenario since we fetch it by ID
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loadingScenario, setLoadingScenario] = useState(true);

  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [currentStage, setCurrentStage] = useState<Stage>("intro");
  const [agentState, setAgentState] = useState<
    "idle" | "listening" | "speaking"
  >("idle");
  const [isMicOn, setIsMicOn] = useState(true);
  const [showHelperText, setShowHelperText] = useState(false);

  // Timer State
  const [timeLeft, setTimeLeft] = useState(ROLEPLAY_DURATION_SECONDS);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [stageSecondsElapsed, setStageSecondsElapsed] = useState(0);

  const shouldBlink = React.useMemo(() => {
    if (currentStage === "intro") return stageSecondsElapsed >= 30;
    if (currentStage === "roleplay") return stageSecondsElapsed >= 150;
    if (currentStage === "test") return stageSecondsElapsed >= 60;
    return false;
  }, [currentStage, stageSecondsElapsed]);

  // 'Say Hi' Animation State
  const [showSayHi, setShowSayHi] = useState(false);

  // Report Data State
  const [reportData, setReportData] = useState<AssessmentReport>({
    intro: { audio: null, transcript: "" },
    roleplay: { audio: null, transcript: "" },
    test: { audio: null, transcript: "" },
  });

  // Setup Form States
  const [language, setLanguage] = useState("IndianEnglish");
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [videoUploadState, setVideoUploadState] = useState<
    "idle" | "recording" | "ready" | "disabled" | "error"
  >("idle");
  const [videoRecordedBytes, setVideoRecordedBytes] = useState(0);
  const [stageVideoUrls, setStageVideoUrls] = useState<
    Partial<Record<AgentStage, string>>
  >({});
  const [stageVideoSizes, setStageVideoSizes] = useState<
    Partial<Record<AgentStage, number>>
  >({});
  const [videoError, setVideoError] = useState<string | null>(null);

  // Session tracking
  const sessionIdRef = useRef<string | null>(null);
  const stageStartTimeRef = useRef<number>(Date.now());

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Report generation state
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportResults, setReportResults] = useState<{
    roleplay?: ReportResult;
    test?: ReportResult;
  }>({});
  const stageAudioUrlsRef = useRef<{ roleplay?: string; test?: string }>({});
  const stageDataRef = useRef<
    Partial<
      Record<
        "intro" | "roleplay" | "test",
        {
          audioBlob: Blob | null;
          videoBlob: Blob | null | undefined;
          transcript: string;
        }
      >
    >
  >({});

  // Refs for API and Audio
  const aiRef = useRef<GoogleGenAI | null>(null);
  const agentSessionsRef = useRef<Partial<Record<AgentStage, Promise<any>>>>(
    {},
  );
  const activeStageRef = useRef<AgentStage>("intro");
  const hasPrewarmedRef = useRef<Partial<Record<AgentStage, boolean>>>({});
  const isSessionActiveRef = useRef(false);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const recordingContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mixedDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(
    null,
  );
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const stageVideoChunksRef = useRef<Blob[]>([]);
  const stageVideoBlobsRef = useRef<Partial<Record<AgentStage, Blob>>>({});
  const stageVideoRecorderStageRef = useRef<AgentStage | null>(null);
  const stageVideoUrlsRef = useRef<Partial<Record<AgentStage, string>>>({});
  const isTransitioningRef = useRef(false);
  const hasTriggeredReportRef = useRef(false);

  // Data Accumulators for current stage
  const currentTranscriptRef = useRef<string>("");
  const audioChunksRef = useRef<Blob[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // URL cleanup
  const objectUrlsRef = useRef<string[]>([]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Fetch Scenario Details
  useEffect(() => {
    if (!scenarioId) return;

    const fetchScenario = async () => {
      setLoadingScenario(true);
      try {
        const response = await fetch("/api/scenarios");
        if (response.ok) {
          const data = await response.json();
          const found = data.find((s: any) => s.id === scenarioId);
          if (found) {
            setScenario({
              id: found.id,
              title: found.title,
              description: found.description,
              difficulty: found.difficulty,
              type: found.type,
              is_active: found.isActive,
              roleplay_prompt: found.roleplayPrompt,
              examiner_prompt: found.examinerPrompt,
              roleplay_eval_prompt: found.roleplayEvalPrompt,
              examiner_eval_prompt: found.examinerEvalPrompt,
              // Configs
              intro_config: found.introConfig,
              roleplay_config: found.roleplayConfig,
              examiner_config: found.examinerConfig,
            });
          }
        }
      } catch (error) {
        console.error("Failed to load scenario details", error);
      } finally {
        setLoadingScenario(false);
      }
    };
    fetchScenario();
  }, [scenarioId]);

  // --- Session Management (Prisma) ---

  // Create assessment session when setup is complete
  useEffect(() => {
    if (!isSetupComplete || !isOnboardingComplete || !authUser || !scenario)
      return;

    const createSession = async () => {
      const result = await createAssessmentSession(
        authUser.id,
        scenario.id,
        level || "Beginner",
        language,
      );

      if (result.success && result.id) {
        sessionIdRef.current = result.id;
        console.log("Assessment session created:", result.id);
      } else {
        console.error("Failed to create assessment session:", result.error);
      }
    };

    createSession();
    stageStartTimeRef.current = Date.now();
  }, [
    isSetupComplete,
    isOnboardingComplete,
    authUser,
    scenario,
    level,
    language,
  ]);

  // Save stage result
  const handleSaveStageResult = async (
    stage: "intro" | "roleplay" | "test",
    audioBlob: Blob | null,
    videoBlob: Blob | null | undefined,
    transcript: string,
  ): Promise<string | null> => {
    if (!sessionIdRef.current) {
      console.warn("No session ID, skipping stage save");
      return null;
    }

    const durationSeconds = Math.round(
      (Date.now() - stageStartTimeRef.current) / 1000,
    );
    let audioUrl: string | null = null;
    let videoUrl: string | null = null;

    // Upload audio if available
    if (audioBlob && audioBlob.size > 0) {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");

      const uploadResult = await uploadAudio(
        sessionIdRef.current,
        stage,
        formData,
      );
      if (uploadResult.success && uploadResult.url) {
        audioUrl = uploadResult.url;
      } else {
        console.error("Audio upload failed:", uploadResult.error);
      }
    }

    // Upload video if available
    if (videoBlob && videoBlob.size > 0) {
      const formData = new FormData();
      formData.append("file", videoBlob, "video.webm");

      const uploadResult = await uploadVideo(
        sessionIdRef.current,
        stage,
        formData,
      );
      if (uploadResult.success && uploadResult.url) {
        videoUrl = uploadResult.url;
      } else {
        console.error("Video upload failed:", uploadResult.error);
      }
    }

    // Save stage result
    const result = await saveStageResult(
      sessionIdRef.current,
      stage,
      transcript || null,
      audioUrl,
      videoUrl,
      durationSeconds,
    );

    if (!result.success) {
      console.error(`Failed to save ${stage} result:`, result.error);
    } else {
      console.log(`Stage ${stage} result saved`);
    }

    // Track audio URL for report pipeline
    if (audioUrl && (stage === "roleplay" || stage === "test")) {
      stageAudioUrlsRef.current[stage] = audioUrl;
    }

    // Reset stage timer
    stageStartTimeRef.current = Date.now();
    return audioUrl;
  };

  // Complete the assessment session
  const handleCompleteAssessmentSession = async () => {
    if (!sessionIdRef.current) return;

    const result = await completeAssessmentSession(
      sessionIdRef.current,
      totalSeconds,
    );

    if (!result.success) {
      console.error("Failed to complete session:", result.error);
    } else {
      console.log("Assessment session completed");
    }
  };

  const getAgentConfig = (stage: AgentStage) => {
    const defaults = { model: DEFAULT_LIVE_MODEL };

    switch (stage) {
      case "intro":
        return {
          ...defaults,
          voiceName: scenario?.intro_config?.voiceName || "Puck",
          temperature: scenario?.intro_config?.temperature ?? 0.7,
          model: scenario?.intro_config?.model || defaults.model,
        };
      case "roleplay":
        return {
          ...defaults,
          voiceName: scenario?.roleplay_config?.voiceName || "Kore",
          temperature: scenario?.roleplay_config?.temperature ?? 0.9,
          model: scenario?.roleplay_config?.model || defaults.model,
        };
      case "test":
        return {
          ...defaults,
          voiceName: scenario?.examiner_config?.voiceName || "Fenrir",
          temperature: scenario?.examiner_config?.temperature ?? 0.5,
          model: scenario?.examiner_config?.model || defaults.model,
        };
    }
  };

  // old
  // const stopAllPlayback = () => {
  //   sourcesRef.current.forEach((source) => {
  //     try {
  //       source.stop();
  //     } catch {
  //       // Ignore if already stopped
  //     }
  //   });
  //   sourcesRef.current.clear();
  //   nextStartTimeRef.current = 0;
  // };

  const stopAllPlayback = () => {
    // 1. Stop every active source node immediately
    sourcesRef.current.forEach((source) => {
      try {
        source.stop(0); // Force stop at current time 0
        source.disconnect();
      } catch (e) {
        // Source might have already finished
      }
    });

    // 2. Clear the set of tracking sources
    sourcesRef.current.clear();

    // 3. Reset the timeline reference
    nextStartTimeRef.current = 0;

    // 4. Reset agent state to listening
    setAgentState("listening");
  };

  const safeCloseAudioContext = async (ctx: AudioContext | null) => {
    if (ctx && ctx.state !== "closed") {
      try {
        await ctx.close();
      } catch {
        // Ignore close race errors
      }
    }
  };

  const getSupportedVideoMimeType = () => {
    const candidates = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ];
    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  };

  const replaceStageVideoUrl = (stage: AgentStage, nextUrl: string) => {
    const previousUrl = stageVideoUrlsRef.current[stage];
    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
      objectUrlsRef.current = objectUrlsRef.current.filter(
        (url) => url !== previousUrl,
      );
    }
    stageVideoUrlsRef.current[stage] = nextUrl;
    objectUrlsRef.current.push(nextUrl);
    setStageVideoUrls((prev) => ({ ...prev, [stage]: nextUrl }));
  };

  const startVideoCapture = async () => {
    if (!isVideoEnabled) {
      setVideoUploadState("disabled");
      return;
    }

    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 360 },
          frameRate: { ideal: 15, max: 24 },
          facingMode: "user",
        },
        audio: false,
      });

      cameraStreamRef.current = cameraStream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = cameraStream;
        try {
          await videoPreviewRef.current.play();
        } catch {
          // Ignore autoplay race in some browsers.
        }
      }

      setVideoError(null);
      setVideoUploadState("ready");
    } catch (error) {
      console.error("Failed to initialize video capture:", error);
      setVideoUploadState("error");
      setVideoError(
        "Camera could not be initialized. Continue with audio-only mode.",
      );
      setIsVideoEnabled(false);
    }
  };

  const startStageVideoRecorder = (stage: AgentStage) => {
    if (!isVideoEnabled) {
      setVideoUploadState("disabled");
      return;
    }

    const cameraTrack = cameraStreamRef.current?.getVideoTracks()[0];
    if (!cameraTrack || cameraTrack.readyState !== "live") {
      setVideoUploadState("error");
      setVideoError("Camera track is not available for recording.");
      return;
    }

    const recordingStream = new MediaStream();
    recordingStream.addTrack(cameraTrack);
    const mixedAudioTrack = mixedDestinationRef.current?.stream
      .getAudioTracks()
      .at(0);
    if (mixedAudioTrack) {
      recordingStream.addTrack(mixedAudioTrack);
    }

    const mimeType = getSupportedVideoMimeType();
    const recorder = mimeType
      ? new MediaRecorder(recordingStream, {
          mimeType,
          videoBitsPerSecond: 400000,
          audioBitsPerSecond: 64000,
        })
      : new MediaRecorder(recordingStream);

    stageVideoChunksRef.current = [];
    stageVideoRecorderStageRef.current = stage;
    setVideoRecordedBytes(0);

    recorder.ondataavailable = (event) => {
      if (!event.data || event.data.size === 0) return;
      stageVideoChunksRef.current.push(event.data);
      setVideoRecordedBytes((prev) => prev + event.data.size);
    };

    recorder.onerror = () => {
      setVideoUploadState("error");
      setVideoError("Video recorder encountered an error.");
    };

    recorder.start();
    videoRecorderRef.current = recorder;
    setVideoUploadState("recording");
    console.log(`Video recording started for ${stage}`);
  };

  const stopStageVideoRecorder = async (
    stage: AgentStage,
  ): Promise<Blob | null> => {
    if (
      !videoRecorderRef.current ||
      videoRecorderRef.current.state === "inactive"
    ) {
      return null;
    }

    const recorder = videoRecorderRef.current;
    await new Promise<void>((resolve) => {
      recorder.addEventListener("stop", () => resolve(), { once: true });
      recorder.stop();
    });

    videoRecorderRef.current = null;
    stageVideoRecorderStageRef.current = null;

    const blob = new Blob(stageVideoChunksRef.current, {
      type: recorder.mimeType || "video/webm",
    });
    stageVideoChunksRef.current = [];

    if (!blob.size) {
      setVideoUploadState("ready");
      return null;
    }

    const videoUrl = URL.createObjectURL(blob);
    replaceStageVideoUrl(stage, videoUrl);
    stageVideoBlobsRef.current[stage] = blob;
    setStageVideoSizes((prev) => ({ ...prev, [stage]: blob.size }));
    setVideoUploadState("ready");

    return blob;
  };

  const stopVideoCapture = async () => {
    const activeStage = stageVideoRecorderStageRef.current;
    if (activeStage && videoRecorderRef.current?.state === "recording") {
      try {
        await stopStageVideoRecorder(activeStage);
      } catch {
        // Ignore stop races while tearing down.
      }
    }

    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }

    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
  };

  const startStageRecorder = (stage: AgentStage) => {
    if (!mixedDestinationRef.current) return;

    audioChunksRef.current = [];
    const recorder = new MediaRecorder(mixedDestinationRef.current.stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    recorder.start();
    stageStartTimeRef.current = Date.now();
    console.log(`Recording started for ${stage}`);
  };

  const stopStageRecorder = async (): Promise<Blob | null> => {
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state === "inactive"
    ) {
      return null;
    }

    mediaRecorderRef.current.stop();
    await new Promise((resolve) => setTimeout(resolve, 50));
    mediaRecorderRef.current = null;

    return new Blob(audioChunksRef.current, { type: "audio/webm" });
  };

  const sendSilentWarmup = async (stage: AgentStage) => {
    if (hasPrewarmedRef.current[stage]) return;
    const sessionPromise = agentSessionsRef.current[stage];
    if (!sessionPromise) return;

    try {
      const session = await sessionPromise;
      const silentData = new Float32Array(1600);
      session.sendRealtimeInput({ media: createBlob(silentData) });
      hasPrewarmedRef.current[stage] = true;
    } catch (err) {
      console.error(`Warmup failed for ${stage}:`, err);
    }
  };

  const sendAgentHandoff = async (
    fromStage: AgentStage,
    toStage: AgentStage,
    transcript: string,
  ) => {
    const sessionPromise = agentSessionsRef.current[toStage];
    if (!sessionPromise) return;

    const handoffTranscript = transcript.trim().slice(-4000);
    const handoffText = [
      `Agent-to-agent handoff.`,
      `From stage: ${fromStage}.`,
      `To stage: ${toStage}.`,
      handoffTranscript
        ? `Previous transcript:\n${handoffTranscript}`
        : "No transcript was captured in the previous stage.",
      `Continue naturally without redoing prior stage instructions.`,
    ].join("\n\n");

    try {
      const session = await sessionPromise;
      if (typeof session.sendClientContent === "function") {
        session.sendClientContent({
          turns: [{ role: "user", parts: [{ text: handoffText }] }],
          turnComplete: true,
        });
      }
      await sendSilentWarmup(toStage);
    } catch (err) {
      console.error(`Handoff failed (${fromStage} -> ${toStage}):`, err);
    }
  };

  const setupAudioPipeline = async () => {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;

    const inputCtx = new AudioContextClass({ sampleRate: 16000 });
    const outputCtx = new AudioContextClass({ sampleRate: 24000 });
    inputContextRef.current = inputCtx;
    outputContextRef.current = outputCtx;
    recordingContextRef.current = null;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        "Media devices or getUserMedia not supported in this environment",
      );
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const recorderDest = outputCtx.createMediaStreamDestination();
    mixedDestinationRef.current = recorderDest;
    const micSourceForRec = outputCtx.createMediaStreamSource(stream);
    micSourceForRec.connect(recorderDest);

    const source = inputCtx.createMediaStreamSource(stream);
    const processor = inputCtx.createScriptProcessor(2048, 1, 1);

    processor.onaudioprocess = (e) => {
      if (!isSessionActiveRef.current) return;

      const stage = activeStageRef.current;
      const sessionPromise = agentSessionsRef.current[stage];
      if (!sessionPromise) return;

      const pcmBlob = createBlob(e.inputBuffer.getChannelData(0));
      sessionPromise
        .then((session: any) => {
          if (!isSessionActiveRef.current || activeStageRef.current !== stage) {
            return;
          }
          session.sendRealtimeInput({ media: pcmBlob });
        })
        .catch((err: any) => {
          if (isSessionActiveRef.current) {
            console.error(`Error sending input (${stage}):`, err);
          }
        });
    };

    source.connect(processor);
    processor.connect(inputCtx.destination);
    processorRef.current = processor;
  };

  const connectAgentSession = (stage: AgentStage, mappedUser: any) => {
    if (!aiRef.current || !scenario) {
      throw new Error("AI client or scenario not ready");
    }

    const agentConfig = getAgentConfig(stage);
    const systemInstruction = getSystemInstruction(
      scenario,
      stage,
      mappedUser,
      language,
      authUser?.isDemo || false,
    );

    const sessionPromise = aiRef.current.live.connect({
      model: agentConfig.model,
      config: {
        generationConfig: { temperature: agentConfig.temperature },
        responseModalities: [Modality.AUDIO],
        systemInstruction,
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: agentConfig.voiceName,
            },
          },
        },
      },
      callbacks: {
        onopen: () => {
          if (!isSessionActiveRef.current) {
            sessionPromise.then((s: any) => s.close());
            return;
          }

          if (activeStageRef.current === stage) {
            setAgentState("listening");
          }
        },
        onmessage: async (msg: LiveServerMessage) => {
          // CRITICAL: If the stage has changed since this callback was queued, discard it.
          if (!isSessionActiveRef.current || activeStageRef.current !== stage) {
            return;
          }

          const outputCtx = outputContextRef.current;
          if (!outputCtx || outputCtx.state === "closed") return;
          const serverContent: any = msg.serverContent;

          const audioData =
            serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioData) {
            setAgentState("speaking");

            if (outputCtx.state === "suspended") {
              await outputCtx.resume();
            }

            nextStartTimeRef.current = Math.max(
              nextStartTimeRef.current,
              outputCtx.currentTime,
            );

            const audioBuffer = await decodeAudioData(
              decode(audioData),
              outputCtx,
              24000,
              1,
            );

            const source = outputCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputCtx.destination);

            if (mixedDestinationRef.current) {
              source.connect(mixedDestinationRef.current);
            }

            source.addEventListener("ended", () => {
              sourcesRef.current.delete(source);
              if (sourcesRef.current.size === 0) {
                setAgentState("listening");
              }
            });

            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
          }

          if (serverContent?.inputTranscription?.text) {
            currentTranscriptRef.current +=
              "User: " + serverContent.inputTranscription.text + "\n";
          }
          if (serverContent?.outputTranscription?.text) {
            currentTranscriptRef.current +=
              "Agent: " + serverContent.outputTranscription.text + "\n";
          }
        },
        onclose: () => {
          if (isSessionActiveRef.current && activeStageRef.current === stage) {
            setAgentState("idle");
          }
        },
        onerror: (err: any) => {
          console.error(`Gemini error (${stage}):`, err);
          if (isSessionActiveRef.current && activeStageRef.current === stage) {
            setAgentState("idle");
          }
        },
      },
    });

    agentSessionsRef.current[stage] = sessionPromise;
    return sessionPromise;
  };

  const teardownAgentSystem = async () => {
    isSessionActiveRef.current = false;
    setAgentState("idle");
    stopAllPlayback();
    await stopStageRecorder();
    await stopVideoCapture();

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    await Promise.all([
      safeCloseAudioContext(inputContextRef.current),
      safeCloseAudioContext(outputContextRef.current),
      safeCloseAudioContext(recordingContextRef.current),
    ]);

    inputContextRef.current = null;
    outputContextRef.current = null;
    recordingContextRef.current = null;
    mixedDestinationRef.current = null;

    const closing = activeStages.map(async (stage) => {
      const sessionPromise = agentSessionsRef.current[stage];
      if (!sessionPromise) return;
      try {
        const session = await sessionPromise;
        if (session && typeof session.close === "function") {
          session.close();
        }
      } catch {
        // Ignore close races
      }
    });
    await Promise.allSettled(closing);

    agentSessionsRef.current = {};
    hasPrewarmedRef.current = {};
    aiRef.current = null;
  };

  const finalizeCurrentStage = async (stage: AgentStage) => {
    const transcript = currentTranscriptRef.current;
    const audioBlob = await stopStageRecorder();
    const videoBlob = await stopStageVideoRecorder(stage);

    setReportData((prev) => ({
      ...prev,
      [stage]: {
        audio: audioBlob,
        transcript,
      },
    }));

    return { audioBlob, videoBlob, transcript };
  };

  // const switchToStage = async (
  //   fromStage: AgentStage,
  //   toStage: AgentStage,
  //   transcript: string,
  // ) => {
  //   stopAllPlayback();
  //   activeStageRef.current = toStage;
  //   currentTranscriptRef.current = "";
  //   setCurrentStage(toStage);
  //   setAgentState("listening");
  //   startStageRecorder(toStage);
  //   startStageVideoRecorder(toStage);
  //   await sendAgentHandoff(fromStage, toStage, transcript);
  // };

  const switchToStage = async (
    fromStage: AgentStage,
    toStage: AgentStage,
    transcript: string,
  ) => {
    // Reset playback and timeline BEFORE changing stage
    stopAllPlayback();

    // Update state
    activeStageRef.current = toStage;
    currentTranscriptRef.current = "";
    setCurrentStage(toStage);

    // Start new recorders
    startStageRecorder(toStage);
    startStageVideoRecorder(toStage);

    // Perform the handoff to the next AI agent
    await sendAgentHandoff(fromStage, toStage, transcript);
  };

  // Initialize and keep all stage agents connected for low-latency handoffs.
  useEffect(() => {
    if (!isSetupComplete || !isOnboardingComplete || !scenario || !authUser)
      return;

    let isCancelled = false;

    const initialize = async () => {
      try {
        await teardownAgentSystem();

        const tokenResult = await getGeminiToken();
        if (!tokenResult.success || !tokenResult.token) {
          throw new Error(
            "Failed to get Gemini token: " + (tokenResult.error || "No token"),
          );
        }

        aiRef.current = new GoogleGenAI({
          apiKey: tokenResult.token,
          apiVersion: "v1alpha",
        });

        isSessionActiveRef.current = true;
        activeStageRef.current = "intro";
        currentTranscriptRef.current = "";
        nextStartTimeRef.current = 0;
        setAgentState("idle");
        hasTriggeredReportRef.current = false;
        isTransitioningRef.current = false;

        await setupAudioPipeline();
        await startVideoCapture();

        const mappedUser = {
          name: authUser.name,
          id: authUser.id,
          role: authUser.role,
        };

        await Promise.all(
          activeStages.map((stage) =>
            connectAgentSession(stage as AgentStage, mappedUser),
          ),
        );

        if (isCancelled) return;

        startStageRecorder("intro");
        startStageVideoRecorder("intro");
        await sendSilentWarmup("intro");
        setAgentState("listening");
      } catch (error) {
        console.error("Failed to initialize multi-agent flow:", error);
        isSessionActiveRef.current = false;
        setAgentState("idle");
      }
    };

    initialize();

    return () => {
      isCancelled = true;
      teardownAgentSystem();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSetupComplete, isOnboardingComplete, scenario, authUser, language]);

  useEffect(() => {
    if (!isSetupComplete || !isOnboardingComplete) return;
    if (currentStage !== "intro") return;

    setShowSayHi(true);
    const timer = setTimeout(() => setShowSayHi(false), 2500);
    return () => clearTimeout(timer);
  }, [currentStage, isSetupComplete, isOnboardingComplete]);

  useEffect(() => {
    if (isSetupComplete) return;
    setVideoUploadState(isVideoEnabled ? "idle" : "disabled");
    if (!isVideoEnabled) {
      setVideoError(null);
    }
  }, [isVideoEnabled, isSetupComplete]);

  // Global & Stage Timer
  useEffect(() => {
    if (!isSetupComplete || !isOnboardingComplete) return;
    const interval = setInterval(() => {
      if (currentStage !== "finished") {
        setTotalSeconds((prev) => prev + 1);
        setStageSecondsElapsed((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isSetupComplete, isOnboardingComplete, currentStage]);

  // Reset stage timers when currentStage changes
  useEffect(() => {
    setStageSecondsElapsed(0);
    if (currentStage === "roleplay") setTimeLeft(ROLEPLAY_DURATION_SECONDS);
    if (currentStage === "test") setTimeLeft(120);
  }, [currentStage]);

  // Stage Timer
  useEffect(() => {
    let interval: any;
    if (
      isSetupComplete &&
      isOnboardingComplete &&
      (currentStage === "roleplay" || currentStage === "test") &&
      timeLeft > 0
    ) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (
      (currentStage === "roleplay" || currentStage === "test") &&
      timeLeft === 0
    ) {
      handleNextStage();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSetupComplete, isOnboardingComplete, currentStage, timeLeft]);

  // Report Generation Pipeline
  const triggerReportPipeline = async () => {
    if (!sessionIdRef.current || !scenario || hasTriggeredReportRef.current)
      return;
    hasTriggeredReportRef.current = true;

    setIsGeneratingReport(true);
    console.log("Starting report generation pipeline...");

    // We don't fetch from DB here in the new refined logic, we trust `stageAudioUrlsRef`
    // However, if we need to robustly fetch, we can use `getStageResults` action
    // But for now, let's just use what we have in ref since we just saved it.
    // Actually, persistence check is good.

    const stages: Array<{
      stage: "roleplay" | "test";
      evalPrompt: string | null | undefined;
    }> = [
      { stage: "roleplay", evalPrompt: scenario.roleplay_eval_prompt },
      { stage: "test", evalPrompt: scenario.examiner_eval_prompt },
    ];

    for (const { stage, evalPrompt } of stages) {
      // We rely on the local ref for the URL as we get it back from save action
      const audioUrl = stageAudioUrlsRef.current[stage];

      if (!audioUrl) {
        console.warn(`No audio URL for ${stage}, skipping report`);
        continue;
      }
      if (!evalPrompt) {
        console.warn(`No eval prompt for ${stage}, skipping evaluation`);
        continue;
      }

      try {
        console.log(`Generating report for ${stage}...`);
        const result = await generateReport(
          audioUrl,
          sessionIdRef.current!,
          stage,
          evalPrompt,
        );
        setReportResults((prev) => ({ ...prev, [stage]: result }));

        if (result.success) {
          console.log(`Report for ${stage} complete`);
        } else {
          console.error(`Report for ${stage} failed:`, result.error);
        }
      } catch (err) {
        console.error(`Report pipeline error for ${stage}:`, err);
      }
    }

    setIsGeneratingReport(false);
    console.log("Report generation pipeline finished");
  };

  const handleNextStage = async () => {
    if (currentStage === "finished" || isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    try {
      const stage = currentStage as AgentStage;
      const { audioBlob, videoBlob, transcript } =
        await finalizeCurrentStage(stage);

      stageDataRef.current[stage] = { audioBlob, videoBlob, transcript };

      if (stage === "intro") {
        await switchToStage("intro", "roleplay", transcript);
        setTimeLeft(ROLEPLAY_DURATION_SECONDS);
      } else if (stage === "roleplay") {
        // Demo users skip the "test" stage and go straight to finished
        if (authUser?.isDemo) {
          // Kill audio immediately — before any async work — to prevent bleed
          isSessionActiveRef.current = false;
          stopAllPlayback();

          setIsSaving(true);
          setCurrentStage("finished");

          const stages: ("intro" | "roleplay")[] = ["intro", "roleplay"];
          for (const stg of stages) {
            const data = stageDataRef.current[stg];
            if (data) {
              await handleSaveStageResult(
                stg,
                data.audioBlob,
                data.videoBlob,
                data.transcript,
              );
            }
          }

          await handleCompleteAssessmentSession();
          await teardownAgentSystem();
          setIsSaving(false);

          // Trigger report pipeline for roleplay only
          console.log(
            "Demo mode: triggering report generation pipeline (roleplay only)",
          );
          triggerReportPipeline();
        } else {
          await switchToStage("roleplay", "test", transcript);
          setTimeLeft(TEST_DURATION_SECONDS);
        }
      } else if (stage === "test") {
        setIsSaving(true);
        setCurrentStage("finished");

        const stages: ("intro" | "roleplay" | "test")[] = [
          "intro",
          "roleplay",
          "test",
        ];
        for (const stg of stages) {
          const data = stageDataRef.current[stg];
          if (data) {
            await handleSaveStageResult(
              stg,
              data.audioBlob,
              data.videoBlob,
              data.transcript,
            );
          }
        }

        await handleCompleteAssessmentSession();
        await teardownAgentSystem();
        setIsSaving(false);

        // Trigger report generation pipeline (fire-and-forget, runs in background)
        console.log("Triggering report generation pipeline");
        triggerReportPipeline();
      }
    } catch (e) {
      console.error("Stage transition failed:", e);
    } finally {
      isTransitioningRef.current = false;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTotalTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getVideoStatusText = () => {
    switch (videoUploadState) {
      case "recording":
        return "Video recording";
      case "ready":
        return "Video ready";
      case "disabled":
        return "Video off";
      case "error":
        return "Video error";
      default:
        return "Video idle";
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current
        .getAudioTracks()
        .forEach((track) => (track.enabled = !isMicOn));
    }
    setIsMicOn(!isMicOn);
  };

  const handleViewReport = () => {
    if (!sessionIdRef.current) {
      window.alert("Report session is not ready yet. Please try again.");
      return;
    }

    const reportUrl = `${window.location.origin}/report/${encodeURIComponent(sessionIdRef.current)}`;
    window.open(reportUrl, "_blank", "noopener,noreferrer");
  };

  if (authLoading || loadingScenario) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" />
          <div className="w-8 h-8 border-2 border-[#2d87a4] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Initializing Assessment...</p>
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-sans">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">
            Scenario Not Found
          </h2>
          <button
            onClick={() => router.back()}
            className="mt-4 text-[#2d87a4] hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ... (Initial setup view matches original) ...
  // Since the original file was truncated in view_file, checking if I have the full Setup View logic.
  // The logic for Setup View is usually: if (!isSetupComplete) show setup form.

  if (!isSetupComplete && !showGuidelines) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
          <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 text-center">
            <div className="flex justify-center items-center gap-3 mb-2">
              <Logo size="lg" />
              <span className="text-3xl font-thin text-slate-300">|</span>
              <span className="text-xl font-semibold text-slate-600 tracking-tight pt-1">
                Settings
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
              You'll first be greeted by a voice agent who will guide you
              through the assessment flow.
            </p>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Globe size={16} className="text-[#2d87a4]" />
                Change Language{" "}
                <span className="text-slate-400 font-normal text-xs">
                  (Optional)
                </span>
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#2d87a4]/20 focus:border-[#2d87a4] transition-all"
                >
                  <option value="IndianEnglish">English</option>
                  <option value="Hinglish">
                    Indian Hinglish (Hindi + English)
                  </option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Punjabi">Punjabi</option>
                  <option value="Bengali">Bengali</option>
                </select>
              </div>
            </div>
            {/* <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#2d87a4]">
                  {isVideoEnabled ? (
                    <Video size={16} />
                  ) : (
                    <VideoOff size={16} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Session Camera
                  </p>
                  <p className="text-xs text-slate-500">
                    Turn on to show your video in the live session and
                    post-session playback.
                  </p>
                </div>
              </div>
              <label
                htmlFor="session-camera-toggle"
                className="relative inline-flex items-center cursor-pointer"
              >
                <input
                  id="session-camera-toggle"
                  type="checkbox"
                  className="sr-only peer"
                  checked={isVideoEnabled}
                  onChange={(e) => setIsVideoEnabled(e.target.checked)}
                />
                <div className="h-8 w-14 rounded-full bg-slate-300 transition-colors peer-checked:bg-[#2d87a4]"></div>
                <div className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-6"></div>
              </label>
            </div> */}
            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={() => setShowGuidelines(true)}
                className="w-full py-4 bg-[#2d87a4] hover:bg-[#236c84] text-white rounded-xl font-semibold shadow-lg shadow-cyan-900/20 hover:shadow-cyan-900/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                Click to Start Assessment
              </button>
              <button
                onClick={() => router.back()}
                className="w-full py-3 border border-[#2d87a4] text-[#2d87a4] hover:bg-[#2d87a4]/5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} /> Back to All Scenarios
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isSetupComplete && showGuidelines) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
          <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 text-center">
            <div className="flex justify-center items-center gap-3 mb-2">
              <Logo size="lg" />
              <span className="text-3xl font-thin text-slate-300">|</span>
              <span className="text-xl font-semibold text-slate-600 tracking-tight pt-1">
                Guidelines
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
              Please read the instructions carefully before starting your
              session.
            </p>
          </div>
          <div className="p-6 space-y-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#2d87a4] shrink-0 shadow-sm">
                  <Mic size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Voice Interaction
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    You'll be communicating with an AI agent. Speak clearly and
                    naturally in your preferred language.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#2d87a4] shrink-0 shadow-sm">
                  <Volume2 size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Listen to Instructions
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Wait for the agent to finish speaking. It may take a few
                    seconds to start or respond — this is normal.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#2d87a4] shrink-0 shadow-sm">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Quiet Environment
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Use a quiet place with a stable internet connection.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={() => setIsSetupComplete(true)}
                className="w-full py-4 bg-[#2d87a4] hover:bg-[#236c84] text-white rounded-xl font-semibold shadow-lg shadow-cyan-900/20 hover:shadow-cyan-900/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Accept & Start Session <ChevronRight size={18} />
              </button>
              <button
                onClick={() => setShowGuidelines(false)}
                className="w-full py-3 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                Back to Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Finished View
  if (currentStage === "finished") {
    if (isSaving) {
      return (
        <div className="min-h-screen bg-[#f8fafc] p-6 flex items-center justify-center font-sans">
          <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden text-center p-12">
            <div className="w-20 h-20 bg-sky-50 text-[#2d87a4] rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-10 h-10 border-4 border-[#2d87a4] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Saving Assessment...
            </h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Please do not close this window. We are securely{" "}
              {isVideoEnabled ? "uploading your video and " : ""}processing your
              session data.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                disabled
                className="px-8 py-3 rounded-xl border-2 border-slate-200 text-slate-400 font-bold bg-slate-50 cursor-not-allowed"
              >
                Back to Home
              </button>
              <button
                disabled
                className="px-8 py-3 rounded-xl bg-[#2d87a4]/50 text-white font-bold cursor-not-allowed flex items-center justify-center gap-2"
              >
                View Report <FileText size={18} />
              </button>
              <button
                disabled
                className="px-8 py-3 rounded-xl border-2 border-[#2d87a4]/50 text-[#2d87a4]/50 font-bold cursor-not-allowed"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 flex items-center justify-center font-sans">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden text-center p-12">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Assessment Complete!
          </h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Great job! Your session has been recorded and analysed. You can now
            view your detailed performance report.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/")}
              className="px-8 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              Back to Home
            </button>
            <button
              onClick={handleViewReport}
              className="px-8 py-3 rounded-xl bg-[#2d87a4] text-white font-bold hover:bg-[#26728b] shadow-lg shadow-[#2d87a4]/20 transition-colors flex items-center justify-center gap-2"
            >
              View Report <FileText size={18} />
            </button>
            <button
              onClick={() => {
                // simple reload to restart for now
                window.location.reload();
              }}
              className="px-8 py-3 rounded-xl border-2 border-[#2d87a4] text-[#2d87a4] font-bold hover:bg-[#2d87a4]/5 transition-colors"
            >
              Try Again
            </button>
          </div>

          {/* <div className="mt-8 text-left border border-slate-200 rounded-2xl p-5 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-700 mb-3">
              Session Video Summary
            </h3>
            {isVideoEnabled ? (
              <div className="space-y-3 text-sm text-slate-600">
                <p>
                  Status:{" "}
                  <span className="font-semibold text-slate-700">
                    {getVideoStatusText()}
                  </span>
                </p>
                {activeStages.map((stage) => {
                  const videoUrl = stageVideoUrls[stage as AgentStage];
                  const videoSize = stageVideoSizes[stage as AgentStage];
                  return (
                    <div
                      key={stage}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {STAGE_LABELS[stage as AgentStage]}
                        </p>
                        <p className="text-xs text-slate-500">
                          {videoSize
                            ? `${formatBytes(videoSize)} generated`
                            : "Not generated"}
                        </p>
                      </div>
                      {videoUrl ? (
                        <a
                          href={videoUrl}
                          download={`${sessionIdRef.current || "session"}_${stage}.webm`}
                          className="px-3 py-1.5 rounded-lg bg-[#2d87a4] text-white text-xs font-semibold hover:bg-[#26728b] transition-colors"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">
                          Unavailable
                        </span>
                      )}
                    </div>
                  );
                })}
                {videoError && (
                  <p className="text-xs text-red-500">{videoError}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                Camera was disabled for this session.
              </p>
            )}
          </div> */}

          {isGeneratingReport && (
            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200 inline-block">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-4 h-4 border-2 border-[#2d87a4] border-t-transparent rounded-full animate-spin"></div>
                Generating detailed feedback report...
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Render Helpers ---

  const renderHelperText = () => {
    return (
      <>
        {/* Backdrop for mobile centered modal */}
        <div
          className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-45 transition-opacity duration-300 md:hidden ${
            showHelperText
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setShowHelperText(false)}
        />

        {/* Floating Info Button */}
        <button
          onClick={() => setShowHelperText(!showHelperText)}
          className="fixed bottom-[6px] right-[6px] md:bottom-10 md:right-10 w-12 h-12 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-[#2d87a4] hover:bg-slate-50 transition-all z-60 md:z-40"
          title="Show help"
        >
          {showHelperText ? <X size={24} /> : <Info size={24} />}
        </button>

        {/* Helper Content */}
        <div
          className={`fixed w-[85%] max-w-sm md:w-80 bg-white/95 backdrop-blur-md border border-slate-200 p-6 rounded-3xl md:rounded-2xl shadow-2xl transition-all duration-300 z-50 md:z-30 
            ${
              showHelperText
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            }
            /* Center on mobile, Bottom-right on desktop */
            top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            md:top-auto md:left-auto md:bottom-24 md:right-14 md:translate-x-0 md:translate-y-0
          `}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#2d87a4] animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Assistant
              </span>
            </div>
            <button
              onClick={() => setShowHelperText(false)}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 Transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            {currentStage === "intro" && (
              <p className="text-slate-600 text-sm leading-relaxed">
                Once the introduction is over, click the button to go to the
                next round.
              </p>
            )}
            {currentStage === "roleplay" && (
              <p className="text-slate-600 text-sm leading-relaxed">
                If you're done early, you can click the button for the next
                round. The roleplay round will end automatically when the timer
                runs out.
              </p>
            )}
            {currentStage === "test" && (
              <p className="text-slate-600 text-sm leading-relaxed">
                You MUST mention all the steps that are stated in the SOP for
                this scenario to score full points.
                <br />
                <br />
                Once you are done answering the question, click on Finish
                Assignment. The round will automatically end when the timer runs
                out.
              </p>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col overflow-hidden relative">
      <style>{`
        @keyframes button-blink {
          0%, 100% {
            transform: scale(1);
            background-color: #ef4444;
            box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.2);
          }
          50% {
            transform: scale(1.01);
            background-color: #dc2626;
            box-shadow: 0 20px 25px -5px rgba(220, 38, 38, 0.4);
          }
        }
        .animate-button-blink {
          animation: button-blink 1s ease-in-out infinite !important;
        }
      `}</style>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 z-20 gap-2 shadow-sm shrink-0">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <button
            onClick={() => router.push("/")}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors shrink-0"
          >
            <ArrowLeft size={20} className="md:w-6 md:h-6" />
          </button>
          <div className="overflow-hidden">
            <h1 className="text-sm md:text-lg font-bold text-slate-800 truncate">
              {scenario.title}
            </h1>
            <p className="hidden md:block text-xs text-slate-500 max-w-xl truncate mt-0.5">
              {scenario.description}
            </p>
            <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs mt-0.5 md:mt-1.5">
              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                {level}
              </span>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-slate-400 flex items-center gap-1.5">
                <Clock size={10} className="md:w-3 md:h-3" />{" "}
                {formatTotalTime(totalSeconds)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 bg-slate-50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border border-slate-100 shrink-0">
          <div className="flex flex-col items-end justify-center">
            <span className="text-xs md:text-sm font-bold text-slate-800 leading-none mb-1 md:mb-1.5">
              {authUser?.name}
            </span>
            <div className="items-center gap-2 text-[10px] leading-none">
              <span className="hidden md:block uppercase tracking-wide text-slate-500 font-semibold">
                {authUser?.role}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-slate-400 font-mono">
                ID: {authUser?.staffId}
              </span>
            </div>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white flex items-center justify-center text-xs md:text-sm font-bold text-[#2d87a4] border border-slate-200 shadow-sm">
            {authUser?.name?.charAt(0)}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full p-6 flex flex-col items-center relative">
        {/* Stepper */}
        <div className="w-full max-w-3xl mb-6 md:mb-12 mt-2 md:mt-4 shrink-0">
          <div
            className={`flex items-center ${activeStages.length === 3 ? "justify-between" : "justify-center gap-36"}  relative px-4 md:px-2`}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full -z-20" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#2d87a4] rounded-full -z-10 transition-all duration-500 ease-out"
              style={{
                width: `${(currentStage as string) === "finished" ? 100 : activeStages.indexOf(currentStage as any) === -1 ? 0 : (activeStages.indexOf(currentStage as any) / (activeStages.length - 1)) * 100}%`,
              }}
            />
            {activeStages.map((step, index) => (
              <div
                key={step}
                className="flex flex-col items-center gap-1.5 md:gap-2 relative"
              >
                <div
                  className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${currentStage === step ? "border-[#2d87a4] bg-white text-[#2d87a4] shadow-md scale-110" : index < activeStages.indexOf(currentStage as any) ? "border-[#2d87a4] bg-[#2d87a4] text-white" : "border-slate-200 bg-slate-50 text-slate-300"}`}
                >
                  {index < activeStages.indexOf(currentStage as any) ? (
                    <CheckCircle2 size={14} className="md:w-4 md:h-4" />
                  ) : (
                    <span className="font-bold text-[10px] md:text-xs">
                      {index + 1}
                    </span>
                  )}
                </div>
                <span className="absolute -bottom-6 md:-bottom-7 w-20 md:w-32 text-center text-[9px] md:text-xs font-semibold text-slate-500">
                  {STAGE_LABELS[step as AgentStage]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`flex-1 flex flex-col items-center justify-center w-full gap-4 md:gap-10 ${isVideoEnabled ? "max-w-6xl" : "max-w-2xl mt-6 md:-mt-10"}`}
        >
          {!isVideoEnabled && (
            <div className="flex flex-wrap items-center justify-center gap-3 z-20">
              <div
                className={`px-4 md:px-5 py-1.5 md:py-2 rounded-full shadow-sm border flex items-center gap-2 md:gap-2.5 transition-all duration-300 ${agentState === "speaking" ? "bg-white border-slate-100 text-[#2d87a4]" : "bg-emerald-50 border-emerald-200 text-emerald-600"}`}
              >
                <Volume2
                  size={14}
                  className={`md:w-4 md:h-4 ${agentState === "speaking" ? "animate-pulse" : ""}`}
                />
                <span className="text-xs md:text-sm font-semibold tracking-tight">
                  {agentState === "speaking"
                    ? "Agent is speaking..."
                    : "Listening to you..."}
                </span>
              </div>
            </div>
          )}

          {isVideoEnabled ? (
            <div className="relative w-full max-w-4xl">
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xl">
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute left-4 top-4 px-3 py-1.5 rounded-full bg-black/55 text-white text-xs font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                  Recording live.
                </div>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full shadow-sm border bg-white/90 backdrop-blur-md flex items-center gap-2.5">
                  <Volume2
                    size={14}
                    className={
                      agentState === "speaking"
                        ? "text-[#2d87a4] animate-pulse"
                        : "text-emerald-600"
                    }
                  />
                  <span
                    className={`text-xs font-semibold tracking-tight ${agentState === "speaking" ? "text-[#2d87a4]" : "text-emerald-600"}`}
                  >
                    {agentState === "speaking"
                      ? "Agent is speaking..."
                      : "Listening to you..."}
                  </span>
                </div>
                <div className="absolute left-4 bottom-4 px-3 py-1.5 rounded-full bg-black/50 text-white/90 text-xs">
                  {formatBytes(videoRecordedBytes)} captured
                </div>
              </div>
              <div className="absolute top-4 right-4 md:top-5 md:right-5 z-30">
                <div className="relative">
                  <div
                    className={`rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm px-3 py-2 shadow-lg onboarding-voice-agent`}
                  >
                    <VoiceAgent
                      state={agentState}
                      compact
                      hideAmbientEffects={isVideoEnabled}
                    />
                  </div>
                  {showSayHi && currentStage === "intro" && (
                    <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 animate-in fade-in slide-in-from-left-4 duration-500 z-20 pointer-events-none">
                      <div className="bg-white text-slate-800 text-2xl font-bold px-8 py-4 rounded-2xl shadow-xl border border-slate-100 relative whitespace-nowrap">
                        <span className="animate-pulse">Say "Hi"! 👋</span>
                        <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-white border-l border-b border-slate-100 transform rotate-45"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative transform scale-75 sm:scale-90 md:scale-100 transition-transform onboarding-voice-agent">
              <VoiceAgent state={agentState} />
              {showSayHi && (
                <div className="absolute -right-20 sm:-right-32 top-10 animate-in fade-in slide-in-from-left-4 duration-500 z-20 pointer-events-none sm:pointer-events-auto">
                  <div className="bg-white text-slate-800 text-lg sm:text-2xl font-bold px-4 sm:px-8 py-2 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 relative whitespace-nowrap">
                    <span className="animate-pulse">Say "Hi"! 👋</span>
                    <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-white border-l border-b border-slate-100 transform rotate-45"></div>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={toggleMic}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110 active:scale-95 z-20 onboarding-mic-toggle ${isMicOn ? "bg-white text-slate-800 border border-slate-200 hover:border-[#2d87a4] hover:text-[#2d87a4]" : "bg-red-50 text-red-500 border border-red-200"}`}
          >
            {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
          </button>

          <div className="flex flex-col items-center gap-3 md:gap-4 w-full max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 md:pb-0">
            {(currentStage === "roleplay" || currentStage === "test") && (
              <div
                className={`font-mono text-xs md:text-sm lg:text-base font-semibold transition-colors duration-300 flex items-center gap-2 onboarding-timer ${timeLeft <= 30 ? "text-red-500 animate-pulse" : "text-slate-400"}`}
              >
                <Clock size={16} className="md:w-[18px] md:h-[18px]" />{" "}
                {formatTime(timeLeft)}
              </div>
            )}
            <button
              onClick={handleNextStage}
              disabled={isSaving}
              className={`mt-4 w-full py-3.5 md:py-4 bg-[#2d87a4] hover:bg-[#236c84] text-white rounded-full text-sm md:text-base font-bold shadow-lg shadow-cyan-900/20 hover:shadow-cyan-900/30 cursor-pointer transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed onboarding-next-stage-button ${shouldBlink ? "animate-button-blink" : ""}`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <span className="truncate">
                    {currentStage === "intro" && "Move to Roleplay Round"}
                    {currentStage === "roleplay" &&
                      (authUser?.isDemo
                        ? "Finish Assignment"
                        : "Move to Verbal Test Round")}
                    {currentStage === "test" && "Finish Assignment"}
                  </span>
                  <ChevronRight
                    size={16}
                    className="md:w-[18px] md:h-[18px] group-hover:translate-x-1 transition-transform shrink-0"
                  />
                </>
              )}
            </button>
          </div>
        </div>

        {renderHelperText()}
      </main>

      {isSetupComplete &&
        authUser &&
        (currentStage as string) !== "finished" && (
          <>
            <OnboardingGuide
              userId={authUser.id}
              stepsKey="assessment"
              onComplete={() => setIsOnboardingComplete(true)}
            />
            {shouldBlink && (
              <OnboardingGuide
                userId={authUser.id}
                stepsKey="assessment_blink"
              />
            )}
          </>
        )}
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-sans">
          <div className="flex flex-col items-center gap-4">
            <Logo size="lg" />
            <div className="w-8 h-8 border-2 border-[#2d87a4] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <AssessmentContent />
    </Suspense>
  );
}
