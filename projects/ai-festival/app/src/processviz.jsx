/* ============================================================
   processviz.jsx — N₂O emission digital-twin visualization
   생물반응조(혐기/호기) 단면 + 실시간 N₂O 배출 플룸
   ============================================================ */
const PV = window.COLORS;
const { Card, Badge, Dot } = window;
const { fmt: pvFmt } = window;
const { useMemo: pvMemo } = React;

function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

function emissionTone(v) {
  if (v <= 0.08) return { name: "안정", color: "#0f9aa6", soft: "#e1f2f3", text: "#0b7a84", tone: "teal" };
  if (v <= 0.12) return { name: "주의", color: "#e0982f", soft: "#fbf0d9", text: "#9a6a14", tone: "amber" };
  return { name: "경고", color: "#ef6c3b", soft: "#fdeadf", text: "#c4521f", tone: "orange" };
}

/* small leader-line label */
function ZoneLabel({ style, title, sub, color, align = "left" }) {
  return (
    <div className="absolute z-20" style={style}>
      <div className={`flex flex-col ${align === "right" ? "items-end" : "items-start"}`}>
        <div className="text-[12px] font-700 whitespace-nowrap" style={{ color }}>{title}</div>
        {sub && <div className="text-[10.5px] whitespace-nowrap" style={{ color: PV.muted }}>{sub}</div>}
      </div>
    </div>
  );
}

