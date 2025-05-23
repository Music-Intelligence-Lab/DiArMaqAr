"use client";

import { useAppContext } from "@/contexts/app-context";
import { useSearchParams } from "next/navigation";
import TuningSystemManager from "@/components/tuning-system-manager";
// import JinsManager from "@/components/jins-manager";
import JinsTranspositions from "@/components/jins-transpositions";
// import MaqamManager from "@/components/maqam-manager";
import MaqamTranspositions from "@/components/maqam-transpositions";
import SayrManager from "@/components/sayr-manager";
import KeyboardControls from "@/components/keyboard-controls";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import BottomDrawer from "@/components/bottom-drawer";

export default function Home() {
  const {tuningSystems, ajnas, maqamat, handleUrlParams, selectedTuningSystem, selectedJins, selectedMaqam, maqamSayrId, getFirstNoteName, selectedIndices, originalIndices} = useAppContext();
  const searchParams = useSearchParams();
  const tuningSystemId = searchParams.get("tuningSystem");
  const jinsId = searchParams.get("jins");
  const maqamId = searchParams.get("maqam");
  const sayrId = searchParams.get("sayr");
  const firstNote = searchParams.get("firstNote");

  const router = useRouter();

  useEffect(() => {
    handleUrlParams({
      tuningSystemId: tuningSystemId || undefined,
      jinsId: jinsId || undefined,
      maqamId: maqamId || undefined,
      sayrId: sayrId || undefined,
      firstNote: firstNote || undefined,
    });
  }, [tuningSystems, ajnas, maqamat]);

  useEffect(() => {
      const params = [];
  
      if (selectedTuningSystem) {
        params.push(`tuningSystem=${selectedTuningSystem.getId()}`);
        const firstNote = getFirstNoteName();
        if (firstNote) {
          params.push(`firstNote=${firstNote}`);
        }
      }
  
      if (selectedJins) {
        params.push(`jins=${selectedJins.getId()}`);
      }
  
      if (selectedMaqam) {
        params.push(`maqam=${selectedMaqam.getId()}`);
      }
  
      if (maqamSayrId) {
        params.push(`sayr=${maqamSayrId}`);
      }
  
      if (typeof window !== "undefined" && window.location.pathname !== "/") return;
  
      router.replace(`/?${params.join("&")}`, { scroll: false });
    }, [selectedTuningSystem, selectedJins, selectedMaqam, maqamSayrId, selectedIndices, originalIndices]);
  
  return (
    <div className="home-page">
      <TuningSystemManager />
      {/* <JinsManager /> */}
      {/* <MaqamManager /> */}
      <SayrManager />
      <JinsTranspositions />
      <MaqamTranspositions/>
      <KeyboardControls/>
      <BottomDrawer />
    </div>
  );
}
