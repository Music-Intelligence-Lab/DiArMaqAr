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
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>{language === "ar" ? "أرشيف المقامات العربية الرقمي" : "Digital Arabic Maqām Archive"}</h3>
          <p>
            {language === "ar"
              ? "منصة إلكترونية تفاعلية ومكتبة مفتوحة المصدر لاستكشاف نظام المقامات العربية"
              : "Open-source interactive online platform and library for exploring the Arabic maqām system"}
          </p>
        </div>

        <div className="footer-section">
          <h4>{language === "ar" ? "روابط سريعة" : "Quick Links"}</h4>
          <ul>
            <li><a href="/app">{language === "ar" ? "الأرشيف" : "Archive"}</a></li>
            <li><a href="/about">{language === "ar" ? "حول المشروع" : "About"}</a></li>
            <li><a href="/user-guide">{language === "ar" ? "دليل المستخدم" : "User Guide"}</a></li>
            <li><a href="/bibliography">{language === "ar" ? "المراجع" : "Bibliography"}</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>{language === "ar" ? "القائمون على المشروع" : "Project Team"}</h4>
          <p>
            {language === "ar"
              ? "الدكتور خيام علامي وإبراهيم الخنسا"
              : "Dr. Khyam Allami & Ibrahim El Khansa"}
          </p>
          <p>
            {language === "ar"
              ? "مختبر ذكاء الموسيقى"
              : "Music Intelligence Lab"}
          </p>
          <div className="footer-logo">
            <Image
              src="https://www.aub.edu.lb/Style%20Library/AUB/images/American%20University%20of%20Beirut-AUB.png"
              alt="American University of Beirut Logo"
              width={150}
              height={60}
              style={{ maxHeight: "40px", width: "auto" }}
            />
          </div>
        </div>

        <div className="footer-section">
          <h4>{language === "ar" ? "ساهموا" : "Contribute"}</h4>
          <p>
            <a href="https://github.com/Music-Intelligence-Lab/maqam-network" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </p>
          <p>
            {language === "ar" ? "تواصلوا معنا:" : "Contact us:"}
          </p>
          <p>
            <a href="mailto:ka109&#64;aub&#46;edu&#46;lb">ka109&#64;aub&#46;edu&#46;lb</a>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          {language === "ar"
            ? `© ${new Date().getFullYear()} أرشيف المقامات العربية الرقمي. جميع الحقوق محفوظة.`
            : `© ${new Date().getFullYear()} Digital Arabic Maqām Archive. All rights reserved.`}
        </p>
        <p>
          {language === "ar"
            ? "مفتوح المصدر تحت رخصة MIT"
            : "Open source under MIT License"}
        </p>
      </div>
    </footer>
  );
}
