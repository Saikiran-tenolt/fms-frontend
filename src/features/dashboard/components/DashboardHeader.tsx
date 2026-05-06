import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, MapPin, Target, Calendar } from "lucide-react";

/* ─────────────────────────────────────────────
   DATA TYPES & CONSTANTS
   ───────────────────────────────────────────── */
export interface PlotData {
  _id: string;
  plotName: string;
  location: {
    district: string;
    state: string;
  };
}

export interface CropData {
  id: string;
  label: string;
  icon: string;
}

export interface StageData {
  id: string;
  label: string;
  days: string;
  color: string;
}

const CROPS: CropData[] = [
  { id: "PADDY", label: "Paddy", icon: "🌾" },
  { id: "MAIZE", label: "Maize", icon: "🌽" },
  { id: "COTTON", label: "Cotton", icon: "☁️" },
];

const STAGES: StageData[] = [
  { id: "GERMINATION", label: "Germination", days: "D1–D7", color: "#1D9E75" },
  { id: "SEEDLING", label: "Seedling", days: "D8–D20", color: "#1D9E75" },
  { id: "TILLERING", label: "Tillering", days: "D21–D40", color: "#1D9E75" },
  { id: "BOOTING", label: "Booting", days: "D41–D60", color: "#9CA3AF" },
  { id: "HEADING", label: "Heading", days: "D61–D80", color: "#9CA3AF" },
  { id: "HARVEST", label: "Harvest", days: "D90+", color: "#9CA3AF" },
];

/* ─── Styles ─── */
const S = {
  card: {
    background: "#ffffff",
    border: "0.5px solid #e2e8f0",
    borderRadius: 14,
    padding: "16px 20px",
    fontFamily: "'Sora', sans-serif",
    boxSizing: "border-box" as const,
    marginBottom: "18px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  },
  top: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 12,
  },
  plotBtn: {
    display: "flex", alignItems: "center", gap: 10,
    background: "none", border: "none", padding: 0,
    cursor: "pointer", textAlign: "left" as const,
  },
  plotIcon: {
    width: 40, height: 40, borderRadius: 10,
    background: "#EAF3DE",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    color: "#3B6D11",
  },
  plotName: {
    display: "flex", alignItems: "center", gap: 5,
    fontSize: 17, fontWeight: 600,
    color: "#111827", margin: "0 0 3px",
  },
  plotLoc: {
    display: "flex", alignItems: "center", gap: 4,
    fontSize: 12, color: "#6B7280", margin: 0,
  },
  rightCol: {
    display: "flex", flexDirection: "column" as const,
    alignItems: "flex-end", gap: 7,
  },
  liveRow: {
    display: "flex", alignItems: "center", gap: 5,
    fontSize: 12, fontWeight: 600, color: "#2d7a4f",
  },
  tagsRow: { display: "flex", gap: 6 },
  tagCrop: {
    display: "flex", alignItems: "center", gap: 5,
    background: "#f0fdf4", color: "#166534",
    border: "0.5px solid #bcf0da",
    borderRadius: 8, fontSize: 12, fontWeight: 500,
    padding: "5px 10px", cursor: "pointer",
    userSelect: "none" as const,
  },
  tagStage: {
    display: "flex", alignItems: "center", gap: 5,
    background: "#fffbeb", color: "#92400e",
    border: "0.5px solid #fde68a",
    borderRadius: 8, fontSize: 12, fontWeight: 500,
    padding: "5px 10px", cursor: "pointer",
    userSelect: "none" as const,
  },
  progMeta: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 7,
  },
  progLabel: { fontSize: 12, color: "#6B7280" },
  harvestPill: {
    display: "flex", alignItems: "center", gap: 5,
    background: "#f0fdf4", color: "#166534",
    border: "0.5px solid #bcf0da",
    borderRadius: 20, fontSize: 11, fontWeight: 500,
    padding: "3px 10px",
  },
  barWrap: {
    height: 6, background: "#F3F4F6",
    borderRadius: 99, overflow: "hidden", marginBottom: 9,
  },
  stagesRow: {
    display: "flex", justifyContent: "space-between",
  },
  /* Dropdown */
  ddWrap: { position: "relative" as const },
  ddMenu: {
    position: "absolute" as const, top: "calc(100% + 6px)", right: 0,
    background: "#ffffff", border: "0.5px solid #E5E7EB",
    borderRadius: 10, minWidth: 180, zIndex: 999,
    boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
    overflow: "hidden",
    animation: "ddIn 180ms cubic-bezier(0.16,1,0.3,1) forwards",
  },
  ddItem: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "9px 14px", fontSize: 13,
    color: "#374151", cursor: "pointer",
    transition: "background 120ms",
    border: "none", background: "none",
    width: "100%", textAlign: "left" as const,
  },
};

const PULSE_CSS = `
@keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
@keyframes ddIn      { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
`;

function LiveDot() {
  return (
    <div style={{
      width: 8, height: 8, borderRadius: "50%", background: "#22C55E",
      animation: "livePulse 1.8s ease-in-out infinite"
    }} />
  );
}

function Dropdown({ open, items, onSelect, onClose, renderItem }: any) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div ref={ref} style={S.ddMenu}>
      {items.map((item: any, i: number) => (
        <button key={item._id || item.id || i}
          style={S.ddItem}
          onClick={() => { onSelect(item); onClose(); }}
          onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
        >
          {renderItem(item)}
        </button>
      ))}
    </div>
  );
}

