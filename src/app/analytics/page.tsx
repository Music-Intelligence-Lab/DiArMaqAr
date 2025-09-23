import type { Metadata } from "next";
import AnalyticsClient from "./analytics-client";

export const metadata: Metadata = {
  title: "Maqām Analytics - Interactive Data Explorer",
  description: "Interactive analytics tool for exploring maqām transpositions, modulations, and statistical analysis across different tuning systems.",
  keywords: "maqam, analytics, transpositions, modulations, tuning systems, Arabic music theory, interactive data",
};

export default function AnalyticsPage() {
  return (
    <div className="analytics-page">
      <div className="analytics-page__container">
        <header className="analytics-page__header">
          <h1 className="analytics-page__title">Maqām Analytics</h1>
          <p className="analytics-page__description">
            Interactive tool for exploring maqām transpositions, modulations, and statistical analysis across different tuning systems.
          </p>
        </header>
        <AnalyticsClient />
      </div>
    </div>
  );
}