import type { Metadata } from "next";
import { Geologica, Figtree } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./lib/auth/authContext";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geologica.variable} ${figtree.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
