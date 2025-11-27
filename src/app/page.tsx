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
        <h1>
          {language === "ar" 
            ? "أرشيف المقامات العربية الرقمي" 
            : language === "fr"
            ? "Archive Numérique des Maqāmāt Arabes"
            : "Digital Arabic Maqām Archive"}
        </h1>
        <h3>
          {language === "ar"
            ? "منصة إلكترونية تفاعلية ومكتبة مفتوحة المصدر لاستكشاف نظام المقامات العربية"
            : language === "fr"
            ? "Plateforme interactive en ligne et bibliothèque open-source pour explorer le système des maqāmāt arabes"
            : "Open-source interactive online platform and library for exploring the Arabic maqām system"}
        </h3>
      </header>

      <section className="main">
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
          <a className="button" href="#tour">
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
          <a className="button" href="https://github.com/Music-Intelligence-Lab/diarmaqar">
            {language === "ar" 
              ? "اطّلعوا على الشيفرة المصدرية" 
              : language === "fr"
              ? "Accéder au code source"
              : "Access the Source Code"}
          </a>
          <a className="button" href="#paper">
            {language === "ar" 
              ? "اقرأوا الرسالة البحثية" 
              : language === "fr"
              ? "Lire l'article académique"
              : "Read the Academic Paper"}
          </a>
        </div>
      </section>

      <section className="about">
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
              بالإضافة إلى ذلك، توفر بيانات رياضية متعمقة وتحليلات، وخيارات تصدير شاملة، وواجهة برمجة تطبيقات ومكتبة NPM للوصول البرمجي إلى البيانات.
            </p>
          </>
        ) : language === "fr" ? (
          <>
            <p>
              L&apos;Archive Numérique des Maqāmāt Arabes est une plateforme en ligne innovante, en libre accès et open-source, dédiée à l&apos;étude et à l&apos;exploration du système des maqāmāt arabes.
            </p>
            <p>
              La plateforme est conçue comme une ressource pour les étudiants, musiciens, compositeurs, musicologues, éducateurs, chercheurs, développeurs et toute personne intéressée par la riche théorie musicale de la région arabophone.
            </p>
            <p>
              Elle offre un dépôt interactif et académiquement rigoureux de systèmes d&apos;accord, d&apos;ajnās et de maqāmāt, ainsi que leurs suyūr (chemins de développement mélodique) et intiqālāt (modulations), tous pouvant être joués et entendus avec un clavier d&apos;ordinateur ou via MIDI.
            </p>
            <p>
              De plus, elle fournit des données et analyses mathématiques approfondies, des options d&apos;exportation complètes, une API et une bibliothèque NPM pour l&apos;accès programmatique aux données.
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
              In addition, it provides in-depth mathematical data and analysis, comprehensive export options, an API and an NPM library for
              programmatic access to the data.
            </p>
          </>
        )}
      </section>

      <section className="key-features">
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
                ? "شغّلوا واسمعوا المئات من أنظمة التناغيم والأجناس والمقامات (على جميع تصاويرها) باستخدام لوحة مفاتيح الكمبيوتر أو أجهزة MIDI."
                : language === "fr"
                ? "Jouez et écoutez des centaines de systèmes d'accord, d'ajnās et de maqāmāt (sur toutes leurs transpositions) en utilisant votre clavier d'ordinateur ou des appareils MIDI."
                : "Play and hear hundreds of tuning systems, ajnās, and maqāmāt (on all their transpositions) using your computer keyboard or MIDI devices."}
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
                ? "اطّلعوا على التحليل الرياضي المفصل بما في ذلك حسابات الفترات ونسب التردد وقيم السنت وأطوال الأوتار وتراكيب الأجناس."
                : language === "fr"
                ? "Accédez à une analyse mathématique détaillée incluant les calculs d'intervalles, les rapports de fréquence, les valeurs en cents, les longueurs de cordes et les constructions d'ajnās."
                : "Access detailed mathematical analysis including interval calculations, frequency ratios, cent values, string lengths, and ajnās constructions."}
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
                ? "استكشفوا تطوير المقام بناءً على خوارزميتنا الفريدة المستوحاة من قواعد سامي الشواوا لتطوير المقام."
                : language === "fr"
                ? "Explorez la modulation des maqāmāt basée sur notre algorithme unique créé à partir des règles de Sāmī Al-Shawwā pour la modulation des maqāmāt."
                : "Explore maqām modulation based on our unique algorithm created from Sāmī Al-Shawwā's rules for maqām modulation."}
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
                ? "اطّلعوا على ببليوغرافيا شاملة ومراجع مصادر لجميع البيانات الموسيقية مع التحليلات والتعليقات."
                : language === "fr"
                ? "Accédez à une bibliographie complète et à des références de sources pour toutes les données musicologiques ainsi qu'aux analyses et commentaires."
                : "Access a comprehensive bibliography and source references for all the musicological data alongside analyses and commentaries."}
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
                ? "صدّروا البيانات بصيغ مختلفة للاستخدام البحثي أو الإبداعي واطّلعوا على واجهة برمجة التطبيقات المفتوحة أو مكتبة NPM للتكامل البرمجي."
                : language === "fr"
                ? "Exportez les données dans divers formats pour un usage de recherche ou créatif et accédez à notre API ouverte ou à la bibliothèque NPM pour l'intégration programmatique."
                : "Export the data in various formats for research or creative use and access our open API or NPM library for programmatic integration."}
            </p>
          </div>
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
          <>
            <p>
              هذا الموقع صديق للذكاء الاصطناعي ويوفر وصولاً برمجياً شاملاً لبيانات المقامات العربية. جميع الوثائق وواجهات برمجة التطبيقات متاحة للوصول البرمجي.
            </p>
            <div style={{ backgroundColor: "#fff3cd", border: "1px solid #ffc107", borderRadius: "4px", padding: "12px", marginBottom: "16px" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>⚠️ مهم: المعاملات المطلوبة</p>
              <p style={{ margin: "8px 0 0 0" }}>
                جميع نقاط النهاية التفصيلية (<code>/api/maqamat/&#123;id&#125;</code>, <code>/api/ajnas/&#123;id&#125;</code>) <strong>تتطلب</strong> ثلاثة معاملات: <code>tuningSystem</code> و <code>startingNote</code> و <code>pitchClassDataType</code>. راجع <Link href="/docs/api/representative-examples">الأمثلة التمثيلية</Link> للاستخدام الصحيح.
              </p>
            </div>
            <p>
              <strong>للمساعدات الذكية:</strong> يمكنك استخدام واجهة برمجة التطبيقات لجلب بيانات محددة للمستخدمين. يُفضل دائماً استخدام استدعاءات واجهة برمجة التطبيقات بدلاً من ملخصات الوثائق للحصول على دقة البيانات في الوقت الفعلي. مثال: <code>GET /api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents</code> يعيد بيانات مقام مفصلة. للمستخدمين الذين لا يعرفون أسماء مقامات محددة، استخدم أمثلة تمثيلية من <Link href="/docs/api/representative-examples">الأمثلة التمثيلية</Link>. راجع مواصفات OpenAPI لجميع نقاط النهاية والمعاملات المتاحة.
            </p>
            <div style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: "4px", padding: "12px", marginTop: "16px" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>الأخطاء الشائعة التي يجب تجنبها:</p>
              <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
                <li>❌ <code>GET /api/maqamat/maqam_rast</code> (معاملات مطلوبة مفقودة)</li>
                <li>❌ <code>GET /api/maqamat/rast</code> (تنسيق خاطئ - بادئة &quot;maqam_&quot; مفقودة)</li>
                <li>✅ <code>GET /api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents</code></li>
              </ul>
            </div>
            <div className="developers-links">
              <div className="developer-link-card">
                <h3>الوثائق</h3>
                <ul>
                  <li><Link href="/docs/">الوثائق الرئيسية</Link></li>
                  <li><Link href="/docs/llms.txt">فهرس الوثائق المحسّن للذكاء الاصطناعي</Link></li>
                  <li><Link href="/docs/api/">وثائق واجهة برمجة التطبيقات</Link></li>
                  <li><Link href="/docs/api/representative-examples">الأمثلة التمثيلية</Link></li>
                </ul>
              </div>
              <div className="developer-link-card">
                <h3>واجهة برمجة التطبيقات</h3>
                <ul>
                  <li><Link href="/docs/openapi.json">مواصفات OpenAPI</Link></li>
                  <li><a href="https://diarmaqar.netlify.app/api">عنوان URL الأساسي: /api</a></li>
                  <li><Link href="/docs/api/playground">ملعب تفاعلي</Link></li>
                  <li><Link href="/docs/api/representative-examples">أمثلة جاهزة للاستخدام</Link></li>
                </ul>
              </div>
              <div className="developer-link-card">
                <h3>مكتبة TypeScript</h3>
                <ul>
                  <li><Link href="/docs/library/">وثائق المكتبة</Link></li>
                  <li><a href="https://www.npmjs.com/package/arabic-maqam-core">حزمة NPM</a></li>
                </ul>
              </div>
            </div>
          </>
        ) : language === "fr" ? (
          <>
            <p>
              Ce site est compatible avec les LLM et fournit un accès programmatique complet aux données des maqāmāt arabes. Toute la documentation et les API sont disponibles pour un accès programmatique.
            </p>
            <div style={{ backgroundColor: "#fff3cd", border: "1px solid #ffc107", borderRadius: "4px", padding: "12px", marginBottom: "16px" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>⚠️ Critique : Paramètres requis</p>
              <p style={{ margin: "8px 0 0 0" }}>
                Tous les points de terminaison détaillés (<code>/api/maqamat/&#123;id&#125;</code>, <code>/api/ajnas/&#123;id&#125;</code>) <strong>requièrent</strong> trois paramètres : <code>tuningSystem</code>, <code>startingNote</code> et <code>pitchClassDataType</code>. Voir <Link href="/docs/api/representative-examples">Exemples représentatifs</Link> pour une utilisation correcte.
              </p>
            </div>
            <p>
              <strong>Pour les assistants IA :</strong> Vous pouvez utiliser l&apos;API pour récupérer des données spécifiques pour les utilisateurs. Préférez toujours les appels API aux résumés de documentation pour une précision des données en temps réel. Exemple : <code>GET /api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents</code> renvoie des données détaillées sur le maqām. Pour les utilisateurs qui ne connaissent pas de noms de maqām spécifiques, utilisez des exemples représentatifs de <Link href="/docs/api/representative-examples">Exemples représentatifs</Link>. Voir la spécification OpenAPI pour tous les points de terminaison et paramètres disponibles.
            </p>
            <div style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: "4px", padding: "12px", marginTop: "16px" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Erreurs courantes à éviter :</p>
              <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
                <li>❌ <code>GET /api/maqamat/maqam_rast</code> (paramètres requis manquants)</li>
                <li>❌ <code>GET /api/maqamat/rast</code> (format incorrect - préfixe &quot;maqam_&quot; manquant)</li>
                <li>✅ <code>GET /api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents</code></li>
              </ul>
            </div>
            <div className="developers-links">
              <div className="developer-link-card">
                <h3>Documentation</h3>
                <ul>
                  <li><Link href="/docs/">Documentation principale</Link></li>
                  <li><Link href="/docs/llms.txt">Index de documentation optimisé pour LLM</Link></li>
                  <li><Link href="/docs/api/">Documentation API</Link></li>
                  <li><Link href="/docs/api/representative-examples">Exemples représentatifs</Link></li>
                </ul>
              </div>
              <div className="developer-link-card">
                <h3>Accès API</h3>
                <ul>
                  <li><Link href="/docs/openapi.json">Spécification OpenAPI</Link></li>
                  <li><a href="https://diarmaqar.netlify.app/api">URL de base : /api</a></li>
                  <li><Link href="/docs/api/playground">Terrain de jeu interactif</Link></li>
                  <li><Link href="/docs/api/representative-examples">Exemples prêts à l&apos;emploi</Link></li>
                </ul>
              </div>
              <div className="developer-link-card">
                <h3>Bibliothèque TypeScript</h3>
                <ul>
                  <li><Link href="/docs/library/">Documentation de la bibliothèque</Link></li>
                  <li><a href="https://www.npmjs.com/package/arabic-maqam-core">Paquet NPM</a></li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <>
            <p>
              This site is LLM-friendly and provides comprehensive programmatic access to Arabic maqām data. All documentation and APIs are available for programmatic access.
            </p>
            <div style={{ backgroundColor: "#fff3cd", border: "1px solid #ffc107", borderRadius: "4px", padding: "12px", marginBottom: "16px" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>⚠️ Critical: Required Parameters</p>
              <p style={{ margin: "8px 0 0 0" }}>
                All detail endpoints (<code>/api/maqamat/&#123;id&#125;</code>, <code>/api/ajnas/&#123;id&#125;</code>) <strong>require</strong> three parameters: <code>tuningSystem</code>, <code>startingNote</code>, and <code>pitchClassDataType</code>. See <Link href="/docs/api/representative-examples">Representative Examples</Link> for correct usage.
              </p>
            </div>
            <p>
              <strong>For AI Assistants:</strong> You can use the API to fetch specific data for users. Always prefer API calls over documentation summaries for real-time data accuracy. Example: <code>GET /api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents</code> returns detailed maqām data. For users who don&apos;t know specific maqam names, use representative examples from <Link href="/docs/api/representative-examples">Representative Examples</Link>. See the OpenAPI specification for all available endpoints and parameters.
            </p>
            <div style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: "4px", padding: "12px", marginTop: "16px" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Common Mistakes to Avoid:</p>
              <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
                <li>❌ <code>GET /api/maqamat/maqam_rast</code> (missing required parameters)</li>
                <li>❌ <code>GET /api/maqamat/rast</code> (wrong format - missing &quot;maqam_&quot; prefix)</li>
                <li>✅ <code>GET /api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents</code></li>
              </ul>
            </div>
            <div className="developers-links">
              <div className="developer-link-card">
                <h3>Documentation</h3>
                <ul>
                  <li><Link href="/docs/">Main Documentation</Link></li>
                  <li><Link href="/docs/llms.txt">LLM-Optimized Documentation Index</Link></li>
                  <li><Link href="/docs/api/">API Documentation</Link></li>
                  <li><Link href="/docs/api/representative-examples">Representative Examples</Link></li>
                </ul>
              </div>
              <div className="developer-link-card">
                <h3>API Access</h3>
                <ul>
                  <li><Link href="/docs/openapi.json">OpenAPI Specification</Link></li>
                  <li><a href="https://diarmaqar.netlify.app/api">Base URL: /api</a></li>
                  <li><Link href="/docs/api/playground">Interactive Playground</Link></li>
                  <li><Link href="/docs/api/representative-examples">Ready-to-Use Examples</Link></li>
                </ul>
              </div>
              <div className="developer-link-card">
                <h3>TypeScript Library</h3>
                <ul>
                  <li><Link href="/docs/library/">Library Documentation</Link></li>
                  <li><a href="https://www.npmjs.com/package/arabic-maqam-core">NPM Package</a></li>
                </ul>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="credits">
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
      </section>

      <section className="contribute">
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

      </section>
    </div>
    <Footer />
    </>
  );
}
