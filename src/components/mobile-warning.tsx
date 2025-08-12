"use client";

import React from "react";

export default function MobileWarning() {
  return (
    <div className="mobile-warning">
      <div className="mobile-warning__content">
        <div className="mobile-warning__icon">
          🖥️
        </div>
        <h2 className="mobile-warning__title">
          Desktop Required
        </h2>
        <p className="mobile-warning__message">
          The Arabic Maqam Network is designed for laptop and desktop computers only.
        </p>
        <p>
          Please access this application from a device with a larger screen for the best experience.
        </p>
      </div>
    </div>
  );
}
