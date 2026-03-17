"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Header } from "../components/header";
import { SearchBar } from "../components/searchbar";
import { Sidebar } from "../components/sidebar";
import { Scenario } from "../types";
import { ScenarioCard } from "../components/scenario-card";
import { OnboardingGuide } from "../components/onboarding-guide";

import { useScenarios } from "@/lib/hooks/use-scenarios";

export default function Home() {
  const { user, loading: authLoading, signout } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const { data: scenarios = [], isLoading: loadingScenarios } = useScenarios();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#2d87a4] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans text-slate-900">
      <div className="onboarding-sidebar">
        <Sidebar
          onLogout={async () => {
            await signout();
            router.push("/auth/login");
          }}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-10 w-full ml-0 md:ml-20">
        <div className="max-w-[1920px] mx-auto">
          <div className="onboarding-header">
            <Header user={{ ...user, role: "STAFF" }} />
          </div>

          <div className="mb-8 onboarding-search">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          {loadingScenarios ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-[#2d87a4] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 text-sm">Loading scenarios...</p>
              </div>
            </div>
          ) : scenarios.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-slate-400 text-sm">No scenarios available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 onboarding-scenarios">
              {scenarios
                .filter(
                  (scenario: Scenario) =>
                    (scenario.title?.toLowerCase() || "").includes(
                      searchQuery.toLowerCase(),
                    ) ||
                    (scenario.description?.toLowerCase() || "").includes(
                      searchQuery.toLowerCase(),
                    ),
                )
                .map((scenario: Scenario, index: number) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    isFirst={index === 0}
                    onStartAssessment={(scenario, level) => {
                      router.push(
                        `/assessment?scenarioId=${scenario.id}&level=${level}`,
                      );
                    }}
                  />
                ))}
            </div>
          )}
        </div>
      </main>

      <OnboardingGuide userId={user.id} stepsKey="dashboard" />
    </div>
  );
}
