"use client";

import React, { FormEvent, useEffect, useState } from "react";
import useAppContext from "@/contexts/app-context";
import useLanguageContext from "@/contexts/language-context";
import { Sayr, SayrStop } from "@/models/Maqam";
import { octaveZeroNoteNames, octaveOneNoteNames, octaveTwoNoteNames, octaveThreeNoteNames } from "@/models/NoteName";
import { nanoid } from "nanoid";
import { updateMaqamat } from "@/functions/update";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import SouthEastIcon from "@mui/icons-material/SouthEast";
import JinsData from "@/models/Jins";
import Link from "next/link";
export default function SayrManager({ admin }: { admin: boolean }) {
  const { t, getDisplayName, language } = useLanguageContext();
  const { selectedMaqamData, setSelectedMaqamData, ajnas, maqamSayrId, setMaqamSayrId, sources, maqamat, setMaqamat /* handleClickJins, handleClickMaqam */ } = useAppContext();

  const [creatorEnglish, setCreatorEnglish] = useState("");
  const [creatorArabic, setCreatorArabic] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [page, setPage] = useState("");
  const [commentsEnglish, setCommentsEnglish] = useState("");
  const [commentsArabic, setCommentsArabic] = useState("");
  const [stops, setStops] = useState<SayrStop[]>([]);

  const resetForm = () => {
    setCreatorEnglish("");
    setCreatorArabic("");
    setSourceId("");
    setPage("");
    setCommentsEnglish("");
    setCommentsArabic("");
    setStops([]);
  };

  useEffect(() => {
    if (selectedMaqamData && maqamSayrId) {
      const sel = selectedMaqamData.getSuyūr().find((s) => s.id === maqamSayrId);
      if (sel) {
        setCreatorEnglish(sel.creatorEnglish ?? "");
        setCreatorArabic(sel.creatorArabic ?? "");
        setSourceId(sel.sourceId ?? "");
        setPage(sel.page ?? "");
        setCommentsEnglish(sel.commentsEnglish ?? "");
        setCommentsArabic(sel.commentsArabic ?? "");
        setStops(sel.stops.map((s) => ({ ...s })));
        return;
      }
    }
    resetForm();
  }, [maqamSayrId, selectedMaqamData]);

  if (!selectedMaqamData) return null;
  const existingSuyūr = selectedMaqamData.getSuyūr();

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => setMaqamSayrId(e.target.value);
  const addStop = () => setStops((prev) => [...prev, { type: "note", value: "" }]);
  const removeStop = (i: number) => setStops((prev) => prev.filter((_, idx) => idx !== i));
  const updateStop = (i: number, field: keyof SayrStop, val: string) => {
    setStops((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const idUse = maqamSayrId || nanoid();
    const newSayr: Sayr = {
      id: idUse,
      creatorEnglish,
      creatorArabic,
      sourceId,
      page,
      commentsEnglish,
      commentsArabic,
      stops,
    };
    const updated = existingSuyūr.some((s) => s.id === idUse) ? existingSuyūr.map((s) => (s.id === idUse ? newSayr : s)) : [...existingSuyūr, newSayr];
    const updatedMaqam = selectedMaqamData.createMaqamWithNewSuyūr(updated);
    setSelectedMaqamData(updatedMaqam);
    setMaqamSayrId(idUse);

    const others = maqamat.filter((m) => m.getId() !== updatedMaqam.getId());
    await updateMaqamat([...others, updatedMaqam]);
    setMaqamat([...others, updatedMaqam]);
  };

  const handleDelete = async () => {
    if (!maqamSayrId) return;
    const filtered = existingSuyūr.filter((s) => s.id !== maqamSayrId);
    const updatedMaqam = selectedMaqamData.createMaqamWithNewSuyūr(filtered);
    setSelectedMaqamData(updatedMaqam);
    setMaqamSayrId("");

    const others = maqamat.filter((m) => m.getId() !== updatedMaqam.getId());
    await updateMaqamat([...others, updatedMaqam]);
    setMaqamat([...others, updatedMaqam]);
  };

  return (
    <div className="sayr-manager">
      {admin && (
        <div className="sayr-manager__group">
          <div className="sayr-manager__input-container">
            <label className="sayr-manager__label" htmlFor="sayrSelect">
              {t('sayr.selectOrCreate')}
            </label>
            <select id="sayrSelect" className="sayr-manager__select" value={maqamSayrId} onChange={handleSelect}>
              <option value="">{t('sayr.newSayr')}</option>
              {existingSuyūr.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.creatorEnglish}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {!admin && (
        <div className="sayr-manager__list">
          {existingSuyūr.length === 0 ? (
            <p>{t('sayr.noSuyurAvailable')}</p>
          ) : (
            existingSuyūr.map((sayr, index) => (
              <div
                key={index}
                className={"sayr-manager__item " + (sayr.id === maqamSayrId ? "sayr-manager__item_selected " : "")}
                onClick={() => {
                  setMaqamSayrId(sayr.id);
                }}
              >
                {sayr.sourceId
                  ? (() => {
                      const source = sources.find((s) => s.getId() === sayr.sourceId);
                      const authorName = language === 'ar' 
                        ? `${source?.getContributors()[0]?.firstNameArabic || source?.getContributors()[0]?.firstNameEnglish || ""} ${source?.getContributors()[0]?.lastNameArabic || source?.getContributors()[0]?.lastNameEnglish || ""}`.trim()
                        : `${source?.getContributors()[0]?.firstNameEnglish || ""} ${source?.getContributors()[0]?.lastNameEnglish || ""}`.trim();
                      const publicationDate = source?.getPublicationDateEnglish() || "";
                      return `${authorName} (${publicationDate}`;
                    })()
                  : t('sayr.noSource')}
                :{sayr.page})
              </div>
            ))
          )}
        </div>
      )}

      <form className="sayr-manager__form" onSubmit={handleSave}>
        {admin && (
          <div className="sayr-manager__group">
            <div className="sayr-manager__input-container">
              <label className="sayr-manager__label">{t('sayr.source')}</label>
              <select className="sayr-manager__select" value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
                <option value="">{t('sayr.selectSource')}</option>
                {[...sources]
                  .sort((a, b) => {
                    const titleA = language === 'ar' ? a.getTitleArabic() || a.getTitleEnglish() : a.getTitleEnglish();
                    const titleB = language === 'ar' ? b.getTitleArabic() || b.getTitleEnglish() : b.getTitleEnglish();
                    return titleA.localeCompare(titleB);
                  })
                  .map((s) => (
                    <option key={s.getId()} value={s.getId()}>
                      {language === 'ar' ? (s.getTitleArabic() || s.getTitleEnglish()) : s.getTitleEnglish()}
                    </option>
                  ))}
              </select>
            </div>
            <div className="sayr-manager__input-container">
              <label className="sayr-manager__label">{t('sayr.page')}</label>
              <input className="sayr-manager__input" type="text" value={page} onChange={(e) => setPage(e.target.value)} />
            </div>
          </div>
        )}

        {admin && (
          <div className="sayr-manager__group">
            <div className="sayr-manager__input-container">
              <label className="sayr-manager__label">{t('sayr.commentsEnglish')}</label>
              <textarea className="sayr-manager__textarea" rows={3} value={commentsEnglish} onChange={(e) => setCommentsEnglish(e.target.value)} />
            </div>
            <div className="sayr-manager__input-container">
              <label className="sayr-manager__label">{t('sayr.commentsArabic')}</label>
              <textarea className="sayr-manager__textarea" rows={3} value={commentsArabic} onChange={(e) => setCommentsArabic(e.target.value)} />
            </div>
          </div>
        )}

        <div className="sayr-manager__stops-section">
          <div className="sayr-manager__comments-section">
            {sourceId &&
              (() => {
                const source = sources.find((s) => s.getId() === sourceId);
                const year = source?.getPublicationDateEnglish() || "";
                const creatorName = language === 'ar'
                  ? `${source?.getContributors()[0]?.firstNameArabic || source?.getContributors()[0]?.firstNameEnglish || ""} ${source?.getContributors()[0]?.lastNameArabic || source?.getContributors()[0]?.lastNameEnglish || ""}`.trim()
                  : `${source?.getContributors()[0]?.firstNameEnglish || ""} ${source?.getContributors()[0]?.lastNameEnglish || ""}`.trim();
                return (
                  <span className="sayr-manager__comments-english_title">
                    {t('sayr.commentsOnSayr')}{" "}
                    <Link href={`/bibliography?source=${sourceId}`}>
                      {creatorName}
                      {year ? ` (${year}` : ""}
                      {page && `:${page})`}
                    </Link>
                  </span>
                );
              })()}
            <span className="sayr-manager__comments-english">
              {language === 'ar' ? (commentsArabic || commentsEnglish) : commentsEnglish}
            </span>
          </div>
          {admin && (
            <h3 className="sayr-manager__stops-header">
              {t('sayr.stops')}{" "}
              <button type="button" className="sayr-manager__add-stop" onClick={addStop}>
                {t('sayr.addStop')}
              </button>
            </h3>
          )}

          <div className="sayr-manager__admin-stops">
            {admin &&
              stops.map((stop, i) => (
                <div key={i} className="sayr-manager__admin-stop">
                  <select className="sayr-manager__stop-type" value={stop.type} onChange={(e) => updateStop(i, "type", e.target.value)}>
                    <option value="note">{t('sayr.note')}</option>
                    <option value="jins">{t('sayr.jins')}</option>
                    <option value="maqam">{t('sayr.maqam')}</option>
                    <option value="direction">{t('sayr.direction')}</option>
                  </select>

                  {/* --- note stop --- */}
                  {stop.type === "note" && (
                    <>
                      <select className="sayr-manager__stop-value" value={stop.value} onChange={(e) => updateStop(i, "value", e.target.value)}>
                        <option value="">{t('sayr.none')}</option>
                        {octaveZeroNoteNames.map((n) => (
                          <option key={n} value={n}>
                            {getDisplayName(n, 'note')}
                          </option>
                        ))}
                        <option disabled>---</option>
                        {octaveOneNoteNames.map((n) => (
                          <option key={n} value={n}>
                            {getDisplayName(n, 'note')}
                          </option>
                        ))}
                        <option disabled>---</option>
                        {octaveTwoNoteNames.map((n) => (
                          <option key={n} value={n}>
                            {getDisplayName(n, 'note')}
                          </option>
                        ))}
                        <option disabled>---</option>
                        {octaveThreeNoteNames.map((n) => (
                          <option key={n} value={n}>
                            {getDisplayName(n, 'note')}
                          </option>
                        ))}
                      </select>
                      {/* Optional direction for note stop */}
                      <select className="sayr-manager__stop-value" value={stop.direction ?? ""} onChange={(e) => updateStop(i, "direction", e.target.value)}>
                        <option value="">{t('sayr.noDirection')}</option>
                        <option value="ascending">{t('sayr.ascending')}</option>
                        <option value="descending">{t('sayr.descending')}</option>
                      </select>
                    </>
                  )}

                  {/* --- jins stop (updated) --- */}
                  {stop.type === "jins" && (
                    <>
                      {/* 1) select which jins */}
                      <select className="sayr-manager__stop-value" value={stop.value} onChange={(e) => updateStop(i, "value", e.target.value)}>
                        <option value="">{t('sayr.none')}</option>
                        {[...ajnas]
                          .sort((a, b) => a.getName().localeCompare(b.getName()))
                          .map((j) => (
                            <option key={j.getId()} value={j.getId()}>
                              {getDisplayName(j.getName(), 'jins')}
                            </option>
                          ))}
                      </select>

                      {/* 2) optional starting note for this jins */}
                      <select className="sayr-manager__stop-value" value={stop.startingNote ?? ""} onChange={(e) => updateStop(i, "startingNote", e.target.value)}>
                        <option value="">{t('sayr.none')}</option>
                        {octaveOneNoteNames.map((n) => (
                          <option key={n} value={n}>
                            {getDisplayName(n, 'note')}
                          </option>
                        ))}
                        <option disabled>---</option>
                        {octaveTwoNoteNames.map((n) => (
                          <option key={n} value={n}>
                            {getDisplayName(n, 'note')}
                          </option>
                        ))}
                      </select>

                      {/* 3) optional direction for this jins */}
                      <select className="sayr-manager__stop-value" value={stop.direction ?? ""} onChange={(e) => updateStop(i, "direction", e.target.value)}>
                        <option value="">{t('sayr.none')}</option>
                        <option value="ascending">{t('sayr.ascending')}</option>
                        <option value="descending">{t('sayr.descending')}</option>
                      </select>
                    </>
                  )}

                  {/* --- maqam stop (updated) --- */}
                  {stop.type === "maqam" && (
                    <>
                      {/* 1) select which maqam */}
                      <select className="sayr-manager__stop-value" value={stop.value} onChange={(e) => updateStop(i, "value", e.target.value)}>
                        <option value="">{t('sayr.none')}</option>
                        {[...maqamat]
                          .sort((a, b) => a.getName().localeCompare(b.getName()))
                          .map((m) => (
                            <option key={m.getId()} value={m.getId()}>
                              {getDisplayName(m.getName(), 'maqam')}
                            </option>
                          ))}
                      </select>

                      {/* 2) optional starting note for this maqam */}
                      <select className="sayr-manager__stop-value" value={stop.startingNote ?? ""} onChange={(e) => updateStop(i, "startingNote", e.target.value)}>
                        <option value="">{t('sayr.none')}</option>
                        {octaveOneNoteNames.map((n) => (
                          <option key={n} value={n}>
                            {getDisplayName(n, 'note')}
                          </option>
                        ))}
                        <option disabled>---</option>
                        {octaveTwoNoteNames.map((n) => (
                          <option key={n} value={n}>
                            {getDisplayName(n, 'note')}
                          </option>
                        ))}
                      </select>

                      {/* 3) optional direction for this maqam */}
                      <select className="sayr-manager__stop-value" value={stop.direction ?? ""} onChange={(e) => updateStop(i, "direction", e.target.value)}>
                        <option value="">{t('sayr.none')}</option>
                        <option value="ascending">{t('sayr.ascending')}</option>
                        <option value="descending">{t('sayr.descending')}</option>
                      </select>
                    </>
                  )}

                  {/* --- direction stop --- */}
                  {stop.type === "direction" && (
                    <select className="sayr-manager__stop-value" value={stop.value} onChange={(e) => updateStop(i, "value", e.target.value)}>
                      <option value="">{t('sayr.none')}</option>
                      <option value="ascending">{t('sayr.ascending')}</option>
                      <option value="descending">{t('sayr.descending')}</option>
                    </select>
                  )}

                  {admin && (
                    <button type="button" className="sayr-manager__delete-stop" onClick={() => removeStop(i)}>
                      {t('sayr.delete')}
                    </button>
                  )}
                </div>
              ))}
          </div>
          <div className="sayr-manager__stops">
            {!admin &&
              stops.map((stop, i) => {
                let jinsData: JinsData | undefined;
                let maqamData: any | undefined;
                let sentence = "";
                // Patch: support for maqam stop type (type assertion workaround)
                if (stop.type === "note") {
                  sentence += `${getDisplayName(stop.value, 'note')}`;
                } else if (stop.type === "jins") {
                  jinsData = ajnas.find((j) => j.getId() === stop.value);
                  const jinsName = jinsData ? getDisplayName(jinsData.getName(), 'jins') : getDisplayName(stop.value, 'jins');
                  sentence += `${jinsName}${stop.startingNote ? t('sayr.definiteArticle') + getDisplayName(stop.startingNote, 'note') : ""}`;
                } else if ((stop as any).type === "maqam") {
                  maqamData = maqamat.find((m) => m.getId() === stop.value);
                  const maqamName = maqamData ? getDisplayName(maqamData.getName(), 'maqam') : getDisplayName(stop.value, 'maqam');
                  sentence += `${maqamName}${stop.startingNote ? t('sayr.definiteArticle') + getDisplayName(stop.startingNote, 'note') : ""}`;
                } else if (stop.type === "direction") {
                  if (stop.value === "ascending") {
                    sentence += t('sayr.ascend');
                  } else if (stop.value === "descending") {
                    sentence += t('sayr.descend');
                  } else {
                    sentence += `${stop.value}`;
                  }
                }

                // Determine which icon to use for the transition before this stop
                let transitionIcon = ArrowForwardIcon;
                let transitionLabel = "";
                let showTransitionLabel = false;
                if (i !== 0) {
                  // Check direction on previous stop, or direction property on previous jins or maqam stop
                  const prevStop = stops[i - 1];
                  let direction = null;
                  if (prevStop.type === "direction") {
                    direction = prevStop.value;
                  } else if (prevStop.type === "jins" && prevStop.direction) {
                    direction = prevStop.direction;
                  } else if (prevStop.type === "maqam" && prevStop.direction) {
                    direction = prevStop.direction;
                  } else if (prevStop.type === "note" && prevStop.direction) {
                    direction = prevStop.direction;
                  }

                  if (direction === "ascending") {
                    transitionIcon = NorthEastIcon;
                    transitionLabel = t('sayr.ascendTo');
                  } else if (direction === "descending") {
                    transitionIcon = SouthEastIcon;
                    transitionLabel = t('sayr.descendTo');
                  }
                }
                // Only show the label if NEITHER the previous nor the current stop is a direction stop
                showTransitionLabel = transitionLabel !== "" && stop.type !== "direction" && (i === 0 || stops[i - 1].type !== "direction");
                // Show transition arrow for all, but label only for non-direction stops (never for direction stops)
                return (
                  <React.Fragment key={i}>
                    {i !== 0 && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
                        {showTransitionLabel && <span className="sayr-manager__transition-label">{transitionLabel}</span>}
                        {React.createElement(transitionIcon)}
                      </span>
                    )}
                    <div
                      className="sayr-manager__stop"
                      style={stop.type === "jins" || (stop as any).type === "maqam" ? { cursor: "default" } : undefined}
                      onClick={() => {
                        if (stop.type === "jins" && jinsData) {
                          // handleClickJins(jinsData);
                        } else if ((stop as any).type === "maqam" && maqamData) {
                          // Optionally, implement a handler for maqam click
                          // handleClickMaqam(maqamData);
                        }
                      }}
                    >
                      {sentence}
                    </div>
                  </React.Fragment>
                );
              })}
          </div>
        </div>

        {admin && (
          <div className="sayr-manager__buttons">
            <button type="submit" className="sayr-manager__save-button">
              {maqamSayrId ? t('sayr.updateSayr') : t('sayr.saveSayr')}
            </button>
            {maqamSayrId && (
              <button type="button" className="sayr-manager__delete-button" onClick={handleDelete}>
                {t('sayr.deleteSayr')}
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
