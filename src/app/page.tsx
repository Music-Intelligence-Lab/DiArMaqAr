"use client";

import React from "react";
import Link from "next/link";
import LanguageSelector from "@/components/language-selector";
import useLanguageContext from "@/contexts/language-context";
import Footer from "@/components/footer";

export default function LandingPage() {
  const { language, isRTL } = useLanguageContext();
  return (
    <>
      <div className={`landing-page ${isRTL ? "rtl" : "ltr"}`}>
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
            ? "منصة ومكتبة مفتوحة المصدر لاستكشاف نظام المقامات العربية"
            : language === "fr"
            ? "Plateforme et bibliothèque open-source pour explorer le système des maqām arabes"
            : "Open-source platform and library for exploring the Arabic maqām system"}
        </p>

        <div className="cta-row">
          <Link className="main-button" href="/app">
            {language === "ar"
              ? "ادخلوا إلى الأرشيف"
              : language === "fr"
              ? "Entrer dans l'Archive"
              : "Enter the Archive"}
          </Link>
        </div>

        <div className="button-row">
          <a className="button disabled" href="#" onClick={(e) => e.preventDefault()} aria-disabled="true" tabIndex={-1}>
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
          <a className="button disabled" href="#" onClick={(e) => e.preventDefault()} aria-disabled="true" tabIndex={-1}>
            {language === "ar"
              ? "اطّلعوا على الشيفرة المصدرية"
              : language === "fr"
              ? "Accéder au code source"
              : "Access the Source Code"}
          </a>
          <a className="button disabled" href="#" onClick={(e) => e.preventDefault()} aria-disabled="true" tabIndex={-1}>
            {language === "ar"
              ? "اقرأوا الرسالة البحثية"
              : language === "fr"
              ? "Lire l'article académique"
              : "Read the Academic Paper"}
          </a>
        </div>
      </header>

      <a
        className="scroll-cue"
        href="#key-features"
        aria-label={language === "ar" ? "مرّروا إلى الأسفل" : language === "fr" ? "Défiler vers le bas" : "Scroll down"}
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("key-features")?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>

      <section className="key-features" id="key-features">
        <h2>
          {language === "ar" 
            ? "الميزات الأساسية" 
            : language === "fr"
            ? "Fonctionnalités principales"
            : "Core Features"}
        </h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>
              {language === "ar" 
                ? "الاستكشاف التفاعلي" 
                : language === "fr"
                ? "Exploration interactive"
                : "Interactive Exploration"}
            </h3>
            <p>
              {language === "ar"
                ? "شغّلوا المئات من أنظمة التناغيم والأجناس والمقامات باستخدام لوحة مفاتيح الكمبيوتر أو أجهزة MIDI."
                : language === "fr"
                ? "Jouez des centaines de systèmes d'accord, d'ajnās et de maqāmāt avec votre clavier d'ordinateur ou des appareils MIDI."
                : "Play hundreds of tuning systems, ajnās, and maqāmāt using your computer keyboard or MIDI devices."}
            </p>
          </div>

          <div className="feature-card">
            <h3>
              {language === "ar" 
                ? "التحليل المقارن" 
                : language === "fr"
                ? "Analyse comparative"
                : "Comparative Analysis"}
            </h3>
            <p>
              {language === "ar"
                ? "انتقلوا بين أنظمة تناغيم متعددة لسماع ومقارنة ابعادها على نفس الجنس أو المقام."
                : language === "fr"
                ? "Passez entre plusieurs systèmes d'accord pour entendre et comparer leurs intervalles sur le même jins ou maqām."
                : "Switch between multiple tuning systems to hear and compare their intervals on the same jins or maqām."}
            </p>
          </div>

          <div className="feature-card">
            <h3>
              {language === "ar" 
                ? "الدقة الرياضية" 
                : language === "fr"
                ? "Précision mathématique"
                : "Mathematical Precision"}
            </h3>
            <p>
              {language === "ar"
                ? "اطّلعوا على التحليل الرياضي المفصل بما في ذلك حسابات الفترات وتراكيب الأجناس."
                : language === "fr"
                ? "Accédez à une analyse mathématique détaillée incluant les calculs d'intervalles et les constructions d'ajnās."
                : "Access detailed mathematical analysis including interval calculations, and ajnās constructions."}
            </p>
          </div>

          <div className="feature-card">
            <h3>
              {language === "ar" 
                ? "التطويرات الخوارزمية" 
                : language === "fr"
                ? "Modulations algorithmiques"
                : "Algorithmic Modulations"}
            </h3>
            <p>
              {language === "ar"
                ? "استكشفوا تطويرات المقام بناءً على قواعد سامي الشواوا لتطوير المقام."
                : language === "fr"
                ? "Explorez les modulations de maqām selon les règles de modulation de Sāmī Al-Shawwā."
                : "Explore maqām modulations based on Sāmī Al-Shawwā's maqām modulation rules."}
            </p>
          </div>

          <div className="feature-card">
            <h3>
              {language === "ar" 
                ? "الصرامة الأكاديمية" 
                : language === "fr"
                ? "Rigueur académique"
                : "Scholarly Rigour"}
            </h3>
            <p>
              {language === "ar"
                ? "اطّلعوا على مراجع ببليوغرافية شاملة لجميع البيانات الموسيقية."
                : language === "fr"
                ? "Accédez à des références bibliographiques complètes pour toutes les données musicologiques."
                : "Access comprehensive bibliographic references for all the musicological data."}
            </p>
          </div>

          <div className="feature-card">
            <h3>
              {language === "ar" 
                ? "الوصول المفتوح للبيانات" 
                : language === "fr"
                ? "Accès ouvert aux données"
                : "Open Data Access"}
            </h3>
            <p>
              {language === "ar"
                ? "صدّروا البيانات للاستخدام البحثي أو الإبداعي أو استخدموا واجهة برمجة التطبيقات المفتوحة للتكامل البرمجي."
                : language === "fr"
                ? "Exportez les données pour un usage de recherche ou créatif, ou utilisez notre API ouverte pour l'intégration programmatique."
                : "Export the data for research or creative use or use our open API for programmatic integration."}
            </p>
          </div>
        </div>
      </section>

      <section className="about" id="about">
        <div className="about__inner">
        <h2>
          {language === "ar" 
            ? "حول المشروع" 
            : language === "fr"
            ? "À propos"
            : "About"}
        </h2>
        {language === "ar" ? (
          <>
            <p>شبكة المقام العربي هي منصة إلكترونية مبتكرة مفتوحة الوصول ومفتوحة المصدر مخصصة لدراسة واستكشاف نظام المقامات العربية.</p>
            <p>
              صُممت المنصة لتكون مورداً للطلاب والموسيقيين والملحنين وعلماء الموسيقى والمعلمين والباحثين والمبرمجين وكل من يهتم بنظريات الموسيقى في
              المنطقة الناطقة بالعربية.
            </p>
            <p>
              توفر مستودعاً تفاعلياً وصارماً أكاديمياً لأنظمة التناغيم والأجناس والمقامات، مع سيورها (مسارات التطوير اللحني) وانتقالاتها (التطويرات)،
              وكلها يمكن تشغيلها وسماعها باستخدام لوحة مفاتيح الكمبيوتر أو عبر MIDI.
            </p>
            <p>
              يمكن للموسيقيين والملحنين تصدير ملفات Scala للتناغم للتكامل مع الآلات والبرمجيات الخارجية. بالتوازي، يمكن للمطورين والباحثين الوصول إلى بيانات منظمة وقابلة للاستعلام حسابياً من خلال تصديرات JSON شاملة ونقاط نهاية واجهة برمجة التطبيقات، إلى جانب بيانات وتحليلات رياضية متعمقة.
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
      </section>

      <section className="developers-llms">
        <h2>
          {language === "ar"
            ? "للمطورين والذكاء الاصطناعي"
            : language === "fr"
            ? "Pour les développeurs et les LLM"
            : "For Developers & LLMs"}
        </h2>
        {language === "ar" ? (
          <p>
            جميع نقاط نهاية واجهة برمجة التطبيقات عامة وغير مصادق عليها وتعيد JSON عادي — المتن الكامل قابل للقراءة آليًا. تتوفر الأدلة الكاملة والأمثلة الجاهزة والملعب التفاعلي ومواصفات OpenAPI في التوثيق.
          </p>
        ) : language === "fr" ? (
          <p>
            Tous les points de terminaison de l&apos;API sont publics, non authentifiés et renvoient du JSON brut — l&apos;ensemble du corpus est lisible par machine. Les guides complets, les exemples prêts à l&apos;emploi, le terrain de jeu interactif et la spécification OpenAPI se trouvent dans la documentation.
          </p>
        ) : (
          <p>
            Every API endpoint is public, unauthenticated, and returns plain JSON — the entire corpus is machine-readable. Full guides, ready-to-use examples, an interactive playground, and the OpenAPI specification live in the documentation.
          </p>
        )}
        <code className="dev-code" dir="ltr">
          GET https://diarmaqar.netlify.app/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents
        </code>
        <div className="dev-links">
          <Link href="/docs/api/">
            {language === "ar" ? "وثائق واجهة برمجة التطبيقات" : language === "fr" ? "Documentation API" : "API Documentation"}
          </Link>
          <Link href="/docs/openapi.json">
            {language === "ar" ? "مواصفات OpenAPI" : language === "fr" ? "Spécification OpenAPI" : "OpenAPI Specification"}
          </Link>
          <Link href="/docs/api/playground">
            {language === "ar" ? "ملعب تفاعلي" : language === "fr" ? "Terrain de jeu interactif" : "Interactive Playground"}
          </Link>
          <Link href="/docs/llms.txt">llms.txt</Link>
        </div>
      </section>

      <section className="colophon">
        <div className="colophon__item">
          <h2>
            {language === "ar"
              ? "القائمون على المشروع"
              : language === "fr"
              ? "Équipe du projet"
              : "Project Team"}
          </h2>
        {language === "ar" ? (
          <p>
            تم بحث وتصميم وتطوير هذا المشروع من قبل خيام اللامي وإبراهيم الخنسة في مختبر الذكاء الموسيقى في الجامعة الأمريكية في بيروت، لبنان، وأُطلق
            في سبتمبر 2025.
          </p>
        ) : language === "fr" ? (
          <p>
            Ce projet a été recherché, conçu et développé par Khyam Allami et Ibrahim El Khansa au Music Intelligence Lab de l&apos;Université américaine de Beyrouth, Liban, et lancé en septembre 2025.
          </p>
        ) : (
          <p>
            This project was researched, designed and developed by Khyam Allami and Ibrahim El Khansa in the Music Intelligence Lab at the American
            University of Beirut, Lebanon, and launched in September 2025.
          </p>
        )}
        </div>
        <div className="colophon__item">
          <h2>
            {language === "ar"
              ? "ساهموا"
              : language === "fr"
              ? "Contribuer"
              : "Contribute"}
          </h2>
        {language === "ar" ? (
          <p>
            نرحب بمساهمات المجتمع لمساعدتنا في تحسين وتوسيع هذا المشروع أكثر. يرجى زيارة مستودع GitHub الخاص بنا للإبلاغ عن المشاكل أو اقتراح الميزات
            أو تقديم طلبات السحب. بدلاً من ذلك، إذا كنتم ترغبون في المساعدة في إدخال البيانات، يرجى التواصل مع خيام اللامي مباشرة عبر{" "}
            <a href="mailto:ka109&#64;aub&#46;edu&#46;lb">ka109&#64;aub&#46;edu&#46;lb</a>.
          </p>
        ) : language === "fr" ? (
          <p>
            Nous accueillons les contributions de la communauté pour nous aider à améliorer et à développer ce projet davantage. Veuillez visiter notre dépôt GitHub pour signaler des problèmes, suggérer des fonctionnalités ou soumettre des demandes de tirage. Alternativement, si vous souhaitez aider à la saisie de données, veuillez contacter directement Khyam Allami à <a href="mailto:ka109&#64;aub&#46;edu&#46;lb">ka109&#64;aub&#46;edu&#46;lb</a>.
          </p>
        ) : (
          <p>
            We welcome contributions from the community to help improve and expand this project further. Please visit our GitHub repository to report
            issues, suggest features, or submit pull requests. Alternatively, if you would like to help with data entry please get in touch with Khyam
            Allami directly on <a href="mailto:ka109&#64;aub&#46;edu&#46;lb">ka109&#64;aub&#46;edu&#46;lb</a>.
          </p>
        )}
        </div>
      </section>

      <section className="closing-cta">
        <p>
          {language === "ar"
            ? "مئات من أنظمة التناغيم والأجناس والمقامات — جاهزة للعزف والسماع والدراسة."
            : language === "fr"
            ? "Des centaines de systèmes d'accord, d'ajnās et de maqāmāt — prêts à être joués, écoutés et étudiés."
            : "Hundreds of tuning systems, ajnās, and maqāmāt — ready to be played, heard, and studied."}
        </p>
        <Link className="main-button" href="/app">
          {language === "ar"
            ? "ادخلوا إلى الأرشيف"
            : language === "fr"
            ? "Entrer dans l'Archive"
            : "Enter the Archive"}
        </Link>
      </section>
    </div>
    <Footer />
    </>
  );
}
