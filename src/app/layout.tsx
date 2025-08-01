import type { Metadata } from "next";
import { AppContextProvider } from "@/contexts/app-context";
import { SoundContextProvider } from "@/contexts/sound-context";
import { FilterContextProvider } from "@/contexts/filter-context";
import { MenuContextProvider } from "@/contexts/menu-context";
import { LanguageContextProvider } from "@/contexts/language-context";
import Navbar from "@/components/navbar";
import MobileWarning from "@/components/mobile-warning";
import { Readex_Pro } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.scss";

const readexPro = Readex_Pro({
  weight: ["200", "300", "400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-readex-pro",
});

export const metadata: Metadata = {
  title: "Arabic Maqām Network | Interactive Platform for Arabic Music Theory",
  description: "An innovative open-access online platform for the study and exploration of the Arabic maqām system. Explore tuning systems, maqāmāt, ajnās, and melodic pathways with real-time audio synthesis and interactive tools for students, musicians, and researchers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="googlebot" content="notranslate" />
        <meta name="google" content="notranslate" />
      </head>
      <body className={`${readexPro.variable}`}>
        <MobileWarning />
        <LanguageContextProvider>
          <AppContextProvider>
            <SoundContextProvider>
              <MenuContextProvider>
                <FilterContextProvider>
                  <Navbar />
                  <main className="center-container">{children}</main>
                  <Analytics />
                </FilterContextProvider>
              </MenuContextProvider>
            </SoundContextProvider>
          </AppContextProvider>
        </LanguageContextProvider>
      </body>
    </html>
  );
}
