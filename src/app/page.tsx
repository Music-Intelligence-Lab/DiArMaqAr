"use client";

import React from "react";
import Image from "next/image";
import "../app/globals.scss";
import "../styles/landing-page.scss";
import LanguageSelector from "@/components/language-selector";
import useLanguageContext from "@/contexts/language-context";


export default function LandingPage() {
  const { language, isRTL } = useLanguageContext();
  return (
    <div className={`landing-page ${isRTL ? 'rtl' : 'ltr'}`}>
      <header className="landing-header">
        <div style={{ position: "absolute", top: 12, right: 12 }}>
          <LanguageSelector />
        </div>
        <h1>
          {language === 'ar' ? 'أرشيف المقامات العربية الرقمي' : 'Digital Arabic Maqām Archive'}
        </h1>
      </header>

      <section className="lead">
        {language === 'ar' ? (
          <>
            <p>
              يُعدّ <span className="highlight">أرشيف المقامات العربية</span> منصة
              إلكترونية مبتكرة ومفتوحة المصدر ومفتوحة الوصول مخصّصة لدراسة
              واستكشاف <span className="highlight">نظام المقام العربي</span>.
            </p>

            <p>
              صُممت المنصة لتكون مورداً قيّماً للـ
              <span className="highlight"> طلاب</span>،
              <span className="highlight"> موسيقيين</span>،
              <span className="highlight"> ملحّنين</span>،
              <span className="highlight"> علماء الموسيقى</span>،
              <span className="highlight"> معلّمين</span>،
              <span className="highlight"> باحثين</span>، وكل من يهتمُّ بالإرث
              الموسيقي الغني في المنطقة الناطقة بالعربية.
            </p>

            <p>
              تقدّم المنصة مستودعاً <span className="highlight">تفاعلياً</span> و
              <span className="highlight">موثوقاً أكاديمياً</span> لأنظمة التناغيم،
              <span className="highlight"> الأجناس</span>،
              <span className="highlight"> المقامات</span>، إضافةً إلى
              <span className="highlight"> السيور</span> ومسارات التطوّر
              الموسيقي و<span className="highlight">الإنتقالات</span> الممكنة، وكلّها
              قابلة للتشغيل باستخدام <span className="highlight">لوحة المفاتيح</span> أو عبر
              <span className="highlight"> MIDI</span>.
            </p>

            <p>
              بالإضافة إلى ذلك، توفّر المنصة <span className="highlight">بيانات رياضية</span> متعمّقة
              وتحليلات، خيارات <span className="highlight">تصدير</span> شاملة، و
              <span className="highlight">واجهة برمجة تطبيقات</span> للوصول البرمجي إلى
              البيانات.
            </p>
          </>
        ) : (
          <>
            <p>
              The Digital Arabic Maqām Archive is an innovative{" "}
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
          </>
        )}
      </section>

      <section className="credits">
        {language === 'ar' ? (
          <p>
            طوّره ودرسه وصمّمه الدكتور خيام علامي وإبراهيم الخنسا في
            <span className="highlight"> مختبر الموسيقى والذكاء الاصطناعي</span> في
            <span className="highlight"> الجامعة الأمريكية في بيروت</span>، لبنان، وتم
            إطلاقه لأول مرة في سبتمبر 2025.
          </p>
        ) : (
          <p>
            This project was researched, designed and developed by Dr. Khyam
            Allami and Ibrahim El Khansa in the{" "}
            <span className="highlight">Music Intelligence Lab</span> at the{" "}
            <span className="highlight">American University of Beirut</span>,
            Lebanon, and initially launched in September 2025.
          </p>
        )}
      </section>

      <div className="cta-row">
        <a className="main-button" href="/app">
          {language === 'ar' ? 'ادخل إلى أرشيف المقامات العربية' : 'Enter the Arabic Maqām Archive'}
        </a>
      </div>

      <div className="button-row">
        <a className="button" href="#tour">
          {language === 'ar' ? 'ابدأ جولة تفاعلية' : 'Take an Interactive Tour'}
        </a>
        <a className="button" href="#code">
          {language === 'ar' ? 'اطّلع على الشيفرة المصدرية' : 'Access the Source Code'}
        </a>
        <a className="button" href="#paper">
          {language === 'ar' ? 'اقرأ الورقة البحثية' : 'Read the Academic Paper'}
        </a>
      </div>

      <h3>{language === 'ar' ? 'الميزات الرئيسية:' : 'Key Features:'}</h3>

      <ul>
        {language === 'ar' ? (
          <>
            <li>
              استكشف وشغل المئات من أنظمة التناغيم، الأجناس، والمقامات العربية بشكل
              تفاعلي.
            </li>
            <li>
              التبديل بين أنظمة تناغيم متعددة لسماع ومقارنة البُنى والفواصل على نفس
              الجنس أو المقام.
            </li>
            <li>
              تشغيل وسماع كل جنس ومقام، بما في ذلك جميع التصاوير والإنتقالات
              الممكنة، باستخدام لوحة المفاتيح أو مدخل MIDI.
            </li>
            <li>
              استكشف تعديلات المقام بناءً على خوارزمية فريدة مستخلصة من قواعد سامي
              الشواوا للإنتقالات.
            </li>
            <li>
              عرض تحليلات مفصلة لكل نظام تناغيم، جنس ومقام، بما في ذلك تراكيب الأجناس
              وجميع التصاوير الممكنة.
            </li>
            <li>قراءة تعليقات الدكتور خيام علامي.</li>
            <li>
              الوصول إلى ببليوغرافيا شاملة ومراجع للمصادر لجميع البيانات
              الموسيقية.
            </li>
            <li>
              تخصيص إخراج الصوت بالشكل، مستوى الصوت، وإعدادات المُغلّف.
            </li>
            <li>
              حفظ عناوين الصفحات لتنظيم وإعادة زيارة المقامات والأجناس المفضلة.
            </li>
            <li>
              تصدير البيانات بصيغ متعددة للاستخدام البحثي أو الإبداعي.
            </li>
            <li>
              الوصول إلى واجهة برمجة تطبيقات مفتوحة لاسترجاع ودمج البيانات برمجياً.
            </li>
          </>
        ) : (
          <>
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
          </>
        )}
      </ul>


        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Image 
            src="https://www.aub.edu.lb/Style%20Library/AUB/images/American%20University%20of%20Beirut-AUB.png" 
            alt="American University of Beirut Logo"
            width={200}
            height={80}
            style={{ maxHeight: '80px', width: 'auto' }}
          />
        </div>


    </div>
  );
}
