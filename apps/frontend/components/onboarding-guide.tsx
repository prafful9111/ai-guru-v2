"use client";

import React, { useState, useEffect } from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";

interface OnboardingGuideProps {
  userId: string;
  stepsKey: "dashboard" | "attempts" | "assessment" | "assessment_blink";
  onComplete?: () => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ userId, stepsKey, onComplete }) => {
  const [run, setRun] = useState(false);
  const storageKey = `hasSeenOnboarding_${stepsKey}_${userId}`;

  useEffect(() => {
    const hasSeen = localStorage.getItem(storageKey);
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // If already seen, notify completion immediately
      onComplete?.();
    }
  }, [storageKey, onComplete]);

  const getSteps = (): Step[] => {
    switch (stepsKey) {
      case "dashboard":
        return [
          {
            target: ".onboarding-intermediate-button",
            content: (
              <div className="text-left font-sans">
                <h3 className="font-bold mb-1 text-[#2d87a4]">Start Your Simulation 🎙️</h3>
                <p className="text-slate-600">Clicking the <strong>Intermediate</strong> button will launch a live, voice-based simulation with a virtual patient or examiner. Ensure your microphone is ready—you'll need to respond verbally to progress!</p>
              </div>
            ),
            placement: "top",
          },
        ];
      case "attempts":
        return [
          {
            target: "body",
            content: (
              <div className="text-left font-sans">
                <h3 className="font-bold text-lg mb-2 text-[#2d87a4]">Your Progress History 📈</h3>
                <p className="text-slate-600">Track all your previous scenario attempts and see how much you've improved over time.</p>
              </div>
            ),
            placement: "center",
          },
          {
            target: "table",
            content: (
              <div className="text-left font-sans">
                <h3 className="font-bold mb-1 text-[#2d87a4]">Detailed Metrics</h3>
                <p className="text-slate-600">View your <strong>Total Score</strong>, SOP adherence, and communication quality for every session.</p>
              </div>
            ),
            placement: "top",
          },
          {
            target: ".onboarding-search-attempts",
            content: (
              <div className="text-left font-sans">
                <h3 className="font-bold mb-1 text-[#2d87a4]">Search & Filter</h3>
                <p className="text-slate-600">Quickly find specific scenarios or filter by date to review your performance.</p>
              </div>
            ),
            placement: "bottom",
          },
        ];
      case "assessment":
        return [
          {
            target: "body",
            content: (
              <div className="text-left font-sans">
                <h3 className="font-bold text-lg mb-2 text-[#2d87a4]">Live Simulation 🎙️</h3>
                <p className="text-slate-600">You are about to interact with an AI agent. Make sure your microphone is working and you are in a quiet place.</p>
              </div>
            ),
            placement: "center",
          },
          {
            target: ".onboarding-voice-agent",
            content: (
              <div className="text-left font-sans">
                <h3 className="font-bold mb-1 text-[#2d87a4]">The AI Agent</h3>
                <p className="text-slate-600">This is your patient/examiner. Listen carefully to what they say and respond verbally.</p>
              </div>
            ),
            placement: "bottom",
          },
          {
            target: ".onboarding-mic-toggle",
            content: (
              <div className="text-left font-sans">
                <h3 className="font-bold mb-1 text-[#2d87a4]">Microphone Control</h3>
                <p className="text-slate-600">Toggle your microphone here. Ensure it's active when you want to speak.</p>
              </div>
            ),
            placement: "top",
          },
          {
            target: ".onboarding-timer",
            content: (
              <div className="text-left font-sans">
                <h3 className="font-bold mb-1 text-[#2d87a4]">Session Timer</h3>
                <p className="text-slate-600">Keep an eye on the clock! Some sessions have time limits for each round.</p>
              </div>
            ),
            placement: "bottom",
          },
        ];
      case "assessment_blink":
        return [
          {
            target: ".onboarding-next-stage-button",
            content: (
              <div className="text-left font-sans">
                <h3 className="font-bold mb-1 text-[#2d87a4]">Ready for the next round? 🚀</h3>
                <p className="text-slate-600">Whenever you're ready or done early, click this button to move to the next stage of the assessment.</p>
              </div>
            ),
            placement: "top",
          },
        ];
      default:
        return [];
    }
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem(storageKey, "true");
      onComplete?.();
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={getSteps()}
      styles={{
        options: {
          primaryColor: "#2d87a4",
          zIndex: 10000,
          backgroundColor: "#ffffff",
          arrowColor: "#ffffff",
          textColor: "#1e293b",
        },
        buttonNext: {
          borderRadius: "8px",
          padding: "8px 16px",
          fontSize: "14px",
          fontWeight: "600",
        },
        buttonSkip: {
          color: "#94a3b8",
          fontSize: "14px",
        },
        buttonBack: {
          marginRight: "10px",
          color: "#64748b",
        },
        tooltip: {
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
      }}
      locale={{
        last: "Finish",
        skip: "Skip All",
        next: "Next",
        back: "Back",
      }}
    />
  );
};
