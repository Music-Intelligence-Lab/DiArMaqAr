"use client";

import { useAppContext } from "@/contexts/app-context";
import { useSearchParams } from "next/navigation";
import TuningSystemManager from "@/components/tuning-system-manager";
import JinsManager from "@/components/jins-manager";
import JinsTranspositions from "@/components/jins-transpositions";
import MaqamManager from "@/components/maqam-manager";
import MaqamTranspositions from "@/components/maqam-transpositions";
import SeirManager from "@/components/seir-manager";
import KeyboardControls from "@/components/keyboard-controls";
import { useEffect } from "react";

export default function Home() {
  const {tuningSystems, ajnas, maqamat, handleUrlParams} = useAppContext();
  const searchParams = useSearchParams();
  const tuningSystemId = searchParams.get("tuningSystem");
  const jinsId = searchParams.get("jins");
  const maqamId = searchParams.get("maqam");
  const firstNote = searchParams.get("firstNote");

  useEffect(() => {
    handleUrlParams({
      tuningSystemId: tuningSystemId || undefined,
      jinsId: jinsId || undefined,
      maqamId: maqamId || undefined,
      firstNote: firstNote || undefined,
    });
  }, [tuningSystems, ajnas, maqamat]);
  
  return (
    <div className="home-page">
      <TuningSystemManager />
      <JinsManager />
      <MaqamManager />
      <SeirManager />
      <JinsTranspositions />
      <MaqamTranspositions/>
      <KeyboardControls/>
    </div>
  );
}
