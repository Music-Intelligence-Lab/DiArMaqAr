"use client";

import React, { useState, useEffect } from "react";
import useAppContext from "@/contexts/app-context";
import { Contributor } from "@/models/bibliography/AbstractSource";
import Book from "@/models/bibliography/Book";
import Article from "@/models/bibliography/Article";
import { Source } from "@/models/bibliography/Source";
import { nanoid } from "nanoid";
import { updateSources } from "@/functions/update";

export default function SourcesManager() {
  const { sources, setSources } = useAppContext();

  // “selectedSourceId” can be “new” or the id of an existing Book/Article
  const [selectedSourceId, setSelectedSourceId] = useState<string>("new");

  // Shared fields:
  const [id, setId] = useState<string>("");
  const [titleEnglish, setTitleEnglish] = useState<string>("");
  const [titleArabic, setTitleArabic] = useState<string>("");
  const [sourceType, setSourceType] = useState<"Book" | "Article">("Book");
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [editionEnglish, setEditionEnglish] = useState<string>("");
  const [editionArabic, setEditionArabic] = useState<string>("");
  const [publicationDateEnglish, setPublicationDateEnglish] = useState<string>("");
  const [publicationDateArabic, setPublicationDateArabic] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [dateAccessed, setDateAccessed] = useState<string>("");

  // --- Book‐only fields ---
  const [originalPublicationDateEnglish, setOriginalPublicationDateEnglish] = useState<string>("");
  const [originalPublicationDateArabic, setOriginalPublicationDateArabic] = useState<string>("");
  const [publisherEnglish, setPublisherEnglish] = useState<string>("");
  const [publisherArabic, setPublisherArabic] = useState<string>("");
  const [placeEnglish, setPlaceEnglish] = useState<string>("");
  const [placeArabic, setPlaceArabic] = useState<string>("");
  const [ISBN, setISBN] = useState<string>("");

  // --- Article‐only fields ---
  const [journalEnglish, setJournalEnglish] = useState<string>("");
  const [journalArabic, setJournalArabic] = useState<string>("");
  const [volumeEnglish, setVolumeEnglish] = useState<string>("");
  const [volumeArabic, setVolumeArabic] = useState<string>("");
  const [issueEnglish, setIssueEnglish] = useState<string>("");
  const [issueArabic, setIssueArabic] = useState<string>("");
  const [pageRangeEnglish, setPageRangeEnglish] = useState<string>("");
  const [pageRangeArabic, setPageRangeArabic] = useState<string>("");
  const [DOI, setDOI] = useState<string>("");

  // Whenever selectedSourceId or sources change, populate (or clear) all fields:
  useEffect(() => {
    if (selectedSourceId === "new") {
      // Reset everything for a brand‐new source
      setId(nanoid());
      setTitleEnglish("");
      setTitleArabic("");
      setSourceType("Book");
      setContributors([]);
      setEditionEnglish("");
      setEditionArabic("");
      setPublicationDateEnglish("");
      setPublicationDateArabic("");
      setUrl("");
      setDateAccessed("");

      // Clear Book‐only:
      setOriginalPublicationDateEnglish("");
      setOriginalPublicationDateArabic("");
      setPublisherEnglish("");
      setPublisherArabic("");
      setPlaceEnglish("");
      setPlaceArabic("");
      setISBN("");

      // Clear Article‐only:
      setJournalEnglish("");
      setJournalArabic("");
      setVolumeEnglish("");
      setVolumeArabic("");
      setIssueEnglish("");
      setIssueArabic("");
      setPageRangeEnglish("");
      setPageRangeArabic("");
      setDOI("");
    } else {
      // Find the existing Book or Article from context:
      const found = sources.find((s: Source) => s.getId() === selectedSourceId);
      if (!found) return;

      // Fill shared fields:
      setId(found.getId());
      setTitleEnglish(found.getTitleEnglish());
      setTitleArabic(found.getTitleArabic());
      setSourceType(found.getSourceType());
      setContributors(found.getContributors());
      setEditionEnglish(found.getEditionEnglish());
      setEditionArabic(found.getEditionArabic());
      setPublicationDateEnglish(found.getPublicationDateEnglish());
      setPublicationDateArabic(found.getPublicationDateArabic());
      setUrl(found.getUrl());
      setDateAccessed(found.getDateAccessed());

      // Clear all subtype fields first:
      setOriginalPublicationDateEnglish("");
      setOriginalPublicationDateArabic("");
      setPublisherEnglish("");
      setPublisherArabic("");
      setPlaceEnglish("");
      setPlaceArabic("");
      setISBN("");

      setJournalEnglish("");
      setJournalArabic("");
      setVolumeEnglish("");
      setVolumeArabic("");
      setIssueEnglish("");
      setIssueArabic("");
      setPageRangeEnglish("");
      setPageRangeArabic("");
      setDOI("");

      // Now cast to the correct subclass and populate its own fields:
      if (found.getSourceType() === "Book") {
        const book = found as Book;
        setOriginalPublicationDateEnglish(book.getOriginalPublicationDateEnglish());
        setOriginalPublicationDateArabic(book.getOriginalPublicationDateArabic());
        setPublisherEnglish(book.getPublisherEnglish());
        setPublisherArabic(book.getPublisherArabic());
        setPlaceEnglish(book.getPlaceEnglish());
        setPlaceArabic(book.getPlaceArabic());
        setISBN(book.getISBN());
      } else {
        // Article
        const article = found as Article;
        setJournalEnglish(article.getJournalEnglish());
        setJournalArabic(article.getJournalArabic());
        setVolumeEnglish(article.getVolumeEnglish());
        setVolumeArabic(article.getVolumeArabic());
        setIssueEnglish(article.getIssueEnglish());
        setIssueArabic(article.getIssueArabic());
        setPageRangeEnglish(article.getPageRangeEnglish());
        setPageRangeArabic(article.getPageRangeArabic());
        setDOI(article.getDOI());
      }
    }
  }, [selectedSourceId, sources]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSourceId(e.target.value);
  };

  const handleAddContributor = () => {
    setContributors([
      ...contributors,
      {
        type: "Author",
        firstNameEnglish: "",
        lastNameEnglish: "",
        firstNameArabic: "",
        lastNameArabic: "",
      },
    ]);
  };

  const handleContributorChange = (index: number, field: keyof Contributor, value: string) => {
    const newContributors = [...contributors];
    newContributors[index] = { ...newContributors[index], [field]: value };
    setContributors(newContributors);
  };

  const handleRemoveContributor = (index: number) => {
    setContributors(contributors.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    let newSource: Source;
    if (sourceType === "Book") {
      newSource = new Book(
        id,
        titleEnglish,
        titleArabic,
        contributors,
        editionEnglish,
        editionArabic,
        publicationDateEnglish,
        publicationDateArabic,
        // Book‐only:
        originalPublicationDateEnglish,
        originalPublicationDateArabic,
        publisherEnglish,
        publisherArabic,
        placeEnglish,
        placeArabic,
        ISBN,
        url,
        dateAccessed
      );
    } else {
      // Article
      newSource = new Article(
        id,
        titleEnglish,
        titleArabic,
        contributors,
        editionEnglish,
        editionArabic,
        publicationDateEnglish,
        publicationDateArabic,
        // Article‐only:
        journalEnglish,
        journalArabic,
        volumeEnglish,
        volumeArabic,
        issueEnglish,
        issueArabic,
        pageRangeEnglish,
        pageRangeArabic,
        DOI,
        url,
        dateAccessed
      );
    }

    let updatedSources: Source[];
    if (selectedSourceId === "new") {
      updatedSources = [...sources, newSource];
    } else {
      updatedSources = sources.map((s: Source) => (s.getId() === selectedSourceId ? newSource : s));
    }

    setSources(updatedSources);
    updateSources(updatedSources);
    setSelectedSourceId("new"); // reset to “new” if you want
  };

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSourceId !== "new") {
      const updatedSources = sources.filter((s: Source) => s.getId() !== selectedSourceId);
      setSources(updatedSources);
      updateSources(updatedSources);
      setSelectedSourceId("new");
    }
  };

  return (
    <div className="sources-manager">
      <h2 className="sources-manager__header">Bibliography</h2>
      {selectedSourceId !== "new" && <span className="sources-manager__selected">{`: ${selectedSourceId} ${titleEnglish}`}</span>}

      {/* Select existing or create new */}
      <div className="sources-manager__group">
        <div className="sources-manager__input-container">
          <label className="sources-manager__label" htmlFor="sourceSelect">
            Select Source or Create New:
          </label>
          <select id="sourceSelect" className="sources-manager__select" value={selectedSourceId} onChange={handleSelectChange}>
            <option value="new">-- Create New Source --</option>
            {sources
              .slice()
              .sort((a: Source, b: Source) => {
                // Sort alphabetically by last name, or by title if no contributors
                const aContribs = a.getContributors();
                const bContribs = b.getContributors();
                const aKey = aContribs && aContribs.length > 0 ? aContribs[0].lastNameEnglish.toLowerCase() : a.getTitleEnglish().toLowerCase();
                const bKey = bContribs && bContribs.length > 0 ? bContribs[0].lastNameEnglish.toLowerCase() : b.getTitleEnglish().toLowerCase();
                return aKey.localeCompare(bKey);
              })
              .map((s: Source) => {
                const contribs = s.getContributors();
                const firstContributor = contribs && contribs.length > 0 ? contribs[0] : null;
                const lastName = firstContributor ? firstContributor.lastNameEnglish : "n.a.";
                return (
                  <option key={s.getId()} value={s.getId()}>
                    {`${lastName} (${s.getPublicationDateEnglish()}) ${s.getTitleEnglish()} (${s.getSourceType()})`}
                  </option>
                );
              })}
          </select>
        </div>
      </div>

      <form className="sources-manager__form" onSubmit={handleSave}>
        {/* ───────────────────────────────────────── */}
        {/* Shared fields: Title & Type */}
        {/* ───────────────────────────────────────── */}
        <div className="sources-manager__group">
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="titleEnglishField">
              Title (English)
            </label>
            <input id="titleEnglishField" className="sources-manager__input" type="text" value={titleEnglish} onChange={(e) => setTitleEnglish(e.target.value)} />
          </div>
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="titleArabicField">
              Title (Arabic)
            </label>
            <input id="titleArabicField" className="sources-manager__input" type="text" value={titleArabic} onChange={(e) => setTitleArabic(e.target.value)} />
          </div>
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="sourceTypeField">
              Type
            </label>
            <select id="sourceTypeField" className="sources-manager__select" value={sourceType} onChange={(e) => setSourceType(e.target.value as "Book" | "Article")}>
              <option value="Book">Book</option>
              <option value="Article">Article</option>
            </select>
          </div>
        </div>

        {/* ───────────────────────────────────────── */}
        {/* Shared fields: Edition & Publication Dates */}
        {/* ───────────────────────────────────────── */}
        <div className="sources-manager__group">
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="editionEnglishField">
              Edition (English)
            </label>
            <input id="editionEnglishField" className="sources-manager__input" type="text" value={editionEnglish} onChange={(e) => setEditionEnglish(e.target.value)} />
          </div>
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="editionArabicField">
              Edition (Arabic)
            </label>
            <input id="editionArabicField" className="sources-manager__input" type="text" value={editionArabic} onChange={(e) => setEditionArabic(e.target.value)} />
          </div>
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="pubDateEnglishField">
              Publication Date (English)
            </label>
            <input id="pubDateEnglishField" className="sources-manager__input" type="text" value={publicationDateEnglish} onChange={(e) => setPublicationDateEnglish(e.target.value)} />
          </div>
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="pubDateArabicField">
              Publication Date (Arabic)
            </label>
            <input id="pubDateArabicField" className="sources-manager__input" type="text" value={publicationDateArabic} onChange={(e) => setPublicationDateArabic(e.target.value)} />
          </div>
        </div>

        {/* ───────────────────────────────────────── */}
        {/* Book‐Only: Original Dates, Publisher, Place, ISBN */}
        {/* ...rendered only if sourceType === "Book" */}
        {/* ───────────────────────────────────────── */}
        {sourceType === "Book" && (
          <>
            <div className="sources-manager__group">
              <div className="sources-manager__input-container">
                <label className="sources-manager__label" htmlFor="origPubDateEnglishField">
                  Original Publication Date (English)
                </label>
                <input
                  id="origPubDateEnglishField"
                  className="sources-manager__input"
                  type="text"
                  value={originalPublicationDateEnglish}
                  onChange={(e) => setOriginalPublicationDateEnglish(e.target.value)}
                />
              </div>
              <div className="sources-manager__input-container">
                <label className="sources-manager__label" htmlFor="origPubDateArabicField">
                  Original Publication Date (Arabic)
                </label>
                <input
                  id="origPubDateArabicField"
                  className="sources-manager__input"
                  type="text"
                  value={originalPublicationDateArabic}
                  onChange={(e) => setOriginalPublicationDateArabic(e.target.value)}
                />
              </div>
              <div className="sources-manager__input-container">
                <label className="sources-manager__label" htmlFor="publisherEnglishField">
                  Publisher (English)
                </label>
                <input id="publisherEnglishField" className="sources-manager__input" type="text" value={publisherEnglish} onChange={(e) => setPublisherEnglish(e.target.value)} />
              </div>
              <div className="sources-manager__input-container">
                <label className="sources-manager__label" htmlFor="publisherArabicField">
                  Publisher (Arabic)
                </label>
                <input id="publisherArabicField" className="sources-manager__input" type="text" value={publisherArabic} onChange={(e) => setPublisherArabic(e.target.value)} />
              </div>
            </div>

            <div className="sources-manager__group">
              <div className="sources-manager__input-container">
                <label className="sources-manager__label" htmlFor="placeEnglishField">
                  Place (English)
                </label>
                <input id="placeEnglishField" className="sources-manager__input" type="text" value={placeEnglish} onChange={(e) => setPlaceEnglish(e.target.value)} />
              </div>
              <div className="sources-manager__input-container">
                <label className="sources-manager__label" htmlFor="placeArabicField">
                  Place (Arabic)
                </label>
                <input id="placeArabicField" className="sources-manager__input" type="text" value={placeArabic} onChange={(e) => setPlaceArabic(e.target.value)} />
              </div>
              <div className="sources-manager__input-container">
                <label className="sources-manager__label" htmlFor="isbnField">
                  ISBN
                </label>
                <input id="isbnField" className="sources-manager__input" type="text" value={ISBN} onChange={(e) => setISBN(e.target.value)} />
              </div>
            </div>
          </>
        )}

        {/* ───────────────────────────────────────── */}
        {/* Article‐Only: Journal, Volume, Issue, Page Range, DOI */}
        {/* ...rendered only if sourceType === "Article" */}
        {/* ───────────────────────────────────────── */}
        {sourceType === "Article" && (
          <>
            <div className="sources-manager__group">
              <div className="sources-manager__input-container">
                <label className="sources-manager__label" htmlFor="journalEnglishField">
                  Journal (English)
                </label>
                <input id="journalEnglishField" className="sources-manager__input" type="text" value={journalEnglish} onChange={(e) => setJournalEnglish(e.target.value)} />
              </div>
              <div className="sources-manager__input-container">
                <label className="sources-manager__label" htmlFor="journalArabicField">
                  Journal (Arabic)
                </label>
                <input id="journalArabicField" className="sources-manager__input" type="text" value={journalArabic} onChange={(e) => setJournalArabic(e.target.value)} />
              </div>
              <div className="sources-manager__input-container">
                <label className="sources-manager__label" htmlFor="volumeEnglishField">
                  Volume (English)
                </label>
                <input id="volumeEnglishField" className="sources-manager__input" type="text" value={volumeEnglish} onChange={(e) => setVolumeEnglish(e.target.value)} />
              </div>
              <div className="sources-manager__input-container">
                <label className="sources-manager__label" htmlFor="volumeArabicField">
                  Volume (Arabic)
                </label>
                <input id="volumeArabicField" className="sources-manager__input" type="text" value={volumeArabic} onChange={(e) => setVolumeArabic(e.target.value)} />
              </div>
            </div>

            <div className="sources-manager__group">
              <div className="sources-manager__input-container">
                <label className="sources-manager__label" htmlFor="issueEnglishField">
                  Issue (English)
                </label>
                <input id="issueEnglishField" className="sources-manager__input" type="text" value={issueEnglish} onChange={(e) => setIssueEnglish(e.target.value)} />
              </div>
              <div className="sources-manager__input-container">
                <label className="sources-manager__label" htmlFor="issueArabicField">
                  Issue (Arabic)
                </label>
                <input id="issueArabicField" className="sources-manager__input" type="text" value={issueArabic} onChange={(e) => setIssueArabic(e.target.value)} />
              </div>
              <div className="sources-manager__input-container">
                <label className="sources-manager__label" htmlFor="pageRangeEnglishField">
                  Page Range (English)
                </label>
                <input id="pageRangeEnglishField" className="sources-manager__input" type="text" value={pageRangeEnglish} onChange={(e) => setPageRangeEnglish(e.target.value)} />
              </div>
              <div className="sources-manager__input-container">
                <label className="sources-manager__label" htmlFor="pageRangeArabicField">
                  Page Range (Arabic)
                </label>
                <input id="pageRangeArabicField" className="sources-manager__input" type="text" value={pageRangeArabic} onChange={(e) => setPageRangeArabic(e.target.value)} />
              </div>
            </div>

            <div className="sources-manager__group">
              <div className="sources-manager__input-container">
                <label className="sources-manager__label" htmlFor="doiField">
                  DOI
                </label>
                <input id="doiField" className="sources-manager__input" type="text" value={DOI} onChange={(e) => setDOI(e.target.value)} />
              </div>
            </div>
          </>
        )}

        {/* ───────────────────────────────────────── */}
        {/* URL & Date Accessed (shared) */}
        {/* ───────────────────────────────────────── */}
        <div className="sources-manager__group">
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="urlField">
              URL
            </label>
            <input id="urlField" className="sources-manager__input" type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="dateAccessedField">
              Date Accessed
            </label>
            <input id="dateAccessedField" className="sources-manager__input" type="text" value={dateAccessed} onChange={(e) => setDateAccessed(e.target.value)} />
          </div>
        </div>

        {/* ───────────────────────────────────────── */}
        {/* Contributors (shared) */}
        {/* ───────────────────────────────────────── */}
        <div className="sources-manager__group sources-manager__group_vertical">
          <div className="sources-manager__input-container">
            <div className="sources-manager__label">
              Contributors
              <button type="button" className="sources-manager__add-button" onClick={handleAddContributor}>
                Add Contributor
              </button>
            </div>
          </div>
          {contributors.map((contributor, index) => (
            <div key={index} className="sources-manager__contributor">
              <select className="sources-manager__select" value={contributor.type} onChange={(e) => handleContributorChange(index, "type", e.target.value)}>
                <option value="Author">Author</option>
                <option value="Editor">Editor</option>
                <option value="Translator">Translator</option>
                <option value="Reviewer">Reviewer</option>
                <option value="Investigator">Investigator</option>
              </select>
              <input type="text" placeholder="First Name (English)" value={contributor.firstNameEnglish} onChange={(e) => handleContributorChange(index, "firstNameEnglish", e.target.value)} />
              <input type="text" placeholder="Last Name (English)" value={contributor.lastNameEnglish} onChange={(e) => handleContributorChange(index, "lastNameEnglish", e.target.value)} />
              <input type="text" placeholder="First Name (Arabic)" value={contributor.firstNameArabic} onChange={(e) => handleContributorChange(index, "firstNameArabic", e.target.value)} />
              <input type="text" placeholder="Last Name (Arabic)" value={contributor.lastNameArabic} onChange={(e) => handleContributorChange(index, "lastNameArabic", e.target.value)} />
              <button type="button" className="sources-manager__remove-button" onClick={() => handleRemoveContributor(index)}>
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* ───────────────────────────────────────── */}
        {/* Save & Delete Buttons */}
        {/* ───────────────────────────────────────── */}
        <div className="sources-manager__buttons">
          <button type="submit" className="sources-manager__save-button">
            Save
          </button>
          <button type="button" className="sources-manager__delete-button" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
