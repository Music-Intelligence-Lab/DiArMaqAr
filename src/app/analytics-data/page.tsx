"use client";

import React, { useState } from "react";
// import { getTuningSystems, getAjnas, getMaqamat } from "@/functions/import";
// import { getJinsTranspositions, getMaqamTranspositions } from "@/functions/transpose";
// import modulate from "@/functions/modulate";
// import getTuningSystemCells from "@/functions/getTuningSystemCells";
// import calculateNumberOfModulations from "@/functions/calculateNumberOfModulations";
// import TuningSystem from "@/models/TuningSystem";

 interface AnalyticsRow {
  id: string;
  label: string;
  possibleAjnasCount: number;
  possibleAjnasTranspositionsCount: number;
  totalAjnas: number;
  possibleMaqamatCount: number;
  possibleMaqamatTranspositionsCount: number;
  totalMaqamat: number;
  totalSuyur: number;
  totalAjnasModulations: number;
  totalMaqamatModulations: number;
}

function computeAnalyticsForSystem(
  tuningSystem: TuningSystem,
  allAjnas: ReturnType<typeof getAjnas>,
  allMaqamat: ReturnType<typeof getMaqamat>
): AnalyticsRow[] {
  console.time(`computeAnalytics:${tuningSystem.getId()}`);

  const rows: AnalyticsRow[] = [];
  const totalNumberOfAjnas = allAjnas.length;
  const totalNumberOfMaqamat = allMaqamat.length;

  console.time(`getNoteNames:${tuningSystem.getId()}`);
  const allNoteNameLists = tuningSystem.getNoteNames();
  console.timeEnd(`getNoteNames:${tuningSystem.getId()}`);

  for (const noteNames of allNoteNameLists) {
    const starting = noteNames[0];
    const rowId = tuningSystem.getId() + starting;
    const label = `${tuningSystem.stringify()} ${starting}`;

    console.time(`getCells:${rowId}`);
    const allPitchClasses = getTuningSystemCells(tuningSystem, starting);
    console.timeEnd(`getCells:${rowId}`);

    console.time(`computeAjnas:${rowId}`);
    const possibleAjnas = [];
    const possibleAjnasTrans = [];
    for (const jinsDetails of allAjnas) {
      if (jinsDetails.isJinsSelectable(allPitchClasses.map(pc => pc.noteName))) {
        possibleAjnas.push(jinsDetails);
        getJinsTranspositions(allPitchClasses, jinsDetails, false)
          .forEach(tr => possibleAjnasTrans.push(tr));
      }
    }
    console.timeEnd(`computeAjnas:${rowId}`);

    console.time(`computeMaqamat:${rowId}`);
    let totalSuyur = 0;
    const possibleMaqamat = [];
    const possibleMaqamatTrans = [];
    let totalAjnasMod = 0;
    let totalMaqamatMod = 0;

    for (const maqamDetails of allMaqamat) {
      console.log(maqamDetails);
      if (maqamDetails.isMaqamSelectable(allPitchClasses.map(pc => pc.noteName))) {
        possibleMaqamat.push(maqamDetails);
        totalSuyur += maqamDetails.getSuyūr().length;

        getMaqamTranspositions(allPitchClasses, allAjnas, maqamDetails, false)
          .forEach(transposition => {
            console.log(transposition);
            possibleMaqamatTrans.push(transposition);

            // totalAjnasMod += calculateNumberOfModulations(modulate(
            //   allPitchClasses, allAjnas, allMaqamat, transposition, true
            // ));
            // totalMaqamatMod += calculateNumberOfModulations(modulate(
            //   allPitchClasses, allAjnas, allMaqamat, transposition, false
            // ));
          });
      }
    }
    console.timeEnd(`computeMaqamat:${rowId}`);

    rows.push({
      id: rowId,
      label,
      possibleAjnasCount: possibleAjnas.length,
      possibleAjnasTranspositionsCount: possibleAjnasTrans.length,
      totalAjnas: totalNumberOfAjnas,
      possibleMaqamatCount: possibleMaqamat.length,
      possibleMaqamatTranspositionsCount: possibleMaqamatTrans.length,
      totalMaqamat: totalNumberOfMaqamat,
      totalSuyur,
      totalAjnasModulations: totalAjnasMod,
      totalMaqamatModulations: totalMaqamatMod,
    });
  }

  console.timeEnd(`computeAnalytics:${tuningSystem.getId()}`);
  return rows;
}

export default function AnalyticsPage() {
  // cache it so we only measure once per render
  const analyticsRows = useMemo(() => {
    const systems = [getTuningSystems()[11]]
    const allAjnas = getAjnas();
    const allMaqamat = getMaqamat();

    return systems.flatMap(ts =>
      computeAnalyticsForSystem(ts, allAjnas, allMaqamat)
    );
  }, []);

  return (
    <div className="analytics-page">
      <button onClick={handleReRender} disabled={loading} style={{marginBottom: 16}}>
        {loading ? "Re-Rendering..." : "Re-Render Analytics"}
      </button>
      {error && <div style={{color: 'red'}}>{error}</div>}
      {success && <div style={{color: 'green'}}>{success}</div>}
      <table>
        <thead>
          <tr>
            {renderSortableHeader('Tuning Systems', 'label')}
            {renderSortableHeader('Possible Ajnas', 'possibleAjnasCount')}
            {renderSortableHeader('Possible Ajnas Transpositions', 'possibleAjnasTranspositionsCount')}
            {renderSortableHeader('Possible Maqamat', 'possibleMaqamatCount')}
            {renderSortableHeader('Possible Maqamat Transpositions', 'possibleMaqamatTranspositionsCount')}
            {renderSortableHeader('Total Suyur', 'totalSuyur')}
            {renderSortableHeader('Total Possible Ajnas Modulations', 'totalAjnasModulations')}
            {renderSortableHeader('Total Possible Maqamat Modulations', 'totalMaqamatModulations')}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map(row => (
            <tr key={row.id}>
              <td>{row.label}</td>
              <td>{`${row.possibleAjnasCount}/${row.totalAjnas}`}</td>
              <td>{row.possibleAjnasTranspositionsCount}</td>
              <td>{`${row.possibleMaqamatCount}/${row.totalMaqamat}`}</td>
              <td>{row.possibleMaqamatTranspositionsCount}</td>
              <td>{row.totalSuyur}</td>
              <td>{row.totalAjnasModulations}</td>
              <td>{row.totalMaqamatModulations}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
