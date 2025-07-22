"use client";

import React from "react";

export default function MobileWarning() {
  return (
    <div className="mobile-warning">
      <div className="mobile-warning__content">
        <div className="mobile-warning__icon">
          🖥️
        </div>
        <h1 className="mobile-warning__title">
          Desktop Required
        </h1>
        <p className="mobile-warning__message">
          The Arabic Maqam Network is designed for laptop and desktop computers only.
        </p>
        <p className="mobile-warning__submessage">
          Please access this application from a device with a larger screen for the best experience.
        </p>
        <div className="mobile-warning__features">
          <div className="mobile-warning__feature">
            🎵 Interactive musical interfaces
          </div>
          <div className="mobile-warning__feature">
            🎹 Complex keyboard controls
          </div>
          <div className="mobile-warning__feature">
            📊 Detailed data visualizations
          </div>
        </div>
      </div>
    </div>
  );
}
