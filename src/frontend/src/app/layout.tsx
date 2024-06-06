import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { JetBrains_Mono as Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react"; // Importing Analytics from Vercel
import { Navbar } from "@/components/nav";
import { Footer } from "@/components/footer";

const mono = Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

const inter = Inter({ subsets: ["latin"] });

const title = "AI Uncensored";
const description = "Uncensored, Private, and Creative AI Assistant";
const imageUrl = "/opengraph-image.png"; // Updated path to the image in the public folder

export const metadata: Metadata = {
  metadataBase: new URL("https://aiuncensored.info/"),
  title,
  description,
  openGraph: {
    title,
    description,
    images: [
      {
        url: imageUrl,
        width: 800,
        height: 600,
        alt: title,
      },
    ],
  },
  twitter: {
    title,
    description,
    images: [
      {
        url: imageUrl,
        alt: title,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn("antialiased", GeistSans.className, mono.className)}
        >
          <Providers>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <Navbar />
              {children}
              <Toaster />
              <Analytics /> {/* Using the Analytics component */}
            </ThemeProvider>
          </Providers>
        </body>
      </html>
    </>
  );
}
