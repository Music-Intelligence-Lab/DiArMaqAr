"use client";

import React from "react";
import useMenuContext from "@/contexts/menu-context";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";

const NavigationMenu = () => {
  const { openSettings, setOpenSettings, openNavigation, setOpenNavigation } = useMenuContext();

  const togglePanel = () => {
    setOpenNavigation((prev) => !prev);
    if (openSettings) setOpenSettings(false);
  };

  return (
    <>
      <button className="navigation-menu-open-button" onClick={togglePanel}>
        <MenuIcon className="navigation-menu-open-button__icon" />
      </button>

      <div className={`navigation-menu-card ${openNavigation ? "navigation-menu-card--open" : ""}`}>
        <div className="navigation-menu-card__content">
          <Link href="/" className="navigation-menu-card__link">
            Home
          </Link>
          <Link href="/landing" className="navigation-menu-card__link">
            Landing Page
          </Link>
          <Link href="/user-guide" className="navigation-menu-card__link">
            User Guide
          </Link>
          <Link href="/about" className="navigation-menu-card__link">
            About Page
          </Link>
          <Link href="/credits" className="navigation-menu-card__link">
            Credits Page
          </Link>
        </div>
      </div>
    </>
  );
};

export default NavigationMenu;
