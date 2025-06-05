import type { Metadata } from "next";
import { AppContextProvider } from "@/contexts/app-context";
import { FilterContextProvider } from "@/contexts/filter-context";
import { MenuContextProvider } from "@/contexts/menu-context";
import Navbar from "@/components/navbar";
import { Readex_Pro } from "next/font/google";
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
