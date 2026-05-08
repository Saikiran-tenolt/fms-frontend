import React, { useState, useEffect, useCallback } from "react";

interface ToastProps {
  id: number;
  type?: "warning" | "info" | "success" | "error";
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
  onDismiss: (id: number) => void;
}

const VARIANTS = {
  warning: {
    iconBg:       "#FEF3C7",
    iconColor:    "#92400E",
    borderColor:  "#FDE68A",
    progressColor:"#F59E0B",
    actionColor:  "#92400E",
    duration:     5000,
    Icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  info: {
    iconBg:       "#DBEAFE",
    iconColor:    "#1E40AF",
    borderColor:  "#BFDBFE",
    progressColor:"#3B82F6",
    actionColor:  "#1E40AF",
    duration:     4000,
    Icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  success: {
    iconBg:       "#D1FAE5",
    iconColor:    "#065F46",
    borderColor:  "#A7F3D0",
    progressColor:"#10B981",
    actionColor:  "#065F46",
    duration:     3500,
    Icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
  error: {
    iconBg:       "#FEE2E2",
    iconColor:    "#991B1B",
    borderColor:  "#FECACA",
    progressColor:"#EF4444",
    actionColor:  "#991B1B",
    duration:     6000,
    Icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
  },
};

const CloseIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const KEYFRAMES = `
  @keyframes toast-in  { from { opacity:0; transform:translateY(-18px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes toast-out { from { opacity:1; transform:translateY(0) scale(1); } to { opacity:0; transform:translateY(-10px) scale(0.97); } }
  @keyframes toast-bar { from { width:100%; } to { width:0%; } }
`;

let keyframesInjected = false;
function injectKeyframes() {
  if (keyframesInjected) return;
  if (typeof document !== 'undefined') {
    const s = document.createElement("style");
    s.textContent = KEYFRAMES;
    document.head.appendChild(s);
    keyframesInjected = true;
  }
}

export function Toast({ id, type = "info", title, subtitle, action, onDismiss }: ToastProps) {
  const [phase, setPhase] = useState<"entering" | "visible" | "leaving">("entering");
  const v = VARIANTS[type] ?? VARIANTS.info;

  injectKeyframes();

  const dismiss = useCallback(() => {
    if (phase === "leaving") return;
    setPhase("leaving");
    setTimeout(() => onDismiss(id), 220);
  }, [phase, id, onDismiss]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("visible"), 10);
    const t2 = setTimeout(dismiss, v.duration);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [dismiss, v.duration]);

  const animStyle: React.CSSProperties = phase === "leaving"
    ? { animation: "toast-out 220ms ease-in forwards" }
    : phase === "entering"
    ? { animation: "toast-in 280ms cubic-bezier(0.16,1,0.3,1) forwards" }
    : {};

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        width: 400,
        background: "#ffffff",
        border: `0.5px solid ${v.borderColor}`,
        borderRadius: 12,
        padding: "12px 14px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        ...animStyle,
      }}
    >
      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        background: v.iconBg, color: v.iconColor,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <v.Icon />
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 500, color: "#111827", lineHeight: 1.4 }}>
          {title}
        </p>
        {subtitle && (
          <p style={{ margin: 0, fontSize: 12, color: "#6B7280", lineHeight: 1.4 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Action */}
      {action && (
        <button
          onClick={() => { action.onClick?.(); dismiss(); }}
          style={{
            flexShrink: 0, background: "none", border: "none",
            fontSize: 12, fontWeight: 500, color: v.actionColor,
            cursor: "pointer", padding: "2px 0", whiteSpace: "nowrap",
          }}
        >
          {action.label} →
        </button>
      )}

      {/* Close */}
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          flexShrink: 0, background: "none", border: "none",
          color: "#9CA3AF", cursor: "pointer", padding: 2,
          display: "flex", alignItems: "center", transition: "color 150ms",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "#374151")}
        onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
      >
        <CloseIcon />
      </button>

      {/* Progress bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0,
        height: 3, background: v.progressColor,
        borderRadius: "0 0 0 12px", opacity: 0.75,
        animation: `toast-bar ${v.duration}ms linear forwards`,
      }} />
    </div>
  );
}

