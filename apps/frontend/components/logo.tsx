import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = "md" }) => {
  const sizeClasses = {
    sm: "text-base", // Smaller for brand label usage
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div
      className={`font-sans tracking-tight flex items-center select-none ${sizeClasses[size]} ${className}`}
    >
      <span className="font-bold text-slate-800">AI</span>
      <span className="font-normal text-[#2d87a4] ml-2">GURU</span>
    </div>
  );
};
