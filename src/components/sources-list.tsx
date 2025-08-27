"use client";

import React from "react";
import useAppContext from "@/contexts/app-context";
import { Source, stringifySource } from "@/models/bibliography/Source";
import Book from "@/models/bibliography/Book";
import Article from "@/models/bibliography/Article";
import { Contributor } from "@/models/bibliography/AbstractSource";
import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function SourcesList() {
  const { sources } = useAppContext();

  const [highlighted, setHighlighted] = useState<string | null>(null);
  const sourceRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname === "/bibliography") {
      const sourceParameter = searchParams.get("source");
      if (sourceParameter) {
        for (const source of sources) {
          if (sourceParameter === stringifySource(source, true, null)) {
            setHighlighted(source.getId());
            break;
          }
        }
      }
    }
  }, [pathname, searchParams]);

  // Auto-scroll to highlighted source
  useEffect(() => {
    if (highlighted && sourceRefs.current[highlighted]) {
      sourceRefs.current[highlighted]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [highlighted]);

  // Helper to format contributor names as "Last First؛ Last First؛ …" (using Arabic space and semicolon)
  const formatContributorsArabic = (contributors: Contributor[]): string => {
    if (contributors.length === 0) return "";
    return contributors.map((c) => `${c.lastNameArabic} ${c.firstNameArabic}`).join("؛ ");
  };

  // Build an English citation as JSX for either Book or Article
  const buildEnglishCitation = (source: Source): React.ReactNode => {
    // Helper to format individual names: "Last, F."
    const formatName = (c: Contributor) => `${c.lastNameEnglish}, ${c.firstNameEnglish[0]}.`;

    // Separate contributors by type: authors, editors, translators, reviewers
    const allContribs = source.getContributors();
    const authors = allContribs.filter((c) => c.type.toLowerCase().includes("author"));
    const editors = allContribs.filter((c) => c.type.toLowerCase().includes("editor"));
    const translators = allContribs.filter((c) => c.type.toLowerCase().includes("translator"));
    const reviewers = allContribs.filter((c) => c.type.toLowerCase().includes("reviewer"));

    // 1) Contributors: authors first, each role on its own sentence
    const primaryAuthors = authors.map(formatName).join(" and ");
    const contribLine = (
      <>
        {primaryAuthors && <>{primaryAuthors}.</>}
        {editors.length > 0 && <> Edited by {editors.map(formatName).join(" and ")}.</>}
        {translators.length > 0 && <> Translated by {translators.map(formatName).join(" and ")}.</>}
        {reviewers.length > 0 && <> Reviewed by {reviewers.map(formatName).join(" and ")}.</>}
      </>
    );
    const noContribs = authors.length + editors.length + translators.length + reviewers.length === 0;
    const authorSegment = noContribs ? "n.a." : primaryAuthors;
    const contribSegment = noContribs ? "n.a." : contribLine;

    // 2) Year (assume releaseDateEnglish is "YYYY" or "YYYY-MM-DD")
    const pubDateEng = source.getPublicationDateEnglish() || "";
    const yearMatch = pubDateEng.match(/^\d{4}/);
    const year = yearMatch ? yearMatch[0] : pubDateEng;

    // 3) Title
    const title = (
      <span className="sources-list__citation-title">
        {source.getTitleEnglish()}
        {`.`}
      </span>
    );
    const url = source.getUrl();
    const dateAcc = source.getDateAccessed();
    // Format dateAcc (DD-MM-YYYY) into “DD MMM YYYY”
    const formattedDateAcc = dateAcc
      ? (() => {
          const [day, month, year] = dateAcc.split("-");
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const m = parseInt(month, 10);
          const monthName = monthNames[m - 1] || "";
          return `${day} ${monthName} ${year}`;
        })()
      : "";

    if (source.getSourceType() === "Book") {
      const book = source as Book;
      // Edition (if present)
      const edEng = book.getEditionEnglish();
      const editionPart = edEng ? `${edEng}.` : "";

      // Original publication date (if present)
      const oPubDateEng = book.getOriginalPublicationDateEnglish();
      const oPubDateEngPart = oPubDateEng ? `${oPubDateEng}.` : "";

      // Publisher & Place
      const pubEng = book.getPublisherEnglish();
      const placeEng = book.getPlaceEnglish();
      const publisherPart = pubEng && placeEng ? `${placeEng}: ${pubEng}` : pubEng || placeEng || "";

      return (
        <>
          {authorSegment} ({year}) {editors.length > 0 && <> Edited by {editors.map(formatName).join(" and ")}</>}{" "}
          {translators.length > 0 && <> Translated by {translators.map(formatName).join(" and ")}</>}{" "}
          {reviewers.length > 0 && <> Reviewed by {reviewers.map(formatName).join(" and ")}</>} {title} {editionPart && ` ${editionPart}`}{" "}
          {oPubDateEngPart && ` ${oPubDateEngPart}`} {publisherPart && <>{publisherPart}.</>}{" "}
          {url && (
            <>
              Available at:{" "}
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
            </>
          )}
          {dateAcc && ` [Accessed ${formattedDateAcc}]`}
        </>
      );
    } else {
      // Article
      const article = source as Article;
      const journalEng = article.getJournalEnglish();
      const volumeEng = article.getVolumeEnglish();
      const issueEng = article.getIssueEnglish();
      const pageRangeEng = article.getPageRangeEnglish();

      // Build journal line: Journal Title, 20(4), pp. 332-348.
      const journalLineParts: string[] = [];
      if (journalEng) {
        let line = journalEng;
        if (volumeEng) line += `, ${volumeEng}`;
        if (issueEng) line += `(${issueEng})`;
        if (pageRangeEng) line += `, pp. ${pageRangeEng}`;
        journalLineParts.push(line);
      }

      return (
        <>
          {contribSegment} ({year}) {source.getTitleEnglish()}. <span className="citation-journal">{journalLineParts.join(", ")}</span>.
          {url && (
            <>
              URL:{" "}
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
              .
            </>
          )}
          {dateAcc && ` Accessed: ${formattedDateAcc}.`}
        </>
      );
    }
  };

  // Build an Arabic citation string for either Book or Article
  const buildArabicCitation = (source: Source): string => {
    const common = [];
    // Contributors
    const contribs = formatContributorsArabic(source.getContributors());
    if (contribs) common.push(contribs);

    // Title
    common.push(source.getTitleArabic());

    // Edition (if present)
    const edAr = source.getEditionArabic();
    if (edAr) common.push(`الطبعة: ${edAr}`);

    // Publication Date
    const pubDateAr = source.getPublicationDateArabic();
    if (pubDateAr) common.push(pubDateAr);

    // Branch by type:
    if (source.getSourceType() === "Book") {
      const book = source as Book;
      // Original Publication Date
      const origAr = book.getOriginalPublicationDateArabic();
      if (origAr) common.push(`النشر الأصلي: ${origAr}`);

      // Publisher & Place
      const pubAr = book.getPublisherArabic();
      const placeAr = book.getPlaceArabic();
      if (pubAr || placeAr) {
        const parts = [];
        if (pubAr) parts.push(pubAr);
        if (placeAr) parts.push(`(${placeAr})`);
        common.push(parts.join(" "));
      }

      // ISBN
      const isbn = book.getISBN();
      if (isbn) common.push(`ISBN: ${isbn}`);
    } else {
      // Article
      const article = source as Article;
      // Journal, Volume, Issue, Page Range
      const journalAr = article.getJournalArabic();
      const volumeAr = article.getVolumeArabic();
      const issueAr = article.getIssueArabic();
      const pageRangeAr = article.getPageRangeArabic();

      if (journalAr) {
        let journalLine = journalAr;
        if (volumeAr) journalLine += `، المجلد ${volumeAr}`;
        if (issueAr) journalLine += `، العدد ${issueAr}`;
        if (pageRangeAr) journalLine += `، الصفحات ${pageRangeAr}`;
        common.push(journalLine);
      }

      // DOI (English only—still label it “DOI:”)
      const doi = article.getDOI();
      if (doi) common.push(`DOI: ${doi}`);
    }

    // URL & Date Accessed
    const url = source.getUrl();
    if (url) common.push(`رابط: ${url}`);
    const dateAcc = source.getDateAccessed();
    if (dateAcc) common.push(`تاريخ الإطلاع: ${dateAcc}`);

    return common.join("، ") + "۔";
  };

  return (
    <div className="sources-list">
      {sources
        .slice()
        .sort((a: Source, b: Source) => {
          // Determine primary sort key: first contributor's lastNameEnglish or title if no contributors
          const aContribs = a.getContributors();
          const bContribs = b.getContributors();
          const aKey = aContribs && aContribs.length > 0 ? aContribs[0].lastNameEnglish.toLowerCase() : a.getTitleEnglish().toLowerCase();
          const bKey = bContribs && bContribs.length > 0 ? bContribs[0].lastNameEnglish.toLowerCase() : b.getTitleEnglish().toLowerCase();
          if (aKey < bKey) return -1;
          if (aKey > bKey) return 1;
          return 0;
        })
        .map((src: Source) => (
          <div 
            key={src.getId()} 
            ref={(el) => { sourceRefs.current[src.getId()] = el; }}
            className={"sources-list__row " + (highlighted === src.getId() ? "sources-list__row_highlighted" : "")}
          >
            <div className="sources-list__cell sources-list__cell--english">{buildEnglishCitation(src)}</div>
            <div className="sources-list__cell sources-list__cell--arabic">{buildArabicCitation(src)}</div>
          </div>
        ))}
    </div>
  );
}
