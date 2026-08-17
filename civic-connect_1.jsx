import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  MapPin, Camera, Mic, CheckCircle2, Circle, AlertTriangle, Clock, Users,
  TrendingUp, Filter, Bell, User, Home, FileText, List, Settings, LogOut,
  ChevronRight, ChevronLeft, ShieldCheck, Layers, Truck, Wrench, Upload,
  X, Check, ArrowRight, BarChart3, Map as MapIcon, ClipboardList, Zap,
  PlayCircle, Eye, RotateCcw, Send, Navigation, Search, Sparkles,
  GitMerge, Building2, Radio, Lock, Database, Activity, ChevronDown,
  StopCircle, ArrowLeftRight, Info, ThumbsUp, ThumbsDown, Flag
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

/* ============================================================
   DESIGN TOKENS
   ============================================================ */
const COLORS = {
  navy: "#0B1E3C",
  navy2: "#12294F",
  navySoft: "#1B3A63",
  blue: "#1E5FA8",
  blueLight: "#E9F1FA",
  green: "#1C8A5A",
  greenLight: "#E6F5EC",
  orange: "#DB8A2B",
  orangeLight: "#FBF0DF",
  red: "#D14343",
  redLight: "#FBE9E9",
  gray: "#F4F6F8",
  border: "#E3E7EC",
  text: "#1B2430",
  mute: "#66707B",
  white: "#FFFFFF",
};

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
    .cc-root { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color:${COLORS.text}; background:${COLORS.gray}; }
    .cc-root * { box-sizing: border-box; }
    .cc-mono { font-family: 'IBM Plex Mono', monospace; }
    .cc-scroll::-webkit-scrollbar { width:6px; height:6px; }
    .cc-scroll::-webkit-scrollbar-thumb { background:#c7d0da; border-radius:4px; }
    .cc-card { background:${COLORS.white}; border:1px solid ${COLORS.border}; border-radius:14px; }
    .cc-shadow { box-shadow: 0 1px 2px rgba(11,30,60,0.04), 0 6px 20px rgba(11,30,60,0.06); }
    .cc-btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; font-weight:600; border-radius:10px; cursor:pointer; border:1px solid transparent; transition:all .15s ease; white-space:nowrap; }
    .cc-btn:active { transform: translateY(1px); }
    .cc-btn:focus-visible { outline: 2px solid ${COLORS.blue}; outline-offset:2px; }
    .cc-btn-primary { background:${COLORS.blue}; color:#fff; }
    .cc-btn-primary:hover { background:#184d8c; }
    .cc-btn-navy { background:${COLORS.navy}; color:#fff; }
    .cc-btn-navy:hover { background:#081733; }
    .cc-btn-outline { background:#fff; color:${COLORS.navy}; border-color:${COLORS.border}; }
    .cc-btn-outline:hover { background:${COLORS.gray}; }
    .cc-btn-green { background:${COLORS.green}; color:#fff; }
    .cc-btn-green:hover { background:#166f48; }
    .cc-btn-red { background:${COLORS.red}; color:#fff; }
    .cc-btn-ghost { background:transparent; color:${COLORS.mute}; }
    .cc-btn-ghost:hover { background:${COLORS.gray}; color:${COLORS.text}; }
    .cc-badge { display:inline-flex; align-items:center; gap:5px; font-size:11.5px; font-weight:700; padding:3px 9px; border-radius:999px; letter-spacing:.02em; }
    .cc-fade-in { animation: ccFadeIn .35s ease; }
    @keyframes ccFadeIn { from { opacity:0; transform:translateY(6px);} to {opacity:1; transform:translateY(0);} }
    @keyframes ccPulse { 0%,100%{opacity:1;} 50%{opacity:.45;} }
    .cc-pulse { animation: ccPulse 1.4s ease-in-out infinite; }
    @keyframes ccSpin { to { transform: rotate(360deg); } }
    .cc-spin { animation: ccSpin 1s linear infinite; }
    .cc-navlink { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:10px; font-size:13.5px; font-weight:600; color:#B9C6DA; cursor:pointer; }
    .cc-navlink:hover { background:${COLORS.navy2}; color:#fff; }
    .cc-navlink.active { background:${COLORS.blue}; color:#fff; }
    .cc-tab { display:flex; flex-direction:column; align-items:center; gap:3px; font-size:10.5px; font-weight:600; color:#9AA6B2; cursor:pointer; flex:1; padding:8px 0 6px; }
    .cc-tab.active { color:${COLORS.blue}; }
    input.cc-input, textarea.cc-input, select.cc-input { width:100%; border:1px solid ${COLORS.border}; border-radius:10px; padding:10px 12px; font-size:13.5px; font-family:inherit; background:#fff; color:${COLORS.text}; }
    input.cc-input:focus, textarea.cc-input:focus, select.cc-input:focus { outline:2px solid ${COLORS.blue}; outline-offset:0; border-color:${COLORS.blue}; }
    .cc-slider-handle { cursor: ew-resize; }
  `}</style>
);

/* ============================================================
   SEED DATA
   ============================================================ */
const CATEGORIES = [
  { id: "pothole", label: "Pothole / Road Damage", icon: "🕳️" },
  { id: "streetlight", label: "Streetlight", icon: "💡" },
  { id: "garbage", label: "Garbage", icon: "🗑️" },
  { id: "water", label: "Water Leakage", icon: "💧" },
  { id: "drainage", label: "Drainage", icon: "🌊" },
  { id: "footpath", label: "Footpath", icon: "🚶" },
  { id: "asset", label: "Municipal Asset", icon: "🏛️" },
];

const DEPARTMENTS = ["Road Maintenance", "Electrical", "Sanitation", "Water Works", "Drainage", "Public Works"];

const STATUS_META = {
  reported:        { label: "Reported",         tone: "orange", stage: 0 },
  verified:        { label: "AI Verified",       tone: "blue",   stage: 1 },
  validated:       { label: "Community Validated", tone: "blue", stage: 2 },
  pending:         { label: "Pending Assignment", tone: "orange", stage: 2 },
  assigned:        { label: "Assigned",          tone: "orange", stage: 3 },
  in_progress:     { label: "In Progress",       tone: "orange", stage: 4 },
  proof_submitted: { label: "Proof Submitted",   tone: "blue",   stage: 4 },
  resolved:        { label: "Resolved",          tone: "green",  stage: 5 },
  closed:          { label: "Closed",            tone: "green",  stage: 5 },
  reopened:        { label: "Reopened",          tone: "red",    stage: 4 },
};

const WORKFLOW_STAGES = ["REPORT", "VERIFY", "VALIDATE", "ASSIGN", "REPAIR", "CLOSE"];

function seedIncidents() {
  return [
    {
      id: "CC-1042", category: "pothole", title: "Large pothole near Knowledge Park Gate",
      description: "Large pothole near the college gate causing difficulty for two-wheelers, especially after rain.",
      ward: "Ward 12", location: "Knowledge Park, Greater Noida", x: 46, y: 40,
      status: "in_progress", priority: 86, priorityBand: "HIGH",
      priorityBreakdown: { severity: 27, people: 16, vulnerability: 16, urgency: 14, recurrence: 13 },
      aiConfidence: 94, evidenceRelevance: 98, duplicateCount: 3, linkedReports: 12,
      communityConfirmations: 23, department: "Road Maintenance", ward_dept_note: "Ward 12 → Road Maintenance (Team A)",
      assignedWorker: "Amit Kumar", deadline: "18 Aug 2026, 6:00 PM", sla: "6h remaining",
      reportedAt: "18 Aug 2026, 10:12 AM", afterPhoto: false, modelVersion: "civic-ai v1.0",
      reasonCodes: ["High severity", "High traffic area", "Nearby school/college", "Multiple citizen confirmations", "Similar reports detected"],
    },
    { id: "CC-1043", category: "garbage", title: "Overflowing garbage bin, Sector 62 market", ward: "Ward 8", location: "Sector 62 Market", x: 62, y: 55, status: "pending", priority: 62, priorityBand: "MEDIUM", aiConfidence: 91, department: "Sanitation", sla: "18h remaining", communityConfirmations: 6, reportedAt: "18 Aug 2026, 8:40 AM" },
    { id: "CC-1044", category: "streetlight", title: "Non-functional streetlight, Pari Chowk", ward: "Ward 5", location: "Pari Chowk", x: 30, y: 25, status: "in_progress", priority: 78, priorityBand: "HIGH", aiConfidence: 96, department: "Electrical", assignedWorker: "Ravi Singh", sla: "4h remaining", communityConfirmations: 11, reportedAt: "18 Aug 2026, 7:05 AM" },
    { id: "CC-1045", category: "water", title: "Water pipeline leakage, Alpha 1", ward: "Ward 9", location: "Alpha 1 Sector", x: 70, y: 35, status: "assigned", priority: 70, priorityBand: "HIGH", aiConfidence: 89, department: "Water Works", assignedWorker: "Suresh Yadav", sla: "10h remaining", communityConfirmations: 9, reportedAt: "18 Aug 2026, 9:20 AM" },
    { id: "CC-1046", category: "drainage", title: "Blocked drain causing waterlogging, Beta 2", ward: "Ward 8", location: "Beta 2 Sector", x: 58, y: 62, status: "verified", priority: 65, priorityBand: "MEDIUM", aiConfidence: 88, department: "Drainage", communityConfirmations: 4, reportedAt: "18 Aug 2026, 11:02 AM" },
    { id: "CC-1048", category: "footpath", title: "Broken footpath tiles, Gamma 1", ward: "Ward 6", location: "Gamma 1", x: 20, y: 60, status: "resolved", priority: 40, priorityBand: "LOW", aiConfidence: 85, department: "Road Maintenance", communityConfirmations: 3, reportedAt: "16 Aug 2026, 9:00 AM" },
    { id: "CC-1049", category: "asset", title: "Damaged public bench, Sector 18", ward: "Ward 3", location: "Sector 18", x: 78, y: 68, status: "resolved", priority: 35, priorityBand: "LOW", aiConfidence: 80, department: "Public Works", communityConfirmations: 2, reportedAt: "15 Aug 2026, 4:12 PM" },
    { id: "CC-1052", category: "garbage", title: "Illegal dumping near Sector 50 park", ward: "Ward 7", location: "Sector 50", x: 40, y: 72, status: "validated", priority: 55, priorityBand: "MEDIUM", aiConfidence: 90, department: "Sanitation", communityConfirmations: 8, reportedAt: "18 Aug 2026, 6:50 AM" },
    { id: "CC-1053", category: "drainage", title: "Open drain cover, near Beta 2 crossing", ward: "Ward 8", location: "Beta 2 Crossing", x: 55, y: 48, status: "in_progress", priority: 58, priorityBand: "MEDIUM", aiConfidence: 87, department: "Drainage", assignedWorker: "Manoj Tiwari", sla: "12h remaining", communityConfirmations: 5, reportedAt: "18 Aug 2026, 8:15 AM" },
    { id: "CC-1054", category: "streetlight", title: "Flickering streetlight, Ward 12 lane 4", ward: "Ward 12", location: "Knowledge Park Lane 4", x: 48, y: 30, status: "reported", priority: 44, priorityBand: "LOW", aiConfidence: 54, department: null, communityConfirmations: 1, reportedAt: "18 Aug 2026, 1:10 PM", lowConfidence: true },
    { id: "CC-1055", category: "pothole", title: "Deep pothole reopened, Sector 62 crossing", ward: "Ward 8", location: "Sector 62 Crossing", x: 66, y: 44, status: "reopened", priority: 90, priorityBand: "CRITICAL", aiConfidence: 93, department: "Road Maintenance", assignedWorker: "Amit Kumar", sla: "Overdue", communityConfirmations: 19, reportedAt: "17 Aug 2026, 3:00 PM" },
    { id: "CC-1056", category: "water", title: "Leaking pipe joint, Ward 4 main road", ward: "Ward 4", location: "Ward 4 Main Road", x: 34, y: 50, status: "proof_submitted", priority: 80, priorityBand: "HIGH", aiConfidence: 92, department: "Water Works", assignedWorker: "Suresh Yadav", sla: "Proof under review", communityConfirmations: 14, reportedAt: "17 Aug 2026, 10:00 AM" },
  ];
}

const DUPLICATE_LINKED = [
  { id: "CC-1042", distance: "0 m (origin)", time: "2 hours ago" },
  { id: "CC-1047", distance: "48 m", time: "2 hours ago" },
  { id: "CC-1050", distance: "71 m", time: "4 hours ago" },
  { id: "CC-1051", distance: "93 m", time: "5 hours ago" },
];

const BASE_AUDIT = [
  { time: "18 Aug 2026, 10:12", actor: "Citizen (CIT-2291)", action: "Report submitted", incident: "CC-1042", detail: "Category: Pothole · Evidence attached" },
  { time: "18 Aug 2026, 10:13", actor: "AI Model v1.0", action: "Classification completed", incident: "CC-1042", detail: "Confidence: 94%" },
  { time: "18 Aug 2026, 10:14", actor: "AI Model v1.0", action: "Duplicate cluster created", incident: "CC-1042", detail: "3 similar reports linked" },
  { time: "18 Aug 2026, 10:15", actor: "AI Model v1.0", action: "Priority calculated", incident: "CC-1042", detail: "Score: 86/100 · Human review flagged" },
  { time: "18 Aug 2026, 10:17", actor: "Officer Priya Sharma", action: "Assigned to Road Maintenance", incident: "CC-1042", detail: "Ward 12 → Team A" },
  { time: "18 Aug 2026, 16:12", actor: "Field Worker Amit Kumar", action: "Repair proof uploaded", incident: "CC-1042", detail: "After-photo + GPS + timestamp captured" },
  { time: "18 Aug 2026, 16:25", actor: "Officer Priya Sharma", action: "Completion approved", incident: "CC-1042", detail: "GPS match ✓ · Timestamp ✓ · Image quality ✓" },
];

/* ============================================================
   DEMO SEQUENCE ENGINE (drives "START SIH DEMO")
   ============================================================ */
const DEMO_SEQUENCE = [
  { title: "Citizen notices a pothole", role: "citizen", screen: "home", stage: 0, status: "draft" },
  { title: "Citizen captures photo evidence", role: "citizen", screen: "report2", stage: 0, status: "draft" },
  { title: "GPS location is captured", role: "citizen", screen: "report3", stage: 0, status: "draft" },
  { title: "Report submitted — AI classifies the issue", role: "citizen", screen: "aiverify", stage: 1, status: "verified" },
  { title: "AI detects 3 duplicate reports nearby", role: "citizen", screen: "aiverify-dup", stage: 1, status: "verified" },
  { title: "Reports merge into one incident cluster", role: "citizen", screen: "cluster", stage: 1, status: "verified" },
  { title: "Community confirms the issue is real", role: "citizen", screen: "public", stage: 2, status: "validated" },
  { title: "Explainable priority score: 86/100", role: "officer", screen: "detail-priority", stage: 2, status: "validated" },
  { title: "GIS routes the incident to Road Maintenance", role: "officer", screen: "detail-ai", stage: 3, status: "pending" },
  { title: "Officer assigns worker & sets deadline", role: "officer", screen: "detail-assign", stage: 3, status: "assigned" },
  { title: "Field worker accepts & starts repair", role: "worker", screen: "task", stage: 4, status: "in_progress" },
  { title: "Worker uploads after-repair photo proof", role: "worker", screen: "proof", stage: 4, status: "proof_submitted" },
  { title: "Officer reviews evidence & approves", role: "officer", screen: "detail-verify", stage: 4, status: "resolved" },
  { title: "Citizen verifies the repair in person", role: "citizen", screen: "finalverify", stage: 5, status: "resolved" },
  { title: "Incident closed — evidence chain complete", role: "citizen", screen: "tracking", stage: 5, status: "closed" },
];

function getDemoState(stepIndex) {
  const upTo = DEMO_SEQUENCE.slice(0, stepIndex + 1);
  const status = upTo[upTo.length - 1].status;
  return {
    step: DEMO_SEQUENCE[stepIndex],
    stage: DEMO_SEQUENCE[stepIndex].stage,
    status,
    showDuplicates: stepIndex >= 4,
    showCluster: stepIndex >= 5,
    confirmed: stepIndex >= 6,
    confirmations: stepIndex >= 6 ? 23 : 11,
    priorityShown: stepIndex >= 7,
    departmentShown: stepIndex >= 8,
    assigned: stepIndex >= 9,
    workerStarted: stepIndex >= 10,
    proofUploaded: stepIndex >= 11,
    officerApproved: stepIndex >= 12,
    citizenVerified: stepIndex >= 13,
    closed: stepIndex >= 14,
    auditCount: Math.min(BASE_AUDIT.length, Math.max(1, Math.round((stepIndex + 1) / 15 * BASE_AUDIT.length))),
  };
}

/* ============================================================
   SMALL UI ATOMS
   ============================================================ */
const toneStyles = {
  orange: { bg: COLORS.orangeLight, fg: "#9A5B12", dot: COLORS.orange },
  blue: { bg: COLORS.blueLight, fg: "#134A85", dot: COLORS.blue },
  green: { bg: COLORS.greenLight, fg: "#146240", dot: COLORS.green },
  red: { bg: COLORS.redLight, fg: "#A62F2F", dot: COLORS.red },
  gray: { bg: "#EEF1F4", fg: COLORS.mute, dot: "#9AA6B2" },
};

function Badge({ tone = "gray", children, dot = true }) {
  const t = toneStyles[tone] || toneStyles.gray;
  return (
    <span className="cc-badge" style={{ background: t.bg, color: t.fg }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 99, background: t.dot }} />}
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.reported;
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

function PriorityBadge({ band }) {
  const tone = band === "CRITICAL" ? "red" : band === "HIGH" ? "orange" : band === "MEDIUM" ? "blue" : "gray";
  return <Badge tone={tone}>{band}</Badge>;
}

function Btn({ children, variant = "outline", icon: Icon, onClick, style, small, full, disabled, type = "button" }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`cc-btn cc-btn-${variant}`}
      style={{
        padding: small ? "7px 12px" : "10px 16px",
        fontSize: small ? 12.5 : 13.5,
        width: full ? "100%" : undefined,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {Icon && <Icon size={small ? 14 : 16} />}
      {children}
    </button>
  );
}

function CategoryIcon(catId) {
  return (CATEGORIES.find((c) => c.id === catId) || {}).icon || "📍";
}
function CategoryLabel(catId) {
  return (CATEGORIES.find((c) => c.id === catId) || {}).label || catId;
}

function PhotoPlaceholder({ label, tone = "orange", tall }) {
  const t = toneStyles[tone] || toneStyles.orange;
  return (
    <div
      style={{
        height: tall ? 220 : 150,
        borderRadius: 12,
        background: `linear-gradient(135deg, ${t.bg}, #fff)`,
        border: `1.5px dashed ${t.dot}66`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 6, color: t.fg, position: "relative", overflow: "hidden",
      }}
    >
      <Camera size={28} strokeWidth={1.5} />
      <div style={{ fontSize: 12, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 10, color: COLORS.mute }}>Prototype sample image</div>
    </div>
  );
}

function ProgressStepper({ stage }) {
  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
      {WORKFLOW_STAGES.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 0 }}>
            <div
              style={{
                width: 26, height: 26, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center",
                background: i < stage ? COLORS.green : i === stage ? COLORS.blue : "#E4E8EC",
                color: i <= stage ? "#fff" : COLORS.mute, fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}
            >
              {i < stage ? <Check size={13} /> : i + 1}
            </div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: i <= stage ? COLORS.navy : COLORS.mute, letterSpacing: ".02em", whiteSpace: "nowrap" }}>{s}</div>
          </div>
          {i < WORKFLOW_STAGES.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < stage ? COLORS.green : "#E4E8EC", margin: "0 2px 16px" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function Timeline({ items }) {
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", gap: 12, position: "relative" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: 22, height: 22, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                background: it.state === "done" ? COLORS.green : it.state === "active" ? COLORS.blue : "#E4E8EC",
                color: it.state === "pending" ? COLORS.mute : "#fff",
              }}
              className={it.state === "active" ? "cc-pulse" : ""}
            >
              {it.state === "done" ? <Check size={13} /> : it.state === "active" ? <Circle size={9} fill="#fff" /> : <Circle size={9} />}
            </div>
            {i < items.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 24, background: it.state === "done" ? COLORS.green : "#E4E8EC" }} />}
          </div>
          <div style={{ paddingBottom: 20 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: it.state === "pending" ? COLORS.mute : COLORS.text }}>{it.label}</div>
            {it.sub && <div style={{ fontSize: 12, color: COLORS.mute, marginTop: 2 }}>{it.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function BeforeAfterSlider({ beforeLabel, afterLabel }) {
  const [pos, setPos] = useState(50);
  const ref = useRef(null);
  const drag = (clientX) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    setPos(pct);
  };
  return (
    <div
      ref={ref}
      style={{ position: "relative", height: 240, borderRadius: 12, overflow: "hidden", cursor: "ew-resize", userSelect: "none" }}
      onMouseDown={(e) => { drag(e.clientX); const mv = (ev) => drag(ev.clientX); const up = () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); }; window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up); }}
      onTouchMove={(e) => drag(e.touches[0].clientX)}
    >
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${COLORS.greenLight}, #fff)`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
        <CheckCircle2 size={30} color={COLORS.green} strokeWidth={1.5} />
        <div style={{ fontWeight: 700, fontSize: 13, color: "#146240" }}>{afterLabel}</div>
        <Badge tone="green">AFTER</Badge>
      </div>
      <div style={{ position: "absolute", inset: 0, width: `${pos}%`, overflow: "hidden", background: `linear-gradient(135deg, ${COLORS.orangeLight}, #fff)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: ref.current ? ref.current.getBoundingClientRect().width : 400, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <AlertTriangle size={30} color={COLORS.orange} strokeWidth={1.5} />
          <div style={{ fontWeight: 700, fontSize: 13, color: "#9A5B12" }}>{beforeLabel}</div>
          <Badge tone="orange">BEFORE</Badge>
        </div>
      </div>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${pos}%`, width: 3, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,.1)", transform: "translateX(-1.5px)" }}>
        <div className="cc-slider-handle" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 32, height: 32, borderRadius: 99, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowLeftRight size={15} color={COLORS.navy} />
        </div>
      </div>
    </div>
  );
}

/* Simplified illustrative GIS map — NOT real geodata */
function CivicMap({ incidents, selectedId, onSelect, height = 340 }) {
  const toneFor = (inc) => {
    if (inc.status === "resolved" || inc.status === "closed") return COLORS.green;
    if (inc.priorityBand === "CRITICAL" || inc.status === "reopened") return COLORS.red;
    if (inc.priorityBand === "HIGH") return COLORS.orange;
    return "#E0A73A";
  };
  return (
    <div style={{ position: "relative", height, borderRadius: 12, overflow: "hidden", background: "#EAF0F5" }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <rect width="100" height="100" fill="#EAF0F5" />
        {[12, 30, 50, 70, 88].map((y) => <line key={"h" + y} x1="0" y1={y} x2="100" y2={y} stroke="#D5DEE7" strokeWidth="0.6" />)}
        {[15, 35, 55, 75, 92].map((x) => <line key={"v" + x} x1={x} y1="0" x2={x} y2="100" stroke="#D5DEE7" strokeWidth="0.6" />)}
        <path d="M0,45 Q50,20 100,50" stroke="#C4CFDA" strokeWidth="1.4" fill="none" />
        <path d="M20,0 Q40,50 30,100" stroke="#C4CFDA" strokeWidth="1.4" fill="none" />
        <circle cx="46" cy="40" r="9" fill="#D14343" opacity="0.08" />
        <circle cx="58" cy="55" r="7" fill="#DB8A2B" opacity="0.08" />
      </svg>
      {incidents.map((inc) => (
        <div
          key={inc.id}
          onClick={() => onSelect && onSelect(inc.id)}
          title={`${inc.id} · ${inc.title}`}
          style={{
            position: "absolute", left: `${inc.x}%`, top: `${inc.y}%`, transform: "translate(-50%,-100%)",
            cursor: onSelect ? "pointer" : "default", zIndex: selectedId === inc.id ? 5 : 2,
          }}
        >
          <div style={{
            width: selectedId === inc.id ? 20 : 14, height: selectedId === inc.id ? 20 : 14, borderRadius: "50% 50% 50% 0",
            background: toneFor(inc), transform: "rotate(-45deg)",
            boxShadow: selectedId === inc.id ? `0 0 0 5px ${toneFor(inc)}33` : "0 1px 3px rgba(0,0,0,.3)",
            border: "1.5px solid #fff",
          }} />
        </div>
      ))}
      <div style={{ position: "absolute", bottom: 10, left: 10, background: "rgba(255,255,255,.92)", borderRadius: 8, padding: "6px 10px", fontSize: 10.5, display: "flex", gap: 10 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: COLORS.red }} />Critical</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: COLORS.orange }} />High</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: "#E0A73A" }} />Medium</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: COLORS.green }} />Resolved</span>
      </div>
      <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(11,30,60,.85)", color: "#fff", fontSize: 10, padding: "4px 9px", borderRadius: 6 }}>Illustrative map · Prototype sample data</div>
    </div>
  );
}

/* ============================================================
   REUSABLE: Priority Breakdown Panel
   ============================================================ */
function PriorityPanel({ incident }) {
  const bd = incident.priorityBreakdown || { severity: 22, people: 14, vulnerability: 13, urgency: 10, recurrence: 9 };
  const rows = [
    { label: "Severity", weight: "30%", val: bd.severity, max: 30 },
    { label: "Affected People", weight: "20%", val: bd.people, max: 20 },
    { label: "Vulnerability", weight: "20%", val: bd.vulnerability, max: 20 },
    { label: "Urgency", weight: "15%", val: bd.urgency, max: 15 },
    { label: "Recurrence / Accessibility", weight: "15%", val: bd.recurrence, max: 15 },
  ];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: COLORS.navy }}>{incident.priority}<span style={{ fontSize: 15, color: COLORS.mute, fontWeight: 600 }}>/100</span></div>
        <PriorityBadge band={incident.priorityBand} />
      </div>
      <div style={{ fontSize: 12, color: COLORS.mute, marginBottom: 14 }}>Configurable prototype weighting — not a universally fixed formula.</div>
      {rows.map((r) => (
        <div key={r.label} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ fontWeight: 600 }}>{r.label} <span style={{ color: COLORS.mute, fontWeight: 500 }}>({r.weight})</span></span>
            <span className="cc-mono" style={{ color: COLORS.mute }}>{r.val}/{r.max}</span>
          </div>
          <div style={{ height: 7, borderRadius: 99, background: "#EEF1F4", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(r.val / r.max) * 100}%`, background: COLORS.blue, borderRadius: 99 }} />
          </div>
        </div>
      ))}
      <div style={{ background: COLORS.blueLight, borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#134A85", marginTop: 10, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Sparkles size={15} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>AI recommendation — human review required before final routing.</span>
      </div>
    </div>
  );
}

/* ============================================================
   ROOT APP
   ============================================================ */
export default function CivicConnectApp() {
  const [role, setRole] = useState(null); // null | citizen | officer | worker
  const [demoActive, setDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [juryView, setJuryView] = useState(false);
  const [incidents] = useState(seedIncidents());
  const [notifCount, setNotifCount] = useState(4);

  const demo = demoActive ? getDemoState(demoStep) : null;

  const startDemo = () => {
    setDemoActive(true);
    setDemoStep(0);
    setRole(DEMO_SEQUENCE[0].role);
  };
  const stepDemo = (dir) => {
    setDemoStep((s) => {
      const next = Math.max(0, Math.min(DEMO_SEQUENCE.length - 1, s + dir));
      setRole(DEMO_SEQUENCE[next].role);
      return next;
    });
  };
  const exitDemo = () => { setDemoActive(false); setDemoStep(0); };

  if (juryView) return <><GlobalStyle /><JuryView onClose={() => setJuryView(false)} /></>;

  if (!role) {
    return (
      <div className="cc-root">
        <GlobalStyle />
        <LoginScreen onSelectRole={setRole} onStartDemo={startDemo} onJury={() => setJuryView(true)} />
      </div>
    );
  }

  return (
    <div className="cc-root" style={{ minHeight: "100%" }}>
      <GlobalStyle />
      {role === "citizen" && (
        <CitizenApp
          incidents={incidents}
          onLogout={() => { setRole(null); exitDemo(); }}
          onJury={() => setJuryView(true)}
          demo={demo}
        />
      )}
      {role === "officer" && (
        <OfficerApp
          incidents={incidents}
          onLogout={() => { setRole(null); exitDemo(); }}
          onJury={() => setJuryView(true)}
          demo={demo}
        />
      )}
      {role === "worker" && (
        <WorkerApp
          incidents={incidents}
          onLogout={() => { setRole(null); exitDemo(); }}
          onJury={() => setJuryView(true)}
          demo={demo}
        />
      )}
      {demoActive && (
        <DemoControlBar
          step={demoStep}
          total={DEMO_SEQUENCE.length}
          data={demo}
          onPrev={() => stepDemo(-1)}
          onNext={() => stepDemo(1)}
          onExit={exitDemo}
        />
      )}
    </div>
  );
}

/* ============================================================
   DEMO CONTROL BAR
   ============================================================ */
function DemoControlBar({ step, total, data, onPrev, onNext, onExit }) {
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 200, background: COLORS.navy, color: "#fff", padding: "10px 16px", boxShadow: "0 -4px 16px rgba(0,0,0,.2)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span className="cc-pulse" style={{ width: 8, height: 8, borderRadius: 99, background: "#FF6B6B", flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#8FA5C6", flexShrink: 0 }}>SIH DEMO · STEP {step + 1}/{total}</span>
          <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{data.step.title}</span>
        </div>
        <div style={{ flex: "1 1 220px", minWidth: 180 }}>
          <div style={{ display: "flex", height: 5, borderRadius: 99, overflow: "hidden", background: "#1B3A63" }}>
            {WORKFLOW_STAGES.map((s, i) => <div key={s} style={{ flex: 1, background: i <= data.stage ? COLORS.blue : "transparent", marginRight: 1.5 }} />)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <Btn variant="ghost" small icon={ChevronLeft} onClick={onPrev} disabled={step === 0} style={{ color: "#B9C6DA" }}>Prev</Btn>
          <Btn variant="primary" small icon={ChevronRight} onClick={onNext} disabled={step === total - 1}>Next Step</Btn>
          <Btn variant="ghost" small icon={StopCircle} onClick={onExit} style={{ color: "#B9C6DA" }}>End Demo</Btn>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LOGIN SCREEN
   ============================================================ */
function LoginScreen({ onSelectRole, onStartDemo, onJury }) {
  const roles = [
    { id: "citizen", label: "Citizen", desc: "Report issues, track progress, verify repairs", icon: User, email: "citizen@civicconnect.demo" },
    { id: "officer", label: "Municipal Officer", desc: "Review AI queue, assign teams, monitor SLAs", icon: ShieldCheck, email: "officer@civicconnect.demo" },
    { id: "worker", label: "Field Worker", desc: "Accept tasks, upload repair proof", icon: Wrench, email: "worker@civicconnect.demo" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${COLORS.navy} 0%, ${COLORS.navy2} 55%, ${COLORS.gray} 55%)`, padding: "0 16px 60px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", paddingTop: 48 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", marginBottom: 26 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: COLORS.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: ".01em" }}>CIVIC CONNECT</div>
            <div style={{ fontSize: 10.5, color: "#8FA5C6", letterSpacing: ".04em" }}>SMART INDIA HACKATHON 2026 · PROTOTYPE</div>
          </div>
        </div>

        <div style={{ color: "#fff", marginBottom: 30 }}>
          <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.2, maxWidth: 640 }}>From Visible Civic Problems to Accountable Resolution</div>
          <div style={{ fontSize: 14.5, color: "#B9C6DA", marginTop: 10, maxWidth: 620 }}>AI-assisted public infrastructure reporting, verification &amp; accountability platform. Not just a complaint app — an accountability platform.</div>
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            <Btn variant="primary" icon={PlayCircle} onClick={onStartDemo}>START SIH DEMO</Btn>
            <Btn variant="outline" icon={Layers} onClick={onJury} style={{ background: "rgba(255,255,255,.08)", color: "#fff", borderColor: "rgba(255,255,255,.25)" }}>Jury Presentation Mode</Btn>
          </div>
        </div>

        <div className="cc-card cc-shadow" style={{ padding: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.mute, letterSpacing: ".04em", marginBottom: 14 }}>SELECT A DEMO ROLE TO CONTINUE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
            {roles.map((r) => (
              <div
                key={r.id}
                onClick={() => onSelectRole(r.id)}
                className="cc-card"
                style={{ padding: 18, cursor: "pointer", border: `1.5px solid ${COLORS.border}`, transition: "all .15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = COLORS.blue)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = COLORS.border)}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.blueLight, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <r.icon size={20} color={COLORS.blue} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{r.label}</div>
                <div style={{ fontSize: 12, color: COLORS.mute, marginBottom: 12, minHeight: 32 }}>{r.desc}</div>
                <div className="cc-mono" style={{ fontSize: 11, color: COLORS.blue, background: COLORS.blueLight, padding: "5px 8px", borderRadius: 6 }}>{r.email}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: COLORS.mute, marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Lock size={12} /> Demo authentication only — no real credentials required. Prototype sample data throughout.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CITIZEN APP
   ============================================================ */
function CitizenApp({ incidents, onLogout, onJury, demo }) {
  const [screen, setScreen] = useState("home");
  const [reportStep, setReportStep] = useState(1);
  const [reportData, setReportData] = useState({ category: null, photo: false, desc: "" });
  const [confirmedIssue, setConfirmedIssue] = useState(false);
  const mainIncident = incidents.find((i) => i.id === "CC-1042");

  useEffect(() => {
    if (!demo) return;
    const s = demo.step.screen;
    if (s === "home") setScreen("home");
    else if (s === "report2") { setScreen("report"); setReportStep(2); setReportData((d) => ({ ...d, category: "pothole" })); }
    else if (s === "report3") { setScreen("report"); setReportStep(3); }
    else if (s === "aiverify" || s === "aiverify-dup") setScreen("aiverify");
    else if (s === "cluster") setScreen("cluster");
    else if (s === "public") setScreen("public");
    else if (s === "finalverify") setScreen("finalverify");
    else if (s === "tracking") setScreen("tracking");
  }, [demo]);

  const nav = [
    { id: "home", label: "Home", icon: Home },
    { id: "report", label: "Report", icon: Camera },
    { id: "nearby", label: "Nearby", icon: MapIcon },
    { id: "myreports", label: "My Reports", icon: List },
    { id: "notif", label: "Alerts", icon: Bell },
  ];

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: COLORS.gray, position: "relative", paddingBottom: 74 }}>
      <TopBar title="Citizen" roleLabel="Citizen" onLogout={onLogout} onJury={onJury} />
      <div className="cc-fade-in" style={{ padding: 16 }}>
        {screen === "home" && (
          <CitizenHome incidents={incidents} onReport={() => { setScreen("report"); setReportStep(1); }} onOpenIncident={() => setScreen("tracking")} onNearby={() => setScreen("nearby")} onMyReports={() => setScreen("myreports")} />
        )}
        {screen === "report" && (
          <ReportFlow
            step={reportStep} setStep={setReportStep} data={reportData} setData={setReportData}
            onSubmit={() => setScreen("aiverify")}
          />
        )}
        {screen === "aiverify" && <AIVerifyScreen showDup={!demo || demo.showDuplicates} onViewIncident={() => setScreen("cluster")} onContinue={() => setScreen("public")} />}
        {screen === "cluster" && <ClusterScreen onContinue={() => setScreen("public")} />}
        {screen === "public" && (
          <PublicIncidentScreen
            incident={mainIncident}
            confirmed={confirmedIssue || (demo && demo.confirmed)}
            confirmCount={demo ? demo.confirmations : (confirmedIssue ? 24 : 23)}
            onConfirm={() => setConfirmedIssue(true)}
            onContinue={() => setScreen("tracking")}
          />
        )}
        {screen === "tracking" && <TrackingScreen incident={mainIncident} demo={demo} onFinalVerify={() => setScreen("finalverify")} />}
        {screen === "finalverify" && <FinalVerifyScreen onDone={() => setScreen("tracking")} />}
        {screen === "myreports" && <MyReportsScreen incidents={incidents} onOpen={() => setScreen("tracking")} />}
        {screen === "nearby" && <NearbyScreen incidents={incidents} onOpen={() => setScreen("tracking")} />}
        {screen === "notif" && <NotificationsScreen />}
      </div>
      <BottomTabs items={nav} active={screen === "aiverify" || screen === "cluster" || screen === "public" || screen === "finalverify" ? "home" : (screen === "tracking" ? "myreports" : screen)} onChange={(id) => { setScreen(id); if (id === "report") setReportStep(1); }} />
    </div>
  );
}

function TopBar({ roleLabel, onLogout, onJury }) {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 20, background: COLORS.navy, color: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: COLORS.blue, display: "flex", alignItems: "center", justifyContent: "center" }}><Building2 size={14} /></div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 13 }}>Civic Connect</div>
          <div style={{ fontSize: 9.5, color: "#8FA5C6" }}>{roleLabel} view</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={onJury} className="cc-btn cc-btn-ghost" style={{ color: "#B9C6DA", padding: 7 }} title="Jury Presentation Mode"><Layers size={16} /></button>
        <button onClick={onLogout} className="cc-btn cc-btn-ghost" style={{ color: "#B9C6DA", padding: 7 }} title="Switch role"><LogOut size={16} /></button>
      </div>
    </div>
  );
}

