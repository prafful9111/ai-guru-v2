import React from "react";
import { User } from "../types";
import { Logo } from "./logo";

interface HeaderProps {
  user: User;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <div className="bg-white rounded-2xl px-6 py-5 border border-slate-200 shadow-sm mb-6 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
      {/* Left: Brand & Page Context Combined */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          {/* Bigger Product Name */}
          <Logo size="lg" />

          {/* Separator */}
          <span className="mx-4 text-slate-200 text-3xl font-thin">|</span>

          {/* Smaller Page Title */}
          <h1 className="text-lg font-semibold text-slate-500 tracking-tight pt-1">
            All Scenarios
          </h1>
        </div>
        <p className="text-slate-600 text-sm font-medium mt-1">
          Select a Scenario & Level to begin your assessment
        </p>
      </div>

      {/* Right: User Profile - Compact */}
      <div className="flex items-center gap-4 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 self-start md:self-center onboarding-profile">
        <div className="flex flex-col items-end justify-center">
          {/* Line 1: Name (Bigger) */}
          <span className="text-sm font-bold text-slate-800 leading-none mb-1.5">
            {user.name}
          </span>

          {/* Line 2: Role & ID (Smaller, same line) */}
          <div className="flex items-center gap-2 text-[10px] leading-none">
            {/* <span className="uppercase tracking-wide text-slate-500 font-semibold">
              {user.role}
            </span> */}
            {user.department && (
              <>
                {/* <span className="w-1 h-1 rounded-full bg-slate-300"></span> */}
                <span className="text-slate-500 font-medium whitespace-nowrap">
                  {user.department}
                </span>
              </>
            )}
            {/* {user.unit && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-slate-500 font-medium whitespace-nowrap">
                  {user.unit}
                </span>
              </>
            )} */}
          </div>
        </div>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-sm font-bold text-[#2d87a4] border border-slate-200 shadow-sm">
          {user.name.charAt(0)}
        </div>
      </div>
    </div>
  );
};
