"use client";

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import useMenuContext from "@/contexts/menu-context";
import useLanguageContext from "@/contexts/language-context";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";

const NavigationMenu = () => {
  const { openSettings, setOpenSettings, openNavigation, setOpenNavigation } = useMenuContext();
  const { t } = useLanguageContext();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const togglePanel = (e?: React.MouseEvent | React.KeyboardEvent) => {
    // Prevent event bubbling to document, which would immediately close the menu
    e?.stopPropagation?.();
    if (openNavigation) {
      setOpenNavigation(false);
    } else {
      setOpenNavigation(true);
      if (openSettings) setOpenSettings(false);
    }
  };

  // Close menu when clicking outside, but ignore clicks on the open button
  useEffect(() => {
    if (!openNavigation) return;
    function handleClick(event: MouseEvent) {
      // If click is outside menu and not on the open button, close
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setOpenNavigation(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openNavigation, setOpenNavigation]);

  // Trap focus inside menu and close on ESC
  useEffect(() => {
    if (!openNavigation) return;
    const focusable = menuRef.current?.querySelectorAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])');
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];
    first?.focus();
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenNavigation(false);
        buttonRef.current?.focus();
      }
      if (e.key === "Tab" && focusable && focusable.length > 0) {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openNavigation, setOpenNavigation]);

  // Prevent background scroll when menu is open
  useEffect(() => {
    if (openNavigation) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [openNavigation]);

  // Auto-close menu on route change
  useEffect(() => {
    const handleRoute = () => setOpenNavigation(false);
    window.addEventListener("popstate", handleRoute);
    return () => window.removeEventListener("popstate", handleRoute);
  }, [setOpenNavigation]);

  // Only render portal after mount to avoid hydration errors
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Define navigation links with proper RTL ordering
  const navigationLinks = [
    { href: "/app", key: "nav.home" },
    { href: "/bibliography", key: "nav.bibliography" },
    { href: "/statistics", key: "nav.statistics" },
    { href: "/docs/", key: "nav.documentation" },
    { href: "/about", key: "nav.about" },
    { href: "/credits", key: "nav.credits" },
  ];

  const menuContent = (
    <div ref={menuRef} className={`navigation-menu-card ${openNavigation ? "navigation-menu-card--open" : ""}`} role="dialog" aria-modal="true" aria-label="Main navigation menu" tabIndex={-1}>
      <div className="navigation-menu-card__content">
        {navigationLinks.map((link) => (
          <Link 
            key={link.href} 
            href={link.href} 
            className="navigation-menu-card__link"
          >
            {t(link.key)}
          </Link>
        ))}
      </div>
    </div>
  );

  // Render open button via portal to ensure it's always above all stacking contexts
  const openButton = (
    <button className="navigation-menu-open-button" onClick={togglePanel} aria-haspopup="dialog" aria-expanded={openNavigation} aria-controls="navigation-menu" ref={buttonRef}>
      <MenuIcon className="navigation-menu-open-button__icon" />
    </button>
  );

  return (
    <>
      {mounted && createPortal(openButton, document.body)}
      {mounted && createPortal(menuContent, document.body)}
    </>
  );
};

export default NavigationMenu;
