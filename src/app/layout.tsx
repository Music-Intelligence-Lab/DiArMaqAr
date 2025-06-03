import type { Metadata } from "next";
import { AppContextProvider } from "@/contexts/app-context";
import { FilterContextProvider } from "@/contexts/filter-context";
import { MenuContextProvider } from "@/contexts/menu-context";
import Navbar from "@/components/navbar";
import { Readex_Pro, Roboto, Bebas_Neue, Inter } from "next/font/google";
import "./globals.scss";

const readexPro = Readex_Pro({
  weight: ["200", "300", "400"],
  subsets: ["latin", "arabic"],
  display: "swap",
  variable: "--font-readex-pro",
});

const roboto = Roboto({
  weight: "300",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bebas-neue",
});

const inter = Inter({
  weight: ["200", "300", "400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
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
      <body className={`${readexPro.variable}`}>
        <AppContextProvider>
          <MenuContextProvider>
            <FilterContextProvider>
              <Navbar />
              <main className="center-container">{children}</main>
            </FilterContextProvider>
          </MenuContextProvider>
        </AppContextProvider>
      </body>
    </html>
  );
}
