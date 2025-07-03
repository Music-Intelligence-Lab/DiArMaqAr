export const revalidate = 0;

import { getTuningSystems, getAjnas, getMaqamat } from "@/functions/import";
import { getJinsTranspositions, getMaqamTranspositions } from "@/functions/transpose";
import modulate from "@/functions/modulate";
import getTuningSystemCells from "@/functions/getTuningSystemCells";
import calculateNumberOfModulations from "@/functions/calculateNumberOfModulations";
import TuningSystem from "@/models/TuningSystem";

export default function AnalyticsPage() {
  const allTuningSystems: TuningSystem[] = [getTuningSystems()[0]];
  const allAjnas = getAjnas();
  const allMaqamat = getMaqamat();

  const totalNumberOfAjnas = allAjnas.length;
  const totalNumberOfMaqamat = allMaqamat.length;

  console.log("HERE");

  return (<div className="analytics-page">
    <table>
      <thead>
        <tr>
          <th>Tuning Systems</th>
          <th>Possible Ajnas</th>
          <th>Possible Ajnas Transpositions</th>
          <th>Possible Maqamat</th>
          <th>Possible Maqamat Transpositions</th>
          <th>Total Suyur</th>
          <th>Total Possible Ajnas Modulations</th>
          <th>Total Possible Maqamat Modulations</th>
        </tr>
      </thead>
      <tbody>
        {allTuningSystems.map((tuningSystem) => {
          for (const noteNames of tuningSystem.getNoteNames()) {
            const startingNoteName = noteNames[0];

            const allPitchClasses = getTuningSystemCells(tuningSystem, startingNoteName);
            const possibleAjnas = [];
            const possibleAjnasTranspositions = [];

            for (const jinsDetails of allAjnas) {
              if (jinsDetails.isJinsSelectable(allPitchClasses.map((pc) => pc.noteName))) {
                possibleAjnas.push(jinsDetails);

                getJinsTranspositions(allPitchClasses, jinsDetails, false).forEach((transposition) => {
                  possibleAjnasTranspositions.push(transposition);
                });
              }
            }

            let totalNumberOfSuyur = 0;
            const possibleMaqamat = [];
            const possibleMaqamatTranspositions = [];
            let totalNumberOfAjnasModulations = 0;
            let totalNumberOfMaqamatModulations = 0;

            for (const maqamDetails of allMaqamat) {
              if (maqamDetails.isMaqamSelectable(allPitchClasses.map((pc) => pc.noteName))) {
                possibleMaqamat.push(maqamDetails);
                totalNumberOfSuyur += maqamDetails.getSuyūr().length;

                getMaqamTranspositions(allPitchClasses, allAjnas, maqamDetails, false).forEach((transposition) => {
                  possibleMaqamatTranspositions.push(transposition);

                  totalNumberOfAjnasModulations += calculateNumberOfModulations(modulate(allPitchClasses, allAjnas, allMaqamat, transposition, true))
                  totalNumberOfMaqamatModulations += calculateNumberOfModulations(modulate(allPitchClasses, allAjnas, allMaqamat, transposition, false));
                });
              }
            }

            return (
              <tr key={tuningSystem.getId() + startingNoteName}>
                <td>{tuningSystem.stringify() + " " + startingNoteName}</td>
                <td>{`${possibleAjnas.length}/${totalNumberOfAjnas}`}</td>
                <td>{possibleAjnasTranspositions.length}</td>
                <td>{`${possibleMaqamat.length}/${totalNumberOfMaqamat}`}</td>
                <td>{possibleMaqamatTranspositions.length}</td>
                <td>{totalNumberOfSuyur}</td>
                <td>{totalNumberOfAjnasModulations}</td>
                <td>{totalNumberOfMaqamatModulations}</td>
              </tr>
            );
          }
        })}
      </tbody>
    </table>
  </div>);
}
