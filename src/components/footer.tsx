"use client";

import React from "react";
import Image from "next/image";
// Update the import path if the context file exists elsewhere, for example:
import useLanguageContext from "../contexts/language-context";
// Or, if the correct path is different, adjust accordingly:
// import useLanguageContext from "../../contexts/language-context";

export default function Footer() {
  const { language } = useLanguageContext();

  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__section">
          <h3 className="footer__title">
            {language === "ar" 
              ? "أرشيف المقامات العربية الرقمي" 
              : language === "fr"
              ? "Archive Numérique des Maqāmāt Arabes"
              : "Digital Arabic Maqām Archive"}
          </h3>
          <p className="footer__description">
            {language === "ar"
              ? "منصة إلكترونية تفاعلية ومكتبة مفتوحة المصدر لاستكشاف نظام المقامات العربية"
              : language === "fr"
              ? "Plateforme interactive en ligne et bibliothèque open-source pour explorer le système des maqāmāt arabes"
              : "Open-source interactive online platform and library for exploring the Arabic maqām system"}
          </p>
                    <div className="footer__logo">
            <Image
              src="https://www.aub.edu.lb/Style%20Library/AUB/images/American%20University%20of%20Beirut-AUB.png"
              alt="American University of Beirut Logo"
              width={200}
              height={50}
              style={{ maxHeight: "50px", width: "auto", height: "auto" }}
            />
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
              <a href="/app" className="footer__link">
                {language === "ar" 
                  ? "استخدام الأرشيف" 
                  : language === "fr"
                  ? "Accéder à l&apos;Archive"
                  : "Access the Archive"}
              </a>
            </li>
            <li className="footer__list-item">
              <a href="/about" className="footer__link">
                {language === "ar" 
                  ? "حول المشروع" 
                  : language === "fr"
                  ? "À propos"
                  : "About"}
              </a>
            </li>
            <li className="footer__list-item">
              <a href="/user-guide" className="footer__link">
                {language === "ar" 
                  ? "دليل المستخدم" 
                  : language === "fr"
                  ? "Guide utilisateur"
                  : "User Guide"}
              </a>
            </li>
            <li className="footer__list-item">
              <a href="/bibliography" className="footer__link">
                {language === "ar" 
                  ? "المراجع" 
                  : language === "fr"
                  ? "Bibliographie"
                  : "Bibliography"}
              </a>
            </li>
          </ul>
        </div>

{/*         <div className="footer__section">
          <h4 className="footer__subtitle">{language === "ar" ? "القائمون على المشروع" : "Project Team"}</h4>
          <p className="footer__text">
            {language === "ar"
              ? "الدكتور خيام علامي وإبراهيم الخنسا"
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
            <a href="https://github.com/Music-Intelligence-Lab/maqam-network" target="_blank" rel="noopener noreferrer" className="footer__link">
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

        <div className="footer__section">
          <p className="footer__copyright">
            {language === "ar"
              ? `© ${new Date().getFullYear()} أرشيف المقامات العربية الرقمي/مختبر الذكاء الموسيقي في الجامعة الأمريكية في بيروت. جميع الحقوق محفوظة.`
              : language === "fr"
              ? (
                <>
                  Archive Numérique des Maqāmāt Arabes (DiArMaqAr) © 2025 par <a href="https://musicintelligencelab.com" className="footer__link">Khyam Allami/Music Intelligence Lab</a> est sous licence <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" className="footer__link">CC BY-NC-SA 4.0</a>
                  <br />
                  <Image src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" width={32} height={32} style={{ maxWidth: "1.5em", maxHeight: "1.5em", marginLeft: ".2em", marginTop: "0.5em", marginBottom: "0.5em", verticalAlign: "middle" }} unoptimized />
                  <Image src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" width={32} height={32} style={{ maxWidth: "1.5em", maxHeight: "1.5em", marginLeft: ".2em", marginTop: "0.5em", marginBottom: "0.5em", verticalAlign: "middle" }} unoptimized />
                  <Image src="https://mirrors.creativecommons.org/presskit/icons/nc.svg" alt="" width={32} height={32} style={{ maxWidth: "1.5em", maxHeight: "1.5em", marginLeft: ".2em", marginTop: "0.5em", marginBottom: "0.5em", verticalAlign: "middle" }} unoptimized />
                  <Image src="https://mirrors.creativecommons.org/presskit/icons/sa.svg" alt="" width={32} height={32} style={{ maxWidth: "1.5em", maxHeight: "1.5em", marginLeft: ".2em", marginTop: "0.5em", marginBottom: "0.5em", verticalAlign: "middle" }} unoptimized />
                </>
              )
              : (
            <>
              Digital Arabic Maqam Archive (DiArMaqAr) 
              <br /> © 2025 by <a href="https://musicintelligencelab.com" className="footer__link">AUB Music Intelligence Lab</a>
              <br /> Licensed under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" className="footer__link">CC BY-NC-SA 4.0</a>
              <br />
                <Image src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" width={32} height={32} style={{ maxWidth: "1.5em", maxHeight: "1.5em", marginLeft: "0em", marginTop: "0.5em", marginBottom: "0.5em", verticalAlign: "middle" }} unoptimized />
                <Image src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" width={32} height={32} style={{ maxWidth: "1.5em", maxHeight: "1.5em", marginLeft: ".2em", marginTop: "0.5em", marginBottom: "0.5em", verticalAlign: "middle" }} unoptimized />
                <Image src="https://mirrors.creativecommons.org/presskit/icons/nc.svg" alt="" width={32} height={32} style={{ maxWidth: "1.5em", maxHeight: "1.5em", marginLeft: ".2em", marginTop: "0.5em", marginBottom: "0.5em", verticalAlign: "middle" }} unoptimized />
                <Image src="https://mirrors.creativecommons.org/presskit/icons/sa.svg" alt="" width={32} height={32} style={{ maxWidth: "1.5em", maxHeight: "1.5em", marginLeft: ".2em", marginTop: "0.5em", marginBottom: "0.5em", verticalAlign: "middle" }} unoptimized />
              <br />This site is powered by <a href="https://www.netlify.com" className="footer__link">Netlify</a>.
            </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
