"use client";

import useMenuContext from "@/contexts/menu-context";
import SourcesManager from "@/components/sources-manager";
import SourcesList from "@/components/sources-list";
import Footer from "@/components/footer";

export default function BibliographyClient() {
  const { showAdminTabs } = useMenuContext();

  return (
    <div className="main-content">
      {showAdminTabs ? <SourcesManager />: <SourcesList />}
      <Footer />
    </div>
  );
}
