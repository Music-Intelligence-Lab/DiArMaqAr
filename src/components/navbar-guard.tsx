"use client";

import { usePathname } from "next/navigation";
import { stripLocale } from "@/i18n/navigation";
import Navbar from "./navbar";

export default function NavbarGuard() {
  const pathname = usePathname();
  if (!pathname) return null;
  // Hide navbar on the root landing page
  if (stripLocale(pathname) === "/") return null;
  return <Navbar />;
}
