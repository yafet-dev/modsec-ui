import type { Metadata } from "next";
import { Rethink_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { RoleProvider } from "@/components/providers/RoleProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ConfirmationProvider } from "@/components/providers/ConfirmationProvider";
import { SidebarProvider } from "@/components/providers/SidebarProvider";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

const rethinkSans = Rethink_Sans({
  variable: "--font-rethink-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Zergaw WAF",
  description: "Zergaw WAF Settings and Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${rethinkSans.variable} antialiased`}>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem("zergaw_theme");
                  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  const theme = stored || (prefersDark ? "dark" : "light");
                  if (theme === "dark") {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <RoleProvider>
                <ConfirmationProvider>
                  <SidebarProvider>
                    {children}
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        duration: 4000,
                        style: {
                          background: "var(--toast-bg)",
                          color: "var(--toast-color)",
                        },
                        success: {
                          iconTheme: {
                            primary: "#10b981",
                            secondary: "#fff",
                          },
                        },
                        error: {
                          iconTheme: {
                            primary: "#ef4444",
                            secondary: "#fff",
                          },
                        },
                      }}
                    />
                  </SidebarProvider>
                </ConfirmationProvider>
              </RoleProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