function BottomTabs({ items, active, onChange }) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: `1px solid ${COLORS.border}`, display: "flex", zIndex: 30 }}>
      {items.map((it) => (
        <div key={it.id} className={`cc-tab ${active === it.id ? "active" : ""}`} onClick={() => onChange(it.id)}>
          <it.icon size={19} />
          {it.label}
        </div>
      ))}
    </div>
  );
}

function StatPill({ label, value, tone = "blue" }) {
  const t = toneStyles[tone];
  return (
    <div className="cc-card" style={{ flex: 1, padding: "12px 10px", textAlign: "center" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: t.dot }}>{value}</div>
      <div style={{ fontSize: 10.5, color: COLORS.mute, fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function CitizenHome({ incidents, onReport, onOpenIncident, onNearby, onMyReports }) {
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Good morning, Citizen 👋</div>
        <div style={{ fontSize: 12.5, color: COLORS.mute, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}><MapPin size={13} /> Greater Noida</div>
      </div>

      <div onClick={onReport} className="cc-shadow" style={{ background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.navy})`, borderRadius: 16, padding: 20, color: "#fff", cursor: "pointer", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16.5 }}>Report a Civic Issue</div>
            <div style={{ fontSize: 12, color: "#CBDAF0", marginTop: 3 }}>Photo, GPS &amp; AI verification in under a minute</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 99, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><Camera size={20} /></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <div onClick={onNearby} className="cc-card" style={{ flex: 1, padding: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <MapIcon size={18} color={COLORS.blue} /> <span style={{ fontWeight: 700, fontSize: 12.5 }}>Nearby Issues</span>
        </div>
        <div onClick={onMyReports} className="cc-card" style={{ flex: 1, padding: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <ClipboardList size={18} color={COLORS.blue} /> <span style={{ fontWeight: 700, fontSize: 12.5 }}>My Reports</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <StatPill label="My Reports" value="6" tone="blue" />
        <StatPill label="Resolved" value="3" tone="green" />
        <StatPill label="In Progress" value="2" tone="orange" />
      </div>

      <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>Nearby civic incidents</div>
      <CivicMap incidents={incidents} selectedId="CC-1042" onSelect={onOpenIncident} height={220} />

      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginTop: 14, paddingBottom: 4 }} className="cc-scroll">
        {CATEGORIES.map((c) => (
          <div key={c.id} className="cc-card" style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0 }}>
            <span>{c.icon}</span><span style={{ fontSize: 11.5, fontWeight: 600 }}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NearbyScreen({ incidents, onOpen }) {
  return (
    <div>
      <ScreenHeader title="Nearby Issues" sub="Live civic incidents around your location" />
      <CivicMap incidents={incidents} onSelect={onOpen} height={220} />
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        {incidents.slice(0, 8).map((inc) => (
          <div key={inc.id} className="cc-card" style={{ padding: 12, cursor: "pointer" }} onClick={onOpen}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{CategoryIcon(inc.category)}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12.5 }}>{inc.title}</div>
                  <div style={{ fontSize: 11, color: COLORS.mute, marginTop: 1 }} className="cc-mono">{inc.id} · {inc.location}</div>
                </div>
              </div>
              <StatusBadge status={inc.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenHeader({ title, sub, onBack }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {onBack && <div onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 4, color: COLORS.blue, fontSize: 12.5, fontWeight: 700, cursor: "pointer", marginBottom: 8 }}><ChevronLeft size={15} /> Back</div>}
      <div style={{ fontSize: 18, fontWeight: 800 }}>{title}</div>
      {sub && <div style={{ fontSize: 12.5, color: COLORS.mute, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

/* ---------------- Report Issue Flow ---------------- */
function ReportFlow({ step, setStep, data, setData, onSubmit }) {
  const total = 5;
  return (
    <div>
      <ScreenHeader title="Report a Civic Issue" sub={`Step ${step} of ${total}`} />
      <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
        {[1, 2, 3, 4, 5].map((s) => <div key={s} style={{ flex: 1, height: 4, borderRadius: 99, background: s <= step ? COLORS.blue : "#E4E8EC" }} />)}
      </div>

      {step === 1 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Select issue category</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {CATEGORIES.map((c) => (
              <div key={c.id} onClick={() => setData({ ...data, category: c.id })}
                className="cc-card" style={{ padding: 16, textAlign: "center", cursor: "pointer", borderColor: data.category === c.id ? COLORS.blue : COLORS.border, borderWidth: data.category === c.id ? 2 : 1, background: data.category === c.id ? COLORS.blueLight : "#fff" }}>
                <div style={{ fontSize: 26 }}>{c.icon}</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 6 }}>{c.label}</div>
              </div>
            ))}
          </div>
          <Btn variant="primary" full style={{ marginTop: 18 }} icon={ArrowRight} disabled={!data.category} onClick={() => setStep(2)}>Continue</Btn>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Capture / upload evidence</div>
          {data.photo ? <PhotoPlaceholder label={`${CategoryLabel(data.category)} — photo captured`} tall /> : (
            <div onClick={() => setData({ ...data, photo: true })} className="cc-card" style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", borderStyle: "dashed" }}>
              <div style={{ width: 54, height: 54, borderRadius: 99, background: COLORS.blueLight, display: "flex", alignItems: "center", justifyContent: "center" }}><Camera size={24} color={COLORS.blue} /></div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Tap to capture photo</div>
              <div style={{ fontSize: 11, color: COLORS.mute }}>or upload from gallery · optional video</div>
            </div>
          )}
          {data.photo && <Btn variant="outline" small icon={Camera} style={{ marginTop: 10 }} onClick={() => setData({ ...data, photo: true })}>Retake photo</Btn>}
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <Btn variant="outline" icon={ChevronLeft} onClick={() => setStep(1)}>Back</Btn>
            <Btn variant="primary" full icon={ArrowRight} disabled={!data.photo} onClick={() => setStep(3)}>Continue</Btn>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Location</div>
          <CivicMap incidents={[{ id: "new", category: data.category, title: "New report", x: 46, y: 40, status: "reported", priorityBand: "HIGH" }]} height={180} />
          <div className="cc-card" style={{ padding: 12, marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <Row label="Latitude / Longitude" value="28.4744° N, 77.5040° E" mono />
            <Row label="Address" value="Knowledge Park, Greater Noida, UP" />
          </div>
          <Btn variant="outline" small icon={Navigation} style={{ marginTop: 10 }}>Use Current Location</Btn>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <Btn variant="outline" icon={ChevronLeft} onClick={() => setStep(2)}>Back</Btn>
            <Btn variant="primary" full icon={ArrowRight} onClick={() => setStep(4)}>Continue</Btn>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Describe the issue</div>
          <textarea
            className="cc-input" rows={5} placeholder="Describe the issue…"
            value={data.desc}
            onChange={(e) => setData({ ...data, desc: e.target.value })}
          />
          <div style={{ fontSize: 11, color: COLORS.mute, marginTop: 6, fontStyle: "italic" }}>e.g. "Large pothole near the college gate causing difficulty for two-wheelers."</div>
          <Btn variant="outline" small icon={Mic} style={{ marginTop: 10 }} onClick={() => setData({ ...data, desc: data.desc || "Large pothole near the college gate causing difficulty for two-wheelers." })}>Use voice input</Btn>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <Btn variant="outline" icon={ChevronLeft} onClick={() => setStep(3)}>Back</Btn>
            <Btn variant="primary" full icon={ArrowRight} disabled={!data.desc} onClick={() => setStep(5)}>Continue</Btn>
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Evidence summary</div>
          <div className="cc-card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <Row label="Category" value={CategoryLabel(data.category)} />
            <Row label="Evidence" value="Photo attached ✓" tone="green" />
            <Row label="GPS" value="Captured ✓" tone="green" />
            <Row label="Timestamp" value="Captured ✓" tone="green" />
            <Row label="Description" value="Available ✓" tone="green" />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <Btn variant="outline" icon={ChevronLeft} onClick={() => setStep(4)}>Back</Btn>
            <Btn variant="primary" full icon={Send} onClick={onSubmit}>Submit Report</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, tone, mono }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 12, color: COLORS.mute }}>{label}</span>
      <span className={mono ? "cc-mono" : ""} style={{ fontSize: 12.5, fontWeight: 700, color: tone === "green" ? COLORS.green : COLORS.text }}>{value}</span>
    </div>
  );
}

/* ---------------- AI Verification Screen ---------------- */
function AIVerifyScreen({ showDup, onViewIncident, onContinue }) {
  const [stage, setStage] = useState(0);
  const stages = ["Evidence received", "Location validated", "Image relevance checked", "Issue category analyzed", "Nearby reports searched", "Priority calculated"];
  useEffect(() => {
    setStage(0);
    const t = setInterval(() => setStage((s) => (s < stages.length ? s + 1 : s)), 380);
    return () => clearInterval(t);
  }, []);
  const done = stage >= stages.length;

  return (
    <div>
      <ScreenHeader title={done ? "Report Verified" : "Verifying your report…"} sub={done ? "AI classification complete" : "Please wait a moment"} />
      <div className="cc-card" style={{ padding: 16, marginBottom: 14 }}>
        {stages.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", opacity: i < stage ? 1 : i === stage ? 0.6 : 0.3 }}>
            {i < stage ? <CheckCircle2 size={16} color={COLORS.green} /> : i === stage ? <Circle size={16} className="cc-spin" color={COLORS.blue} /> : <Circle size={16} color="#C7D0DA" />}
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>{s}</span>
          </div>
        ))}
      </div>

      {done && (
        <div className="cc-fade-in">
          <div className="cc-card" style={{ padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.mute, marginBottom: 8, letterSpacing: ".03em" }}>AI CLASSIFICATION</div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>🕳️ Pothole / Road Damage</div>
            <ConfidenceBar label="Confidence" value={94} />
            <ConfidenceBar label="Evidence Relevance" value={98} />
          </div>

          {showDup && (
            <div className="cc-fade-in cc-card" style={{ padding: 16, marginBottom: 12, borderColor: COLORS.orange }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <AlertTriangle size={17} color={COLORS.orange} />
                <div style={{ fontWeight: 800, fontSize: 13.5 }}>Possible existing incident detected</div>
              </div>
              <div style={{ fontSize: 12.5, color: COLORS.mute, marginBottom: 10 }}>3 similar reports found nearby</div>
              <CivicMap incidents={DUPLICATE_LINKED.map((d, i) => ({ id: d.id, category: "pothole", x: 44 + i * 5, y: 38 + i * 4, status: "reported", priorityBand: "HIGH" }))} height={140} />
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                {DUPLICATE_LINKED.slice(1).map((d) => (
                  <div key={d.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span className="cc-mono" style={{ fontWeight: 700 }}>Report #{d.id}</span>
                    <span style={{ color: COLORS.mute }}>{d.distance} · {d.time}</span>
                  </div>
                ))}
              </div>
              <Btn variant="outline" full small icon={GitMerge} style={{ marginTop: 12 }} onClick={onViewIncident}>View Incident</Btn>
            </div>
          )}
          <Btn variant="primary" full icon={ArrowRight} onClick={onContinue}>Continue</Btn>
        </div>
      )}
    </div>
  );
}

function ConfidenceBar({ label, value }) {
  const tone = value >= 85 ? COLORS.green : value >= 60 ? COLORS.orange : COLORS.red;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 3 }}>
        <span style={{ color: COLORS.mute, fontWeight: 600 }}>{label}</span>
        <span style={{ fontWeight: 700, color: tone }}>{value}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "#EEF1F4" }}>
        <div style={{ height: "100%", width: `${value}%`, background: tone, borderRadius: 99 }} />
      </div>
    </div>
  );
}

/* ---------------- Duplicate Clustering Visual ---------------- */
function ClusterScreen({ onContinue }) {
  return (
    <div>
      <ScreenHeader title="Duplicate Clustering" sub="Multiple citizen reports, one accountable incident" />
      <div className="cc-card" style={{ padding: 18, marginBottom: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <ClusterBox n="12" label="Citizen Reports" tone="orange" />
          <ArrowDown />
          <ClusterBox n="1" label="Verified Incident" tone="blue" />
          <ArrowDown />
          <ClusterBox n="1" label="Municipal Work Order" tone="green" />
        </div>
      </div>
      <div className="cc-card" style={{ padding: 16, marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>INCIDENT #CC-1042</div>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Large pothole near Knowledge Park Gate</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12 }}>
          <span><b>12</b> reports linked</span>
          <span><b>23</b> confirmations</span>
          <span>Location: Knowledge Park</span>
          <PriorityBadge band="HIGH" />
        </div>
        <div style={{ background: COLORS.blueLight, borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#134A85", marginTop: 12, display: "flex", gap: 8 }}>
          <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>Similar reports were grouped using text similarity + location + time + category signals.</span>
        </div>
      </div>
      <Btn variant="primary" full icon={ArrowRight} onClick={onContinue}>View Public Incident Page</Btn>
    </div>
  );
}
function ArrowDown() { return <div style={{ color: COLORS.mute, fontSize: 18 }}>↓</div>; }
function ClusterBox({ n, label, tone }) {
  const t = toneStyles[tone];
  return (
    <div style={{ background: t.bg, color: t.fg, borderRadius: 12, padding: "14px 26px", textAlign: "center", minWidth: 160 }}>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{n}</div>
      <div style={{ fontSize: 11.5, fontWeight: 700 }}>{label}</div>
    </div>
  );
}

/* ---------------- Community Validation ---------------- */
function PublicIncidentScreen({ incident, confirmed, confirmCount, onConfirm, onContinue }) {
  return (
    <div>
      <ScreenHeader title="Public Incident Page" sub="Community validation" />
      <PhotoPlaceholder label="Pothole — Knowledge Park Gate" tall />
      <div className="cc-card" style={{ padding: 16, marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14.5 }}>{incident.title}</div>
            <div style={{ fontSize: 12, color: COLORS.mute, marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {incident.location}</div>
          </div>
          <PriorityBadge band={incident.priorityBand} />
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 12 }}>
          <span>🕳️ Category: Pothole</span>
          <span>Reports: 12</span>
        </div>
        <div style={{ marginTop: 6, fontSize: 12 }}>
          <Users size={13} style={{ display: "inline", marginRight: 4, verticalAlign: -2 }} /><b>{confirmCount}</b> citizens confirmed this issue.
        </div>

        <div style={{ marginTop: 16, fontWeight: 700, fontSize: 13 }}>Is this issue still present?</div>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Btn variant={confirmed ? "green" : "outline"} icon={ThumbsUp} onClick={onConfirm} style={{ flex: 1 }}>{confirmed ? "Confirmed ✓" : "Yes, Still Present"}</Btn>
          <Btn variant="outline" icon={ThumbsDown} style={{ flex: 1 }}>No, Resolved</Btn>
        </div>

        <div style={{ marginTop: 14, fontWeight: 700, fontSize: 13 }}>Confirm severity</div>
        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
          {["Low", "Medium", "High", "Critical"].map((s) => (
            <span key={s} className="cc-badge" style={{ background: s === "High" ? COLORS.orangeLight : "#EEF1F4", color: s === "High" ? "#9A5B12" : COLORS.mute, cursor: "pointer" }}>{s}</span>
          ))}
        </div>
        <Btn variant="ghost" small icon={Flag} style={{ marginTop: 12, color: COLORS.mute }}>Report disagreement</Btn>
      </div>
      <Btn variant="primary" full icon={ArrowRight} style={{ marginTop: 14 }} onClick={onContinue}>Track This Incident</Btn>
    </div>
  );
}

/* ---------------- Citizen Tracking ---------------- */
function TrackingScreen({ incident, demo, onFinalVerify }) {
  const stage = demo ? demo.stage : STATUS_META[incident.status].stage;
  const status = demo ? demo.status : incident.status;
  const items = [
    { label: "Reported", state: "done" },
    { label: "AI Verified", state: stage >= 1 ? "done" : "pending" },
    { label: "Community Validated", state: stage >= 2 ? "done" : "pending" },
    { label: "Assigned to Roads Department", state: stage >= 3 ? "done" : "pending" },
    { label: "Repair In Progress", state: stage === 4 ? "active" : stage > 4 ? "done" : "pending" },
    { label: "Proof Uploaded", state: demo ? (demo.proofUploaded ? "done" : "pending") : "pending" },
    { label: "Citizen Verification", state: demo ? (demo.citizenVerified ? "done" : "pending") : "pending" },
    { label: "Closed", state: demo ? (demo.closed ? "done" : "pending") : (incident.status === "closed" ? "done" : "pending") },
  ];
  const showVerifyCTA = demo && demo.officerApproved && !demo.citizenVerified;

  return (
    <div>
      <ScreenHeader title={`Incident ${incident.id}`} sub={incident.title} />
      <div className="cc-card" style={{ padding: 14, marginBottom: 14 }}>
        <StatusBadge status={status} />
      </div>
      {showVerifyCTA && (
        <div className="cc-card cc-fade-in" style={{ padding: 14, marginBottom: 14, borderColor: COLORS.blue, background: COLORS.blueLight }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Repair completed — please verify</div>
          <Btn variant="primary" full small onClick={onFinalVerify}>Verify Repair Now</Btn>
        </div>
      )}
      <div className="cc-card" style={{ padding: 16, marginBottom: 14 }}>
        <Timeline items={items} />
      </div>
      <div className="cc-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <Row label="Department" value={incident.department || "Road Maintenance"} />
        <Row label="Assigned Worker" value={incident.assignedWorker || "Amit Kumar"} />
        <Row label="Deadline" value={incident.deadline || "18 Aug 2026, 6:00 PM"} />
        <Row label="Priority" value={incident.priorityBand} />
        <Row label="Community confirmations" value={demo ? demo.confirmations : incident.communityConfirmations} />
      </div>
    </div>
  );
}

function FinalVerifyScreen({ onDone }) {
  const [answer, setAnswer] = useState(null);
  return (
    <div>
      <ScreenHeader title="Citizen Final Verification" sub="Is the issue actually resolved?" />
      <BeforeAfterSlider beforeLabel="Pothole (before repair)" afterLabel="Road surface (repaired)" />
      {!answer ? (
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <Btn variant="green" icon={CheckCircle2} style={{ flex: 1 }} onClick={() => setAnswer("resolved")}>Issue Resolved</Btn>
          <Btn variant="red" icon={X} style={{ flex: 1 }} onClick={() => setAnswer("notresolved")}>Still Not Resolved</Btn>
        </div>
      ) : answer === "resolved" ? (
        <div className="cc-fade-in cc-card" style={{ padding: 18, marginTop: 16, textAlign: "center" }}>
          <CheckCircle2 size={34} color={COLORS.green} style={{ marginBottom: 8 }} />
          <div style={{ fontWeight: 800, fontSize: 14.5 }}>Thank you for helping improve your city.</div>
          <Btn variant="primary" full style={{ marginTop: 14 }} onClick={onDone}>Back to Tracking</Btn>
        </div>
      ) : (
        <div className="cc-fade-in cc-card" style={{ padding: 18, marginTop: 16 }}>
          <Badge tone="red">REOPENED</Badge>
          <div style={{ fontWeight: 700, fontSize: 13, marginTop: 10 }}>Reason: "Repair is incomplete."</div>
          <div style={{ fontSize: 12, color: COLORS.mute, marginTop: 6 }}>This incident has been sent back to the department for re-inspection. You'll be notified when it's addressed.</div>
          <Btn variant="primary" full style={{ marginTop: 14 }} onClick={onDone}>Back to Tracking</Btn>
        </div>
      )}
    </div>
  );
}

function MyReportsScreen({ incidents, onOpen }) {
  return (
    <div>
      <ScreenHeader title="My Reports" sub="6 reports · 3 resolved" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {incidents.slice(0, 6).map((inc) => (
          <div key={inc.id} className="cc-card" style={{ padding: 12, cursor: "pointer" }} onClick={onOpen}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{CategoryIcon(inc.category)}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12.5 }}>{inc.title}</div>
                  <div className="cc-mono" style={{ fontSize: 11, color: COLORS.mute }}>{inc.id} · {inc.reportedAt || "18 Aug 2026"}</div>
                </div>
              </div>
              <StatusBadge status={inc.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsScreen() {
  const items = [
    { t: "Your report CC-1042 has been verified.", when: "2h ago", icon: CheckCircle2, tone: "blue" },
    { t: "Your issue has been assigned to Road Maintenance.", when: "2h ago", icon: Truck, tone: "orange" },
    { t: "Repair proof has been uploaded.", when: "45m ago", icon: Upload, tone: "blue" },
    { t: "Please verify whether the issue is resolved.", when: "20m ago", icon: Bell, tone: "green" },
    { t: "Incident CC-1055 was reopened.", when: "1d ago", icon: RotateCcw, tone: "red" },
  ];
  return (
    <div>
      <ScreenHeader title="Notifications" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((n, i) => (
          <div key={i} className="cc-card" style={{ padding: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: toneStyles[n.tone].bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <n.icon size={15} color={toneStyles[n.tone].dot} />
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{n.t}</div>
              <div style={{ fontSize: 10.5, color: COLORS.mute, marginTop: 2 }}>{n.when}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   OFFICER APP
   ============================================================ */
function OfficerApp({ incidents, onLogout, onJury, demo }) {
  const [screen, setScreen] = useState("dashboard");
  const [selectedId, setSelectedId] = useState("CC-1042");
  const [overrideOpen, setOverrideOpen] = useState(false);

  useEffect(() => {
    if (!demo) return;
    const s = demo.step.screen;
    if (s.startsWith("detail")) { setScreen("detail"); setSelectedId("CC-1042"); }
  }, [demo]);

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "queue", label: "Live Incidents", icon: List },
    { id: "map", label: "Map", icon: MapIcon },
    { id: "aiqueue", label: "AI Queue", icon: Sparkles },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "departments", label: "Departments", icon: Building2 },
    { id: "audit", label: "Audit Logs", icon: Database },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const selected = incidents.find((i) => i.id === selectedId) || incidents[0];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ width: 220, background: COLORS.navy, color: "#fff", flexShrink: 0, padding: "16px 12px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px 18px" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: COLORS.blue, display: "flex", alignItems: "center", justifyContent: "center" }}><Building2 size={15} /></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13 }}>Civic Connect</div>
            <div style={{ fontSize: 9.5, color: "#8FA5C6" }}>Officer Console</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {nav.map((n) => (
            <div key={n.id} className={`cc-navlink ${screen === n.id ? "active" : ""}`} onClick={() => setScreen(n.id)}>
              <n.icon size={16} />{n.label}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #1B3A63", paddingTop: 10, display: "flex", flexDirection: "column", gap: 2 }}>
          <div className="cc-navlink" onClick={onJury}><Layers size={16} />Jury View</div>
          <div className="cc-navlink" onClick={onLogout}><LogOut size={16} />Switch Role</div>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#fff", borderBottom: `1px solid ${COLORS.border}`, padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{navTitle(screen)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Bell size={17} color={COLORS.mute} />
            <div style={{ width: 30, height: 30, borderRadius: 99, background: COLORS.blueLight, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: COLORS.blue }}>PS</div>
            <div style={{ fontSize: 12 }}>
              <div style={{ fontWeight: 700 }}>Priya Sharma</div>
              <div style={{ color: COLORS.mute, fontSize: 10.5 }}>Municipal Officer</div>
            </div>
          </div>
        </div>

        <div className="cc-fade-in" style={{ padding: 24, maxWidth: 1200 }}>
          {screen === "dashboard" && <OfficerDashboard incidents={incidents} onOpen={(id) => { setSelectedId(id); setScreen("detail"); }} />}
          {screen === "queue" && <IncidentQueue incidents={incidents} onOpen={(id) => { setSelectedId(id); setScreen("detail"); }} />}
          {screen === "aiqueue" && <IncidentQueue incidents={incidents.filter((i) => ["reported", "verified", "validated", "pending"].includes(i.status))} onOpen={(id) => { setSelectedId(id); setScreen("detail"); }} title="AI Review Queue" />}
          {screen === "map" && <MapScreen incidents={incidents} onOpen={(id) => { setSelectedId(id); setScreen("detail"); }} />}
          {screen === "analytics" && <AnalyticsScreen incidents={incidents} />}
          {screen === "departments" && <DepartmentsScreen incidents={incidents} />}
          {screen === "audit" && <AuditLogScreen limit={demo ? demo.auditCount : undefined} />}
          {screen === "settings" && <SettingsScreen />}
          {screen === "detail" && (
            <IncidentDetail
              incident={selected} demo={demo}
              overrideOpen={overrideOpen} setOverrideOpen={setOverrideOpen}
              onBack={() => setScreen("queue")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function navTitle(s) {
  return {
    dashboard: "Municipal Operations Dashboard", queue: "Live Incidents", map: "GIS Map",
    aiqueue: "AI Review Queue", analytics: "Analytics", departments: "Departments",
    audit: "Audit Logs", settings: "Settings & Security", detail: "Incident Detail",
  }[s] || "Civic Connect";
}

function KPICard({ label, value, tone = "blue", icon: Icon }) {
  const t = toneStyles[tone];
  return (
    <div className="cc-card cc-shadow" style={{ padding: 16, flex: "1 1 150px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.navy }}>{value}</div>
          <div style={{ fontSize: 11.5, color: COLORS.mute, fontWeight: 600, marginTop: 2 }}>{label}</div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={16} color={t.dot} /></div>
      </div>
    </div>
  );
}

function OfficerDashboard({ incidents, onOpen }) {
  const kpis = [
    { label: "Total Incidents", value: 128, tone: "blue", icon: ClipboardList },
    { label: "High Priority", value: 17, tone: "orange", icon: AlertTriangle },
    { label: "Pending Assignment", value: 9, tone: "orange", icon: Clock },
    { label: "In Progress", value: 34, tone: "blue", icon: Activity },
    { label: "Resolved", value: 68, tone: "green", icon: CheckCircle2 },
    { label: "SLA At Risk", value: 7, tone: "red", icon: Radio },
  ];
  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        {kpis.map((k) => <KPICard key={k.label} {...k} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
        <div className="cc-card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Live incident map</div>
          <CivicMap incidents={incidents} onSelect={onOpen} height={300} />
        </div>
        <div className="cc-card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Highest priority right now</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...incidents].sort((a, b) => b.priority - a.priority).slice(0, 6).map((inc) => (
              <div key={inc.id} onClick={() => onOpen(inc.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: 8, cursor: "pointer", border: `1px solid ${COLORS.border}` }}>
                <div>
                  <div className="cc-mono" style={{ fontSize: 11, color: COLORS.mute }}>{inc.id}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, maxWidth: 190, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inc.title}</div>
                </div>
                <PriorityBadge band={inc.priorityBand} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function IncidentQueue({ incidents, onOpen, title }) {
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const filtered = incidents.filter((i) => (filterCat === "all" || i.category === filterCat) && (filterStatus === "all" || i.status === filterStatus));
  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.mute, fontWeight: 600 }}><Filter size={14} /> Filters:</div>
        <select className="cc-input" style={{ width: "auto" }} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select className="cc-input" style={{ width: "auto" }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {Object.keys(STATUS_META).map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
        </select>
        <div style={{ marginLeft: "auto", fontSize: 12, color: COLORS.mute }}>{filtered.length} incidents</div>
      </div>
      <div className="cc-card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: COLORS.gray, textAlign: "left" }}>
              {["Incident ID", "Category", "Location", "Priority", "AI Confidence", "Department", "SLA", "Status"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", fontWeight: 700, color: COLORS.mute, fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((inc) => (
              <tr key={inc.id} onClick={() => onOpen(inc.id)} style={{ borderTop: `1px solid ${COLORS.border}`, cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.gray)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <td style={{ padding: "10px 14px" }} className="cc-mono"><b>{inc.id}</b></td>
                <td style={{ padding: "10px 14px" }}>{CategoryIcon(inc.category)} {CategoryLabel(inc.category)}</td>
                <td style={{ padding: "10px 14px" }}>{inc.location}</td>
                <td style={{ padding: "10px 14px" }}><PriorityBadge band={inc.priorityBand} /></td>
                <td style={{ padding: "10px 14px" }}>{inc.aiConfidence}%</td>
                <td style={{ padding: "10px 14px" }}>{inc.department || "—"}</td>
                <td style={{ padding: "10px 14px" }}>{inc.sla || "—"}</td>
                <td style={{ padding: "10px 14px" }}><StatusBadge status={inc.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MapScreen({ incidents, onOpen }) {
  return (
    <div>
      <div className="cc-card" style={{ padding: 16 }}>
        <CivicMap incidents={incidents} onSelect={onOpen} height={480} />
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
        <div className="cc-card" style={{ flex: 1, padding: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 6 }}>🔥 Road Damage Hotspot</div>
          <div style={{ fontSize: 11.5, color: COLORS.mute }}>Ward 12 — 17 recurring pothole incidents in the last 90 days.</div>
        </div>
        <div className="cc-card" style={{ flex: 1, padding: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 6 }}>🔥 Drainage Hotspot</div>
          <div style={{ fontSize: 11.5, color: COLORS.mute }}>Ward 8 — 11 recurring drainage incidents in the last 90 days.</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Incident Detail (AI Decision + Priority + Assign + Verify) ---------------- */
function IncidentDetail({ incident, demo, overrideOpen, setOverrideOpen, onBack }) {
  const [tab, setTab] = useState("ai");
  const [accepted, setAccepted] = useState(false);
  const [assigned, setAssigned] = useState(demo ? demo.assigned : incident.status === "assigned" || incident.status === "in_progress");
  const [approved, setApproved] = useState(demo ? demo.officerApproved : false);
  const isMain = incident.id === "CC-1042";
  const stage = demo && isMain ? demo.stage : STATUS_META[incident.status].stage;

  const tabs = [
    { id: "ai", label: "AI Decision" },
    { id: "priority", label: "Priority" },
    { id: "assign", label: "Assignment" },
    { id: "verify", label: "Proof Review" },
  ];

  return (
    <div>
      <div onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 4, color: COLORS.blue, fontSize: 12.5, fontWeight: 700, cursor: "pointer", marginBottom: 12 }}><ChevronLeft size={15} /> Back to queue</div>

      <div className="cc-card" style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div className="cc-mono" style={{ fontSize: 12, color: COLORS.mute }}>{incident.id}</div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>{incident.title}</div>
            <div style={{ fontSize: 12, color: COLORS.mute, marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {incident.location} · {incident.ward}</div>
          </div>
          <StatusBadge status={demo && isMain ? demo.status : incident.status} />
        </div>
        <div style={{ marginTop: 16 }}><ProgressStepper stage={stage} /></div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, borderBottom: `1px solid ${COLORS.border}` }}>
        {tabs.map((t) => (
          <div key={t.id} onClick={() => setTab(t.id)} style={{ padding: "8px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", color: tab === t.id ? COLORS.blue : COLORS.mute, borderBottom: tab === t.id ? `2px solid ${COLORS.blue}` : "2px solid transparent" }}>{t.label}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <div>
          {tab === "ai" && (
            <div className="cc-card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Sparkles size={17} color={COLORS.blue} />
                <div style={{ fontWeight: 800, fontSize: 14 }}>AI Recommendation</div>
                <span className="cc-mono" style={{ fontSize: 10, color: COLORS.mute, marginLeft: "auto" }}>civic-ai v1.0</span>
              </div>
              {incident.lowConfidence ? (
                <div style={{ background: COLORS.redLight, borderRadius: 10, padding: 14, marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#A62F2F", marginBottom: 4 }}>Low confidence — human review required</div>
                  <div style={{ fontSize: 12, color: "#A62F2F" }}>AI Confidence: {incident.aiConfidence}%. This incident will not be auto-routed. Officer must manually select category, department, and priority.</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <MiniStat label="Category" value={CategoryLabel(incident.category)} />
                  <MiniStat label="Confidence" value={`${incident.aiConfidence}%`} />
                  <MiniStat label="Duplicate Probability" value="91%" />
                  <MiniStat label="Priority" value={`${incident.priority}/100`} />
                  <MiniStat label="Suggested Department" value={incident.department || "Road Maintenance"} />
                  <MiniStat label="Suggested Ward" value={incident.ward} />
                </div>
              )}
              {incident.reasonCodes && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: COLORS.mute, marginBottom: 6 }}>REASON CODES</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {incident.reasonCodes.map((r) => <div key={r} style={{ display: "flex", gap: 6, fontSize: 12.5 }}><CheckCircle2 size={14} color={COLORS.green} /> {r}</div>)}
                  </div>
                </div>
              )}
              <div style={{ background: COLORS.gray, borderRadius: 10, padding: 12, fontSize: 11.5, color: COLORS.mute, marginBottom: 14 }}>
                Routing: Category + ward/geofence matched responsible department → <b style={{ color: COLORS.text }}>{incident.ward_dept_note || `${incident.ward} → ${incident.department}`}</b>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn variant="green" icon={Check} disabled={accepted} onClick={() => setAccepted(true)}>{accepted ? "Recommendation Accepted" : "Accept AI Recommendation"}</Btn>
                <Btn variant="outline" icon={ArrowLeftRight} onClick={() => setOverrideOpen(true)}>Override</Btn>
              </div>
              {overrideOpen && <OverrideForm onCancel={() => setOverrideOpen(false)} onSave={() => setOverrideOpen(false)} />}
            </div>
          )}

          {tab === "priority" && (
            <div className="cc-card" style={{ padding: 18 }}>
              <PriorityPanel incident={incident} />
            </div>
          )}

          {tab === "assign" && (
            <AssignPanel incident={incident} assigned={assigned || (demo && isMain && demo.assigned)} onAssign={() => setAssigned(true)} />
          )}

          {tab === "verify" && (
            <ProofReviewPanel approved={approved || (demo && isMain && demo.officerApproved)} onApprove={() => setApproved(true)} />
          )}
        </div>

        <div className="cc-card" style={{ padding: 16, alignSelf: "start" }}>
          <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 10 }}>Incident location</div>
          <CivicMap incidents={[incident]} height={180} />
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <Row label="Community confirmations" value={demo && isMain ? demo.confirmations : incident.communityConfirmations} />
            <Row label="Linked reports" value={incident.linkedReports || 1} />
            <Row label="Reported" value={incident.reportedAt || "—"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ background: COLORS.gray, borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontSize: 10.5, color: COLORS.mute, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function OverrideForm({ onCancel, onSave }) {
  return (
    <div className="cc-fade-in" style={{ marginTop: 14, borderTop: `1px solid ${COLORS.border}`, paddingTop: 14 }}>
      <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 10 }}>Override AI Recommendation</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <select className="cc-input"><option>New Category</option>{CATEGORIES.map((c) => <option key={c.id}>{c.label}</option>)}</select>
        <select className="cc-input"><option>New Priority Band</option><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select>
        <select className="cc-input"><option>New Department</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select>
        <input className="cc-input" placeholder="Reason for override (required)" />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="outline" small onClick={onCancel}>Cancel</Btn>
        <Btn variant="navy" small icon={Database} onClick={onSave}>Save &amp; Log to Audit Trail</Btn>
      </div>
    </div>
  );
}

function AssignPanel({ incident, assigned, onAssign }) {
  return (
    <div className="cc-card" style={{ padding: 18 }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Department Routing &amp; Assignment</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, marginBottom: 14, flexWrap: "wrap" }}>
        <Badge tone="blue">{CategoryLabel(incident.category)}</Badge><ChevronRight size={14} color={COLORS.mute} />
        <Badge tone="gray">{incident.ward}</Badge><ChevronRight size={14} color={COLORS.mute} />
        <Badge tone="green">{incident.department || "Road Maintenance"}</Badge><ChevronRight size={14} color={COLORS.mute} />
        <Badge tone="green">Team A</Badge>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div><div style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.mute, marginBottom: 4 }}>Assigned Worker</div><select className="cc-input" defaultValue={incident.assignedWorker || "Amit Kumar"}><option>Amit Kumar</option><option>Ravi Singh</option><option>Suresh Yadav</option><option>Manoj Tiwari</option></select></div>
        <div><div style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.mute, marginBottom: 4 }}>Deadline</div><input className="cc-input" defaultValue={incident.deadline || "18 Aug 2026, 6:00 PM"} /></div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.mute, marginBottom: 4 }}>Instructions</div>
        <textarea className="cc-input" rows={2} defaultValue="Priority repair — confirm barricading before excavation." />
      </div>
      <Btn variant={assigned ? "green" : "primary"} icon={assigned ? CheckCircle2 : Send} onClick={onAssign} disabled={assigned}>{assigned ? "Assigned & Notification Sent" : "Assign Worker & Notify"}</Btn>
      {assigned && <div style={{ marginTop: 10, fontSize: 12, color: COLORS.mute }}>SLA: {incident.sla || "6h remaining"}</div>}
    </div>
  );
}

function ProofReviewPanel({ approved, onApprove }) {
  const [reopened, setReopened] = useState(false);
  return (
    <div className="cc-card" style={{ padding: 18 }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Completion Proof Review</div>
      <BeforeAfterSlider beforeLabel="Pothole (before repair)" afterLabel="Road surface (repaired)" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "14px 0" }}>
        <ChecklistRow label="GPS match" ok />
        <ChecklistRow label="Timestamp" ok />
        <ChecklistRow label="Image quality" ok />
        <ChecklistRow label="Location match" ok />
      </div>
      {!reopened ? (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Btn variant={approved ? "green" : "primary"} icon={CheckCircle2} onClick={onApprove} disabled={approved}>{approved ? "Approved & Closed" : "Approve & Close"}</Btn>
          <Btn variant="outline" icon={RotateCcw}>Request Repair</Btn>
          <Btn variant="red" icon={X} onClick={() => setReopened(true)}>Reopen</Btn>
        </div>
      ) : (
        <div className="cc-fade-in" style={{ background: COLORS.redLight, borderRadius: 10, padding: 12 }}>
          <Badge tone="red">REOPENED</Badge>
          <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 6 }}>Reason: "Pothole still visible in the repaired area."</div>
        </div>
      )}
    </div>
  );
}
function ChecklistRow({ label, ok }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, background: COLORS.greenLight, borderRadius: 8, padding: "6px 10px" }}><CheckCircle2 size={14} color={COLORS.green} /> {label}</div>;
}

/* ---------------- Analytics ---------------- */
function AnalyticsScreen({ incidents }) {
  const byCategory = CATEGORIES.map((c) => ({ name: c.label.split(" / ")[0], value: incidents.filter((i) => i.category === c.id).length || Math.floor(Math.random() * 4) + 4 }));
  const byWard = [...new Set(incidents.map((i) => i.ward))].map((w) => ({ name: w, value: incidents.filter((i) => i.ward === w).length }));
  const pieColors = [COLORS.blue, COLORS.orange, COLORS.green, COLORS.red, "#8E63C9", "#3AA6A0", COLORS.navySoft];
  const slaTrend = [{ m: "Wk1", v: 78 }, { m: "Wk2", v: 81 }, { m: "Wk3", v: 76 }, { m: "Wk4", v: 84 }, { m: "Wk5", v: 88 }];

  const metrics = [
    { label: "Median Triage Time", value: "38 min" }, { label: "Correct Routing Rate", value: "92%" },
    { label: "Duplicate Consolidation", value: "31%" }, { label: "SLA Compliance", value: "84%" },
    { label: "Resolution Cycle Time", value: "2.1 days" }, { label: "Citizen Satisfaction", value: "4.3/5" },
    { label: "Hotspot Recurrence", value: "17 sites" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Badge tone="gray">Prototype Sample Data</Badge>
        <span style={{ fontSize: 11.5, color: COLORS.mute }}>Figures are illustrative — not audited production metrics.</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 20 }}>
        {metrics.map((m) => (
          <div key={m.label} className="cc-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.navy }}>{m.value}</div>
            <div style={{ fontSize: 10.5, color: COLORS.mute, fontWeight: 600, marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="cc-card" style={{ padding: 16, height: 300 }}>
          <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 10 }}>Incidents by Category</div>
          <ResponsiveContainer width="100%" height="88%">
            <BarChart data={byCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F4" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="cc-card" style={{ padding: 16, height: 300 }}>
          <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 10 }}>Incidents by Ward</div>
          <ResponsiveContainer width="100%" height="88%">
            <PieChart>
              <Pie data={byWard} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={{ fontSize: 10 }}>
                {byWard.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="cc-card" style={{ padding: 16, height: 280 }}>
          <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 10 }}>SLA Compliance Trend</div>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={slaTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F4" />
              <XAxis dataKey="m" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} domain={[50, 100]} />
              <Tooltip /><Line type="monotone" dataKey="v" stroke={COLORS.green} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="cc-card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 10 }}>Recurring Hotspots</div>
          {[{ w: "Ward 12", c: "Pothole", n: 17 }, { w: "Ward 8", c: "Drainage", n: 11 }, { w: "Ward 5", c: "Streetlights", n: 9 }].map((h) => (
            <div key={h.w} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <div><div style={{ fontWeight: 700, fontSize: 12.5 }}>{h.w}</div><div style={{ fontSize: 11, color: COLORS.mute }}>{h.c} recurrence</div></div>
              <Badge tone="orange">{h.n} incidents</Badge>
            </div>
          ))}
          <div style={{ background: COLORS.blueLight, borderRadius: 10, padding: 10, fontSize: 11.5, color: "#134A85", marginTop: 10 }}>Potential infrastructure planning signal. Predictive maintenance is a <b>Future Module</b>, not yet implemented.</div>
        </div>
      </div>
    </div>
  );
}

function DepartmentsScreen({ incidents }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
      {DEPARTMENTS.map((d) => {
        const load = incidents.filter((i) => i.department === d);
        return (
          <div key={d} className="cc-card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>{d}</div>
            <div style={{ fontSize: 11.5, color: COLORS.mute, marginBottom: 10 }}>{load.length} active incidents</div>
            <div style={{ display: "flex", gap: 6 }}>
              <Badge tone="orange">{load.filter((i) => i.status !== "resolved" && i.status !== "closed").length} open</Badge>
              <Badge tone="green">{load.filter((i) => i.status === "resolved" || i.status === "closed").length} resolved</Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AuditLogScreen({ limit }) {
  const entries = limit ? BASE_AUDIT.slice(0, limit) : BASE_AUDIT;
  return (
    <div className="cc-card" style={{ padding: 0, overflow: "hidden" }}>
      {entries.map((a, i) => (
        <div key={i} style={{ padding: "12px 16px", borderTop: i ? `1px solid ${COLORS.border}` : "none", display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div className="cc-mono" style={{ fontSize: 11, color: COLORS.mute, width: 130, flexShrink: 0 }}>{a.time}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>{a.action} <span style={{ color: COLORS.mute, fontWeight: 500 }}>· {a.incident}</span></div>
            <div style={{ fontSize: 11.5, color: COLORS.mute, marginTop: 1 }}>{a.actor} — {a.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsScreen() {
  const items = [
    { label: "Role-Based Access Control", icon: ShieldCheck }, { label: "Secure Authentication", icon: Lock },
    { label: "Rate Limiting", icon: Activity }, { label: "Input Validation", icon: CheckCircle2 },
    { label: "Protected Media Storage", icon: Database }, { label: "Audit Logging", icon: ClipboardList },
    { label: "PII Separation", icon: Users },
  ];
  return (
    <div>
      <div className="cc-card" style={{ padding: 16, marginBottom: 16, background: COLORS.blueLight, borderColor: "transparent" }}>
        <div style={{ fontWeight: 700, fontSize: 12.5, color: "#134A85" }}>Only operationally necessary information is collected. Citizen identity and exact home location are never exposed publicly.</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
        {items.map((it) => (
          <div key={it.label} className="cc-card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: COLORS.greenLight, display: "flex", alignItems: "center", justifyContent: "center" }}><it.icon size={16} color={COLORS.green} /></div>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>{it.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   FIELD WORKER APP
   ============================================================ */
function WorkerApp({ incidents, onLogout, onJury, demo }) {
  const [screen, setScreen] = useState("tasks");
  const [taskState, setTaskState] = useState("assigned"); // assigned -> accepted -> in_progress -> proof -> completed

  useEffect(() => {
    if (!demo) return;
    const s = demo.step.screen;
    if (s === "task") { setScreen("task"); setTaskState(demo.workerStarted ? "in_progress" : "accepted"); }
    else if (s === "proof") { setScreen("task"); setTaskState(demo.proofUploaded ? "completed" : "proof"); }
  }, [demo]);

  const task = incidents.find((i) => i.id === "CC-1042");
  const nav = [
    { id: "tasks", label: "Assigned", icon: ClipboardList },
    { id: "task", label: "Active Task", icon: Wrench },
    { id: "done", label: "Completed", icon: CheckCircle2 },
  ];

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: COLORS.gray, paddingBottom: 74 }}>
      <TopBar roleLabel="Field Worker" onLogout={onLogout} onJury={onJury} />
      <div className="cc-fade-in" style={{ padding: 16 }}>
        {screen === "tasks" && <TaskListScreen onOpen={() => setScreen("task")} />}
        {screen === "task" && <TaskDetailScreen incident={task} state={taskState} setState={setTaskState} />}
        {screen === "done" && <CompletedScreen />}
      </div>
      <BottomTabs items={nav} active={screen} onChange={setScreen} />
    </div>
  );
}

function TaskListScreen({ onOpen }) {
  const tasks = [
    { id: "CC-1042", title: "Pothole Repair", loc: "Knowledge Park Gate", pr: "HIGH", dl: "Today, 6:00 PM" },
    { id: "CC-1053", title: "Open Drain Cover", loc: "Beta 2 Crossing", pr: "MEDIUM", dl: "Today, 10:00 PM" },
    { id: "CC-1044", title: "Streetlight Repair", loc: "Pari Chowk", pr: "HIGH", dl: "Today, 4:00 PM" },
  ];
  return (
    <div>
      <ScreenHeader title="Assigned Tasks" sub="3 tasks · Offline sync ready" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tasks.map((t) => (
          <div key={t.id} className="cc-card" style={{ padding: 14, cursor: "pointer" }} onClick={onOpen}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="cc-mono" style={{ fontSize: 11, color: COLORS.mute }}>TASK #{t.id}</div>
                <div style={{ fontWeight: 700, fontSize: 13.5, marginTop: 2 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: COLORS.mute, marginTop: 2, display: "flex", gap: 4, alignItems: "center" }}><MapPin size={12} /> {t.loc}</div>
              </div>
              <PriorityBadge band={t.pr} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11.5, color: COLORS.mute }}>
              <span><Clock size={12} style={{ display: "inline", marginRight: 3, verticalAlign: -2 }} />Deadline: {t.dl}</span>
              <ChevronRight size={15} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskDetailScreen({ incident, state, setState }) {
  return (
    <div>
      <ScreenHeader title={`TASK #${incident.id}`} sub="Pothole Repair" />
      <div className="cc-card" style={{ padding: 16, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{incident.title}</div>
            <div style={{ fontSize: 12, color: COLORS.mute, marginTop: 3, display: "flex", gap: 4, alignItems: "center" }}><MapPin size={12} /> {incident.location}</div>
          </div>
          <PriorityBadge band={incident.priorityBand} />
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 12 }}>
          <span>Deadline: <b>Today, 6:00 PM</b></span>
        </div>
        <Btn variant="outline" small icon={Navigation} style={{ marginTop: 12 }}>Open Map Navigation</Btn>
      </div>

      {state === "assigned" && <Btn variant="primary" full icon={Check} onClick={() => setState("accepted")}>Accept Task</Btn>}

      {state === "accepted" && (
        <div className="cc-fade-in">
          <div className="cc-card" style={{ padding: 14, marginBottom: 12 }}><Badge tone="blue">Task Accepted</Badge></div>
          <Btn variant="primary" full icon={Wrench} onClick={() => setState("in_progress")}>Start Repair</Btn>
        </div>
      )}

      {state === "in_progress" && (
        <div className="cc-fade-in">
          <div className="cc-card" style={{ padding: 14, marginBottom: 12 }}><Badge tone="orange">Repair In Progress</Badge></div>
          <Btn variant="primary" full icon={Upload} onClick={() => setState("proof")}>Upload Proof</Btn>
        </div>
      )}

      {state === "proof" && (
        <div className="cc-fade-in">
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Repair Proof</div>
          <BeforeAfterSlider beforeLabel="Pothole (before repair)" afterLabel="Road surface (repaired)" />
          <div className="cc-card" style={{ padding: 14, margin: "12px 0", display: "flex", flexDirection: "column", gap: 6 }}>
            <Row label="Captured at" value="18 Aug 2026, 4:12 PM" mono />
            <Row label="GPS" value="Verified ✓" tone="green" />
            <Row label="Timestamp" value="Verified ✓" tone="green" />
            <Row label="Evidence" value="Fresh upload ✓" tone="green" />
          </div>
          <Btn variant="primary" full icon={Send} onClick={() => setState("completed")}>Submit Completion Proof</Btn>
        </div>
      )}

      {state === "completed" && (
        <div className="cc-fade-in cc-card" style={{ padding: 18, textAlign: "center" }}>
          <CheckCircle2 size={32} color={COLORS.green} style={{ marginBottom: 8 }} />
          <div style={{ fontWeight: 800, fontSize: 14 }}>PROOF SUBMITTED</div>
          <div style={{ fontSize: 12, color: COLORS.mute, marginTop: 4 }}>Awaiting officer verification.</div>
        </div>
      )}
    </div>
  );
}

function CompletedScreen() {
  const done = [
    { id: "CC-1048", title: "Footpath tile repair", when: "16 Aug 2026" },
    { id: "CC-1049", title: "Public bench replacement", when: "15 Aug 2026" },
  ];
  return (
    <div>
      <ScreenHeader title="Completed Tasks" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {done.map((d) => (
          <div key={d.id} className="cc-card" style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontWeight: 700, fontSize: 12.5 }}>{d.title}</div><div className="cc-mono" style={{ fontSize: 11, color: COLORS.mute }}>{d.id} · {d.when}</div></div>
            <Badge tone="green">Closed</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   JURY PRESENTATION MODE
   ============================================================ */
function JuryView({ onClose }) {
  const sections = [
    { t: "Problem", d: "Citizens see civic problems daily — potholes, leaks, broken lights — but complaint systems dead-end: no verification, no visible priority, no accountability once a complaint is filed." },
    { t: "Solution", d: "Civic Connect converts citizen observations into verified, prioritized, location-aware, assigned and trackable municipal incidents — with mandatory before/after repair evidence and citizen sign-off." },
    { t: "AI Layer", d: "A decision-support layer classifies category, checks evidence relevance, and flags confidence — never an autonomous government decision. Low-confidence cases route straight to human review." },
    { t: "Duplicate Detection", d: "Semantic similarity + geospatial distance + time window + category signals merge scattered reports into one accountable incident cluster, instead of deleting or ignoring repeats." },
    { t: "Priority Engine", d: "An explainable, configurable weighted score (severity, affected people, vulnerability, urgency, recurrence) — never a black-box number — with mandatory officer override logging." },
    { t: "GIS Routing", d: "Category + ward/geofence signals route each incident to the responsible department and team automatically, with the routing logic shown, not hidden." },
    { t: "Human-in-the-loop", d: "Every AI recommendation carries a confidence score, reason codes, and model version. Officers can accept or override category, routing, priority, and closure — all overrides are audit-logged." },
    { t: "Evidence Chain", d: "GPS + timestamp + before/after photo proof at repair, verified by the officer, then confirmed in person by the citizen — with a reopen path if the repair isn't real." },
    { t: "Analytics", d: "Ward-level hotspot recurrence surfaces infrastructure planning signals for city leadership — labelled as sample data, with predictive maintenance scoped honestly as a future module." },
  ];
  return (
    <div style={{ minHeight: "100vh", background: COLORS.navy, color: "#fff", padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: COLORS.blue, display: "flex", alignItems: "center", justifyContent: "center" }}><Building2 size={18} /></div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Civic Connect — Jury Presentation Mode</div>
          </div>
          <Btn variant="outline" small icon={X} onClick={onClose} style={{ background: "rgba(255,255,255,.08)", color: "#fff", borderColor: "rgba(255,255,255,.25)" }}>Close</Btn>
        </div>

        <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.25, marginBottom: 8 }}>Civic Connect turns citizen signals into accountable municipal action.</div>
        <div style={{ fontSize: 14, color: "#B9C6DA", marginBottom: 30 }}>Not just a complaint app — an accountability platform.</div>

        <div className="cc-card" style={{ background: "rgba(255,255,255,.04)", borderColor: "rgba(255,255,255,.12)", padding: 20, marginBottom: 30 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#8FA5C6", marginBottom: 12, letterSpacing: ".04em" }}>END-TO-END WORKFLOW</div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 700 }}>
            {["REPORT", "VERIFY", "VALIDATE", "ASSIGN", "REPAIR", "CLOSE"].map((s, i, arr) => (
              <React.Fragment key={s}>
                <span style={{ background: COLORS.blue, padding: "6px 12px", borderRadius: 8 }}>{s}</span>
                {i < arr.length - 1 && <ArrowRight size={14} color="#8FA5C6" />}
              </React.Fragment>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, fontSize: 11.5, marginTop: 14, color: "#B9C6DA" }}>
            {["3 Duplicate Reports", "AI + GIS Clustering", "1 Verified Incident", "1 Prioritized Work Order", "1 Repair", "Before/After Proof", "Citizen Verification", "CLOSED"].map((s, i, arr) => (
              <React.Fragment key={s}>
                <span>{s}</span>{i < arr.length - 1 && <span style={{ color: "#4F6690" }}>→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {sections.map((s) => (
            <div key={s.t} className="cc-card" style={{ background: "rgba(255,255,255,.04)", borderColor: "rgba(255,255,255,.12)", padding: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 6, color: "#fff" }}>{s.t}</div>
              <div style={{ fontSize: 12, color: "#B9C6DA", lineHeight: 1.5 }}>{s.d}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 30, fontSize: 11.5, color: "#7488A8" }}>
          Prototype limitations: no live municipal government integration, no nationwide deployment, no guaranteed accuracy or percentage improvements. All incident data shown is seeded sample data for demonstration.
        </div>
      </div>
    </div>
  );
}
