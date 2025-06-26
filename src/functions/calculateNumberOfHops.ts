import { MaqamModulations } from "@/models/Maqam";

export default function calculateNumberOfHops(modulations: MaqamModulations) {
  return (
    (modulations.hopsFromOne?.length || 0) +
    (modulations.hopsFromThree?.length || 0) +
    (modulations.hopsFromThree2p?.length || 0) +
    (modulations.hopsFromFour?.length || 0) +
    (modulations.hopsFromFive?.length || 0) +
    (modulations.hopsFromSix?.length || 0)
  );
}
