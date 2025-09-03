"use client";

import React from "react";
import Image from "next/image";
import "../app/globals.scss";
import "../styles/landing-page.scss";
import LanguageSelector from "@/components/language-selector";
import useLanguageContext from "@/contexts/language-context";

export default function LandingPage() {
  const { language, isRTL }: { language: "ar" | "en"; isRTL: boolean } =
    useLanguageContext();
  return (
    <div className={`landing-page ${isRTL ? "rtl" : "ltr"}`}>
      <header className="landing-header">
        <div style={{ position: "absolute", top: 12, right: 12 }}>
          <LanguageSelector />
        </div>
        <h1>
          {language === "ar"
            ? "أرشيف المقامات العربية الرقمي"
            : "Digital Arabic Maqām Archive"}
        </h1>
                <h3>
          {language === "ar"
            ? "منصة إلكترونية تفاعلية ومكتبة مفتوحة المصدر لاستكشاف نظام المقامات العربية"
            : "Open-source interactive online platform and library for exploring the Arabic maqām system"}
        </h3>


      </header>

      <section className="main">
        <div className="cta-row">
          <a className="main-button" href="/app">
            {language === "ar"
              ? "ادخلوا إلى الأرشيف"
              : "Enter the Archive"}
          </a>
        </div>

        <div className="button-row">
          <a className="button" href="#tour">
            {language === "ar"
              ? "ابدأوا جولة تفاعلية"
              : "Take an Interactive Tour"}
          </a>
          <a className="button" href="#code">
            {language === "ar"
              ? "اطّلعوا على الشيفرة المصدرية"
              : "Access the Source Code"}
          </a>
          <a className="button" href="#paper">
            {language === "ar"
              ? "اقرأوا الرسالة البحثية"
              : "Read the Academic Paper"}
          </a>
        </div>
      </section>

      <section className="about">
        <h2>{language === "ar" ? "حول المشروع" : "About"}</h2>
        {language === "ar" ? (
          <>
            <p>
              شبكة المقام العربي هي منصة إلكترونية مبتكرة مفتوحة الوصول ومفتوحة المصدر
              مخصصة لدراسة واستكشاف نظام المقامات العربية.
            </p>
            <p>
              صُممت المنصة لتكون مورداً للطلاب والموسيقيين والملحنين وعلماء الموسيقى
              والمعلمين والباحثين والمبرمجين وكل من يهتم بنظريات الموسيقى في
              المنطقة الناطقة بالعربية.
            </p>
            <p>
              توفر مستودعاً تفاعلياً وصارماً أكاديمياً لأنظمة التناغيم والأجناس والمقامات،
              مع سيورها (مسارات التطوير اللحني) وانتقالاتها (التطويرات)، وكلها يمكن
              تشغيلها وسماعها باستخدام لوحة مفاتيح الكمبيوتر أو عبر MIDI.
            </p>
            <p>
              بالإضافة إلى ذلك، توفر بيانات رياضية متعمقة وتحليلات، وخيارات تصدير شاملة،
              وواجهة برمجة تطبيقات ومكتبة NPM للوصول البرمجي إلى البيانات.
            </p>
          </>
        ) : (
          <>
            <p>
              Arabic Maqām Network is an innovative open-access and open-source online platform
              dedicated to the study and exploration of the Arabic maqām system.
            </p>
            <p>
              The platform is designed as a resource for students, musicians,
              composers, musicologists, educators, researchers, developers, and
              anyone interested in the rich music theory of the Arabic-speaking
              region.
            </p>
            <p>
              It offers an interactive and academically rigorous repository of
              tuning systems, ajnās, and maqāmāt, along with their suyūr
              (pathways of melodic development) and intiqālāt (modulations), all
              of which can be played and heard with a computer keyboard or via
              MIDI.
            </p>
            <p>
              In addition, it provides in-depth mathematical data and analysis,
              comprehensive export options, an API and an NPM library for programmatic access
              to the data.
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


      <section className="credits">
        <h2>{language === "ar" ? "القائمون على المشروع" : "Project Team"}</h2>
        {language === "ar" ? (
          <p>
        تم بحث وتصميم وتطوير هذا المشروع من قبل خيام اللامي وإبراهيم الخنسة في مختبر الذكاء الموسيقى في الجامعة الأمريكية في بيروت، لبنان، وأُطلق في سبتمبر 2025.
          </p>
        ) : (
          <p>
        This project was researched, designed and developed by Khyam Allami and
        Ibrahim El Khansa in the Music Intelligence Lab at the American
        University of Beirut, Lebanon, and launched in September 2025.
          </p>
        )}

        </section>

              <section className="contribute">
        <h2>{language === "ar" ? "ساهموا" : "Contribute"}</h2>
        {language === "ar" ? (
          <p>
            نرحب بمساهمات المجتمع لمساعدتنا في تحسين وتوسيع هذا المشروع أكثر. يرجى زيارة مستودع GitHub الخاص بنا للإبلاغ عن المشاكل أو اقتراح الميزات أو تقديم طلبات السحب. بدلاً من ذلك، إذا كنتم ترغبون في المساعدة في إدخال البيانات، يرجى التواصل مع خيام اللامي مباشرة عبر <a href="mailto:ka109&#64;aub&#46;edu&#46;lb">ka109&#64;aub&#46;edu&#46;lb</a>.
          </p>
        ) : (
          <p>
            We welcome contributions from the community to help improve and expand this project further. Please visit our GitHub repository to report issues, suggest features, or submit pull requests. Alternatively, if you would like to help with data entry please get in touch with Khyam Allami directly on <a href="mailto:ka109&#64;aub&#46;edu&#46;lb">ka109&#64;aub&#46;edu&#46;lb</a>.
          </p>
        )}



      <div style={{ marginTop: "40px" }}>
        <Image
          src="https://www.aub.edu.lb/Style%20Library/AUB/images/American%20University%20of%20Beirut-AUB.png"
          alt="American University of Beirut Logo"
          width={200}
          height={80}
          style={{ maxHeight: "60px", width: "auto" }}
        />
      </div>

</section>

    </div>
  );
}