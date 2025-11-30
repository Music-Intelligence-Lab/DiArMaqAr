"use client";

import React from "react";
import useAppContext from "@/contexts/app-context";
import { Source } from "@/models/bibliography/Source";
import Book from "@/models/bibliography/Book";
import Article from "@/models/bibliography/Article";
import Thesis from "@/models/bibliography/Thesis";
import { Contributor } from "@/models/bibliography/AbstractSource";
import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { standardizeText } from "@/functions/export";

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
        const source = sources.find((s) => s.getId() === sourceParameter);
        if (source) {
          setHighlighted(source.getId());
        } else {
          setHighlighted(null);
        }
      } else {
        setHighlighted(null);
      }
    } else {
      setHighlighted(null);
    }
  }, [pathname, searchParams, sources]);

  // Auto-scroll to highlighted source
  useEffect(() => {
    if (highlighted && sourceRefs.current[highlighted]) {
      sourceRefs.current[highlighted]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlighted]);

// Helper to format contributor names as
// "LastName، FirstName [MiddleName]؛ LastName، FirstName [MiddleName]؛ …"
const formatContributorsArabic = (contributors: Contributor[]): string => {
  if (contributors.length === 0) return "";
  return contributors
    .map(c => {
      // Build name parts: lastName، firstName [middleName]
      const parts = [`${c.lastNameArabic}، ${c.firstNameArabic}`];
      return parts.join(" ");
    })
    .join("؛ ");
};

  // Build an English citation as JSX for either Book or Article
  const buildEnglishCitation = (source: Source): React.ReactNode => {
    // Helper to format individual names: "Last, F." or "Last, F. M." if first name contains multiple parts
    const formatName = (c: Contributor) => {
      // Split first name by spaces and extract first character of each part as initials
      const firstName = (c.firstNameEnglish || "").trim();
      if (!firstName) {
        return `${c.lastNameEnglish},`;
      }
      const nameParts = firstName.split(/\s+/).filter(part => part.length > 0);
      const initials = nameParts.map(part => part[0].toUpperCase()).join(". ") + ".";
      return `${c.lastNameEnglish}, ${initials}`;
    };

    // Separate contributors by type: authors, editors, translators, reviewers
    const allContribs = source.getContributors();
    const authors = allContribs.filter((c) =>
      c.type.toLowerCase().includes("author")
    );
    const editors = allContribs.filter((c) =>
      c.type.toLowerCase().includes("editor")
    );
    const translators = allContribs.filter((c) =>
      c.type.toLowerCase().includes("translator")
    );
    const reviewers = allContribs.filter((c) =>
      c.type.toLowerCase().includes("reviewer")
    );

    // 1) Contributors: authors first, each role on its own sentence
    const primaryAuthors = authors.map(formatName).join(" and ");
    const contribLine = (
      <>
        {primaryAuthors && <>{primaryAuthors}</>}
        {editors.length > 0 && (
          <> Edited by {editors.map(formatName).join(" and ")}.</>
        )}
        {translators.length > 0 && (
          <> Translated by {translators.map(formatName).join(" and ")}.</>
        )}
        {reviewers.length > 0 && (
          <> Reviewed by {reviewers.map(formatName).join(" and ")}.</>
        )}
      </>
    );
    const noContribs =
      authors.length +
        editors.length +
        translators.length +
        reviewers.length ===
      0;
    const authorSegment = noContribs ? "n.a." : primaryAuthors;
    const contribSegment = noContribs ? "n.a." : contribLine;

    // 2) Year (assume releaseDateEnglish is "YYYY" or "YYYY-MM-DD")
    // Include original publication date if this is a Book with one
    const pubDateEng = source.getPublicationDateEnglish() || "";
    const yearMatch = pubDateEng.match(/^\d{4}/);
    const pubYear = yearMatch ? yearMatch[0] : pubDateEng;

    let year = pubYear;
    if (source.getSourceType() === "Book") {
      const book = source as Book;
      const originalPubDateEng = book.getOriginalPublicationDateEnglish();
      if (originalPubDateEng) {
        const originalYearMatch = originalPubDateEng.match(/^\d{4}/);
        const originalYear = originalYearMatch
          ? originalYearMatch[0]
          : originalPubDateEng;
        year = `${originalYear}/${pubYear}`;
      }
    }

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
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
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
      const publisherPart =
        pubEng && placeEng
          ? `${placeEng}: ${pubEng}`
          : pubEng || placeEng || "";

      return (
        <>
          {authorSegment} ({year}){" "}
          {editors.length > 0 && (
            <> Edited by {editors.map(formatName).join(" and ")}</>
          )}{" "}
          {translators.length > 0 && (
            <> Translated by {translators.map(formatName).join(" and ")}</>
          )}{" "}
          {reviewers.length > 0 && (
            <> Reviewed by {reviewers.map(formatName).join(" and ")}</>
          )}{" "}
          {title} {editionPart && ` ${editionPart}`}{" "}
          {oPubDateEngPart && ` ${oPubDateEngPart}`}{" "}
          {publisherPart && <>{publisherPart}.</>}{" "}
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
    } else if (source.getSourceType() === "Article") {
      // Article
      const article = source as Article;
      const journalEng = article.getJournalEnglish();
      const volumeEng = article.getVolumeEnglish();
      const issueEng = article.getIssueEnglish();
      const pageRangeEng = article.getPageRangeEnglish();

      // Build journal metadata: 20(4), pp. 332-348.
      let journalMetadata = "";
      if (volumeEng) journalMetadata += volumeEng;
      if (issueEng) journalMetadata += `(${issueEng})`;
      if (pageRangeEng) journalMetadata += `, pp. ${pageRangeEng}`;

      return (
        <>
          {contribSegment} ({year}) {source.getTitleEnglish()}.{" "}
          {journalEng && (
            <>
              <span className="citation-journal">
                <em>{journalEng}</em>
              </span>
              {journalMetadata && `, ${journalMetadata}`}
            </>
          )}
          .
          {url && (
            <>
              {" "}Available at:{" "}
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
              .
            </>
          )}
          {dateAcc && ` [Accessed ${formattedDateAcc}]`}
        </>
      );
    } else {
      // Thesis
      const thesis = source as Thesis;
      const degreeTypeEng = thesis.getDegreeTypeEnglish();
      const universityEng = thesis.getUniversityEnglish();
      const departmentEng = thesis.getDepartmentEnglish();
      const databaseName = thesis.getDatabaseName();
      const databaseIdentifier = thesis.getDatabaseIdentifier();

      // Build institution info: "PhD, University of X, Department of Y"
      let institutionInfo = "";
      if (degreeTypeEng) institutionInfo += degreeTypeEng;
      if (universityEng) institutionInfo += `${institutionInfo ? ", " : ""}${universityEng}`;
      if (departmentEng) institutionInfo += `${institutionInfo ? ", " : ""}${departmentEng}`;

      // For theses, build contributor segment without the trailing period
      const thesisCitation = (
        <>
          {authors.length > 0 ? (
            <>
              {authors.map(formatName).join(" and ")} ({year}).{" "}
            </>
          ) : (
            <>n.a. ({year}).{" "}</>
          )}
        </>
      );

      return (
        <>
          {thesisCitation}
          <span className="citation-thesis-title">
            <em>{source.getTitleEnglish()}</em>
          </span>
          {institutionInfo && <>. {institutionInfo}</>}
          {databaseName && databaseIdentifier && (
            <>. {databaseName} ({databaseIdentifier})</>
          )}
          .
          {url && (
            <>
              {" "}Available at:{" "}
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
              .
            </>
          )}
          {dateAcc && ` [Accessed ${formattedDateAcc}]`}
        </>
      );
    }
  };

  // Build an Arabic citation for either Book or Article (returns JSX for clickable links)
  const buildArabicCitation = (source: Source): React.ReactNode => {
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
    const pubDateEng = source.getPublicationDateEnglish();
    if (pubDateEng) common.push(pubDateEng);

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
        // Swap order and use colon, without parentheses:
        const placePublisher = [];
        if (placeAr) placePublisher.push(placeAr);
        if (pubAr) placePublisher.push(pubAr);
        common.push(placePublisher.join("، "));
      }

      // ISBN
      const isbn = book.getISBN();
      if (isbn) common.push(`ISBN: ${isbn}`);
    } else if (source.getSourceType() === "Article") {
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

      // DOI (English only—still label it "DOI:")
      const doi = article.getDOI();
      if (doi) common.push(`DOI: ${doi}`);
    } else if (source.getSourceType() === "Thesis") {
      // Thesis
      const thesis = source as Thesis;
      const degreeTypeAr = thesis.getDegreeTypeArabic();
      const universityAr = thesis.getUniversityArabic();
      const departmentAr = thesis.getDepartmentArabic();
      const databaseName = thesis.getDatabaseName();
      const databaseIdentifier = thesis.getDatabaseIdentifier();

      if (degreeTypeAr) common.push(degreeTypeAr);
      if (universityAr) {
        let universityLine = universityAr;
        if (departmentAr) universityLine += `، ${departmentAr}`;
        common.push(universityLine);
      }
      if (databaseName && databaseIdentifier) {
        common.push(`${databaseName} (${databaseIdentifier})`);
      }
    }

    // URL & Date Accessed
    const url = source.getUrl();
    const dateAcc = source.getDateAccessed();

    // Build the base citation text
    const citationText = common.join("، ");

    // If there's a URL or date accessed, we need to return JSX
    if (url || dateAcc) {
      return (
        <>
          {citationText}
          {url && (
            <>
              ، رابط:{" "}
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
            </>
          )}
          {dateAcc && `، تاريخ الاطلاع: ${dateAcc}`}
          ۔
        </>
      );
    }

    // Otherwise, just return the text with the period
    return citationText + "۔";
  };

  return (
    <div className="sources-list">
      {sources
        .slice()
        .sort((a: Source, b: Source) => {
          // Determine primary sort key: first contributor's lastNameEnglish or title if no contributors
          // Use standardizeText to remove diacritics for consistent sorting
          const aContribs = a.getContributors();
          const bContribs = b.getContributors();
          const aKey =
            aContribs && aContribs.length > 0
              ? standardizeText(aContribs[0].lastNameEnglish.toLowerCase())
              : standardizeText(a.getTitleEnglish().toLowerCase());
          const bKey =
            bContribs && bContribs.length > 0
              ? standardizeText(bContribs[0].lastNameEnglish.toLowerCase())
              : standardizeText(b.getTitleEnglish().toLowerCase());
          return aKey.localeCompare(bKey);
        })
        .map((src: Source) => {
          const isHighlighted = highlighted === src.getId();
          const className = "sources-list__row " + (isHighlighted ? "sources-list__row--highlighted" : "");

          return (
            <div
              key={src.getId()}
              ref={(el) => {
                sourceRefs.current[src.getId()] = el;
              }}
              className={className}
            >
              <div className="sources-list__cell sources-list__cell--arabic">
                {buildArabicCitation(src)}
              </div>
              <div className="sources-list__cell sources-list__cell--english">
                {buildEnglishCitation(src)}
              </div>
            </div>
          );
        })}
    </div>
  );
}
