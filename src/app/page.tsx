"use client";

import { useSearchParams } from "next/navigation";
import TuningSystemManager from "@/components/tuning-system-manager";
import AudioSettingsCard from "@/components/audio-settings-cards";
import JinsManager from "@/components/jins-manager";
import JinsTranspositions from "@/components/jins-transpositions";
import MaqamManager from "@/components/maqam-manager";
import MaqamTranspositions from "@/components/maqam-transpositions";

export default function Home() {
  const searchParams = useSearchParams();
  const tuningSystemIdFromUrl = searchParams.get("tuningSystem");

  return (
    <div className="home-page">
      <div className="home-page__title">Maqam Network</div>
      <TuningSystemManager urlTuningSystemId={tuningSystemIdFromUrl} />
      <JinsManager />
      <MaqamManager />
      <JinsTranspositions />
      <MaqamTranspositions/>
      <AudioSettingsCard />
    </div>
  );
}
