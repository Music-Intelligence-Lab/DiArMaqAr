import type { Metadata } from "next";
import { AppContextProvider } from "@/contexts/app-context";
import { SoundContextProvider } from "@/contexts/sound-context";
import { FilterContextProvider } from "@/contexts/filter-context";
import { MenuContextProvider } from "@/contexts/menu-context";
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
  title: "Maqam Network",
  description: "Maqam Network",
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
      </body>
    </html>
  );
}
