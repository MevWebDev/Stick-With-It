import type { Metadata } from "next";
import { Geologica, Figtree } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./lib/auth/authContext";
import { UserStatsProvider } from "./lib/userStats/UserStatsContext";
import { ToastProvider } from "./lib/toast/ToastContext";
import { ThemeProvider } from "next-themes";
const geologica = Geologica({
  variable: "--font-geologica",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Stick With It!!!",
  description: "self-care app",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  viewport:
    "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Stick With It!!!",
  },
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geologica.variable} ${figtree.variable} antialiased`}>
        
        <AuthProvider>
          <UserStatsProvider>
            <ToastProvider>
              <ThemeProvider enableSystem={true} defaultTheme="system"  attribute="data-theme">
              {children}
              </ThemeProvider>
              </ToastProvider>
          </UserStatsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
