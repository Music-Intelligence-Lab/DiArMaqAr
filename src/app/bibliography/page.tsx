"use client";

import React, { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/app-context";
import Source, { Contributor } from "@/models/Source";
import { v4 as uuidv4 } from "uuid";

export default function BibliographyPage() {
  const { sources, setSources, updateAllSources } = useAppContext();
  const [selectedSourceId, setSelectedSourceId] = useState<string>("new");
  const [id, setId] = useState<string>("");
  const [titleEnglish, setTitleEnglish] = useState<string>("");
  const [titleArabic, setTitleArabic] = useState<string>("");
  const [sourceType, setSourceType] = useState<"Book" | "Article">("Book");
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [editionEnglish, setEditionEnglish] = useState<string>("");
  const [editionArabic, setEditionArabic] = useState<string>("");
  const [releaseDateEnglish, setReleaseDateEnglish] = useState<string>("");
  const [releaseDateArabic, setReleaseDateArabic] = useState<string>("");
  const [originalReleaseDateEnglish, setOriginalReleaseDateEnglish] = useState<string>("");
  const [originalReleaseDateArabic, setOriginalReleaseDateArabic] = useState<string>("");
  const [publisherEnglish, setPublisherEnglish] = useState<string>("");
  const [publisherArabic, setPublisherArabic] = useState<string>("");
  const [locationEnglish, setLocationEnglish] = useState<string>("");
  const [locationArabic, setLocationArabic] = useState<string>("");
  const [ISBN, setISBN] = useState<string>("");
  const [digitizedBookURL, setDigitizedBookURL] = useState<string>("");
  const [dateAccessed, setDateAccessed] = useState<string>("");

  useEffect(() => {
    if (selectedSourceId === "new") {
      setId(uuidv4());
      setTitleEnglish("");
      setTitleArabic("");
      setSourceType("Book");
      setContributors([]);
      setEditionEnglish("");
      setEditionArabic("");
      setReleaseDateEnglish("");
      setReleaseDateArabic("");
      setOriginalReleaseDateEnglish("");
      setOriginalReleaseDateArabic("");
      setPublisherEnglish("");
      setPublisherArabic("");
      setLocationEnglish("");
      setLocationArabic("");
      setISBN("");
      setDigitizedBookURL("");
      setDateAccessed("");
    } else {
      const source = sources.find((s: Source) => s.getId() === selectedSourceId);
      if (source) {
        setId(source.getId());
        setTitleEnglish(source.getTitleEnglish());
        setTitleArabic(source.getTitleArabic());
        setSourceType(source.getSourceType());
        setContributors(source.getContributors());
        setEditionEnglish(source.getEditionEnglish());
        setEditionArabic(source.getEditionArabic());
        setReleaseDateEnglish(source.getReleaseDateEnglish());
        setReleaseDateArabic(source.getReleaseDateArabic());
        setOriginalReleaseDateEnglish(source.getOriginalReleaseDateEnglish());
        setOriginalReleaseDateArabic(source.getOriginalReleaseDateArabic());
        setPublisherEnglish(source.getPublisherEnglish());
        setPublisherArabic(source.getPublisherArabic());
        setLocationEnglish(source.getLocationEnglish());
        setLocationArabic(source.getLocationArabic());
        setISBN(source.getISBN());
        setDigitizedBookURL(source.getDigitizedBookURL());
        setDateAccessed(source.getDateAccessed());
      }
    }
  }, [selectedSourceId, sources]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSourceId(e.target.value);
  };

  const handleAddContributor = () => {
    setContributors([...contributors, { type: "Author", firstNameEnglish: "", lastNameEnglish: "", firstNameArabic: "", lastNameArabic: "" }]);
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
    const newSource = new Source(
      id,
      titleEnglish,
      titleArabic,
      sourceType,
      contributors,
      editionEnglish,
      editionArabic,
      releaseDateEnglish,
      releaseDateArabic,
      originalReleaseDateEnglish,
      originalReleaseDateArabic,
      publisherEnglish,
      publisherArabic,
      locationEnglish,
      locationArabic,
      ISBN,
      digitizedBookURL,
      dateAccessed
    );

    let updatedSources: Source[];
    if (selectedSourceId === "new") {
      updatedSources = [...sources, newSource];
    } else {
      updatedSources = sources.map((s: Source) => (s.getId() === selectedSourceId ? newSource : s));
    }
    setSources(updatedSources);
    updateAllSources(updatedSources);
  };

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSourceId !== "new") {
      const updatedSources = sources.filter((s: Source) => s.getId() !== selectedSourceId);
      setSources(updatedSources);
      updateAllSources(updatedSources);
      setSelectedSourceId("new");
    }
  }

  return (
    <div className="sources-page">
      <summary className="sources-page__summary">
        <h2 className="sources-page__header">Bibliography</h2>
        {selectedSourceId !== "new" && <span className="sources-page__selected">{`: ${selectedSourceId} ${titleEnglish}`}</span>}
      </summary>

      <div className="sources-page__group">
        <div className="sources-page__input-container">
          <label className="sources-page__label" htmlFor="sourceSelect">
            Select Source or Create New:
          </label>
          <select className="sources-page__select" id="sourceSelect" value={selectedSourceId} onChange={handleSelectChange}>
            <option value="new">-- Create New Source --</option>
            {sources.map((s: Source) => (
              <option key={s.getId()} value={s.getId()}>
                {`${s.getTitleEnglish()} (${s.getSourceType()})`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <form className="sources-page__form" onSubmit={handleSave}>
        {/* Identification & Titles */}
        <div className="sources-page__group">
          <div className="sources-page__input-container">
            <label className="sources-page__label" htmlFor="titleEnglishField">
              Title (English)
            </label>
            <input
              id="titleEnglishField"
              className="sources-page__input"
              type="text"
              value={titleEnglish}
              onChange={(e) => setTitleEnglish(e.target.value)}
            />
          </div>
          <div className="sources-page__input-container">
            <label className="sources-page__label" htmlFor="titleArabicField">
              Title (Arabic)
            </label>
            <input
              id="titleArabicField"
              className="sources-page__input"
              type="text"
              value={titleArabic}
              onChange={(e) => setTitleArabic(e.target.value)}
            />
          </div>
          <div className="sources-page__input-container">
            <label className="sources-page__label" htmlFor="sourceTypeField">
              Type
            </label>
            <select
              id="sourceTypeField"
              className="sources-page__select"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as "Book" | "Article")}
            >
              <option value="Book">Book</option>
              <option value="Article">Article</option>
            </select>
          </div>
        </div>

        {/* Edition & Dates */}
        <div className="sources-page__group">
          <div className="sources-page__input-container">
            <label className="sources-page__label" htmlFor="editionEnglishField">
              Edition (English)
            </label>
            <input
              id="editionEnglishField"
              className="sources-page__input"
              type="text"
              value={editionEnglish}
              onChange={(e) => setEditionEnglish(e.target.value)}
            />
          </div>
          <div className="sources-page__input-container">
            <label className="sources-page__label" htmlFor="editionArabicField">
              Edition (Arabic)
            </label>
            <input
              id="editionArabicField"
              className="sources-page__input"
              type="text"
              value={editionArabic}
              onChange={(e) => setEditionArabic(e.target.value)}
            />
          </div>
          <div className="sources-page__input-container">
            <label className="sources-page__label" htmlFor="releaseDateEnglishField">
              Release Date (English)
            </label>
            <input
              id="releaseDateEnglishField"
              className="sources-page__input"
              type="text"
              value={releaseDateEnglish}
              onChange={(e) => setReleaseDateEnglish(e.target.value)}
            />
          </div>
          <div className="sources-page__input-container">
            <label className="sources-page__label" htmlFor="releaseDateArabicField">
              Release Date (Arabic)
            </label>
            <input
              id="releaseDateArabicField"
              className="sources-page__input"
              type="text"
              value={releaseDateArabic}
              onChange={(e) => setReleaseDateArabic(e.target.value)}
            />
          </div>
        </div>

        {/* Original Dates & Publisher */}
        <div className="sources-page__group">
          <div className="sources-page__input-container">
            <label className="sources-page__label" htmlFor="originalReleaseDateEnglishField">
              Original Release Date (English)
            </label>
            <input
              id="originalReleaseDateEnglishField"
              className="sources-page__input"
              type="text"
              value={originalReleaseDateEnglish}
              onChange={(e) => setOriginalReleaseDateEnglish(e.target.value)}
            />
          </div>
          <div className="sources-page__input-container">
            <label className="sources-page__label" htmlFor="originalReleaseDateArabicField">
              Original Release Date (Arabic)
            </label>
            <input
              id="originalReleaseDateArabicField"
              className="sources-page__input"
              type="text"
              value={originalReleaseDateArabic}
              onChange={(e) => setOriginalReleaseDateArabic(e.target.value)}
            />
          </div>
          <div className="sources-page__input-container">
            <label className="sources-page__label" htmlFor="publisherEnglishField">
              Publisher (English)
            </label>
            <input
              id="publisherEnglishField"
              className="sources-page__input"
              type="text"
              value={publisherEnglish}
              onChange={(e) => setPublisherEnglish(e.target.value)}
            />
          </div>
          <div className="sources-page__input-container">
            <label className="sources-page__label" htmlFor="publisherArabicField">
              Publisher (Arabic)
            </label>
            <input
              id="publisherArabicField"
              className="sources-page__input"
              type="text"
              value={publisherArabic}
              onChange={(e) => setPublisherArabic(e.target.value)}
            />
          </div>
        </div>

        {/* Location, ISBN & URL */}
        <div className="sources-page__group">
          <div className="sources-page__input-container">
            <label className="sources-page__label" htmlFor="locationEnglishField">
              Location (English)
            </label>
            <input
              id="locationEnglishField"
              className="sources-page__input"
              type="text"
              value={locationEnglish}
              onChange={(e) => setLocationEnglish(e.target.value)}
            />
          </div>
          <div className="sources-page__input-container">
            <label className="sources-page__label" htmlFor="locationArabicField">
              Location (Arabic)
            </label>
            <input
              id="locationArabicField"
              className="sources-page__input"
              type="text"
              value={locationArabic}
              onChange={(e) => setLocationArabic(e.target.value)}
            />
          </div>
          <div className="sources-page__input-container">
            <label className="sources-page__label" htmlFor="isbnField">
              ISBN
            </label>
            <input id="isbnField" className="sources-page__input" type="text" value={ISBN} onChange={(e) => setISBN(e.target.value)} />
          </div>
          <div className="sources-page__input-container">
            <label className="sources-page__label" htmlFor="digitizedBookURLField">
              Digitized Book URL
            </label>
            <input
              id="digitizedBookURLField"
              className="sources-page__input"
              type="text"
              value={digitizedBookURL}
              onChange={(e) => setDigitizedBookURL(e.target.value)}
            />
          </div>
          <div className="sources-page__input-container">
            <label className="sources-page__label" htmlFor="dateAccessedField">
              Date Accessed
            </label>
            <input
              id="dateAccessedField"
              className="sources-page__input"
              type="text"
              value={dateAccessed}
              onChange={(e) => setDateAccessed(e.target.value)}
            />
          </div>
        </div>
        {/* Contributors */}
        <div className="sources-page__group sources-page__group_vertical">
          <div className="sources-page__input-container">
            <div className="sources-page__label">
              Contributors
              <button type="button" className="sources-page__add-button" onClick={handleAddContributor}>
                Add Contributor
              </button>
            </div>
          </div>
          {contributors.map((contributor, index) => (
            <div key={index} className="sources-page__contributor">
              <select
                className="sources-page__select"
                value={contributor.type}
                onChange={(e) => handleContributorChange(index, "type", e.target.value)}
              >
                <option value="Author">Author</option>
                <option value="Editor">Editor</option>
                <option value="Translator">Translator</option>
                <option value="Reviewer">Reviewer</option>
                <option value="Investigator">Investigator</option>
              </select>
              <input
                type="text"
                placeholder="First Name (English)"
                value={contributor.firstNameEnglish}
                onChange={(e) => handleContributorChange(index, "firstNameEnglish", e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name (English)"
                value={contributor.lastNameEnglish}
                onChange={(e) => handleContributorChange(index, "lastNameEnglish", e.target.value)}
              />
              <input
                type="text"
                placeholder="First Name (Arabic)"
                value={contributor.firstNameArabic}
                onChange={(e) => handleContributorChange(index, "firstNameArabic", e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name (Arabic)"
                value={contributor.lastNameArabic}
                onChange={(e) => handleContributorChange(index, "lastNameArabic", e.target.value)}
              />
              <button type="button" className="sources-page__remove-button" onClick={() => handleRemoveContributor(index)}>
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="sources-page__buttons">
          <button type="submit" className="sources-page__save-button">
            Save
          </button>
          <button type="button" className="sources-page__delete-button" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
