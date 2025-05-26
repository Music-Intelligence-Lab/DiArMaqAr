"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface MenuContextInterface {
  openNavigation: boolean;
  setOpenNavigation: React.Dispatch<React.SetStateAction<boolean>>;
  openSettings: boolean;
  setOpenSettings: React.Dispatch<React.SetStateAction<boolean>>;
  openBottomDrawer: boolean;
  setOpenBottomDrawer: React.Dispatch<React.SetStateAction<boolean>>;
}

const MenuContext = createContext<MenuContextInterface | undefined>(undefined);

export function MenuContextProvider({ children }: { children: ReactNode }) {
  const [openNavigation, setOpenNavigation] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [openBottomDrawer, setOpenBottomDrawer] = useState(false);

  return (
    <MenuContext.Provider
      value={{
        openNavigation,
        setOpenNavigation,
        openSettings,
        setOpenSettings,
        openBottomDrawer,
        setOpenBottomDrawer,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenuContext() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
}
