import type { Metadata } from "next";
import StatisticsClient from "./statistics-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    metadataBase: new URL("https://diarmaqar.net"),
    title: "Maqām Statistics - Interactive Data Explorer",
    description: "Interactive statistics tool for exploring maqām transpositions, modulations, and statistical analysis across different tuning systems.",
    keywords: "maqam, statistics, transpositions, modulations, tuning systems, Arabic music theory, interactive data",
    alternates: { canonical: `/${lang}/analytics` },
  };
}

export default function StatisticsPage() {
  return (
    <div className="statistics-page">
      <div className="statistics-page__container">
        <header className="statistics-page__header">
          <h1 className="statistics-page__title">Maqām Statistics</h1>
          <p className="statistics-page__description">
            Interactive tool for exploring maqām transpositions, modulations, and statistical analysis across different tuning systems.
          </p>
        </header>
        <StatisticsClient />
      </div>
    </div>
  );
}