import type { Metadata } from "next";
import { AppContextProvider } from "@/contexts/app-context";
import { Roboto, Bebas_Neue, Inter } from "next/font/google";
import "./globals.scss";

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
  weight: "200",
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
      <body className={`${roboto.variable} ${bebasNeue.variable} ${inter.variable}`}>
        <AppContextProvider>{children}</AppContextProvider>
      </body>
    </html>
  );
}
