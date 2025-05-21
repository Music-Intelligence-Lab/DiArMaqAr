// app/bibliography/[id]/page.tsx
"use client";

import React from "react";
import { useAppContext } from "@/contexts/app-context";
import { useParams } from "next/navigation";
import Source, { Contributor } from "@/models/Source";

export default function SourceDetailPage() {
  const { id } = useParams();
  const { sources } = useAppContext();

  const source = sources.find((s: Source) => s.getId() === id);

  if (!source) {
    return <div className="sources-detail__not-found">Source not found.</div>;
  }

  return (
    <div className="sources-detail">
      <h2 className="sources-detail__header">
        {source.getTitleEnglish()} ({source.getSourceType()})
      </h2>
      <div className="sources-detail__field">
        <span className="sources-detail__label">Title (Arabic):</span>
        <span className="sources-detail__value">{source.getTitleArabic()}</span>
      </div>
      <div className="sources-detail__field">
        <span className="sources-detail__label">Edition:</span>
        <span className="sources-detail__value">
          {source.getEditionEnglish()} / {source.getEditionArabic()}
        </span>
      </div>
      <div className="sources-detail__field">
        <span className="sources-detail__label">Publication Date:</span>
        <span className="sources-detail__value">
          {source.getReleaseDateEnglish()} / {source.getReleaseDateArabic()}
        </span>
      </div>
      <div className="sources-detail__field">
        <span className="sources-detail__label">Original Publication Date:</span>
        <span className="sources-detail__value">
          {source.getOriginalReleaseDateEnglish()} / {source.getOriginalReleaseDateArabic()}
        </span>
      </div>
      <div className="sources-detail__field">
        <span className="sources-detail__label">Publisher:</span>
        <span className="sources-detail__value">
          {source.getPublisherEnglish()} / {source.getPublisherArabic()}
        </span>
      </div>
      <div className="sources-detail__field">
        <span className="sources-detail__label">Place:</span>
        <span className="sources-detail__value">
          {source.getPlaceEnglish()} / {source.getPlaceArabic()}
        </span>
      </div>
      <div className="sources-detail__field">
        <span className="sources-detail__label">ISBN:</span>
        <span className="sources-detail__value">{source.getISBN()}</span>
      </div>
      <div className="sources-detail__field">
        <span className="sources-detail__label">Digitized URL:</span>
        <a
          className="sources-detail__link"
          href={source.getUrl()}
          target="_blank"
          rel="noopener noreferrer"
        >
          {source.getUrl()}
        </a>
      </div>
      <div className="sources-detail__field">
        <span className="sources-detail__label">Date Accessed:</span>
        <span className="sources-detail__value">{source.getDateAccessed()}</span>
      </div>
      <div className="sources-detail__field">
        <span className="sources-detail__label">Contributors:</span>
        <ul className="sources-detail__contributors">
          {source.getContributors().map((c: Contributor, idx: number) => (
            <li key={idx} className="sources-detail__contributor">
              <strong>{c.type}:</strong> {c.firstNameEnglish} {c.lastNameEnglish} &mdash;{" "}
              {c.firstNameArabic} {c.lastNameArabic}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
