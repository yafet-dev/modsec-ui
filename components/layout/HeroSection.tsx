import { ReactNode } from "react";

interface HeroSectionProps {
  children: ReactNode;
  className?: string;
}

export function HeroSection({ children, className = "" }: HeroSectionProps) {
  return (
    <div
      className={`min-h-screen min-h-[100dvh] flex items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900 px-4 py-8 sm:px-6 ${className}`}
    >
      <div className="w-full max-w-lg mx-auto">{children}</div>
    </div>
  );
}

