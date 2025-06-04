"use client";

import React, { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/app-context";
import Source, { Contributor } from "@/models/Source";
import { nanoid } from "nanoid";
import { updateSources } from "@/functions/update";

export default function SourcesManager() {
  const { sources, setSources } = useAppContext();
  const [selectedSourceId, setSelectedSourceId] = useState<string>("new");
  const [id, setId] = useState<string>("");
  const [titleEnglish, setTitleEnglish] = useState<string>("");
  const [titleArabic, setTitleArabic] = useState<string>("");
  const [sourceType, setSourceType] = useState<"Book" | "Article">("Book");
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [editionEnglish, setEditionEnglish] = useState<string>("");
  const [editionArabic, setEditionArabic] = useState<string>("");
  const [publicationDateEnglish, setReleaseDateEnglish] = useState<string>("");
  const [publicationDateArabic, setReleaseDateArabic] = useState<string>("");
  const [originalPublicationDateEnglish, setOriginalReleaseDateEnglish] = useState<string>("");
  const [originalPublicationDateArabic, setOriginalReleaseDateArabic] = useState<string>("");
  const [publisherEnglish, setPublisherEnglish] = useState<string>("");
  const [publisherArabic, setPublisherArabic] = useState<string>("");
  const [placeEnglish, setPlaceEnglish] = useState<string>("");
  const [placeArabic, setPlaceArabic] = useState<string>("");
  const [ISBN, setISBN] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [dateAccessed, setDateAccessed] = useState<string>("");

  useEffect(() => {
    if (selectedSourceId === "new") {
      setId(nanoid());
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
      setPlaceEnglish("");
      setPlaceArabic("");
      setISBN("");
      setUrl("");
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
        setPlaceEnglish(source.getPlaceEnglish());
        setPlaceArabic(source.getPlaceArabic());
        setISBN(source.getISBN());
        setUrl(source.getUrl());
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
      publicationDateEnglish,
      publicationDateArabic,
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

    let updatedSources: Source[];
    if (selectedSourceId === "new") {
      updatedSources = [...sources, newSource];
    } else {
      updatedSources = sources.map((s: Source) => (s.getId() === selectedSourceId ? newSource : s));
    }
    setSources(updatedSources);
    updateSources(updatedSources);
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

      <div className="sources-manager__group">
        <div className="sources-manager__input-container">
          <label className="sources-manager__label" htmlFor="sourceSelect">
            Select Source or Create New:
          </label>
          <select className="sources-manager__select" id="sourceSelect" value={selectedSourceId} onChange={handleSelectChange}>
            <option value="new">-- Create New Source --</option>
            {sources.map((s: Source) => (
              <option key={s.getId()} value={s.getId()}>
                {`${s.getContributors()[0].lastNameEnglish} (${s.getReleaseDateEnglish()}) ${s.getTitleEnglish()} (${s.getSourceType()})`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <form className="sources-manager__form" onSubmit={handleSave}>
        {/* Identification & Titles */}
        <div className="sources-manager__group">
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="titleEnglishField">
              Title (English)
            </label>
            <input
              id="titleEnglishField"
              className="sources-manager__input"
              type="text"
              value={titleEnglish}
              onChange={(e) => setTitleEnglish(e.target.value)}
            />
          </div>
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="titleArabicField">
              Title (Arabic)
            </label>
            <input
              id="titleArabicField"
              className="sources-manager__input"
              type="text"
              value={titleArabic}
              onChange={(e) => setTitleArabic(e.target.value)}
            />
          </div>
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="sourceTypeField">
              Type
            </label>
            <select
              id="sourceTypeField"
              className="sources-manager__select"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as "Book" | "Article")}
            >
              <option value="Book">Book</option>
              <option value="Article">Article</option>
            </select>
          </div>
        </div>

        {/* Edition & Dates */}
        <div className="sources-manager__group">
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="editionEnglishField">
              Edition (English)
            </label>
            <input
              id="editionEnglishField"
              className="sources-manager__input"
              type="text"
              value={editionEnglish}
              onChange={(e) => setEditionEnglish(e.target.value)}
            />
          </div>
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="editionArabicField">
              Edition (Arabic)
            </label>
            <input
              id="editionArabicField"
              className="sources-manager__input"
              type="text"
              value={editionArabic}
              onChange={(e) => setEditionArabic(e.target.value)}
            />
          </div>
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="publicationDateEnglishField">
              Publication Date (English)
            </label>
            <input
              id="publicationDateEnglishField"
              className="sources-manager__input"
              type="text"
              value={publicationDateEnglish}
              onChange={(e) => setReleaseDateEnglish(e.target.value)}
            />
          </div>
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="publicationDateArabicField">
              Publication Date (Arabic)
            </label>
            <input
              id="publicationDateArabicField"
              className="sources-manager__input"
              type="text"
              value={publicationDateArabic}
              onChange={(e) => setReleaseDateArabic(e.target.value)}
            />
          </div>
        </div>

        {/* Original Dates & Publisher */}
        <div className="sources-manager__group">
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="originalPublicationDateEnglishField">
              Original Publication Date (English)
            </label>
            <input
              id="originalPublicationDateEnglishField"
              className="sources-manager__input"
              type="text"
              value={originalPublicationDateEnglish}
              onChange={(e) => setOriginalReleaseDateEnglish(e.target.value)}
            />
          </div>
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="originalPublicationDateArabicField">
              Original Publication Date (Arabic)
            </label>
            <input
              id="originalPublicationDateArabicField"
              className="sources-manager__input"
              type="text"
              value={originalPublicationDateArabic}
              onChange={(e) => setOriginalReleaseDateArabic(e.target.value)}
            />
          </div>
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="publisherEnglishField">
              Publisher (English)
            </label>
            <input
              id="publisherEnglishField"
              className="sources-manager__input"
              type="text"
              value={publisherEnglish}
              onChange={(e) => setPublisherEnglish(e.target.value)}
            />
          </div>
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="publisherArabicField">
              Publisher (Arabic)
            </label>
            <input
              id="publisherArabicField"
              className="sources-manager__input"
              type="text"
              value={publisherArabic}
              onChange={(e) => setPublisherArabic(e.target.value)}
            />
          </div>
        </div>

        {/* Place, ISBN & URL */}
        <div className="sources-manager__group">
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="placeEnglishField">
              Place (English)
            </label>
            <input
              id="placeEnglishField"
              className="sources-manager__input"
              type="text"
              value={placeEnglish}
              onChange={(e) => setPlaceEnglish(e.target.value)}
            />
          </div>
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="placeArabicField">
              Place (Arabic)
            </label>
            <input
              id="placeArabicField"
              className="sources-manager__input"
              type="text"
              value={placeArabic}
              onChange={(e) => setPlaceArabic(e.target.value)}
            />
          </div>
          <div className="sources-manager__input-container">
            <label className="sources-manager__label" htmlFor="isbnField">
              ISBN
            </label>
            <input id="isbnField" className="sources-manager__input" type="text" value={ISBN} onChange={(e) => setISBN(e.target.value)} />
          </div>
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
            <input
              id="dateAccessedField"
              className="sources-manager__input"
              type="text"
              value={dateAccessed}
              onChange={(e) => setDateAccessed(e.target.value)}
            />
          </div>
        </div>
        {/* Contributors */}
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
              <select
                className="sources-manager__select"
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
              <button type="button" className="sources-manager__remove-button" onClick={() => handleRemoveContributor(index)}>
                Remove
              </button>
            </div>
          ))}
        </div>
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
