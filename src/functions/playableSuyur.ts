import MaqamData, { Maqam, Sayr, SayrStop } from "@/models/Maqam";
import JinsData, { Jins } from "@/models/Jins";
import PitchClass from "@/models/PitchClass";
import { transposeSayr } from "@/functions/transpose";

/**
 * Every form one pitch space has of a maqām or jins: the base form, its taṣwīr
 * and the octave renderings of both. An empty list when it cannot be built.
 * PitchSpaceForms, renderingsLookup and the app's transpositions context all
 * provide this shape.
 */
export interface PitchSpaceRenderings {
  maqam(maqamId: string): Maqam[];
  jins(jinsId: string): Jins[];
}

/** One pitch space (a tuning system on one starting note) and the archive entries a sayr can name */
export interface SuyurContext {
  pitchClasses: PitchClass[];
  ajnas: JinsData[];
  maqamat: MaqamData[];
  renderings: PitchSpaceRenderings;
}

/**
 * The suyūr of a maqām that can be played on one of its forms, each one moved
 * onto that form. This is the single rule for whether a sayr is playable: the
 * Suyūr tab shows these, the API returns these, and the statistics count these.
 *
 * A sayr is judged on the form being shown. On the base form that is the sayr as
 * stored. On a taṣwīr or an octave rendering it is the sayr after transposeSayr
 * has moved it onto that form's tonic.
 *
 * It is playable when every stop is:
 * - a note: the pitch space has that note, and moving the sayr did not push it
 *   past either end of the pitch space;
 * - a jins or maqām: that form, starting on the stop's note, is one of the forms
 *   the pitch space lists for it (base form, taṣwīr or octave rendering), with
 *   its intervals within the cents tolerance. Having the notes is not enough.
 *   Example: Cairo Congress (1929) on yegāh has nawā, ḥusaynī, awj and kurdān,
 *   but no jins rāst on nawā, because its steps there (200, 149, 149 cents) are
 *   not those of jins rāst (204, 149, 159);
 * - a direction: always.
 *
 * A jins or maqām stop that names no starting note sits on the jins's or
 * maqām's own first note, as stored, and moves with the rest of the sayr.
 *
 * @throws when a stop is a data error: an unknown stop type, an empty note, an
 *   empty or unknown jins or maqām id, or a direction other than ascending or
 *   descending. The message names the maqām, the sayr and the stop.
 */
export function playableSuyur(maqam: MaqamData, form: Pick<Maqam, "ascendingPitchClasses">, context: SuyurContext): Sayr[] {
  const noteNames = new Set(context.pitchClasses.map((pitchClass) => pitchClass.noteName));
  const playable: Sayr[] = [];

  for (const sayr of maqam.getSuyur()) {
    const stored = withStartingNotes(maqam, sayr, context);
    const { transposedSayr, hasOutOfBoundsNotes } = transposeSayr(stored, context.pitchClasses, maqam, form);
    if (hasOutOfBoundsNotes) continue;
    if (transposedSayr.stops.every((stop) => stopIsPlayable(stop, noteNames, context.renderings))) {
      playable.push(transposedSayr);
    }
  }

  return playable;
}

/**
 * Throws if a stop of the sayr is a data error (see playableSuyur). The admin
 * editor runs this before saving, so a sayr that cannot be judged never reaches
 * the archive.
 */
export function assertSayrStops(maqam: MaqamData, sayr: Sayr, ajnas: JinsData[], maqamat: MaqamData[]): void {
  sayr.stops.forEach((stop, index) => {
    const where = `Sayr ${sayr.id} of maqām ${maqam.getName()} (id ${maqam.getId()}), stop ${index + 1}`;
    switch (stop.type) {
      case "note":
        if (!stop.value) throw new Error(`${where}: the note stop names no note`);
        return;
      case "jins":
        if (!stop.value) throw new Error(`${where}: the jins stop names no jins`);
        if (!ajnas.some((jins) => jins.getId() === stop.value)) throw new Error(`${where}: no jins with id ${stop.value}`);
        return;
      case "maqam":
        if (!stop.value) throw new Error(`${where}: the maqām stop names no maqām`);
        if (!maqamat.some((other) => other.getId() === stop.value)) throw new Error(`${where}: no maqām with id ${stop.value}`);
        return;
      case "direction":
        if (stop.value !== "ascending" && stop.value !== "descending") {
          throw new Error(`${where}: direction "${stop.value}" is neither ascending nor descending`);
        }
        return;
      default:
        throw new Error(`${where}: unknown stop type "${(stop as SayrStop).type}"`);
    }
  });
}

/**
 * The stored sayr with every jins and maqām stop placed on a note: a stop that
 * names none sits on the first note of that jins or maqām. Done before the sayr
 * is moved, so the note moves with it.
 */
function withStartingNotes(maqam: MaqamData, sayr: Sayr, context: SuyurContext): Sayr {
  assertSayrStops(maqam, sayr, context.ajnas, context.maqamat);
  return {
    ...sayr,
    stops: sayr.stops.map((stop) => {
      if (stop.startingNote) return stop;
      if (stop.type === "jins") return { ...stop, startingNote: context.ajnas.find((jins) => jins.getId() === stop.value)!.getNoteNames()[0] };
      if (stop.type === "maqam") return { ...stop, startingNote: context.maqamat.find((other) => other.getId() === stop.value)!.getAscendingNoteNames()[0] };
      return stop;
    }),
  };
}

function stopIsPlayable(stop: SayrStop, noteNames: Set<string>, renderings: PitchSpaceRenderings): boolean {
  switch (stop.type) {
    case "note":
      return noteNames.has(stop.value);
    case "jins":
      return renderings.jins(stop.value).some((jins) => jins.jinsPitchClasses[0].noteName === stop.startingNote);
    case "maqam":
      return renderings.maqam(stop.value).some((other) => other.ascendingPitchClasses[0].noteName === stop.startingNote);
    case "direction":
      return true;
  }
}
