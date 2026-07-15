"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
// Update the import path if the context file exists elsewhere, for example:
import useLanguageContext from "../contexts/language-context";
// Or, if the correct path is different, adjust accordingly:
// import useLanguageContext from "../../contexts/language-context";
import { useLocalizedHref } from "@/hooks/use-localized-href";

export default function Footer() {
  const { language } = useLanguageContext();
  const lh = useLocalizedHref();

  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__section footer__section--identity">
          <h4 className="footer__subtitle">
            {language === "ar"
              ? "أرشيف المقام العربي الرقمي"
              : language === "fr"
              ? "Archive Numérique du Maqām Arabe"
              : "Digital Arabic Maqām Archive"}
          </h4>
          <p className="footer__description">
            {language === "ar"
              ? "منصّة ومدوّنة وواجهة برمجية متعدّدة اللغات ومفتوحة المصدر لنظرية المقام العربي"
              : language === "fr"
              ? "Plateforme, corpus et API multilingues et open-source pour la théorie du maqām arabe"
              : "Multilingual, open-source platform, corpus and API for Arabic maqām theory"}
          </p>
          <div className="footer__logos">
            <a
              href="https://musicintelligencelab.com"
              className="footer__logo footer__logo--mil"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Music Intelligence Lab"
            >
              <Image
                src="/mil-mark-white.png"
                alt="Music Intelligence Lab"
                width={729}
                height={916}
              />
            </a>
            <a
              href="https://www.aub.edu.lb/cams/"
              className="footer__logo footer__logo--cams"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="AUB Center for Advanced Mathematical Sciences"
            >
              <Image
                src="/cams-logo-white.png"
                alt="AUB Center for Advanced Mathematical Sciences"
                width={531}
                height={159}
              />
            </a>
          </div>
        </div>

        <div className="footer__section">
          <h4 className="footer__subtitle">
            {language === "ar" 
              ? "روابط سريعة" 
              : language === "fr"
              ? "Liens rapides"
              : "Quick Links"}
          </h4>
          <ul className="footer__list">
            <li className="footer__list-item">
              <Link href={lh("/app")} className="footer__link">
                DiArMaqAr
              </Link>
            </li>
            <li className="footer__list-item">
              <Link href={lh("/bibliography")} className="footer__link">
                {language === "ar"
                  ? "المراجع"
                  : language === "fr"
                  ? "Bibliographie"
                  : "Bibliography"}
              </Link>
            </li>
            <li className="footer__list-item">
              <Link href="/docs/" className="footer__link">
                {language === "ar"
                  ? "التوثيق"
                  : language === "fr"
                  ? "Documentation"
                  : "Documentation"}
              </Link>
            </li>
            <li className="footer__list-item">
              <Link href={lh("/about")} className="footer__link">
                {language === "ar"
                  ? "حول المشروع"
                  : language === "fr"
                  ? "À propos"
                  : "About"}
              </Link>
            </li>
          </ul>
        </div>

{/*         <div className="footer__section">
          <h4 className="footer__subtitle">{language === "ar" ? "القائمون على المشروع" : "Project Team"}</h4>
          <p className="footer__text">
            {language === "ar"
              ? "الدكتور خيّام اللامي وإبراهيم الخنسا"
              : "Khyam Allami & Ibrahim El Khansa"}
          </p>
          <p className="footer__text">
            {language === "ar"
              ? "مختبر الذكاء الموسيقي في الجامعة الأمريكية في بيروت"
              : "AUB Music Intelligence Lab"}
          </p>
        </div>
 */}
        <div className="footer__section">
          <h4 className="footer__subtitle">
            {language === "ar" 
              ? "ساهموا" 
              : language === "fr"
              ? "Contribuer"
              : "Contribute"}
          </h4>
          <p className="footer__text">
            <a href="https://github.com/Music-Intelligence-Lab/DiArMaqAr/" target="_blank" rel="noopener noreferrer" className="footer__link">
              GitHub
            </a>
          </p>
          <h4 className="footer__subtitle">
            {language === "ar" 
              ? "تواصلوا معنا:" 
              : language === "fr"
              ? "Contactez-nous :"
              : "Contact us"}
          </h4>
          <p className="footer__text">
            <a href="mailto:ka109&#64;aub&#46;edu&#46;lb" className="footer__link">ka109&#64;aub&#46;edu&#46;lb</a>
          </p>
        </div>

        <div className="footer__section footer__section--legal">
          <h4 className="footer__subtitle">
            {language === "ar"
              ? "الروابط والترخيص"
              : language === "fr"
              ? "Liens et licence"
              : "Links and License"}
          </h4>
          <p className="footer__org">
            <a href="https://musicintelligencelab.com" className="footer__link">AUB Music Intelligence Lab</a>
            <a href="https://www.aub.edu.lb/cams/" className="footer__link">Centre for Advanced Mathematical Sciences</a>
          </p>
          <p className="footer__license-line">
            {language === "ar"
              ? "مرخّص بموجب "
              : language === "fr"
              ? "Sous licence "
              : "Licensed under "}
            <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" className="footer__link">CC BY-NC-SA 4.0</a>
            <span className="footer__cc-icons">
              <Image src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="Creative Commons" width={16} height={16} className="footer__cc-icon" unoptimized />
              <Image src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="Attribution" width={16} height={16} className="footer__cc-icon" unoptimized />
              <Image src="https://mirrors.creativecommons.org/presskit/icons/nc.svg" alt="Non-Commercial" width={16} height={16} className="footer__cc-icon" unoptimized />
              <Image src="https://mirrors.creativecommons.org/presskit/icons/sa.svg" alt="Share-Alike" width={16} height={16} className="footer__cc-icon" unoptimized />
            </span>
          </p>
          <p className="footer__powered">
            {language === "ar"
              ? <>هذا الموقع مدعوم من <a href="https://www.netlify.com" className="footer__link">Netlify</a></>
              : language === "fr"
              ? <>Propulsé par <a href="https://www.netlify.com" className="footer__link">Netlify</a></>
              : <>Powered by <a href="https://www.netlify.com" className="footer__link">Netlify</a></>}
          </p>
        </div>
      </div>
    </footer>
  );
}
