import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { JetBrains_Mono as Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { GoogleAnalytics } from "@next/third-parties/google";
import { usePathname } from 'next/navigation';

const mono = Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

const inter = Inter({ subsets: ["latin"] });

const title = "AI Uncensored";
const description = "Uncensored, Private, and Creative AI Assistant";
const imageUrl = "/opengraph-image.png";

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
  const pathname = usePathname();
  const isImagePage = pathname === '/image';

  return (
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
            {!isImagePage && <Navbar />}
            {children}
            <Toaster />
            <GoogleAnalytics gaId="G-89BPLVVYGM" />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}