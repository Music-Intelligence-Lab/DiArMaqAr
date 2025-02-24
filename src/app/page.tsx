"use client";

import { useState, useEffect } from "react";
import TuningSystem from "@/models/TuningSystem";
import NoteName from "@/models/NoteName";
import tuningSystemsData from "@/../data/tuningSystems.json";
export default function Home() {
  const [tuningSystems, setTuningSystems] = useState<TuningSystem[]>([]);

  useEffect(() => {
    const formattedTuningSystems = tuningSystemsData.map(
      (data) =>
        new TuningSystem(
          data.id,
          data.title,
          data.year,
          data.source,
          data.creator,
          data.comments,
          data.notes,
          data.noteNames as NoteName[],
          Number(data.stringLength),
          Number(data.referenceFrequency)
        )
    );

    setTuningSystems(formattedTuningSystems);
  }, []);

  return (
    <div className="home-page">
      <div className="home-page__title">Maqam Network</div>
      {tuningSystems.map((tuningSystem) => (
        <div className="home-page__tuning-system" key={tuningSystem.getId()}>
          <h2>{tuningSystem.getTitle()}</h2>
          <p>{tuningSystem.getYear()}</p>
          <p>{tuningSystem.getSource()}</p>
          <p>{tuningSystem.getCreator()}</p>
          <p>{tuningSystem.getComments()}</p>
          <p>{tuningSystem.getNotes()}</p>
          <p>{tuningSystem.getNoteNames()}</p>
          <p>{tuningSystem.getStringLength()}</p>
          <p>{tuningSystem.getReferenceFrequency()}</p>
        </div>
      ))}
    </div>
  );
}
