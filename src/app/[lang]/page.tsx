"use client";

import React from "react";
import Link from "next/link";
import LanguageSelector from "@/components/language-selector";
import useLanguageContext from "@/contexts/language-context";
import Footer from "@/components/footer";
import { useLocalizedHref } from "@/hooks/use-localized-href";

export default function LandingPage() {
  const { language, isRTL } = useLanguageContext();
  const lh = useLocalizedHref();

  // A cue is the last child of the section it concludes; clicking it
  // smooth-scrolls to the section it names.
  const scrollCue = (target: string) => (
    <a
      className="scroll-cue"
      href={`#${target}`}
      aria-label={language === "ar" ? "مرّروا إلى الأسفل" : language === "fr" ? "Défiler vers le bas" : "Scroll down"}
      onClick={(e) => {
        e.preventDefault();
        document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );

  // A code box with a header bar carrying a label and a Copy button, so the
  // button never overlays the code. `code` is the literal text to display and
  // copy; `accent` tints the leading edge (gold for the example, purple for
  // the agent prompt). `codeDir` sets the code's base direction: "ltr" for a
  // pure URL/command, "rtl" for Arabic prose so it flows correctly while the
  // embedded URLs stay LTR via the Unicode bidi algorithm.
  const codeBlock = (label: string, code: string, accent: "gold" | "accent", codeDir: "ltr" | "rtl" = "ltr") => (
    <div className={`dev-block dev-block--${accent}`}>
      <div className="dev-block__bar">
        <span className="dev-block__label">{label}</span>
        <button
          type="button"
          className="dev-block__copy"
          onClick={(e) => {
            const btn = e.currentTarget;
            navigator.clipboard?.writeText(code);
            btn.dataset.copied = "true";
            window.setTimeout(() => delete btn.dataset.copied, 1600);
          }}
        >
          <span className="dev-block__copy-label">
            {language === "ar" ? "نسخ" : language === "fr" ? "Copier" : "Copy"}
          </span>
          <span className="dev-block__copy-done">
            {language === "ar" ? "✓ نُسِخ" : language === "fr" ? "✓ Copié" : "✓ Copied"}
          </span>
        </button>
      </div>
      <code dir={codeDir}>{code}</code>
    </div>
  );

  // The primary way in, shown in the hero and repeated in the closing CTA.
  // The app is desktop-only, so a quiet helper line sets expectations under
  // the button rather than crowding its label.
  const enterArchive = (
    <div className="cta-row">
      <Link className="main-button" href={lh("/app")}>
        {language === "ar" ? "ادخلوا إلى الأرشيف" : language === "fr" ? "Entrer dans l'Archive" : "Enter the Archive"}
      </Link>
      <span className="cta-note">
        {language === "ar"
          ? "يتطلّب متصفّحاً على حاسوب مكتبي أو محمول"
          : language === "fr"
          ? "Nécessite un navigateur de bureau"
          : "Requires a desktop browser"}
      </span>
    </div>
  );

  // Secondary ways in, shown under both the hero CTA and the closing CTA.
  const secondaryLinks = (
    <div className="button-row">
      <a className="button" href="#">
        {language === "ar"
          ? "ابدأوا جولة تفاعلية"
          : language === "fr"
          ? "Faire une visite interactive"
          : "Take an Interactive Tour"}
      </a>
      <Link className="button" href="/docs/">
        {language === "ar"
          ? "اطّلعوا على التوثيق"
          : language === "fr"
          ? "Accéder à la documentation"
          : "Access the Documentation"}
      </Link>
      <a className="button" href="#">
        {language === "ar"
          ? "اطّلعوا على الشيفرة المصدرية"
          : language === "fr"
          ? "Accéder au code source"
          : "Access the Source Code"}
      </a>
      <a className="button" href="#">
        {language === "ar"
          ? "اقرأوا الرسالة البحثية"
          : language === "fr"
          ? "Lire l'article académique"
          : "Read the Academic Paper"}
      </a>
    </div>
  );

  return (
    <>
      <div className={`landing-page ${isRTL ? "rtl" : "ltr"}`}>
        {/* ---------------------------------------------------------- hero */}
        <header className="landing-header">
          <div className="language-selector-wrapper">
            <LanguageSelector />
          </div>

          <h1 className="landing-title">
            <span className="landing-title__ar" lang="ar" dir="rtl">
              أرشيف المقام العربي الرقمي
            </span>
            <span className="landing-title__latin" lang={language === "fr" ? "fr" : "en"}>
              {language === "fr" ? "Archive Numérique du Maqām Arabe" : "Digital Arabic Maqām Archive"}
            </span>
          </h1>

          <p className="landing-subtitle">
            {language === "ar"
              ? "منصّة وواجهة برمجية ومدوّنة، متعدّدة اللغات ومفتوحة المصدر، لاستكشاف نظام المقامات العربية"
              : language === "fr"
              ? "Plateforme, API et corpus multilingues et open-source pour explorer le système des maqām arabes"
              : "Multilingual open-source platform, API and corpus for exploring the Arabic maqām system"}
          </p>

          {enterArchive}

          {secondaryLinks}
        </header>

        {/* ------------------------------------------------------ features */}
        <section className="key-features" id="key-features">
          <h2>
            {language === "ar" ? "الميزات الأساسية" : language === "fr" ? "Fonctionnalités principales" : "Core Features"}
          </h2>

          <div className="features-grid">
            <div className="feature-card">
              <h3>
                {language === "ar" ? "الاستكشاف التفاعلي" : language === "fr" ? "Exploration interactive" : "Interactive Exploration"}
              </h3>
              <p>
                {language === "ar"
                  ? "اعزفوا المئات من أنظمة التنغيم والأجناس والمقامات من لوحة مفاتيح الحاسوب أو عبر أجهزة MIDI."
                  : language === "fr"
                  ? "Jouez des centaines de systèmes d'accord, d'ajnās et de maqāmāt avec votre clavier d'ordinateur ou des appareils MIDI."
                  : "Play hundreds of tuning systems, ajnās, and maqāmāt using your computer keyboard or MIDI devices."}
              </p>
            </div>

            <div className="feature-card">
              <h3>
                {language === "ar" ? "التحليل المقارن" : language === "fr" ? "Analyse comparative" : "Comparative Analysis"}
              </h3>
              <p>
                {language === "ar"
                  ? "بدّلوا بين أنظمة تنغيم متعددة لتسمعوا وتقارنوا أبعادها على الجنس أو المقام نفسه."
                  : language === "fr"
                  ? "Passez entre plusieurs systèmes d'accord pour entendre et comparer leurs intervalles sur le même jins ou maqām."
                  : "Switch between multiple tuning systems to hear and compare their intervals on the same jins or maqām."}
              </p>
            </div>

            <div className="feature-card">
              <h3>
                {language === "ar" ? "الدقة الرياضية" : language === "fr" ? "Précision mathématique" : "Mathematical Precision"}
              </h3>
              <p>
                {language === "ar"
                  ? "اطّلعوا على تحليل رياضي مفصّل يشمل حسابات الأبعاد وتراكيب الأجناس."
                  : language === "fr"
                  ? "Accédez à une analyse mathématique détaillée incluant les calculs d'intervalles et les constructions d'ajnās."
                  : "Access detailed mathematical analysis including interval calculations, and ajnās constructions."}
              </p>
            </div>

            <div className="feature-card">
              <h3>
                {language === "ar" ? "الانتقالات الخوارزمية" : language === "fr" ? "Modulations algorithmiques" : "Algorithmic Modulations"}
              </h3>
              <p>
                {language === "ar"
                  ? "استكشفوا انتقالات المقام وفق قواعد سامي الشوّا في الانتقال بين المقامات."
                  : language === "fr"
                  ? "Explorez les modulations de maqām selon les règles de modulation de Sāmī Al-Shawwā."
                  : "Explore maqām modulations based on Sāmī Al-Shawwā's maqām modulation rules."}
              </p>
            </div>

            <div className="feature-card">
              <h3>
                {language === "ar" ? "الصرامة الأكاديمية" : language === "fr" ? "Rigueur académique" : "Scholarly Rigour"}
              </h3>
              <p>
                {language === "ar"
                  ? "اطّلعوا على مراجع ببليوغرافية شاملة تُوثّق كل البيانات الموسيقية."
                  : language === "fr"
                  ? "Accédez à des références bibliographiques complètes pour toutes les données musicologiques."
                  : "Access comprehensive bibliographic references for all the musicological data."}
              </p>
            </div>

            <div className="feature-card">
              <h3>
                {language === "ar" ? "الوصول المفتوح للبيانات" : language === "fr" ? "Accès ouvert aux données" : "Open Data Access"}
              </h3>
              <p>
                {language === "ar"
                  ? "صدّروا البيانات للاستخدام البحثي أو الإبداعي، أو استعينوا بواجهتنا البرمجية المفتوحة (REST API) للتكامل مع برامجكم."
                  : language === "fr"
                  ? "Exportez les données pour un usage de recherche ou créatif, ou utilisez notre API ouverte pour l'intégration programmatique."
                  : "Export the data for research or creative use or use our open API for programmatic integration."}
              </p>
            </div>
          </div>

          {scrollCue("about")}
        </section>

        {/* --------------------------------------------------------- about */}
        <section className="about" id="about">
          <div className="about__inner">
            <h2>{language === "ar" ? "حول المشروع" : language === "fr" ? "À propos" : "About"}</h2>

            {language === "ar" ? (
              <>
                <p>أرشيف المقام العربي الرقمي منصّة مبتكرة مفتوحة المصدر ومفتوحة النفاذ، مخصّصة لدراسة نظام المقامات العربية واستكشافه.</p>
                <p>
                  صُمّمت المنصّة مورداً للطلّاب والموسيقيين والملحّنين وعلماء الموسيقى والمعلّمين والباحثين والمبرمجين، ولكلّ من يهتمّ بنظريات الموسيقى الغنية في المنطقة الناطقة بالعربية.
                </p>
                <p>
                  تقدّم المنصّة مستودعاً تفاعلياً ودقيقاً أكاديمياً لأنظمة التنغيم والأجناس والمقامات، مع سيورها وانتقالاتها، ويمكنكم عزفها وسماعها كلّها من لوحة مفاتيح الحاسوب أو عبر MIDI.
                </p>
                <p>
                  يستطيع الموسيقيون والملحّنون تصدير ملفّات تنغيم بصيغة Scala للتكامل مع الآلات والبرامج الخارجية. وبالمقابل، يصل المبرمجون والباحثون إلى بيانات منظّمة وقابلة للاستعلام حاسوبياً عبر تصديرات JSON شاملة ونقاط وصول الواجهة البرمجية، إلى جانب بيانات وتحليلات رياضية متعمّقة.
                </p>
              </>
            ) : language === "fr" ? (
              <>
                <p>
                  L&apos;Archive Numérique du Maqām Arabe est une plateforme en ligne innovante, en libre accès et open-source, dédiée à l&apos;étude et à l&apos;exploration du système des maqāmāt arabes.
                </p>
                <p>
                  La plateforme est conçue comme une ressource pour les étudiants, musiciens, compositeurs, musicologues, éducateurs, chercheurs, développeurs et toute personne intéressée par la riche théorie musicale de la région arabophone.
                </p>
                <p>
                  Elle offre un dépôt interactif et académiquement rigoureux de systèmes d&apos;accord, d&apos;ajnās et de maqāmāt, ainsi que leurs suyūr (chemins de développement mélodique) et intiqālāt (modulations), tous pouvant être joués et entendus avec un clavier d&apos;ordinateur ou via MIDI.
                </p>
                <p>
                  Les musiciens et compositeurs peuvent exporter des fichiers Scala d&apos;accord pour l&apos;intégration avec des instruments et logiciels externes. En parallèle, les développeurs et chercheurs peuvent accéder à des données structurées et interrogeables par calcul via des exportations JSON complètes et des points de terminaison API, ainsi que des données et analyses mathématiques approfondies.
                </p>
              </>
            ) : (
              <>
                <p>
                  The Digital Arabic Maqām Archive is an innovative open-access and open-source online platform dedicated to the study and exploration of the Arabic
                  maqām system.
                </p>
                <p>
                  The platform is designed as a resource for students, musicians, composers, musicologists, educators, researchers, coders/developers, and anyone
                  interested in the rich music theory of the Arabic-speaking region.
                </p>
                <p>
                  It offers an interactive and academically rigorous repository of tuning systems, ajnās, and maqāmāt, along with their suyūr (pathways of
                  melodic development) and intiqālāt (modulations), all of which can be played and heard with a computer keyboard or via MIDI.
                </p>
                <p>
                  Musicians and composers can export Scala tuning files for integration with external instruments and software. In parallel, developers and researchers can access structured, computationally queryable data through comprehensive JSON exports and API endpoints, alongside in-depth mathematical data and analysis.
                </p>
              </>
            )}
          </div>

          {scrollCue("developers")}
        </section>

        {/* ---------------------------------------------- developers & LLMs */}
        <section className="developers-llms" id="developers">
          <h2>
            {language === "ar"
              ? "للمبرمجين والذكاء الاصطناعي"
              : language === "fr"
              ? "Pour les développeurs et les LLM"
              : "For Developers & LLMs"}
          </h2>

          {language === "ar" ? (
            <p>
              كلّ نقاط وصول الواجهة البرمجية عامّة ومتاحة دون مصادقة، وتُعيد JSON صِرفاً، فالمتن كاملاً قابل للقراءة آلياً. وتجدون في التوثيق الأدلّة الكاملة والأمثلة الجاهزة والملعب التفاعلي ومواصفة OpenAPI.
            </p>
          ) : language === "fr" ? (
            <p>
              Tous les points de terminaison de l&apos;API sont publics, non authentifiés et renvoient du JSON brut&nbsp;; l&apos;ensemble du corpus est lisible par machine. Les guides complets, les exemples prêts à l&apos;emploi, le terrain de jeu interactif et la spécification OpenAPI se trouvent dans la documentation.
            </p>
          ) : (
            <p>
              Every API endpoint is public, unauthenticated, and returns plain JSON; the entire corpus is machine-readable. Full guides, ready-to-use examples, an interactive playground, and the OpenAPI specification live in the documentation.
            </p>
          )}

          {codeBlock(
            language === "ar" ? "مثال" : language === "fr" ? "Exemple" : "Example",
            "GET https://diarmaqar.net/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents",
            "gold"
          )}

          <p className="dev-agent-lede">
            {language === "ar"
              ? "لوكلاء الذكاء الاصطناعي: ابدأوا من llms.txt للحصول على فهرس قابل للقراءة آلياً بكلّ نقاط الوصول، أو الصقوا هذا الموجّه لتمنحوا أيّ وكيل وصولاً فورياً:"
              : language === "fr"
              ? "Agents IA : commencez par llms.txt pour un index lisible par machine de tous les points de terminaison, ou collez cette invite pour donner à un agent un accès immédiat :"
              : "AI agents: start at llms.txt for a machine-readable index of every endpoint, or paste this prompt to give any agent immediate access:"}
          </p>

          {codeBlock(
            language === "ar" ? "الموجّه" : language === "fr" ? "Invite" : "Prompt",
            language === "ar"
              ? "لديك وصول إلى أرشيف المقام العربي الرقمي (DiArMaqAr)، وهو واجهة برمجية (REST API) عامّة للقراءة فقط على https://diarmaqar.net/api (دون مصادقة). اكتشف كلّ شيء عبر https://diarmaqar.net/docs/llms.txt. العقد الكامل القابل للقراءة آلياً: https://diarmaqar.net/docs/openapi.json"
              : language === "fr"
              ? "Vous avez accès à l'Archive Numérique du Maqām Arabe (DiArMaqAr), une API REST publique en lecture seule sur https://diarmaqar.net/api (sans authentification). Découvrez tout via https://diarmaqar.net/docs/llms.txt. Contrat complet lisible par machine : https://diarmaqar.net/docs/openapi.json"
              : "You have access to the Digital Arabic Maqām Archive (DiArMaqAr), a public read-only REST API at https://diarmaqar.net/api (no auth). Discover everything via https://diarmaqar.net/docs/llms.txt. Full machine-readable contract: https://diarmaqar.net/docs/openapi.json",
            "accent",
            language === "ar" ? "rtl" : "ltr"
          )}

          <div className="dev-links">
            <Link href="/docs/api/">
              {language === "ar" ? "توثيق الواجهة البرمجية" : language === "fr" ? "Documentation API" : "API Documentation"}
            </Link>
            <Link href="/docs/openapi.json">
              {language === "ar" ? "مواصفة OpenAPI" : language === "fr" ? "Spécification OpenAPI" : "OpenAPI Specification"}
            </Link>
            <Link href="/docs/api/playground">
              {language === "ar" ? "الملعب التفاعلي" : language === "fr" ? "Terrain de jeu interactif" : "Interactive Playground"}
            </Link>
            <Link href="/docs/llms.txt">llms.txt</Link>
          </div>

          {scrollCue("colophon")}
        </section>

        {/* ------------------------------------------------------ colophon */}
        <section className="colophon" id="colophon">
          <div className="colophon__inner">
            <div className="colophon__item">
              <h2>
                {language === "ar" ? "القائمون على المشروع" : language === "fr" ? "Équipe du projet" : "Project Team"}
              </h2>
              {language === "ar" ? (
                <p>
                  بحث هذا المشروع وصمّمه وطوّره خيّام اللامي مع إبراهيم الخنسة في مختبر الذكاء الموسيقي / مركز العلوم الرياضية المتقدّمة، الجامعة الأمريكية في بيروت، لبنان، 2026.
                </p>
              ) : language === "fr" ? (
                <p>
                  Ce projet a été recherché, conçu et développé par Khyam Allami avec Ibrahim El Khansa au Music Intelligence Lab / Centre for Advanced Mathematical Sciences, Université américaine de Beyrouth, Liban, 2026.
                </p>
              ) : (
                <p>
                  This project was researched, designed and developed by Khyam Allami with Ibrahim El Khansa at the Music Intelligence Lab / Centre for Advanced Mathematical Sciences, American University of Beirut, Lebanon, 2026.
                </p>
              )}
            </div>

            <div className="colophon__item">
              <h2>{language === "ar" ? "ساهموا" : language === "fr" ? "Contribuer" : "Contribute"}</h2>
              {language === "ar" ? (
                <p>
                  نرحّب بمساهمات المجتمع لمساعدتنا في تحسين هذا المشروع وتوسيعه. زوروا{" "}
                  <a href="https://github.com/Music-Intelligence-Lab/DiArMaqAr/" target="_blank" rel="noopener noreferrer">
                    مستودعنا على GitHub
                  </a>{" "}
                  للإبلاغ عن المشكلات أو اقتراح ميزات أو تقديم طلبات سحب. وإن رغبتم في المساعدة على إدخال البيانات، فتواصلوا مع خيّام اللامي مباشرةً عبر{" "}
                  <a href="mailto:ka109&#64;aub&#46;edu&#46;lb">ka109&#64;aub&#46;edu&#46;lb</a>.
                </p>
              ) : language === "fr" ? (
                <p>
                  Nous accueillons les contributions de la communauté pour nous aider à améliorer et à développer ce projet davantage. Veuillez visiter notre{" "}
                  <a href="https://github.com/Music-Intelligence-Lab/DiArMaqAr/" target="_blank" rel="noopener noreferrer">
                    dépôt GitHub
                  </a>{" "}
                  pour signaler des problèmes, suggérer des fonctionnalités ou soumettre des demandes de tirage. Alternativement, si vous souhaitez aider à la saisie de données, veuillez contacter directement Khyam Allami à <a href="mailto:ka109&#64;aub&#46;edu&#46;lb">ka109&#64;aub&#46;edu&#46;lb</a>.
                </p>
              ) : (
                <p>
                  We welcome contributions from the community to help improve and expand this project further. Please visit our{" "}
                  <a href="https://github.com/Music-Intelligence-Lab/DiArMaqAr/" target="_blank" rel="noopener noreferrer">
                    GitHub repository
                  </a>{" "}
                  to report issues, suggest features, or submit pull requests. Alternatively, if you would like to help with data entry please get in touch with Khyam Allami directly on <a href="mailto:ka109&#64;aub&#46;edu&#46;lb">ka109&#64;aub&#46;edu&#46;lb</a>.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- closing CTA */}
        <section className="closing-cta">
          <p>
            {language === "ar"
              ? "مئات من أنظمة التنغيم والأجناس والمقامات، جاهزة للعزف والسماع والدراسة."
              : language === "fr"
              ? "Des centaines de systèmes d'accord, d'ajnās et de maqāmāt, prêts à être joués, écoutés et étudiés."
              : "Hundreds of tuning systems, ajnās, and maqāmāt, ready to be played, heard, and studied."}
          </p>
          {enterArchive}
          {secondaryLinks}
        </section>
      </div>
      <Footer />
    </>
  );
}
