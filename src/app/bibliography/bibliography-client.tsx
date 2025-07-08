"use client";

import useMenuContext from "@/contexts/menu-context";
import SourcesManager from "@/components/sources-manager";
import SourcesList from "@/components/sources-list";

export default function HomeClient() {
  const { showAdminTabs } = useMenuContext();

  return (
    <div className="tools-page">
      {showAdminTabs ? <SourcesManager />: <SourcesList />}
    </div>
  );
}
