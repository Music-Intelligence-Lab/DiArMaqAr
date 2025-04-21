// src/functions/hejiUtils.ts

// 1) The list of primes we support in our monzo, in order
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47] as const;

// 2) The HEJI symbol arrays for each prime (indexed by exponent + 3)
const HEJI_MAP: { [P in typeof PRIMES[number]]?: string[] } = {
  2:    ["","","","","","",""],                      // prime‑2 never draws a symbol
  3:    ["eE","E","e","","v","V","vV"],  // natural sign removed
  5:    ["eE","E","e","","v","V","vV"],             // pythagOutput
  7:    ["<,",",","<","",">",".",">."],             // septimal
  11:   ["555","55","5","","4","44","444"],          // undecimal
  13:   ["000","00","0","","9","99","999"],          // tridecimal
  17:   [":::","::",":","",";",";;",";;;"],          // 17-limit
  19:   ["È","À","*","","/","Á","É"],                // 19-limit
  23:   ["666","66","6","","3","33","333"],          // 23-limit
  29:   ["777","77","7","","2","22","222"],          // 29-limit
  31:   ["111","11","1","","8","88","888"],          // 31-limit
  37:   ["ààà","àà","à","","á","áá","ááá"],          // 37-limit
  41:   ["---","--","-","","+","++","+++"],          // 41-limit
  43:   ["èèè","èè","è","","é","éé","ééé"],          // 43-limit
  47:   ["","","","","","",""],  // 47-limit
};

/** Mapping of Arabic tonic names to Western letter‑names. */
const ARABIC_TO_LETTER: Record<string, string> = {
  "yegāh":     "G",
  "ʿushayrān": "A",
};

/** Circle‑of‑fifths beginning on C (…C → G → D → A → E → B → F → …). */
const FIFTHS = ["C", "G", "D", "A", "E", "B", "F"] as const;

const fifthIndex = (l: string): number => {
  // Cast to the union type of our FIFTHS tuple to satisfy TypeScript
  const u = l.toUpperCase() as typeof FIFTHS[number];
  return FIFTHS.indexOf(u);
};

/* Natural note positions (0‥6) measured in circle‑of‑fifths steps from C. */
const NATURAL: Record<string, number> = FIFTHS.reduce<Record<string, number>>(
  (acc, l, i) => { acc[l] = i; return acc; },
  {}
);

/**
 * Factor a positive integer into exponents of PRIMES.
 * Returns an array of length PRIMES.length.
 */
function factorIntoMonzo(n: number): number[] {
  const exps = PRIMES.map(() => 0);
  let m = n;
  PRIMES.forEach((p, i) => {
    while (m % p === 0) {
      exps[i]++;
      m /= p;
    }
  });
  return exps;
}

/** Wrap an integer into the inclusive range –3 … +3 (mod 6). */
function mod6Wrap(n: number): number {
  while (n < -3) n += 6;
  while (n >  3) n -= 6;
  return n;
}

/**
 * Return the circle‑of‑fifths distance of a diatonic note‑name from the
 * tonic (the note assigned to 1/1).  
 *
 * Sharps / flats of the *query* note are counted relative to its natural
 * letter *and* relative to the tonic’s natural letter.  
 * The tonic itself therefore has an offset of **0** regardless of which
 * letter happens to be 1/1.
 *
 * Both ASCII (#, b) and Unicode (♯, ♭, 𝄪, 𝄫) accidental glyphs are
 * recognised.
 *
 * @param english   The note we are measuring (e.g. “Bb”, “F♯♯”, “C” …).
 * @param tonic     The note that represents 1/1 in the current context
 *                  (e.g. “A”, “C”, “F♯” …).  Defaults to “A”.
 */
function fifthsOffset(
  english: string | undefined,
  tonic: string | undefined = "A"
): number {
  if (!english) return 0;

  // offset of query & tonic _naturals_
  const letter = english[0].toUpperCase();
  const tL = tonic[0].toUpperCase();

  const naturalOffset     = (NATURAL[letter] ?? 0)  - (NATURAL[tL] ?? 0);

  // Accidental offsets removed as per instructions

  return naturalOffset;
}

