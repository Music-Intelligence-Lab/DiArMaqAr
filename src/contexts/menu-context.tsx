"use client";

import React, { createContext, useState, useContext, useCallback, ReactNode } from "react";
import { useEffect } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { stripLocale } from "@/i18n/navigation";

const ADMIN_TABS_STORAGE_KEY = "diarmaqar:showAdminTabs";

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
  // Admin mode survives a reload. localStorage cannot be read during render —
  // the server render has no window, and a first client render that disagreed
  // with the server HTML would fail hydration — so the stored value is read
  // once on mount instead.
  const [showAdminTabs, setShowAdminTabsState] = useState(false);

  useEffect(() => {
    setShowAdminTabsState(window.localStorage.getItem(ADMIN_TABS_STORAGE_KEY) === "true");
  }, []);

  // Persist from the setter, not from an effect on showAdminTabs: such an
  // effect would fire with the initial `false` before the mount read lands and
  // overwrite a stored `true`.
  const setShowAdminTabs = useCallback<React.Dispatch<React.SetStateAction<boolean>>>((value) => {
    setShowAdminTabsState((previous) => {
      const next = typeof value === "function" ? value(previous) : value;
      window.localStorage.setItem(ADMIN_TABS_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

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
  >("");

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const lang = (Array.isArray(params?.lang) ? params.lang[0] : params?.lang) ?? "en";

  useEffect(() => {
    if (stripLocale(pathname) !== "/app" && selectedMenu !== "") {
      router.push(`/${lang}/app`);
    }
  }, [selectedMenu]);

  useEffect(() => {
    if (!stripLocale(pathname).startsWith("/app")) {
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
