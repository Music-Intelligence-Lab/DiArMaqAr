"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppContext } from "@/contexts/app-context";
import TuningSystemManager from "@/components/tuning-system-manager";
import JinsTranspositions from "@/components/jins-transpositions";
import MaqamTranspositions from "@/components/maqam-transpositions";
import SayrManager from "@/components/sayr-manager";
import KeyboardControls from "@/components/keyboard-controls";
import BottomDrawer from "@/components/bottom-drawer";
import getFirstNoteName from "@/functions/getFirstNoteName";

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
      <TuningSystemManager />
      {/* <JinsManager /> */}
      {/* <MaqamManager /> */}
      <SayrManager />
      <JinsTranspositions />
      <MaqamTranspositions />
      <KeyboardControls />
      <BottomDrawer />
    </div>
  );
}
