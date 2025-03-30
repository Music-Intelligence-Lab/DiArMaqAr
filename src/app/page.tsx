"use client";

import { useSearchParams } from "next/navigation";
import TuningSystemManager from "@/components/tuning-system-manager";

export default function Home() {
  const searchParams = useSearchParams();
  const tuningSystemIdFromUrl = searchParams.get("tuningSystem");

  return (
    <div className="home-page">
      <div className="home-page__title">Maqam Network</div>
      <TuningSystemManager urlTuningSystemId={tuningSystemIdFromUrl} />
    </div>
  );
}