function StageDot({ status }: { status: "done" | "current" | "upcoming" }) {
  if (status === "done") {
    return (
      <div style={{
        width: 22, height: 22, borderRadius: "50%", background: "#1D9E75",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff"
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
    );
  }
  if (status === "current") {
    return (
      <div style={{
        width: 22, height: 22, borderRadius: "50%", background: "#EAF3DE",
        border: "2px solid #1D9E75", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 0 4px #F0FDF4"
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75" }} />
      </div>
    );
  }
  return (
    <div style={{
      width: 22, height: 22, borderRadius: "50%", background: "#fff",
      border: "2px solid #E5E7EB"
    }} />
  );
}

interface DashboardHeaderProps {
  plots: PlotData[];
  selectedPlot: PlotData | null;
  currentCropId?: string;
  currentStageId?: string;
  currentDay?: number;
  totalDays?: number;
  daysToHarvest?: number;
  isLive?: boolean;
  onPlotChange: (plotId: string) => void;
  onCropChange?: (cropId: string) => void;
  onStageChange?: (stageId: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  plots,
  selectedPlot,
  currentCropId = "PADDY",
  currentStageId = "TILLERING",
  currentDay = 34,
  totalDays = 120,
  daysToHarvest = 86,
  isLive = true,
  onPlotChange,
  onCropChange,
  onStageChange,
}) => {
  const [plotOpen, setPlotOpen] = useState(false);

  const crop = CROPS.find(c => c.id === currentCropId?.toUpperCase()) || CROPS[0];
  const stage = STAGES.find(s => s.id === currentStageId?.toUpperCase()) || STAGES[2];

  const progress = Math.round((currentDay / totalDays) * 100);
  const stageIndex = STAGES.findIndex(s => s.id === stage.id);

  return (
    <div style={S.card}>
      <style>{PULSE_CSS}</style>

      {/* ── Top row ── */}
      <div style={S.top}>
        {/* Plot Selector */}
        <div style={S.ddWrap}>
          <button style={S.plotBtn} onClick={() => setPlotOpen(!plotOpen)}>
            <div style={S.plotIcon}>
              <Target size={20} />
            </div>
            <div>
              <p style={S.plotName}>
                {selectedPlot?.plotName || "Select Plot"}
                <span style={{ color: "#9CA3AF", marginLeft: 2 }}><ChevronDown size={14} /></span>
              </p>
              <p style={S.plotLoc}>
                <MapPin size={12} style={{ color: "#9CA3AF" }} />
                {selectedPlot?.location.district}, {selectedPlot?.location.state}
              </p>
            </div>
          </button>
          <Dropdown
            open={plotOpen}
            items={plots}
            onSelect={(p: PlotData) => onPlotChange(p._id)}
            onClose={() => setPlotOpen(false)}
            renderItem={(p: PlotData) => (
              <>
                <div style={{
                  width: 28, height: 28, borderRadius: 7, background: "#EAF3DE",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#3B6D11"
                }}>
                  <Target size={14} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{p.plotName}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>{p.location.district}</div>
                </div>
                {p._id === selectedPlot?._id && (
                  <svg style={{ marginLeft: "auto" }} width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </>
            )}
          />
        </div>

        {/* Right side: Live + Dropdowns */}
        <div style={S.rightCol}>
          {isLive && (
            <div style={S.liveRow}>
              <LiveDot />
              Live
            </div>
          )}

          <div style={S.tagsRow}>
            {/* Crop Tag */}
            <div style={S.ddWrap}>
              <div style={{ ...S.tagCrop, cursor: "default" }}>
                <span style={{ fontSize: 14 }}>{crop.icon}</span>
                {crop.label}
              </div>
            </div>

            {/* Stage Tag */}
            <div style={S.ddWrap}>
              <div style={{ ...S.tagStage, cursor: "default" }}>
                <Activity size={12} />
                {stage.label}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Progress section ── */}
      <div>
        <div style={S.progMeta}>
          <span style={S.progLabel}>
            Day {currentDay} of {totalDays} &nbsp;·&nbsp; {progress}% complete
          </span>
          <div style={S.harvestPill}>
            <Calendar size={12} />
            {daysToHarvest} days to harvest
          </div>
        </div>


        <div style={{ ...S.stagesRow, position: "relative", marginTop: 20 }}>
          {STAGES.map((s, i) => {
            const status = i < stageIndex ? "done" : i === stageIndex ? "current" : "upcoming";
            return (
              <div key={s.id}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, position: "relative" }}
              >
                {/* Connecting Line */}
                {i < STAGES.length - 1 && (
                  <div style={{
                    position: "absolute", top: 11, left: "50%", width: "100%", height: 2,
                    background: i < stageIndex ? "#1D9E75" : "#F3F4F6",
                    zIndex: 0
                  }} />
                )}
                <div style={{ zIndex: 1, background: "#fff", padding: "0 10px" }}>
                  <StageDot status={status} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                  <span style={{
                    fontSize: 11,
                    color: status === "current" ? "#111827" : "#6B7280",
                    fontWeight: status === "current" ? 600 : 500,
                    textAlign: "center",
                  }}>
                    {s.label}
                  </span>
                  <span style={{ fontSize: 9, color: "#9CA3AF", fontWeight: 500 }}>{s.days}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Activity = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
