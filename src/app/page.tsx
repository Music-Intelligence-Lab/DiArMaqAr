"use client";

import React from "react";
import Link from "next/link";
import LanguageSelector from "@/components/language-selector";
import useLanguageContext from "@/contexts/language-context";
import Footer from "@/components/footer";

export default function LandingPage() {
  const { language, isRTL }: { language: "ar" | "en"; isRTL: boolean } = useLanguageContext();
  return (
    <>
      <div className={`landing-page ${isRTL ? "rtl" : "ltr"}`}>
      <header className="landing-header">
        <div style={{ position: "absolute", top: 12, right: 12 }}>
          <LanguageSelector />
        </div>
        <h1>{language === "ar" ? "أرشيف المقامات العربية الرقمي" : "Digital Arabic Maqām Archive"}</h1>
        <h3>
          {language === "ar"
            ? "منصة إلكترونية تفاعلية ومكتبة مفتوحة المصدر لاستكشاف نظام المقامات العربية"
            : "Open-source interactive online platform and library for exploring the Arabic maqām system"}
        </h3>
      </header>

      <section className="main">
        <div className="cta-row">
          <Link className="main-button" href="/app">
            {language === "ar" ? "ادخلوا إلى الأرشيف" : "Enter the Archive"}
          </Link>
        </div>

        <div className="button-row">
          <a className="button" href="#tour">
            {language === "ar" ? "ابدأوا جولة تفاعلية" : "Take an Interactive Tour"}
          </a>
          <Link className="button" href="/docs/">
            {language === "ar" ? "اطّلعوا على التوثيق" : "Access the Documentation"}
          </Link>
          <a className="button" href="https://github.com/Music-Intelligence-Lab/diarmaqar">
            {language === "ar" ? "اطّلعوا على الشيفرة المصدرية" : "Access the Source Code"}
          </a>
          <a className="button" href="#paper">
            {language === "ar" ? "اقرأوا الرسالة البحثية" : "Read the Academic Paper"}
          </a>
        </div>
      </section>

      <section className="about">
        <h2>{language === "ar" ? "حول المشروع" : "About"}</h2>
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
        <h2>{language === "ar" ? "الميزات الأساسية" : "Core Features"}</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>{language === "ar" ? "الاستكشاف التفاعلي" : "Interactive Exploration"}</h3>
            <p>
              {language === "ar"
                ? "شغّلوا واسمعوا المئات من أنظمة التناغيم والأجناس والمقامات (على جميع تصاويرها) باستخدام لوحة مفاتيح الكمبيوتر أو أجهزة MIDI."
                : "Play and hear hundreds of tuning systems, ajnās, and maqāmāt (on all their transpositions) using your computer keyboard or MIDI devices."}
            </p>
          </div>

          <div className="feature-card">
            <h3>{language === "ar" ? "التحليل المقارن" : "Comparative Analysis"}</h3>
            <p>
              {language === "ar"
                ? "انتقلوا بين أنظمة تناغيم متعددة لسماع ومقارنة ابعادها على نفس الجنس أو المقام."
                : "Switch between multiple tuning systems to hear and compare their intervals on the same jins or maqām."}
            </p>
          </div>

          <div className="feature-card">
            <h3>{language === "ar" ? "الدقة الرياضية" : "Mathematical Precision"}</h3>
            <p>
              {language === "ar"
                ? "اطّلعوا على التحليل الرياضي المفصل بما في ذلك حسابات الفترات ونسب التردد وقيم السنت وأطوال الأوتار وتراكيب الأجناس."
                : "Access detailed mathematical analysis including interval calculations, frequency ratios, cent values, string lengths, and ajnās constructions."}
            </p>
          </div>

          <div className="feature-card">
            <h3>{language === "ar" ? "التطويرات الخوارزمية" : "Algorithmic Modulations"}</h3>
            <p>
              {language === "ar"
                ? "استكشفوا تطوير المقام بناءً على خوارزميتنا الفريدة المستوحاة من قواعد سامي الشواوا لتطوير المقام."
                : "Explore maqām modulation based on our unique algorithm created from Sāmī Al-Shawwā's rules for maqām modulation."}
            </p>
          </div>

          <div className="feature-card">
            <h3>{language === "ar" ? "الصرامة الأكاديمية" : "Scholarly Rigour"}</h3>
            <p>
              {language === "ar"
                ? "اطّلعوا على ببليوغرافيا شاملة ومراجع مصادر لجميع البيانات الموسيقية مع التحليلات والتعليقات."
                : "Access a comprehensive bibliography and source references for all the musicological data alongside analyses and commentaries."}
            </p>
          </div>

          <div className="feature-card">
            <h3>{language === "ar" ? "الوصول المفتوح للبيانات" : "Open Data Access"}</h3>
            <p>
              {language === "ar"
                ? "صدّروا البيانات بصيغ مختلفة للاستخدام البحثي أو الإبداعي واطّلعوا على واجهة برمجة التطبيقات المفتوحة أو مكتبة NPM للتكامل البرمجي."
                : "Export the data in various formats for research or creative use and access our open API or NPM library for programmatic integration."}
            </p>
          </div>
        </div>
      </section>

      <section className="developers-llms">
        <h2>{language === "ar" ? "للمطورين والذكاء الاصطناعي" : "For Developers & LLMs"}</h2>
        {language === "ar" ? (
          <>
            <p>
              هذا الموقع صديق للذكاء الاصطناعي ويوفر وصولاً برمجياً شاملاً لبيانات المقامات العربية. جميع الوثائق وواجهات برمجة التطبيقات متاحة للوصول البرمجي.
            </p>
            <p>
              <strong>للمساعدات الذكية:</strong> يمكنك استخدام واجهة برمجة التطبيقات لجلب بيانات محددة للمستخدمين. يُفضل دائماً استخدام استدعاءات واجهة برمجة التطبيقات بدلاً من ملخصات الوثائق للحصول على دقة البيانات في الوقت الفعلي. مثال: <code>GET /api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents</code> يعيد بيانات مقام مفصلة. للمستخدمين الذين لا يعرفون أسماء مقامات محددة، استخدم أمثلة تمثيلية من <Link href="/docs/api/representative-examples">الأمثلة التمثيلية</Link>. راجع مواصفات OpenAPI لجميع نقاط النهاية والمعاملات المتاحة.
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
              <div className="developer-link-card">
                <h3>مكتبة TypeScript</h3>
                <ul>
                  <li><Link href="/docs/library/">وثائق المكتبة</Link></li>
                  <li><a href="https://www.npmjs.com/package/arabic-maqam-core">حزمة NPM</a></li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <>
            <p>
              This site is LLM-friendly and provides comprehensive programmatic access to Arabic maqām data. All documentation and APIs are available for programmatic access.
            </p>
            <p>
              <strong>For AI Assistants:</strong> You can use the API to fetch specific data for users. Always prefer API calls over documentation summaries for real-time data accuracy. Example: <code>GET /api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents</code> returns detailed maqām data. For users who don&apos;t know specific maqam names, use representative examples from <Link href="/docs/api/representative-examples">Representative Examples</Link>. See the OpenAPI specification for all available endpoints and parameters.
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
        <h2>{language === "ar" ? "القائمون على المشروع" : "Project Team"}</h2>
        {language === "ar" ? (
          <p>
            تم بحث وتصميم وتطوير هذا المشروع من قبل خيام اللامي وإبراهيم الخنسة في مختبر الذكاء الموسيقى في الجامعة الأمريكية في بيروت، لبنان، وأُطلق
            في سبتمبر 2025.
          </p>
        ) : (
          <p>
            This project was researched, designed and developed by Khyam Allami and Ibrahim El Khansa in the Music Intelligence Lab at the American
            University of Beirut, Lebanon, and launched in September 2025.
          </p>
        )}
      </section>

      <section className="contribute">
        <h2>{language === "ar" ? "ساهموا" : "Contribute"}</h2>
        {language === "ar" ? (
          <p>
            نرحب بمساهمات المجتمع لمساعدتنا في تحسين وتوسيع هذا المشروع أكثر. يرجى زيارة مستودع GitHub الخاص بنا للإبلاغ عن المشاكل أو اقتراح الميزات
            أو تقديم طلبات السحب. بدلاً من ذلك، إذا كنتم ترغبون في المساعدة في إدخال البيانات، يرجى التواصل مع خيام اللامي مباشرة عبر{" "}
            <a href="mailto:ka109&#64;aub&#46;edu&#46;lb">ka109&#64;aub&#46;edu&#46;lb</a>.
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
