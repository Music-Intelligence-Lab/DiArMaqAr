import Footer from "@/components/footer";
import { getStatistics } from "@/functions/getStatistics";
import StatisticsTable from "./statistics-table";
import "@/styles/statistics.scss";

const format = (value: number) => value.toLocaleString("en-US");

// Western digits, day month year: "10 November 2026"
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default function StatisticsPage() {
  const { generatedAt, archive, tuningSystems } = getStatistics();
  const totals = [
    [archive.tuningSystems, "tuning systems"],
    [archive.tuningSystemStartingNotes, "starting notes"],
    [archive.maqamat, "maqāmāt"],
    [archive.ajnas, "ajnās"],
    [archive.suyur, "suyūr"],
    [archive.sources, "sources"],
    [archive.patterns, "patterns"],
  ] as const;

  return (
    <div className="main-content statistics">
      <div className="statistics__body">
        <dl className="statistics__archive">
          {totals.map(([value, label]) => (
            <div key={label} className="statistics__archive-item">
              <dd className="statistics__archive-value">{format(value)}</dd>
              <dt className="statistics__archive-label">{label}</dt>
            </div>
          ))}
        </dl>
        <p className="statistics__generated">
          Computed on <time dateTime={generatedAt}>{formatDate(generatedAt)}</time>
        </p>
        <StatisticsTable rows={tuningSystems} />
      </div>
      <Footer />
    </div>
  );
}
