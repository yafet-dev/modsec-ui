"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { HeroSection } from "@/components/layout/HeroSection";
import { LoginForm } from "@/components/auth/LoginForm";

export default function Home() {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading) return;
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  if (isAuthLoading || isAuthenticated) {
    return null;
  }

  return (
    <HeroSection>
      <LoginForm />
    </HeroSection>
  );
}
