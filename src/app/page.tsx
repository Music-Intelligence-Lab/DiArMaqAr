import React from "react";
import "../app/globals.scss";
import "../styles/landing-page.scss";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1>أرشيف المقامات العربية • Arabic Maqām Archive</h1>
      </header>

      <section className="lead">
        <p>
          The Arabic Maqām Archive is an innovative{" "}
          <span className="highlight">open-source and open-access</span> online
          platform dedicated to the study and exploration of the{" "}
          <span className="highlight">Arabic maqām system</span>.
        </p>

        <p>
          The platform is designed to be a valuable resource for{" "}
          <span className="highlight">students</span>,{" "}
          <span className="highlight">musicians</span>,{" "}
          <span className="highlight">composers</span>,{" "}
          <span className="highlight">musicologists</span>,{" "}
          <span className="highlight">educators</span>,{" "}
          <span className="highlight">researchers</span> and anyone interested
          in the rich musical heritage of the Arabic-speaking region.
        </p>

        <p>
          It offers an <span className="highlight">interactive</span> and{" "}
          <span className="highlight">academically rigorous</span> repository of{" "}
          <span className="highlight">tuning systems</span>,{" "}
          <span className="highlight">ajnās</span>, and{" "}
          <span className="highlight">maqāmāt</span>, along with their{" "}
          <span className="highlight">suyūr</span> (pathways of melodic
          development) and possible <span className="highlight">intiqālāt</span>{" "}
          (modulations), all of which can be{" "}
          <span className="highlight">played</span> and heard with a{" "}
          <span className="highlight">computer keyboard</span> or via{" "}
          <span className="highlight">MIDI</span>.
        </p>

        <p>
          In addition, it provides in-depth{" "}
          <span className="highlight">mathematical data</span> and analysis,
          comprehensive <span className="highlight">export</span> options, plus
          an <span className="highlight">API</span> for programmatic access to
          the data.
        </p>
      </section>

      <section className="credits">
        <p>
          This project was researched, designed and developed by Dr. Khyam
          Allami and Ibrahim El Khansa in the{" "}
          <span className="highlight">Music Intelligence Lab</span> at the{" "}
          <span className="highlight">American University of Beirut</span>,
          Lebanon, and initially launched in September 2025.
        </p>
      </section>

      <div className="cta-row">
        <a className="main-button" href="/app">
          Enter the Arabic Maqām Archive
        </a>
      </div>

      <div className="button-row">
        <a className="button" href="#tour">
          Take an Interactive Tour
        </a>
        <a className="button" href="#code">
          Access the Source Code
        </a>
        <a className="button" href="#paper">
          Read the Paper
        </a>
      </div>

      <h3>Key Features:</h3>

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
          See detailed analysis for each tuning system, jins and maqām including
          their ajnās constructions, and all their possible transpositions.
        </li>
        <li>Read commentaries by Dr. Khyam Allami.</li>
        <li>
          Access a comprehensive bibliography and source references for all the
          musicological data.
        </li>
        <li>
          Customize sound output with waveform, volume, and envelope controls.
        </li>
        <li>
          Bookmark the URLs to organize and revisit your favorite maqāmāt and
          ajnās.
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
