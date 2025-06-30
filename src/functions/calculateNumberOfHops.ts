import { MaqamModulations } from "@/models/Maqam";

export default function calculateNumberOfHops(modulations: MaqamModulations) {
  return (
    (modulations.modulationsOnOne.length || 0) +
    (modulations.modulationsOnThree.length || 0) +
    (modulations.modulationsOnThree2p.length || 0) +
    (modulations.modulationsOnFour.length || 0) +
    (modulations.modulationsOnFive.length || 0) +
    (modulations.modulationsOnSixNoThird.length || 0) + 
    (modulations.modulationsOnSixAscending.length || 0) + 
    (modulations.modulationsOnSixDescending.length || 0)

  );
}
