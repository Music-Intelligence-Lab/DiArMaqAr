"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface MenuContextInterface {
  showAdminTabs: boolean;
  setShowAdminTabs: React.Dispatch<React.SetStateAction<boolean>>;
  openNavigation: boolean;
  setOpenNavigation: React.Dispatch<React.SetStateAction<boolean>>;
  openSettings: boolean;
  setOpenSettings: React.Dispatch<React.SetStateAction<boolean>>;
  selectedMenu:
    | ""
    | "tuningSystem"
    | "maqam"
    | "jins"
    | "sayr"
    | "modulation"
    | "pattern"
    | "tuningSystem-admin"
    | "maqam-admin"
    | "jins-admin"
    | "sayr-admin"
    | "pattern-admin";
  setSelectedMenu: React.Dispatch<
    React.SetStateAction<
      | ""
      | "tuningSystem"
      | "maqam"
      | "jins"
      | "sayr"
      | "modulation"
      | "pattern"
      | "tuningSystem-admin"
      | "maqam-admin"
      | "jins-admin"
      | "sayr-admin"
      | "pattern-admin"
    >
  >;
}

const MenuContext = createContext<MenuContextInterface | undefined>(undefined);

export function MenuContextProvider({ children }: { children: ReactNode }) {
  const [showAdminTabs, setShowAdminTabs] = useState(false);
  const [openNavigation, setOpenNavigation] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<
    | ""
    | "tuningSystem"
    | "maqam"
    | "jins"
    | "sayr"
    | "modulation"
    | "pattern"
    | "tuningSystem-admin"
    | "maqam-admin"
    | "jins-admin"
    | "sayr-admin"
    | "pattern-admin"
  >("tuningSystem");

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/app" && selectedMenu !== "") {
      router.push("/app");
    }
  }, [selectedMenu]);

  useEffect(() => {
    if (!pathname.startsWith("/app")) {
      setSelectedMenu("");
    }
  }, [pathname]);

  return (
    <MenuContext.Provider
      value={{
        showAdminTabs,
        setShowAdminTabs,
        openNavigation,
        setOpenNavigation,
        openSettings,
        setOpenSettings,
        selectedMenu,
        setSelectedMenu,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export default function useMenuContext() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
}
