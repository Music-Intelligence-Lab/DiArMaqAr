"use client";

import React from "react";
import { useAppContext } from "@/contexts/app-context";
import { Source } from "@/models/bibliography/Source";
import Book from "@/models/bibliography/Book";
import Article from "@/models/bibliography/Article";
import { Contributor } from "@/models/bibliography/AbstractSource";

export default function SourcesList() {
  const { sources } = useAppContext();

  // Helper to format contributor names as "Last, First; Last, First; …"
  const formatContributorsEnglish = (contributors: Contributor[]): string => {
    if (contributors.length === 0) return "";
    return contributors
      .map((c) => `${c.lastNameEnglish}, ${c.firstNameEnglish}`)
      .join("; ");
  };

  // Helper to format contributor names as "Last First؛ Last First؛ …" (using Arabic space and semicolon)
  const formatContributorsArabic = (contributors: Contributor[]): string => {
    if (contributors.length === 0) return "";
    return contributors
      .map((c) => `${c.lastNameArabic} ${c.firstNameArabic}`)
      .join("؛ ");
  };

  // Build an English citation string for either Book or Article
  const buildEnglishCitation = (source: Source): string => {
    const common = [];
    // Contributors
    const contribs = formatContributorsEnglish(source.getContributors());
    if (contribs) common.push(contribs);

    // Title
    common.push(source.getTitleEnglish());

    // Edition (if present)
    const edEng = source.getEditionEnglish();
    if (edEng) common.push(`Edition: ${edEng}`);

    // Publication Date
    const pubDateEng = source.getReleaseDateEnglish();
    if (pubDateEng) common.push(pubDateEng);

    // Now branch by type:
    if (source.getSourceType() === "Book") {
      const book = source as Book;
      // Original Publication Date
      const origEng = book.getOriginalReleaseDateEnglish();
      if (origEng) common.push(`Orig. Pub.: ${origEng}`);

      // Publisher & Place
      const pubEng = book.getPublisherEnglish();
      const placeEng = book.getPlaceEnglish();
      if (pubEng || placeEng) {
        const parts = [];
        if (pubEng) parts.push(pubEng);
        if (placeEng) parts.push(`(${placeEng})`);
        common.push(parts.join(" "));
      }

      // ISBN
      const isbn = book.getISBN();
      if (isbn) common.push(`ISBN: ${isbn}`);
    } else {
      // Article
      const article = source as Article;
      // Journal, Volume, Issue, Page Range
      const journalEng = article.getJournalEnglish();
      const volumeEng = article.getVolumeEnglish();
      const issueEng = article.getIssueEnglish();
      const pageRangeEng = article.getPageRangeEnglish();

      if (journalEng) {
        let journalLine = journalEng;
        if (volumeEng) journalLine += `, Vol. ${volumeEng}`;
        if (issueEng) journalLine += `, Issue ${issueEng}`;
        if (pageRangeEng) journalLine += `, pp. ${pageRangeEng}`;
        common.push(journalLine);
      }

      // DOI
      const doi = article.getDOI();
      if (doi) common.push(`DOI: ${doi}`);
    }

    // URL & Date Accessed
    const url = source.getUrl();
    if (url) common.push(`URL: ${url}`);
    const dateAcc = source.getDateAccessed();
    if (dateAcc) common.push(`Accessed: ${dateAcc}`);

    return common.join(". ") + ".";
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
    const pubDateAr = source.getReleaseDateArabic();
    if (pubDateAr) common.push(pubDateAr);

    // Branch by type:
    if (source.getSourceType() === "Book") {
      const book = source as Book;
      // Original Publication Date
      const origAr = book.getOriginalReleaseDateArabic();
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
      {sources.map((src: Source) => (
        <div key={src.getId()} className="sources-list__row">
          <div className="sources-list__cell sources-list__cell--english">
            {buildEnglishCitation(src)}
          </div>
          <div className="sources-list__cell sources-list__cell--arabic">
            {buildArabicCitation(src)}
          </div>
        </div>
      ))}
    </div>
  );
}
