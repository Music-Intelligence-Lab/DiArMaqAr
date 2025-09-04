import React from "react";
import "../../styles/about-page.scss";
import Footer from "@/components/footer";

export default function AboutPage() {
  return (
    <div className="about-page">
      <h1>About the Arabic Maqām Network</h1>

      <section className="project-overview">
        <h2>Project Overview</h2>
        <p>
          The <strong>Arabic Maqām Network</strong> is an innovative <span className="highlight">open-access</span> online platform dedicated to the
          study and exploration of the <span className="highlight">Arabic maqām system</span>. This comprehensive digital resource represents a
          groundbreaking approach to preserving, analyzing, and sharing the <span className="highlight">rich musical heritage</span> of the{" "}
          <span className="highlight">Arabic-speaking region</span>.
        </p>

        <p>
          Developed by <strong>Dr. Khyam Allami</strong> and <strong>Ibrahim El Khansa</strong> at the{" "}
          <span className="highlight">
            <strong>Music Intelligence Lab</strong>
          </span>{" "}
          at the{" "}
          <span className="highlight">
            <strong>American University of Beirut</strong>
          </span>
          , Lebanon, this platform bridges traditional Arabic music theory with modern computational tools and interactive technologies.
        </p>
      </section>

      <section className="mission">
        <h2>Mission & Purpose</h2>
        <p>
          Our mission is to create a comprehensive, academically rigorous, and accessible resource for understanding the intricate world of Arabic
          maqāmāt. The platform serves as both an <span className="highlight">educational tool</span> and a{" "}
          <span className="highlight">research platform</span>, enabling users to explore, analyze, and experience the mathematical and musical
          structures that define this ancient musical tradition.
        </p>

        <p>
          We aim to make the complex theoretical concepts of <span className="highlight">tuning systems</span>,{" "}
          <span className="highlight">ajnās</span>, <span className="highlight">maqāmāt</span>, and <span className="highlight">modulations</span>{" "}
          accessible to a global audience while maintaining the depth and authenticity required for serious academic research.
        </p>
      </section>

      <section className="target-audience">
        <h2>Who Is This For?</h2>
        <p>The Arabic Maqām Network is designed to serve a diverse community of music enthusiasts and professionals:</p>
        <ul>
          <li>
            <span className="highlight">Students</span> learning Arabic music theory and practice
          </li>
          <li>
            <span className="highlight">Musicians</span> seeking to understand and perform maqāmāt
          </li>
          <li>
            <span className="highlight">Composers</span> incorporating Arabic musical elements
          </li>
          <li>
            <span className="highlight">Musicologists</span> conducting research on Middle Eastern music
          </li>
          <li>
            <span className="highlight">Educators</span> teaching world music and ethnomusicology
          </li>
          <li>
            <span className="highlight">Researchers</span> in computational musicology and music theory
          </li>
          <li>
            <span className="highlight">Cultural enthusiasts</span> exploring Arabic musical heritage
          </li>
        </ul>
      </section>

      <section className="technical-approach">
        <h2>Technical Innovation</h2>
        <p>
          The platform leverages cutting-edge web technologies to create an <span className="highlight">interactive</span> and{" "}
          <span className="highlight">immersive</span> experience. Built as a modern single-page application using{" "}
          <span className="highlight">Next.js</span>, <span className="highlight">React</span>, and <span className="highlight">TypeScript</span>, the
          system provides real-time audio synthesis, MIDI integration, and sophisticated mathematical analysis tools.
        </p>

        <p>
          Our unique approach includes the implementation of <span className="highlight">algorithmic modulation analysis</span> based on Sāmī
          Al-Shawwā&apos;s historical rules for maqām transitions, providing users with authentic pathways for exploring musical relationships and
          structures.
        </p>
      </section>

      <section className="key-features">
        <h2>Core Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Interactive Exploration</h3>
            <p>Play and hear hundreds of tuning systems, ajnās, and maqāmāt using your computer keyboard or MIDI devices.</p>
          </div>

          <div className="feature-card">
            <h3>Comparative Analysis</h3>
            <p>Switch between multiple tuning systems to compare their structures and hear their unique interval characteristics.</p>
          </div>

          <div className="feature-card">
            <h3>Mathematical Precision</h3>
            <p>Access detailed mathematical analysis including interval calculations, frequency ratios, and cent values.</p>
          </div>

          <div className="feature-card">
            <h3>Modulation Pathways</h3>
            <p>Explore authentic maqām modulations based on traditional theoretical frameworks and historical practices.</p>
          </div>

          <div className="feature-card">
            <h3>Expert Commentary</h3>
            <p>Read detailed analyses and commentaries by Dr. Khyam Allami on each tuning system, maqām, and sayr.</p>
          </div>

          <div className="feature-card">
            <h3>Open Data Access</h3>
            <p>Export data in various formats and access our open API for programmatic integration and research.</p>
          </div>
        </div>
      </section>

      <section className="academic-foundation">
        <h2>Academic Foundation</h2>
        <p>
          The platform is built upon a foundation of rigorous <span className="highlight">musicological research</span> and draws from extensive
          historical sources and contemporary scholarship. Our comprehensive <span className="highlight">bibliography</span> includes classical
          treatises, modern academic works, and field recordings that inform our understanding of maqām practice and theory.
        </p>

        <p>
          Every data point in the system is carefully sourced and documented, ensuring that users have access to the scholarly context behind each
          musical element. This commitment to academic integrity makes the platform a trusted resource for serious research and education.
        </p>
      </section>

      <section className="open-access">
        <h2>Open Access & Community</h2>
        <p>
          As an <span className="highlight">open-access</span> platform, we believe that knowledge about Arabic musical heritage should be freely
          available to all. Our commitment to accessibility extends beyond just making the platform free to use—we also provide{" "}
          <span className="highlight">open data</span> and <span className="highlight">API access</span> to enable researchers and developers to build
          upon our work.
        </p>

        <p>
          We encourage collaboration and welcome contributions from the global community of musicians, scholars, and technologists who share our
          passion for preserving and promoting Arabic musical traditions.
        </p>
      </section>

      <section className="future-vision">
        <h2>Future Vision</h2>
        <p>
          The Arabic Maqām Network represents just the beginning of our vision for digital preservation and exploration of world music traditions. We
          continue to expand our database, refine our analytical tools, and develop new features that serve the evolving needs of our diverse user
          community.
        </p>

        <p>
          Through ongoing research, technological innovation, and community engagement, we aim to set new standards for how traditional music systems
          can be studied, preserved, and shared in the digital age.
        </p>
      </section>
      <Footer />
    </div>
  );
}
