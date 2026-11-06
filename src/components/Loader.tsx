"use client";
import React, { useEffect, useState } from "react";

export default function Loader() {
  const [exiting, setExiting] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => setVisible(false), 420);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="kl-loader" style={{ opacity: exiting ? 0 : 1 }}>
      <style>{`
        .kl-loader {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: #0A0A0A;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 22px;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        .kl-loader-word {
          font-family: "Outfit", sans-serif;
          font-weight: 900;
          font-size: clamp(1.4rem, 5vw, 2rem);
          letter-spacing: 0.42em;
          text-indent: 0.42em;
          text-transform: uppercase;
          color: #F4F4F2;
          animation: kl-loader-fade 1.2s ease both;
        }
        .kl-loader-line {
          position: relative;
          width: 96px;
          height: 1px;
          background: rgba(255, 255, 255, 0.16);
          overflow: hidden;
        }
        .kl-loader-line::after {
          content: "";
          position: absolute;
          inset: 0;
          background: #F4F4F2;
          transform-origin: left;
          animation: kl-loader-bar 1s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        @keyframes kl-loader-fade {
          from { opacity: 0; letter-spacing: 0.6em; }
          to { opacity: 1; letter-spacing: 0.42em; }
        }
        @keyframes kl-loader-bar {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
      <div className="kl-loader-word">ORBT</div>
      <div className="kl-loader-line" />
    </div>
  );
}