/**
 * Given the prime‑3 exponent and the tonic letter for 1/1,
 * return the diatonic **letter** (A‑G) chosen by the usual
 * circle‑of‑fifths spelling rules.  Accidentals (#/b) are
 * *not* returned here because HEJI glyphs carry all accidental
 * information.
 *
 * @param exp3   The exponent of prime 3 in the monzo.
 * @param tonic  The Latin letter assigned to 1/1 (e.g. “A”, “G”…).
 */
function noteFromMonzo(exp3: number, tonic: string): string {
  const tIdx = fifthIndex(tonic);
  if (tIdx === -1) throw new Error(`Unknown tonic letter “${tonic}”`);

  // Position measured in perfect‑fifths steps from the tonic
  const pos  = tIdx + exp3;

  // Choose the diatonic letter (mod 7)
  const lIdx = ((pos % 7) + 7) % 7;   // bring into 0‥6
  return FIFTHS[lIdx];
}

/**
 * Compute the Western note‑name *and* the HEJI accidental string for a JI ratio.
 *
 * Only the Arabic name that represents 1/1 (e.g. “yegāh”, “ʿushayrān” …) is
 * required from the caller.  The actual Arabic name of the queried ratio is
 * **not** needed here and can be handled further up the stack.
 *
 * @param numerator      Ratio numerator   (must be positive integer)
 * @param denominator    Ratio denominator (must be positive integer)
 */
let currentTonicArabic = "yegāh";

export function setTonicArabic(name: string) {
  if (!ARABIC_TO_LETTER[name]) {
    throw new Error(`Arabic tonic “${name}” not mapped to a Latin letter.`);
  }
  currentTonicArabic = name;
}

/**
 * Compute the Western note‑name *and* the HEJI accidental string for a JI ratio.
 *
 * Only the Arabic name that represents 1/1 (e.g. “yegāh”, “ʿushayrān” …) is
 * honoured if provided. For any other ratio the Arabic name is ignored.
 *
 * @param numerator      Ratio numerator   (must be positive integer)
 * @param denominator    Ratio denominator (must be positive integer)
 * @param arabicName     Optional Arabic tonic name (only honoured for 1/1)
 */
export function getHeji(
  numerator: number,
  denominator: number,
  arabicName?: string,
): { hejiEnglish: string; heji: string } {
  if (numerator <= 0 || denominator <= 0) {
    return { hejiEnglish: "", heji: "" };
  }
  // If this ratio is 1/1 and we were given a (valid) Arabic name,
  // use it as the current tonic.
  if (numerator === denominator && arabicName && ARABIC_TO_LETTER[arabicName]) {
    currentTonicArabic = arabicName;
  }

  const tonicLetter = ARABIC_TO_LETTER[currentTonicArabic];
  if (!tonicLetter) return { hejiEnglish: "", heji: "" };

  // Build the monzo for numerator/denominator
  const numExps = factorIntoMonzo(numerator);
  const denExps = factorIntoMonzo(denominator);
  const monzo   = numExps.map((e, i) => e - denExps[i]);
  // Exponent of prime‑3 (needed for diatonic spelling)
  const exp3 = monzo[PRIMES.indexOf(3)];

  // === 1) Diatonic note‑name (depends only on prime‑3) ====================
  const letter = noteFromMonzo(exp3, tonicLetter);
  // hejiEnglish should include only the diatonic letter; accidentals are conveyed via the HEJI glyphs
  const hejiEnglish = letter;

  // --- Prime‑3 chromatic residue ----------------------------------------
  const naturalStep = mod6Wrap(fifthsOffset(letter, tonicLetter));
  const acc3        = mod6Wrap(exp3 - naturalStep);

  // === 2) Build the HEJI accidental ======================================
  const order: typeof PRIMES[number][] = [47, 43, 41, 37, 31, 29, 23, 19, 17, 13, 11, 7, 5, 3];
  let heji = "";
  for (const p of order) {
    const idx = PRIMES.indexOf(p);
    let exp = monzo[idx] ?? 0;

    // For prime‑3 use the pre‑computed chromatic residue
    if (p === 3) exp = acc3;

    exp = mod6Wrap(exp);                     // window –3 … +3

    const symbols = HEJI_MAP[p];
    if (symbols) heji += symbols[exp + 3];
  }

  if (heji === "") heji = "n";    // default glyph

  return { hejiEnglish, heji };
}