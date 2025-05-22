"use client";
import React, { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HomeIcon from "@mui/icons-material/Home";
import SettingsCard from "@/components/settings-cards";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import QueueMusicIcon from '@mui/icons-material/QueueMusic';

export default function Navbar() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);

  const currentPath = usePathname().split("/")[1];

  const toggleSidebar = () => setIsSideBarOpen((prev) => !prev);

  const closeSidebar = () => setIsSideBarOpen(false);

  return (
    <nav className="navbar">
      <header className="navbar__top-bar">
        <div className="navbar__left-panel">
          <div className="navbar__left-panel-icon" onClick={toggleSidebar}>
            <MenuIcon />
          </div>
        </div>

        <div className="navbar__center-panel">Maqam Network</div>
        <div className="navbar__right-panel">
          <div className="navbar__left-panel-icon">
            <SettingsCard />
          </div>
        </div>
      </header>

      {isSideBarOpen && <div className="navbar__backdrop" onClick={closeSidebar} onTouchMove={closeSidebar} />}

      <section className={"navbar__side-bar " + (isSideBarOpen ? "navbar__side-bar_open" : "")}>
        <div className="navbar__side-bar-content" onClick={(e) => e.stopPropagation()}>
          <div className="navbar__side-bar-content-top">
            <Link onClick={closeSidebar} href="/" className={`navbar__side-bar-link ${currentPath === "" ? "navbar__side-bar-link_active" : ""}`}>
              <HomeIcon />
              Home
            </Link>
            <Link
              onClick={closeSidebar}
              href="/bibliography"
              className={`navbar__side-bar-link ${currentPath === "bibliography" ? "navbar__side-bar-link_active" : ""}`}
            >
              <LibraryBooksIcon />
              Bibliography
            </Link>
            <Link
              onClick={closeSidebar}
              href="/patterns"
              className={`navbar__side-bar-link ${currentPath === "patterns" ? "navbar__side-bar-link_active" : ""}`}
            >
              <QueueMusicIcon />
              Patterns
            </Link>
          </div>
        </div>
      </section>
    </nav>
  );
}
