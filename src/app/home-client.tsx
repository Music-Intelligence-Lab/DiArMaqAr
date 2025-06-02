"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppContext } from "@/contexts/app-context";
import { useMenuContext } from "@/contexts/menu-context";
import TuningSystemManager from "@/components/tuning-system-manager";
import JinsTranspositions from "@/components/jins-transpositions";
import MaqamTranspositions from "@/components/maqam-transpositions";
import SayrManager from "@/components/sayr-manager";
import KeyboardControls from "@/components/keyboard-controls";
import getFirstNoteName from "@/functions/getFirstNoteName";
import SourcesManager from "@/components/sources-manager";
import PatternsManager from "@/components/patterns-manager";
import JinsManager from "@/components/jins-manager";
import MaqamManager from "@/components/maqam-manager";

export default function HomeClient() {
  const {
    tuningSystems,
    ajnas,
    maqamat,
    handleUrlParams,
    selectedTuningSystem,
    selectedJins,
    selectedMaqam,
    maqamSayrId,
    selectedIndices,
    originalIndices,
  } = useAppContext();

  const { selectedMenu } = useMenuContext();

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    handleUrlParams({
      tuningSystemId: searchParams.get("tuningSystem") ?? undefined,
      jinsId: searchParams.get("jins") ?? undefined,
      maqamId: searchParams.get("maqam") ?? undefined,
      sayrId: searchParams.get("sayr") ?? undefined,
      firstNote: searchParams.get("firstNote") ?? undefined,
    });
  }, [tuningSystems, ajnas, maqamat]);

  useEffect(() => {
    const params: string[] = [];

    if (selectedTuningSystem) {
      params.push(`tuningSystem=${selectedTuningSystem.getId()}`);
      const first = getFirstNoteName(selectedIndices);
      if (first) params.push(`firstNote=${first}`);
    }

    if (selectedJins) params.push(`jins=${selectedJins.getId()}`);
    if (selectedMaqam) params.push(`maqam=${selectedMaqam.getId()}`);
    if (maqamSayrId) params.push(`sayr=${maqamSayrId}`);

    if (typeof window !== "undefined" && window.location.pathname === "/") {
      router.replace(`/?${params.join("&")}`, { scroll: false });
    }
  }, [selectedTuningSystem, selectedJins, selectedMaqam, maqamSayrId, selectedIndices, originalIndices]);

  return (
    <div className="home-page">
      {selectedMenu === "tuningSystem" && <TuningSystemManager admin={false} />}
      {selectedMenu === "tuningSystem-admin" && <TuningSystemManager admin />}
      {selectedMenu === "maqam" && selectedTuningSystem && <MaqamManager admin={false} />}
      {selectedMenu === "maqam-admin" && selectedTuningSystem && <MaqamManager admin/>}
      {(selectedMenu === "maqam" || selectedMenu === "maqam-admin") && selectedTuningSystem && <MaqamTranspositions />}
      {selectedMenu === "jins" && selectedTuningSystem && <JinsManager admin={false} />}
      {selectedMenu === "jins-admin" && selectedTuningSystem && <JinsManager admin />}
      {(selectedMenu === "jins" || selectedMenu === "jins-admin") && selectedTuningSystem && <JinsTranspositions />}
      {selectedMenu === "sayr" && selectedMaqam && <SayrManager admin={false} />}
      {selectedMenu === "sayr-admin" && selectedMaqam && <SayrManager admin />}
      {selectedMenu === "bibliography-admin" && <SourcesManager />}
      {selectedMenu === "pattern-admin" && <PatternsManager />}
      <KeyboardControls />
    </div>
  );
}
