import React from "react";
import "../app/globals.scss";
import "../styles/landing-page.scss";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <p>
        <strong>Arabic Maqām Network</strong> is an innovative{" "}
        <span className="highlight">open-access</span> online platform dedicated
        to the study and exploration of the{" "}
        <span className="highlight">Arabic maqām system</span>. It was
        researched, designed and developed by <strong>Dr. Khyam Allami</strong>{" "}
        and <strong>Ibrahim El Khansa</strong> in the{" "}
        <span className="highlight">
          <strong>Music Intelligence Lab</strong>
        </span>{" "}
        at the{" "}
        <span className="highlight">
          <strong>American University of Beirut</strong>
        </span>
        , Lebanon.
      </p>
      <p>
        The platform is designed to be a valuable resource for{" "}
        <span className="highlight">students</span>,{" "}
        <span className="highlight">musicians</span>,{" "}
        <span className="highlight">composers</span>,{" "}
        <span className="highlight">musicologists</span>,{" "}
        <span className="highlight">educators</span>,{" "}
        <span className="highlight">researchers</span>, and anyone interested in
        the <span className="highlight">rich musical heritage</span> of the{" "}
        <span className="highlight">Arabic-speaking region</span>.
      </p>

      <p>
        It offers an <span className="highlight">interactive</span>,{" "}
        <span className="highlight">comprehensive</span> and{" "}
        <span className="highlight">academically rigorous</span> database of{" "}
        <span className="highlight">tuning systems</span>,{" "}
        <span className="highlight">ajnās</span>, and{" "}
        <span className="highlight">maqāmāt</span>, along with their{" "}
        <span className="highlight">suyūr</span> and{" "}
        <span className="highlight">intiqālāt</span> (modulations), all of which
        can be <span className="highlight">played</span> and heard with a{" "}
        <span className="highlight">computer keyboard</span> or via{" "}
        <span className="highlight">MIDI</span>.
      </p>
      <p>
        In addition, it provides in-depth{" "}
        <span className="highlight">mathematical</span> and{" "}
        <span className="highlight">musicological analysis</span>, various{" "}
        <span className="highlight">analytics</span> and an{" "}
        <span className="highlight">API</span> for programmatic access to the{" "}
        <span className="highlight">data</span>.
      </p>
      <ul>
        <li>
          Explore and play hundreds of Arabic tuning systems, ajnās, and maqāmāt
          interactively.
        </li>
        <li>
          Switch between multiple tuning systems to hear and compare their
          structures and intervals on the same jins or maqām.
        </li>
        <li>
          Play and hear every jins and maqām, including all their possible
          transpositions and modulations using your computer keyboard or MIDI
          input.
        </li>
        <li>
          Explore maqām modulation based on a unique algorithm created from Sāmī
          Al-Shawwā&apos;s rules for modulation.
        </li>
        <li>
          See and hear detailed analysis for each tuning system, jins and maqām
          including their ajnas constructions, transpositions and modulations.
        </li>
        <li>
          Detailed commentaries by Dr. Khyam Allami on each tuning system, maqām
          and sayr.
        </li>
        <li>
          Access a comprehensive bibliography and source references for all the
          musicological data.
        </li>
        <li>
          Customize sound output with waveform, volume, and envelope controls.
        </li>
        <li>
          Bookmark, organize, and revisit your favorite maqāmāt and ajnās.
        </li>
        <li>
          Export the data in various formats for research or creative use.
        </li>
        <li>
          Access an open API for programmatic data retrieval and integration.
        </li>
      </ul>
    </div>
  );
}
