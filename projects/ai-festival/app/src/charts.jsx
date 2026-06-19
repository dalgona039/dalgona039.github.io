/* ============================================================
   charts.jsx — recharts visualisations (light theme)
   ============================================================ */
const {
  ComposedChart, Line, BarChart, Bar, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine, LabelList,
} = Recharts;

const CC = window.COLORS;
const { parseTs: pTs, fmtClock: clock, fmt: nfmt, fmtSigned: sfmt } = window;

/* ---------- legend swatch ---------- */
function LegendItem({ color, label, dash }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width="22" height="8">
        <line x1="0" y1="4" x2="22" y2="4" stroke={color} strokeWidth="2.6" strokeDasharray={dash ? "4 3" : "0"} strokeLinecap="round" />
      </svg>
      <span className="text-[12px] font-500 whitespace-nowrap" style={{ color: CC.body }}>{label}</span>
    </span>
  );
}

/* ---------- timeseries tooltip ---------- */
function TSTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const order = { actual: "실측", h1: "+10분", h2: "+20분", h3: "+30분" };
  return (
    <div className="bg-white rounded-2xl px-3.5 py-2.5" style={{ boxShadow: "0 12px 30px -12px rgba(20,40,33,0.3)" }}>
      <div className="text-[11px] font-600 mb-1.5" style={{ color: CC.muted }}>{clock(label)}</div>
      {payload.filter((p) => p.value != null).map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-[12px] tnum">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: CC.body, width: 40 }}>{order[p.dataKey] || p.dataKey}</span>
          <span className="font-700" style={{ color: CC.ink }}>{nfmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Main N₂O timeseries — ComposedChart
   ============================================================ */
function TimeSeriesChart({ chartData, predictions, height = 340 }) {
  if (!chartData || !chartData.length) return null;
  const hist = chartData.map((r) => ({ ts: pTs(r.time), actual: r.n2o, is_aerobic: r.is_aerobic, cusum_alert: r.cusum_alert }));
  const lastTs = hist[hist.length - 1].ts;
  const anchor = hist[hist.length - 1].actual;
  hist[hist.length - 1].h1 = anchor;
  hist[hist.length - 1].h2 = anchor;
  hist[hist.length - 1].h3 = anchor;

  const future = (predictions || []).map((p) => {
    const o = { ts: lastTs + p.minutes_ahead * 60 * 1000 };
    o[`h${p.horizon}`] = p.predicted_n2o;
    return o;
  });
  const data = [...hist, ...future];
  const STEP = 10 * 60 * 1000;

  const spans = [];
  let runStart = null;
  for (let i = 0; i < hist.length; i++) {
    const an = hist[i].is_aerobic === 0;
    if (an && runStart === null) runStart = hist[i].ts;
    if ((!an || i === hist.length - 1) && runStart !== null) {
      const end = an ? hist[i].ts : hist[i - 1].ts;
      spans.push([runStart, end + STEP]);
      runStart = null;
    }
  }
  const alerts = hist.filter((h) => h.cusum_alert).map((h) => h.ts);
  const minTs = hist[0].ts;
  const maxTs = lastTs + 35 * 60 * 1000;
  const ticks = [];
  for (let i = 0; i <= 6; i++) ticks.push(Math.round(minTs + ((maxTs - minTs) * i) / 6));
  const maxY = Math.max(...hist.map((h) => h.actual), ...future.map((f) => f.h1 || f.h2 || f.h3 || 0));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3">
        <LegendItem color={CC.actual} label="실측 N₂O" />
        <LegendItem color={CC.h1} label="+10분 (H1)" dash />
        <LegendItem color={CC.h2} label="+20분 (H2)" dash />
        <LegendItem color={CC.h3} label="+30분 (H3)" dash />
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-[5px]" style={{ background: "rgba(69,113,196,0.16)", border: "1px solid rgba(69,113,196,0.35)" }} />
          <span className="text-[12px] font-500 whitespace-nowrap" style={{ color: CC.body }}>혐기 구간</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" stroke={CC.red} strokeWidth="2.6" /></svg>
          <span className="text-[12px] font-500 whitespace-nowrap" style={{ color: CC.body }}>CUSUM 경보</span>
        </span>
      </div>

      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 10, right: 16, bottom: 4, left: 2 }}>
            <CartesianGrid stroke={CC.grid} vertical={false} />
            {spans.map((s, i) => (
              <ReferenceArea key={`an${i}`} x1={s[0]} x2={s[1]} fill="rgba(69,113,196,0.10)" stroke="none" ifOverflow="extendDomain" />
            ))}
            <ReferenceArea y1={CC.goldenLo} y2={CC.goldenHi} fill="rgba(224,152,47,0.09)" stroke="none" />
            <ReferenceLine y={CC.goldenLo} stroke={CC.amber} strokeDasharray="5 4" strokeOpacity={0.5} />
            <ReferenceLine y={CC.goldenHi} stroke={CC.amber} strokeDasharray="5 4" strokeOpacity={0.5}
              label={{ value: "골든타임 0.05–0.08", position: "insideTopRight", fill: CC.amber, fontSize: 10, fontWeight: 600 }} />
            {alerts.map((a, i) => (
              <ReferenceLine key={`al${i}`} x={a} stroke={CC.red} strokeWidth={1.4} strokeOpacity={0.55} />
            ))}
            <ReferenceLine x={lastTs} stroke="#c2cac5" strokeDasharray="3 3"
              label={{ value: "NOW", position: "top", fill: CC.muted, fontSize: 10, fontWeight: 700 }} />
            <XAxis dataKey="ts" type="number" domain={[minTs, maxTs]} ticks={ticks} scale="time" tickFormatter={clock}
              stroke="transparent" tick={{ fill: CC.muted, fontSize: 10.5 }} tickLine={false} />
            <YAxis domain={[0, Math.ceil(maxY * 12) / 10]} stroke="transparent" tick={{ fill: CC.muted, fontSize: 10.5 }} tickLine={false} width={42}
              label={{ value: "N₂O  kg N/h", angle: -90, position: "insideLeft", fill: CC.muted, fontSize: 10.5, dy: 36 }} />
            <Tooltip content={<TSTooltip />} />
            <Line type="monotone" dataKey="actual" stroke={CC.actual} strokeWidth={2.2} dot={false} activeDot={{ r: 3.5 }} connectNulls isAnimationActive={false} />
            <Line type="monotone" dataKey="h1" stroke={CC.h1} strokeWidth={2.4} strokeDasharray="5 3" dot={{ r: 3.5, fill: CC.h1, strokeWidth: 0 }} connectNulls isAnimationActive={false} />
            <Line type="monotone" dataKey="h2" stroke={CC.h2} strokeWidth={2.4} strokeDasharray="5 3" dot={{ r: 3.5, fill: CC.h2, strokeWidth: 0 }} connectNulls isAnimationActive={false} />
            <Line type="monotone" dataKey="h3" stroke={CC.h3} strokeWidth={2.4} strokeDasharray="5 3" dot={{ r: 3.5, fill: CC.h3, strokeWidth: 0 }} connectNulls isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ============================================================
   DO scenario bar chart
   ============================================================ */
function DOTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white rounded-2xl px-3.5 py-2.5 text-[12px] tnum" style={{ boxShadow: "0 12px 30px -12px rgba(20,40,33,0.3)" }}>
      <div className="font-700 mb-1" style={{ color: CC.ink }}>DO {sfmt(d.do_change, 1)} g O₂/m³</div>
      <div style={{ color: CC.body }}>최적 DO <b style={{ color: CC.ink }}>{nfmt(d.optimized_do, 2)}</b></div>
      <div style={{ color: CC.body }}>예측 N₂O <b style={{ color: CC.ink }}>{nfmt(d.pred_n2o)}</b></div>
      <div style={{ color: CC.body }}>Δ <b style={{ color: d.delta < 0 ? CC.green : d.delta > 0 ? CC.red : CC.muted }}>{sfmt(d.delta, 3)}</b></div>
    </div>
  );
}
function DOScenarioChart({ scenarios, bestChange, height = 230 }) {
  if (!scenarios || !scenarios.length) return null;
  const data = scenarios.map((s) => ({ ...s, label: sfmt(s.do_change, 1) }));
  const colorFor = (s) => (s.do_change === bestChange ? CC.green : s.do_change === 0 ? "#aab4ae" : "#d3dad6");
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 24, right: 6, bottom: 4, left: 2 }}>
          <CartesianGrid stroke={CC.grid} vertical={false} />
          <XAxis dataKey="label" stroke="transparent" tick={{ fill: CC.muted, fontSize: 11, fontWeight: 600 }} tickLine={false} />
          <YAxis stroke="transparent" tick={{ fill: CC.muted, fontSize: 10.5 }} tickLine={false} width={42} domain={[0, "auto"]} />
          <Tooltip cursor={{ fill: "rgba(20,40,33,0.04)" }} content={<DOTooltip />} />
          <Bar dataKey="pred_n2o" radius={[6, 6, 0, 0]} isAnimationActive={false}>
            {data.map((s, i) => <Cell key={i} fill={colorFor(s)} />)}
            <LabelList dataKey="pred_n2o" position="top" formatter={(v) => nfmt(v)} style={{ fill: CC.body, fontSize: 10, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ============================================================
   R² bar chart (model performance)
   ============================================================ */
function R2BarChart({ metrics, height = 200 }) {
  const rows = (metrics || []).filter((m) => m.horizon !== "overall");
  const data = rows.map((m) => ({ name: `+${m.minutes_ahead}분`, R2: m.R2 }));
  const colors = [CC.h1, CC.h2, CC.h3];
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 24, right: 6, bottom: 4, left: 2 }}>
          <CartesianGrid stroke={CC.grid} vertical={false} />
          <XAxis dataKey="name" stroke="transparent" tick={{ fill: CC.muted, fontSize: 11, fontWeight: 600 }} tickLine={false} />
          <YAxis domain={[0, 1]} stroke="transparent" tick={{ fill: CC.muted, fontSize: 10.5 }} tickLine={false} width={34} />
          <Tooltip cursor={{ fill: "rgba(20,40,33,0.04)" }} formatter={(v) => nfmt(v, 4)}
            contentStyle={{ background: "#fff", border: "none", borderRadius: 14, fontSize: 12, boxShadow: "0 10px 30px -10px rgba(20,40,33,0.25)" }} />
          <Bar dataKey="R2" radius={[6, 6, 0, 0]} isAnimationActive={false}>
            {data.map((d, i) => <Cell key={i} fill={colors[i]} />)}
            <LabelList dataKey="R2" position="top" formatter={(v) => nfmt(v, 3)} style={{ fill: CC.ink, fontSize: 11, fontWeight: 700 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

Object.assign(window, { TimeSeriesChart, DOScenarioChart, R2BarChart, LegendItem });