function ProcessViz({ data }) {
  const ps = data.phase_status;
  const dc = data.do_control;
  const v = ps.latest_n2o;
  const aerobic = ps.is_aerobic;
  const t = emissionTone(v);
  const ratio = clamp((v - 0.04) / 0.12, 0, 1);

  const gas = pvMemo(() => {
    const n = 9 + Math.round(ratio * 12);
    return Array.from({ length: n }, () => ({
      left: 4 + Math.random() * 86,
      delay: (Math.random() * 3.2).toFixed(2),
      dur: (2.6 + Math.random() * 1.9 - ratio * 0.7).toFixed(2),
      size: (9 + Math.random() * 14).toFixed(0),
      op: (0.28 + Math.random() * 0.4).toFixed(2),
      sx: (-14 + Math.random() * 30).toFixed(0),
    }));
  }, [ratio]);

  const bubbles = pvMemo(() => Array.from({ length: 18 }, () => ({
    left: Math.random() * 96,
    delay: (Math.random() * 2.6).toFixed(2),
    dur: (1.8 + Math.random() * 1.7).toFixed(2),
    size: (5 + Math.random() * 7).toFixed(0),
  })), []);

  const bubbleOpacity = aerobic ? 1 : 0.18;

  return (
    <Card pad="p-0" className="fade-up relative overflow-hidden" style={{ height: 400 }}>
      {/* sky / air gradient */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #eef3f2 0%, #f4f7f6 38%, #eef2f1 60%, #eef3f2 100%)" }} />

      {/* heading + readout */}
      <div className="absolute left-6 top-5 z-30">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-[18px] font-700 text-[#162019] tracking-tight whitespace-nowrap">생물반응조 디지털 트윈</h3>
        </div>
        <p className="text-[12px] lbl mb-4">실시간 N₂O 배출 시각화</p>
        <div className="flex items-end gap-2.5">
          <span className="text-[44px] leading-none font-800 tnum" style={{ color: t.color }}>{pvFmt(v)}</span>
          <span className="text-[13px] lbl mb-1.5 font-600 whitespace-nowrap">kg N/h</span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Badge tone={t.tone} variant="solid">N₂O {t.name}</Badge>
          <Badge tone={ps.in_golden_time ? "amber" : "neutral"}>{ps.in_golden_time ? "골든타임" : "범위 밖"}</Badge>
        </div>
      </div>

      {/* emission intensity legend (top-right) */}
      <div className="absolute right-6 top-5 z-30 text-right">
        <div className="text-[11px] lbl mb-1.5">배출 강도</div>
        <div className="flex items-center gap-1.5 justify-end">
          <span className="h-2 w-16 rounded-full" style={{ background: "linear-gradient(90deg,#0f9aa6,#e0982f,#ef6c3b)" }} />
        </div>
        <div className="flex items-center gap-2 justify-end mt-1 text-[10px]" style={{ color: PV.muted }}>
          <span>0.05</span><span>0.10</span><span>0.16+</span>
        </div>
      </div>

      {/* N₂O gas plume — rises above the aerobic surface */}
      <div className="absolute z-10" style={{ left: "46%", right: "9%", top: "8%", height: "34%" }}>
        {gas.map((g, i) => (
          <span
            key={i}
            className="gaspuff"
            style={{
              left: `${g.left}%`, bottom: 0, width: `${g.size}px`, height: `${g.size}px`,
              background: t.color,
              "--op": g.op, "--sx": `${g.sx}px`,
              animation: `gasRise ${g.dur}s ease-in ${g.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* emission source marker */}
      <div className="absolute z-20" style={{ left: "62%", top: "6%" }}>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: t.soft, animation: "floatY 3.4s ease-in-out infinite" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.color }} />
          <span className="text-[11px] font-700 whitespace-nowrap" style={{ color: t.text }}>N₂O 배출</span>
        </div>
      </div>

      {/* basin */}
      <div className="absolute rounded-2xl overflow-hidden flex" style={{ left: "5%", right: "5%", top: "42%", bottom: "9%", border: "1px solid #d9e0dd", boxShadow: "inset 0 2px 10px rgba(20,40,33,0.06)" }}>
        {/* anoxic zone (혐기) */}
        <div className="relative h-full" style={{ width: "40%", background: aerobic ? "linear-gradient(180deg,#cfe0f2,#9fc0e6)" : "linear-gradient(180deg,#bcd3ef,#7ba8df)", transition: "background .6s" }}>
          <div className="absolute left-0 right-0 top-0 h-1.5" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.1))", backgroundSize: "90px 100%", animation: "surfaceShimmer 6s linear infinite" }} />
          {!aerobic && <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 0 2px rgba(69,113,196,0.5)" }} />}
        </div>
        {/* baffle */}
        <div className="h-full" style={{ width: 3, background: "#c9d2ce" }} />
        {/* aerobic zone (호기) */}
        <div className="relative h-full flex-1" style={{ background: aerobic ? "linear-gradient(180deg,#cfeceb,#8fd4d2)" : "linear-gradient(180deg,#d6e8e6,#a9d2cf)", transition: "background .6s" }}>
          <div className="absolute left-0 right-0 top-0 h-1.5" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.7), rgba(255,255,255,0.15))", backgroundSize: "90px 100%", animation: "surfaceShimmer 5s linear infinite" }} />
          {/* rising aeration bubbles */}
          <div className="absolute inset-0" style={{ opacity: bubbleOpacity, transition: "opacity .6s" }}>
            {bubbles.map((b, i) => (
              <span key={i} className="bubble" style={{ left: `${b.left}%`, bottom: "12px", width: `${b.size}px`, height: `${b.size}px`, animation: `bubbleUp ${b.dur}s ease-in ${b.delay}s infinite` }} />
            ))}
          </div>
          {/* diffuser bar */}
          <div className="absolute left-3 right-3 flex justify-between" style={{ bottom: 6 }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="rounded-sm" style={{ width: 14, height: 5, background: aerobic ? "#0b7a84" : "#9aa9a6" }} />
            ))}
          </div>
        </div>

        {/* inlet / effluent pipes */}
        <div className="absolute" style={{ left: -14, top: "30%", width: 16, height: 22, borderRadius: 4, background: "#c9d2ce" }} />
        <div className="absolute" style={{ right: -14, top: "22%", width: 16, height: 22, borderRadius: 4, background: "#c9d2ce" }} />
      </div>

      {/* zone labels with leader lines */}
      <div className="absolute z-20" style={{ left: "16%", top: "50%" }}>
        <div className="text-[12px] font-700 whitespace-nowrap" style={{ color: aerobic ? "#5a6661" : "#3559a0" }}>무산소조</div>
        <div className="text-[10.5px] whitespace-nowrap" style={{ color: PV.muted }}>혐기 Anaerobic</div>
      </div>
      <div className="absolute z-20" style={{ left: "55%", top: "50%" }}>
        <div className="text-[12px] font-700 whitespace-nowrap" style={{ color: aerobic ? "#0b7a84" : "#5a6661" }}>폭기조</div>
        <div className="text-[10.5px] whitespace-nowrap" style={{ color: PV.muted }}>호기 Aerobic</div>
      </div>

      {/* DO readout near diffusers */}
      <div className="absolute z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80" style={{ right: "9%", bottom: "13%", boxShadow: "0 4px 12px -6px rgba(20,40,33,0.3)" }}>
        <Dot color={aerobic ? "#3f9d6d" : "#aeb6b2"} pulse={aerobic ? "pulse-green" : ""} />
        <span className="text-[11px] font-700 tnum whitespace-nowrap" style={{ color: "#162019" }}>DO {pvFmt(dc.current_do, 2)}</span>
        <span className="text-[10px] lbl whitespace-nowrap">g O₂/m³</span>
      </div>

      {/* phase status chip bottom-left */}
      <div className="absolute z-20" style={{ left: "5%", bottom: "13%" }}>
        <Badge tone={aerobic ? "green" : "blue"}>
          <Dot color={aerobic ? "#3f9d6d" : "#4571c4"} />
          현재 {aerobic ? "호기 단계" : "혐기 단계"}
        </Badge>
      </div>
    </Card>
  );
}

Object.assign(window, { ProcessViz });
