import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  container?: boolean;
}

export function Section({ children, className = "", container = true }: SectionProps) {
  const content = container ? (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
      {children}
    </div>
  ) : (
    children
  );

  return (
    <section className={className}>
      {content}
    </section>
  );
}

