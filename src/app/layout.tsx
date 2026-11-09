import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: { default: "CForge", template: "%s · CForge" },
  description: "Learn C, algorithms, data structures, competitive programming, and systems programming through deliberate practice.",
  applicationName: "CForge",
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000")
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#080f18" }
  ]
};

const themeScript = `
  try {
    const theme = localStorage.getItem("theme") || "system";
    const dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  } catch (_) {}
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <a href="#main-content" className="sr-focusable fixed left-4 top-4 z-[100] rounded-lg bg-white px-4 py-2 text-black shadow-lg">Skip to content</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
