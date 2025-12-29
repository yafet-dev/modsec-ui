import { ReactNode } from "react";

interface HeroSectionProps {
  children: ReactNode;
  className?: string;
}

export function HeroSection({ children, className = "" }: HeroSectionProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900 ${className}`}>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}

