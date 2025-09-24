import type { Metadata } from "next";
import { AppContextProvider } from "@/contexts/app-context";
import { SoundContextProvider } from "@/contexts/sound-context";
import { TranspositionsContextProvider } from "@/contexts/transpositions-context";
import { FilterContextProvider } from "@/contexts/filter-context";
import { MenuContextProvider } from "@/contexts/menu-context";
import { LanguageContextProvider } from "@/contexts/language-context";
import NavbarGuard from "@/components/navbar-guard";
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
  title: "Digital Arabic Maqām Archive",
  description: "Open-source interactive online platform and library for exploring the Arabic maqām system.",
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
              <TranspositionsContextProvider>
              <MenuContextProvider>
                <FilterContextProvider>
                  <NavbarGuard />
                  <main className="center-container">{children}</main>
                  <Analytics />
                </FilterContextProvider>
              </MenuContextProvider>
              </TranspositionsContextProvider>
            </SoundContextProvider>
          </AppContextProvider>
        </LanguageContextProvider>
      </body>
    </html>
  );
}
