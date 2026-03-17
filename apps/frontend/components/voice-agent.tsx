import React, { useEffect, useState } from "react";

interface VoiceAgentProps {
  state: "idle" | "listening" | "speaking";
  compact?: boolean;
  hideAmbientEffects?: boolean;
}

export const VoiceAgent: React.FC<VoiceAgentProps> = ({
  state,
  compact = false,
  hideAmbientEffects = false,
}) => {
  // We'll simulate some random movement for the visualizer
  const [bars, setBars] = useState<number[]>(
    new Array(compact ? 4 : 5).fill(20),
  );

  useEffect(() => {
    if (state === "idle") {
      setBars(new Array(compact ? 4 : 5).fill(20));
      return;
    }

    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map(() => {
          if (state === "speaking") {
            // High energy: range 20 to 110
            return Math.random() * 90 + 20;
          } else {
            // Listening - Gentle breathing movement: range 15 to 45
            // Use constrained random to simulate subtle activity
            return Math.random() * 30 + 15;
          }
        }),
      );
    }, 100);

    return () => clearInterval(interval);
  }, [state, compact]);

  const isIdle = state === "idle";
  const isSpeaking = state === "speaking";
  const isListening = state === "listening";
  const containerSize = compact ? "w-24 h-24" : "w-64 h-64";
  const orbSize = compact ? "w-16 h-16" : "w-32 h-32";
  const visualizerHeight = compact ? "h-8" : "h-12";
  const barWidth = compact ? "w-1" : "w-1.5";
  const idleLineWidth = compact ? "w-10" : "w-16";

  return (
    <div className={`relative flex items-center justify-center ${containerSize}`}>
      {!hideAmbientEffects && (
        <>
          {/* Outer Glow */}
          <div
            className={`absolute inset-0 rounded-full bg-[#0891b2] blur-3xl transition-all duration-1000 
          ${isSpeaking ? "scale-125 opacity-50" : isListening ? "scale-105 opacity-30 animate-pulse" : "scale-90 opacity-20"}`}
          ></div>

          {/* Middle Ripple */}
          <div
            className={`absolute inset-4 rounded-full border-2 border-[#0891b2]/40 transition-all duration-2000 
          ${!isIdle ? "animate-ping opacity-30" : "opacity-0"}`}
          ></div>
          <div
            className={`absolute inset-12 rounded-full border-2 border-[#0891b2]/40 transition-all duration-2000 delay-300 
          ${!isIdle ? "animate-ping opacity-30" : "opacity-0"}`}
          ></div>
        </>
      )}

      {/* Core Agent Orb */}
      <div
        className={`relative z-10 rounded-full bg-gradient-to-br from-[#0e7490] to-[#0891b2] shadow-xl shadow-cyan-900/40 flex items-center justify-center overflow-hidden transition-all duration-500 ${orbSize}`}
      >
        {/* Face/Visualizer */}
        <div className={`flex items-center gap-1.5 ${visualizerHeight}`}>
          {isIdle ? (
            <div className={`${idleLineWidth} h-1 bg-white/50 rounded-full`}></div>
          ) : (
            bars.map((height, i) => (
              <div
                key={i}
                className={`${barWidth} bg-white rounded-full transition-all duration-200 ease-in-out`}
                style={{ height: `${height}%` }}
              ></div>
            ))
          )}
        </div>

        {/* Shine effect */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-full pointer-events-none"></div>
      </div>
    </div>
  );
};
