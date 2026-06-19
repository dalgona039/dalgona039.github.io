/* ============================================================
   ui.jsx — light premium UI primitives
   ============================================================ */
const C = window.COLORS;

/* ---- geometry helpers for gauges ---- */
function polar(cx, cy, r, deg) {
  const a = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function arcPath(cx, cy, r, a0, a1) {
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;
}

/* ---- icons ---- */
function ArrowOut({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}
function BellIcon({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}
function WarnTri({ size = 13, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01" />
    </svg>
  );
}

/* ---- brand mark ---- */
function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-[11px] grid place-items-center" style={{ background: "linear-gradient(140deg, #0f9aa6, #0b7a84)", boxShadow: "0 6px 16px -6px rgba(15,154,166,0.6)" }}>
        <span className="text-white font-800 text-[15px] tracking-tight">N₂</span>
      </div>
      <div className="leading-none">
        <div className="text-[17px] font-800 tracking-tight text-[#162019]">N₂O Twin</div>
      </div>
    </div>
  );
}

/* ---- pill nav ---- */
function PillNav({ items, active, onSelect }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-white/65 border border-[#e6e9e7] p-1.5" style={{ boxShadow: "0 1px 2px rgba(20,40,33,0.04), inset 0 0 0 1px rgba(255,255,255,0.5)" }}>
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onSelect(it.id)}
          className={`px-4 py-2 rounded-full text-[13.5px] font-600 transition whitespace-nowrap ${active === it.id ? "bg-white text-[#162019]" : "text-[#7c867f] hover:text-[#162019]"}`}
          style={active === it.id ? { boxShadow: "0 2px 8px -2px rgba(20,40,33,0.18)" } : {}}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/* ---- cards ---- */
function Card({ children, className = "", style = {}, pad = "p-6" }) {
  return <div className={`card ${pad} ${className}`} style={style}>{children}</div>;
}
function CardHead({ title, sub, onAction }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="text-[19px] font-700 text-[#162019] tracking-tight leading-tight whitespace-nowrap">{title}</h3>
        {sub && <p className="text-[12.5px] lbl mt-1 whitespace-nowrap">{sub}</p>}
      </div>
      {onAction && (
        <button onClick={onAction} title="자세히 보기" className="w-8 h-8 rounded-full grid place-items-center text-[#aeb6b2] hover:bg-[#f2f5f4] hover:text-[#0b7a84] transition shrink-0 cursor-pointer">
          <ArrowOut />
        </button>
      )}
    </div>
  );
}

/* ---- badges ---- */
function Badge({ children, tone = "neutral", variant = "soft", className = "" }) {
  const map = {
    teal: { soft: "bg-[#e1f2f3] text-[#0b7a84]", solid: "bg-[#0f9aa6] text-white" },
    orange: { soft: "bg-[#fdeadf] text-[#c4521f]", solid: "bg-[#ef6c3b] text-white" },
    green: { soft: "bg-[#e7f3ec] text-[#2f7d54]", solid: "bg-[#3f9d6d] text-white" },
    blue: { soft: "bg-[#e9eefa] text-[#3559a0]", solid: "bg-[#4571c4] text-white" },
    amber: { soft: "bg-[#fbf0d9] text-[#9a6a14]", solid: "bg-[#e0982f] text-white" },
    red: { soft: "bg-[#fce9e9] text-[#c0383c]", solid: "bg-[#e5484d] text-white" },
    neutral: { soft: "bg-[#eef1ef] text-[#5a6661]", solid: "bg-[#162019] text-white" },
  };
  const cls = (map[tone] || map.neutral)[variant];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-600 whitespace-nowrap ${cls} ${className}`}>
      {children}
    </span>
  );
}

/* ---- delta chip ---- */
function Delta({ value, suffix = "%", positiveGood = false }) {
  const up = value >= 0;
  const good = positiveGood ? up : !up;
  const color = good ? "#2f7d54" : "#c4521f";
  const bg = good ? "#e7f3ec" : "#fdeadf";
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-700 tnum" style={{ color, background: bg }}>
      <svg width="9" height="9" viewBox="0 0 10 10" fill={color}>
        {up ? <path d="M5 1l4 6H1z" /> : <path d="M5 9L1 3h8z" />}
      </svg>
      {Math.abs(value)}{suffix}
    </span>
  );
}

/* ---- status dot ---- */
function Dot({ color = "#3f9d6d", pulse = "" }) {
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${pulse}`} style={{ background: color }} />;
}

/* ---- segmented horizontal bar (operation info / temperature style) ---- */
function SegBar({ label, value, display, color = "#0f9aa6", warn = false }) {
  const pct = Math.max(2, Math.min(100, value));
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] lbl whitespace-nowrap">{label}</span>
        <span className="text-[13.5px] font-700 text-[#162019] tnum flex items-center gap-1.5">
          {warn && (
            <span className="w-4 h-4 rounded-[5px] grid place-items-center" style={{ background: "#ef6c3b" }}>
              <WarnTri size={9} />
            </span>
          )}
          {display}
        </span>
      </div>
      <div className="h-2.5 rounded-full relative" style={{ background: "#edf0ee" }}>
        <div className="h-full rounded-full relative" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}cc, ${color})` }}>
          <span className="absolute right-0 top-0 h-full w-1.5 rounded-full" style={{ background: color, filter: "brightness(0.78)" }} />
        </div>
      </div>
    </div>
  );
}

/* ---- fill pill (battery / level) ---- */
function FillPill({ pct, label, color = "#ef6c3b", height = 44 }) {
  const w = Math.max(16, Math.min(100, pct));
  return (
    <div className="rounded-full flex items-center p-1" style={{ height, background: "#edf0ee" }}>
      <div className="h-full rounded-full flex items-center justify-center text-white font-800 text-[15px] tnum px-4" style={{ width: `${w}%`, minWidth: 64, background: `linear-gradient(90deg, ${color}, ${color}dd)`, boxShadow: `0 4px 12px -4px ${color}80` }}>
        {label}
      </div>
    </div>
  );
}

/* ---- weight split bar (XGB / LSTM) ---- */
function WeightBar({ wXgb, wLstm }) {
  const a = Math.round((wXgb || 0) * 100);
  const b = 100 - a;
  return (
    <div>
      <div className="flex justify-between text-[11.5px] font-600 mb-2 whitespace-nowrap">
        <span style={{ color: "#0b7a84" }}>XGBoost {a}%</span>
        <span style={{ color: "#c4521f" }}>LSTM {b}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden flex" style={{ background: "#edf0ee" }}>
        <div className="h-full" style={{ width: `${a}%`, background: "#0f9aa6" }} />
        <div className="h-full" style={{ width: `${b}%`, background: "#ef6c3b" }} />
      </div>
    </div>
  );
}

/* ---- arc gauge (270°) ---- */
function Gauge({ value, min = 0, max = 1, unit, sub, color = "#0f9aa6", size = 176, thickness = 13, zone, format }) {
  const rid = React.useId().replace(/[:]/g, "");
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const cx = size / 2, cy = size / 2, r = size / 2 - thickness / 2 - 4;
  const startA = 135, sweep = 270;
  const valA = startA + sweep * t;
  const end = polar(cx, cy, r, valA);
  const fmt = format || ((v) => v);
  let zoneEl = null;
  if (zone) {
    const z0 = startA + sweep * Math.max(0, Math.min(1, (zone[0] - min) / (max - min)));
    const z1 = startA + sweep * Math.max(0, Math.min(1, (zone[1] - min) / (max - min)));
    zoneEl = <path d={arcPath(cx, cy, r, z0, z1)} stroke="#fbe3b6" strokeWidth={thickness} fill="none" strokeLinecap="butt" />;
  }
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={`g${rid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.75" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <path d={arcPath(cx, cy, r, startA, startA + sweep)} stroke="#e7ebe9" strokeWidth={thickness} fill="none" strokeLinecap="round" />
        {zoneEl}
        {t > 0.001 && <path d={arcPath(cx, cy, r, startA, valA)} stroke={`url(#g${rid})`} strokeWidth={thickness} fill="none" strokeLinecap="round" />}
        <circle cx={end.x} cy={end.y} r={thickness / 2 + 1.5} fill="#fff" stroke={color} strokeWidth="3" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ paddingBottom: 6 }}>
        <div className="font-800 text-[#162019] tnum leading-none" style={{ fontSize: size * 0.22 }}>{fmt(value)}</div>
        {unit && <div className="text-[12px] lbl mt-1.5 font-600">{unit}</div>}
        {sub && <div className="text-[11px] lbl mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

/* ---- skeleton / spinner ---- */
function Skel({ className = "", style = {} }) {
  return <div className={`skel ${className}`} style={style} />;
}
function Spinner({ size = 20, color = "#0f9aa6" }) {
  return <span className="spin inline-block rounded-full" style={{ width: size, height: size, border: `2.5px solid ${color}2e`, borderTopColor: color }} />;
}

/* ---- section anchor heading ---- */
function SectionTitle({ children, sub, right, id }) {
  return (
    <div id={id} className="flex items-end justify-between mb-4 scroll-mt-24">
      <div className="flex items-baseline gap-3">
        <h2 className="text-[22px] font-800 tracking-tight text-[#162019] whitespace-nowrap">{children}</h2>
        {sub && <span className="text-[13px] lbl whitespace-nowrap">{sub}</span>}
      </div>
      {right}
    </div>
  );
}

Object.assign(window, {
  polar, arcPath, ArrowOut, BellIcon, WarnTri, Logo, PillNav, Card, CardHead,
  Badge, Delta, Dot, SegBar, FillPill, WeightBar, Gauge, Skel, Spinner, SectionTitle,
});
