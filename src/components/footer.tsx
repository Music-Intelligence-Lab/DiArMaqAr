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
          <h3 className="footer__title">{language === "ar" ? "أرشيف المقامات العربية الرقمي" : "Digital Arabic Maqām Archive"}</h3>
          <p className="footer__description">
            {language === "ar"
              ? "منصة إلكترونية تفاعلية ومكتبة مفتوحة المصدر لاستكشاف نظام المقامات العربية"
              : "Open-source interactive online platform and library for exploring the Arabic maqām system"}
          </p>
                    <div className="footer__logo">
            <Image
              src="https://www.aub.edu.lb/Style%20Library/AUB/images/American%20University%20of%20Beirut-AUB.png"
              alt="American University of Beirut Logo"
              width={200}
              height={50}
              style={{ maxHeight: "50px", width: "auto" }}
            />
          </div>

        </div>

        <div className="footer__section">
          <h4 className="footer__subtitle">{language === "ar" ? "روابط سريعة" : "Quick Links"}</h4>
          <ul className="footer__list">
            <li className="footer__list-item"><a href="/app" className="footer__link">{language === "ar" ? "استخدام الأرشيف" : "Access the Archive"}</a></li>
            <li className="footer__list-item"><a href="/about" className="footer__link">{language === "ar" ? "حول المشروع" : "About"}</a></li>
            <li className="footer__list-item"><a href="/user-guide" className="footer__link">{language === "ar" ? "دليل المستخدم" : "User Guide"}</a></li>
            <li className="footer__list-item"><a href="/bibliography" className="footer__link">{language === "ar" ? "المراجع" : "Bibliography"}</a></li>
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
          <h4 className="footer__subtitle">{language === "ar" ? "ساهموا" : "Contribute"}</h4>
          <p className="footer__text">
            <a href="https://github.com/Music-Intelligence-Lab/maqam-network" target="_blank" rel="noopener noreferrer" className="footer__link">
              GitHub
            </a>
          </p>
          <h4 className="footer__subtitle">{language === "ar" ? "تواصلوا معنا:" : "Contact us"}</h4>
          <p className="footer__text">
            <a href="mailto:ka109&#64;aub&#46;edu&#46;lb" className="footer__link">ka109&#64;aub&#46;edu&#46;lb</a>
          </p>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copyright">
          {language === "ar"
            ? `© ${new Date().getFullYear()} أرشيف المقامات العربية الرقمي/مختبر الذكاء الموسيقي في الجامعة الأمريكية في بيروت. جميع الحقوق محفوظة.`
            :
          <>
            Digital Arabic Maqam Archive (DiArMaqAr) © 2025 by <a href="https://musicintelligencelab.com" className="footer__link">Khyam Allami/Music Intelligence Lab</a> is licensed under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" className="footer__link">CC BY-NC-SA 4.0</a>
            <Image src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" width={16} height={16} style={{ maxWidth: "1em", maxHeight: "1em", marginLeft: ".2em" }} unoptimized />
            <Image src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" width={16} height={16} style={{ maxWidth: "1em", maxHeight: "1em", marginLeft: ".2em" }} unoptimized />
            <Image src="https://mirrors.creativecommons.org/presskit/icons/nc.svg" alt="" width={16} height={16} style={{ maxWidth: "1em", maxHeight: "1em", marginLeft: ".2em" }} unoptimized />
            <Image src="https://mirrors.creativecommons.org/presskit/icons/sa.svg" alt="" width={16} height={16} style={{ maxWidth: "1em", maxHeight: "1em", marginLeft: ".2em" }} unoptimized />
          </>
          }
        </p>
{/*         <p className="footer__license">
          {language === "ar"
            ? "مفتوح المصدر تحت رخصة MIT"
            : "Open source under MIT License"}
        </p>
 */}      </div>
    </footer>
  );
}
