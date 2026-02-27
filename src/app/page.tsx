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
            ? <>أرشيف المقامات العربية الرقمي<br />Archive Numérique des Maqāmāt Arabes</>
            : <>أرشيف المقامات العربية الرقمي<br />Digital Arabic Maqām Archive</>}
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
          <a className="button disabled" href="#" onClick={(e) => e.preventDefault()} style={{ pointerEvents: 'none', opacity: 0.5, cursor: 'not-allowed' }}>
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
          <a className="button disabled" href="#" onClick={(e) => e.preventDefault()} style={{ pointerEvents: 'none', opacity: 0.5, cursor: 'not-allowed' }}>
            {language === "ar" 
              ? "اطّلعوا على الشيفرة المصدرية" 
              : language === "fr"
              ? "Accéder au code source"
              : "Access the Source Code"}
          </a>
          <a className="button disabled" href="#" onClick={(e) => e.preventDefault()} style={{ pointerEvents: 'none', opacity: 0.5, cursor: 'not-allowed' }}>
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
              يمكن للموسيقيين والملحنين تصدير ملفات Scala للتناغم للتكامل مع الآلات والبرمجيات الخارجية. بالتوازي، يمكن للمطورين والباحثين الوصول إلى بيانات منظمة وقابلة للاستعلام حسابياً من خلال تصديرات JSON شاملة ونقاط نهاية واجهة برمجة التطبيقات، إلى جانب بيانات وتحليلات رياضية متعمقة.
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
                ? "صدّروا البيانات بصيغ مختلفة للاستخدام البحثي أو الإبداعي واطّلعوا على واجهة برمجة التطبيقات المفتوحة للتكامل البرمجي."
                : language === "fr"
                ? "Exportez les données dans divers formats pour un usage de recherche ou créatif et accédez à notre API ouverte pour l'intégration programmatique."
                : "Export the data in various formats for research or creative use and access our open API for programmatic integration."}
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
              هذا الموقع صديق للذكاء الاصطناعي ويوفر وصولاً برمجياً شاملاً لبيانات المقامات العربية. <strong>جميع نقاط نهاية واجهة برمجة التطبيقات عامة وغير مصادق عليها وتعيد JSON عادي</strong> — لا يتطلب متصفحاً أو ملفات تعريف الارتباط أو مصادقة. تعيد واجهة برمجة التطبيقات استجابات JSON منظمة كاملة تتضمن فئات النغمات والفواصل والمراجع الببليوغرافية والمزيد.
            </p>
            
            <div className="warning-box">
              <p>⚠️ مهم: المعاملات المطلوبة</p>
              <p>
                جميع نقاط النهاية التفصيلية (<code>/api/maqamat/&#123;id&#125;</code>, <code>/api/ajnas/&#123;id&#125;</code>) <strong>تتطلب</strong> ثلاثة معاملات: <code>tuningSystem</code> و <code>startingNote</code> و <code>pitchClassDataType</code>. هذه المعاملات مطلوبة لأن حسابات فئات النغمات تعتمد على نظام التناغم والنتيجة البادئة، وتحتاج واجهة برمجة التطبيقات لمعرفة التنسيق الذي يجب إرجاع البيانات به.
              </p>
              <p>
                <strong>رابط اختبار سريع (جاهز للنسخ واللصق):</strong><br />
                <code>GET https://diarmaqar.netlify.app/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents</code>
              </p>
            </div>

            <div className="info-box">
              <p>🤖 تعليمات صريحة للمساعدات الذكية:</p>
              <ul>
                <li><strong>تضمين المعاملات المطلوبة دائماً</strong> (<code>tuningSystem</code>, <code>startingNote</code>, <code>pitchClassDataType</code>) لنقاط النهاية التفصيلية</li>
                <li><strong>استخدام الأمثلة التمثيلية</strong> من <Link href="/docs/api/representative-examples">الأمثلة التمثيلية</Link> كمصدر للحقيقة لاستخدام واجهة برمجة التطبيقات الصحيح</li>
                <li><strong>تفضيل استدعاءات واجهة برمجة التطبيقات على ملخصات الوثائق</strong> لدقة البيانات في الوقت الفعلي</li>
                <li><strong>استخدام اكتشاف المعاملات</strong> (<code>?options=true</code>) لاكتشاف المعاملات المتاحة برمجياً</li>
                <li><strong>للمستخدمين الذين لا يعرفون أسماء محددة</strong>، استخدم <code>maqam_rast</code> مع <code>ibnsina_1037</code> و <code>yegah</code> كقيم افتراضية آمنة</li>
                <li><strong>الرجوع إلى مواصفات OpenAPI</strong> في <Link href="/docs/openapi.json">/docs/openapi.json</Link> للوثائق الكاملة للمعاملات</li>
              </ul>
            </div>

            <div className="info-box">
              <p>الأخطاء الشائعة التي يجب تجنبها:</p>
              <ul>
                <li>❌ <code>GET /api/maqamat/maqam_rast</code> (معاملات مطلوبة مفقودة)</li>
                <li>❌ <code>GET /api/maqamat/rast</code> (تنسيق خاطئ - بادئة &quot;maqam_&quot; مفقودة)</li>
                <li>❌ <code>GET /api/maqamat/maqam_rast?tuningSystem=Ibn Sīnā (1037)</code> (استخدام الاسم المعروض بدلاً من المعرف الآمن للرابط)</li>
                <li>✅ <code>GET /api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents</code></li>
              </ul>
            </div>

            <div className="info-box">
              <p>📋 حالات الاستخدام الشائعة للمساعدات الذكية:</p>
              <ul>
                <li><strong>&quot;أخبرني عن مقام عربي أساسي&quot;</strong> → <code>GET /api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents</code></li>
                <li><strong>&quot;أظهر لي جنساً أساسياً&quot;</strong> → <code>GET /api/ajnas/jins_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents</code></li>
                <li><strong>&quot;ما أنظمة التناغم المتاحة؟&quot;</strong> → <code>GET /api/tuning-systems</code></li>
                <li><strong>&quot;قارن أنظمة تناغم مختلفة&quot;</strong> → <code>GET /api/maqamat/maqam_rast/compare?tuningSystems=ibnsina_1037,alfarabi_950g&startingNote=yegah</code></li>
                <li><strong>&quot;اكتشف المعاملات المتاحة&quot;</strong> → <code>GET /api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&options=true</code></li>
              </ul>
            </div>

            <p>
              <strong>هيكل الاستجابة:</strong> استجابات واجهة برمجة التطبيقات هي هياكل JSON متداخلة معقدة تتضمن بيانات <code>maqam</code>/<code>jins</code>، و<code>pitchData</code> (مصفوفات صاعدة/هابطة)، و<code>intervals</code>، و<code>context</code> (معلومات نظام التناغم)، و<code>sources</code> (مراجع ببليوغرافية)، و<code>links</code> (نقاط نهاية ذات صلة)، و<code>characteristics</code> (خصائص موسيقية). راجع <Link href="/docs/openapi.json">مواصفات OpenAPI</Link> لخطط الاستجابة الكاملة.
            </p>
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
            </div>
          </>
        ) : language === "fr" ? (
          <>
            <p>
              Ce site est compatible avec les LLM et fournit un accès programmatique complet aux données des maqāmāt arabes. <strong>Tous les points de terminaison de l&apos;API sont publics, non authentifiés et renvoient du JSON brut</strong> — aucun navigateur, cookie ou authentification requis. L&apos;API renvoie des réponses JSON structurées complètes incluant les classes de hauteur, les intervalles, les sources bibliographiques et plus encore.
            </p>
            
            <div className="warning-box">
              <p>⚠️ Critique : Paramètres requis</p>
              <p>
                Tous les points de terminaison détaillés (<code>/api/maqamat/&#123;id&#125;</code>, <code>/api/ajnas/&#123;id&#125;</code>) <strong>requièrent</strong> trois paramètres : <code>tuningSystem</code>, <code>startingNote</code> et <code>pitchClassDataType</code>. Ces paramètres sont requis car les calculs de classes de hauteur dépendent du système d&apos;accord et de la note de départ, et l&apos;API doit savoir dans quel format renvoyer les données.
              </p>
              <p>
                <strong>URL de test rapide (prêt à copier-coller) :</strong><br />
                <code>GET https://diarmaqar.netlify.app/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents</code>
              </p>
            </div>

            <div className="info-box">
              <p>🤖 Instructions explicites pour les assistants IA :</p>
              <ul>
                <li><strong>Toujours inclure les paramètres requis</strong> (<code>tuningSystem</code>, <code>startingNote</code>, <code>pitchClassDataType</code>) pour les points de terminaison détaillés</li>
                <li><strong>Utiliser les Exemples représentatifs</strong> de <Link href="/docs/api/representative-examples">Exemples représentatifs</Link> comme source de vérité pour l&apos;utilisation correcte de l&apos;API</li>
                <li><strong>Préférer les appels API aux résumés de documentation</strong> pour une précision des données en temps réel</li>
                <li><strong>Utiliser la découverte de paramètres</strong> (<code>?options=true</code>) pour découvrir programmatiquement les paramètres disponibles</li>
                <li><strong>Pour les utilisateurs qui ne connaissent pas de noms spécifiques</strong>, utilisez <code>maqam_rast</code> avec <code>ibnsina_1037</code> et <code>yegah</code> comme valeurs par défaut sûres</li>
                <li><strong>Consulter la spécification OpenAPI</strong> à <Link href="/docs/openapi.json">/docs/openapi.json</Link> pour la documentation complète des paramètres</li>
              </ul>
            </div>

            <div className="info-box">
              <p>Erreurs courantes à éviter :</p>
              <ul>
                <li>❌ <code>GET /api/maqamat/maqam_rast</code> (paramètres requis manquants)</li>
                <li>❌ <code>GET /api/maqamat/rast</code> (format incorrect - préfixe &quot;maqam_&quot; manquant)</li>
                <li>❌ <code>GET /api/maqamat/maqam_rast?tuningSystem=Ibn Sīnā (1037)</code> (utilisation du nom d&apos;affichage au lieu de l&apos;identifiant sécurisé pour URL)</li>
                <li>✅ <code>GET /api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents</code></li>
              </ul>
            </div>

            <div className="info-box">
              <p>📋 Cas d&apos;utilisation courants pour les assistants IA :</p>
              <ul>
                <li><strong>&quot;Parlez-moi d&apos;un maqām arabe fondamental&quot;</strong> → <code>GET /api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents</code></li>
                <li><strong>&quot;Montrez-moi un jins de base&quot;</strong> → <code>GET /api/ajnas/jins_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents</code></li>
                <li><strong>&quot;Quels systèmes d&apos;accord sont disponibles ?&quot;</strong> → <code>GET /api/tuning-systems</code></li>
                <li><strong>&quot;Comparez différents systèmes d&apos;accord&quot;</strong> → <code>GET /api/maqamat/maqam_rast/compare?tuningSystems=ibnsina_1037,alfarabi_950g&startingNote=yegah</code></li>
                <li><strong>&quot;Découvrez les paramètres disponibles&quot;</strong> → <code>GET /api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&options=true</code></li>
              </ul>
            </div>

            <p>
              <strong>Structure de la réponse :</strong> Les réponses de l&apos;API sont des structures JSON imbriquées complexes incluant les métadonnées <code>maqam</code>/<code>jins</code>, <code>pitchData</code> (tableaux ascendants/descendants), <code>intervals</code>, <code>context</code> (informations sur le système d&apos;accord), <code>sources</code> (références bibliographiques), <code>links</code> (points de terminaison liés) et <code>characteristics</code> (propriétés musicales). Voir la <Link href="/docs/openapi.json">spécification OpenAPI</Link> pour les schémas de réponse complets.
            </p>
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
            </div>
          </>
        ) : (
          <>
            <p>
              This site is LLM-friendly and provides comprehensive programmatic access to Arabic maqām data. <strong>All API endpoints are public, unauthenticated, and return plain JSON</strong> — no browser, cookies, or authentication required. Standard HTTP GET requests work from any client (curl, fetch, etc.). The API returns complete, structured JSON responses with pitch classes, intervals, bibliographic sources, and more.
            </p>
            
            <div className="warning-box">
              <p>⚠️ Critical: Required Parameters</p>
              <p>
                All detail endpoints (<code>/api/maqamat/&#123;id&#125;</code>, <code>/api/ajnas/&#123;id&#125;</code>) <strong>require</strong> three parameters: <code>tuningSystem</code>, <code>startingNote</code>, and <code>pitchClassDataType</code>. These are required because pitch class calculations depend on the tuning system and starting note, and the API needs to know which format to return the data in.
              </p>
              <p>
                <strong>Quick Test URL (copy-paste ready):</strong><br />
                <code>GET https://diarmaqar.netlify.app/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents</code>
              </p>
            </div>

            <div className="info-box">
              <p>🤖 Explicit Instructions for AI Assistants:</p>
              <ul>
                <li><strong>Always include required parameters</strong> (<code>tuningSystem</code>, <code>startingNote</code>, <code>pitchClassDataType</code>) for detail endpoints</li>
                <li><strong>Use Representative Examples</strong> from <Link href="/docs/api/representative-examples">Representative Examples</Link> as the source of truth for correct API usage</li>
                <li><strong>Prefer API calls over documentation summaries</strong> for real-time data accuracy</li>
                <li><strong>Use parameter discovery</strong> (<code>?options=true</code>) to programmatically discover available parameters</li>
                <li><strong>For users who don&apos;t know specific names</strong>, use <code>maqam_rast</code> with <code>ibnsina_1037</code> and <code>yegah</code> as safe defaults</li>
                <li><strong>Reference the OpenAPI specification</strong> at <Link href="/docs/openapi.json">/docs/openapi.json</Link> for complete parameter documentation</li>
              </ul>
            </div>

            <div className="info-box">
              <p>Common Mistakes to Avoid:</p>
              <ul>
                <li>
                  <span>❌</span> <code>GET /api/maqamat/maqam_rast</code> <span>(missing required parameters)</span>
                </li>
                <li>
                  <span>❌</span> <code>GET /api/maqamat/rast</code> <span>(wrong format - missing &quot;maqam_&quot; prefix)</span>
                </li>
                <li>
                  <span>❌</span> <code>GET /api/maqamat/maqam_rast?tuningSystem=Ibn Sīnā (1037)</code> <span>(using display name instead of URL-safe ID)</span>
                </li>
                <li>
                  <span>✅</span> <code>GET /api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents</code>
                </li>
              </ul>
            </div>

            <div className="info-box">
              <p>📋 Common Use Cases for AI Assistants:</p>
              <ul>
                <li>
                  <strong>&quot;Tell me about a fundamental Arabic maqam&quot;</strong> → <code>GET /api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents</code>
                </li>
                <li>
                  <strong>&quot;Show me a basic jins&quot;</strong> → <code>GET /api/ajnas/jins_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents</code>
                </li>
                <li>
                  <strong>&quot;What tuning systems are available?&quot;</strong> → <code>GET /api/tuning-systems</code>
                </li>
                <li>
                  <strong>&quot;Compare different tuning systems&quot;</strong> → <code>GET /api/maqamat/maqam_rast/compare?tuningSystems=ibnsina_1037,alfarabi_950g&startingNote=yegah</code>
                </li>
                <li>
                  <strong>&quot;Discover available parameters&quot;</strong> → <code>GET /api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&options=true</code>
                </li>
              </ul>
            </div>

            <p>
              <strong>Response Structure:</strong> API responses are complex nested JSON structures including <code>maqam</code>/<code>jins</code> metadata, <code>pitchData</code> (ascending/descending arrays), <code>intervals</code>, <code>context</code> (tuning system info), <code>sources</code> (bibliographic references), <code>links</code> (related endpoints), and <code>characteristics</code> (musical properties). See the <Link href="/docs/openapi.json">OpenAPI specification</Link> for complete response schemas.
            </p>
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
