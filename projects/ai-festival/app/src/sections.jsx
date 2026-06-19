/* ============================================================
   sections.jsx — dashboard section blocks (light theme)
   ============================================================ */
const SC = window.COLORS;
const {
  Card, CardHead, Badge, Delta, Dot, SegBar, FillPill, WeightBar, Gauge, Skel, SectionTitle, ArrowOut, WarnTri,
  TimeSeriesChart, DOScenarioChart, R2BarChart,
  fmt, fmtSigned, fmtCount, fmtRange,
} = window;

function anaerobicRatio(chartData) {
  if (!chartData || !chartData.length) return 0;
  const an = chartData.filter((r) => r.is_aerobic === 0).length;
  return Math.round((an / chartData.length) * 100);
}

const navTo = (id) => window.__navTo && window.__navTo(id);

/* ---------- alert box ---------- */
function AlertBox({ tone, title, body, onAction }) {
  const m = {
    red: { bg: "#fce9e9", icon: "#e5484d", text: "#c0383c", pulse: "" },
    orange: { bg: "#fdeadf", icon: "#ef6c3b", text: "#c4521f", pulse: "pulse-orange" },
    green: { bg: "#e7f3ec", icon: "#3f9d6d", text: "#2f7d54", pulse: "" },
  }[tone];
  return (
    <div className="rounded-2xl p-3.5 flex items-start gap-3" style={{ background: m.bg }}>
      <div className={`w-9 h-9 rounded-full grid place-items-center shrink-0 ${m.pulse}`} style={{ background: m.icon }}>
        <WarnTri size={15} color="#fff" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-700 leading-snug" style={{ color: m.text }}>{title}</div>
        <div className="text-[12px] mt-0.5 leading-snug" style={{ color: m.text, opacity: 0.8 }}>{body}</div>
      </div>
      <button onClick={onAction} className="shrink-0 mt-0.5 cursor-pointer" style={{ color: m.icon }}><ArrowOut size={15} /></button>
    </div>
  );
}

/* ---------- hero: left status + right chart ---------- */
function HeroSection({ data }) {
  const ps = data.phase_status;
  const mi = data.model_info;
  const anRatio = anaerobicRatio(data.chart_data);
  const alert = ps.latest_cusum_alert
    ? { tone: "red", title: "CUSUM 변화점 경보 발생", body: "실시간 N₂O 급변 감지 — 즉시 확인이 필요합니다." }
    : ps.recent_alerts_36 > 0
    ? { tone: "orange", title: `최근 6시간 CUSUM 경보 ${ps.recent_alerts_36}건`, body: "누적 변화 추세를 모니터링 중입니다." }
    : { tone: "green", title: "안정 운전 중", body: "최근 36스텝 내 경보가 없습니다." };

  const cusumActive = ps.latest_cusum_alert || ps.recent_alerts_36 > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
      {/* left */}
      <Card pad="p-5" className="fade-up flex flex-col">
        <image-slot id="site" shape="rounded" radius="16" placeholder="처리장 배치도 이미지" style={{ width: "100%", height: "148px", display: "block" }}></image-slot>

        <div className="flex items-center justify-between mt-5 mb-3">
          <h3 className="text-[16px] font-700 text-[#162019] whitespace-nowrap">고위험 경보</h3>
          <button onClick={() => navTo("backtest")} className="text-[12px] lbl hover:text-[#0b7a84] transition cursor-pointer">결정 상세 ›</button>
        </div>
        <AlertBox {...alert} onAction={() => navTo("backtest")} />

        <div className="h-px bg-[#eef1ef] my-5" />

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-700 text-[#162019] whitespace-nowrap">운영 정보</h3>
          <Badge tone={ps.is_aerobic ? "green" : "blue"}>
            <Dot color={ps.is_aerobic ? "#3f9d6d" : "#4571c4"} pulse={ps.is_aerobic ? "pulse-green" : ""} />
            {ps.is_aerobic ? "호기 Aerobic" : "혐기 Anaerobic"}
          </Badge>
        </div>
        <div className="space-y-4">
          <SegBar label="예측 신뢰도 (Overall R²)" value={mi.overall_r2 * 100} display={`${(mi.overall_r2 * 100).toFixed(1)}%`} color="#0f9aa6" />
          <SegBar label="혐기 구간 비율" value={anRatio} display={`${anRatio}%`} color="#ef6c3b" />
        </div>
      </Card>

      {/* right — chart hero */}
      <Card className="fade-up relative overflow-hidden" style={{ animationDelay: "70ms" }}>
        <CardHead title="N₂O 예측 시계열" sub="실측 + H1~H3 예측 (10~30분)" onAction={() => navTo("forecast")} />
        <TimeSeriesChart chartData={data.chart_data} predictions={data.predictions} height={360} />
        {cusumActive && (
          <div className="absolute right-6 bottom-6 max-w-[300px] rounded-2xl p-3.5 flex items-start gap-3" style={{ background: "#fff", boxShadow: "0 16px 36px -14px rgba(20,40,33,0.3)", border: "1px solid #fbe0d4" }}>
            <div className="w-8 h-8 rounded-full grid place-items-center shrink-0 pulse-orange" style={{ background: "#ef6c3b" }}>
              <WarnTri size={13} color="#fff" />
            </div>
            <div>
              <div className="text-[12.5px] font-700" style={{ color: "#c4521f" }}>CUSUM 경보</div>
              <div className="text-[11.5px] mt-0.5 leading-snug" style={{ color: "#7a5a48" }}>
                최근 36스텝 {ps.recent_alerts_36}건 · {data.do_control.worst_horizon} 구간 주의
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---------- metric row (4 signature cards) ---------- */
function InfoRow({ label, children, divider = true }) {
  return (
    <div className={`flex items-center justify-between py-2.5 ${divider ? "border-b border-[#eef1ef]" : ""}`}>
      <span className="text-[13px] lbl whitespace-nowrap">{label}</span>
      <span className="text-[13px] font-700 text-[#162019] tnum text-right whitespace-nowrap">{children}</span>
    </div>
  );
}

function MetricRow({ data, metrics }) {
  const ps = data.phase_status;
  const mi = data.model_info;
  const dc = data.do_control;
  const optimizedDo = dc.current_do + dc.best_do_change;
  const dir = dc.best_do_change < 0 ? "down" : dc.best_do_change > 0 ? "up" : "hold";
  const hRows = (metrics && metrics.filter((m) => m.horizon !== "overall")) ||
    (data.predictions || []).map((p) => ({ minutes_ahead: p.minutes_ahead, R2: p.r2 }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* 1 — 현재 N₂O gauge */}
      <Card className="fade-up flex flex-col" style={{ animationDelay: "0ms" }}>
        <CardHead title="현재 N₂O" onAction={() => navTo("forecast")} />
        <div className="flex flex-col items-center justify-center flex-1 pb-1">
          <Gauge value={ps.latest_n2o} min={0} max={0.2} unit="kg N/h" zone={[0.05, 0.08]} color="#0f9aa6" size={172} format={(v) => fmt(v)} />
          <Badge tone={ps.in_golden_time ? "amber" : "neutral"} className="mt-3">
            {ps.in_golden_time ? "● 골든타임 구간" : "○ 골든타임 범위 밖"}
          </Badge>
        </div>
      </Card>

      {/* 2 — 모델 정보 */}
      <Card className="fade-up flex flex-col" style={{ animationDelay: "70ms" }}>
        <CardHead title="모델 정보" onAction={() => navTo("models")} />
        <div className="flex-1">
          <InfoRow label="앙상블 모델">XGBoost v2 · LSTM v6</InfoRow>
          <InfoRow label="운영 상태"><Badge tone="teal" variant="solid">정상 가동</Badge></InfoRow>
          <InfoRow label="학습 데이터">{fmtCount(data.rows)} rows</InfoRow>
          <InfoRow label="Horizon · Features" divider={false}>{mi.horizons.split(" ")[0]} · {mi.features}개</InfoRow>
        </div>
        <div className="mt-3 rounded-xl px-3.5 py-2.5 flex items-center justify-between" style={{ background: "#f2f5f4" }}>
          <span className="text-[12px] lbl">Overall R²</span>
          <span className="text-[16px] font-800 tnum" style={{ color: "#0b7a84" }}>{fmt(mi.overall_r2, 4)}</span>
        </div>
      </Card>

      {/* 3 — Horizon 정확도 (temperature-bars analog) */}
      <Card className="fade-up flex flex-col" style={{ animationDelay: "140ms" }}>
        <CardHead title="Horizon 정확도" onAction={() => navTo("models")} />
        <div className="space-y-4 flex-1">
          {hRows.map((m, i) => (
            <SegBar key={i} label={`+${m.minutes_ahead}분 후 (H${i + 1})`} value={m.R2 * 100} display={fmt(m.R2, 4)} color={["#0f9aa6", "#46b6bf", "#8ad2d6"][i]} warn={m.R2 < 0.85} />
          ))}
        </div>
        <div className="text-[11.5px] lbl mt-4">R² 기준 · 0.85 미만 시 주의</div>
      </Card>

      {/* 4 — DO 제어 현황 (consumption analog) */}
      <Card className="fade-up flex flex-col" style={{ animationDelay: "210ms" }}>
        <CardHead title="DO 제어 현황" onAction={() => navTo("do")} />
        <div className="flex flex-col items-center flex-1">
          <Gauge value={dc.current_do} min={0} max={1.5} unit="g O₂/m³" sub="현재 DO" color="#0f9aa6" size={150} format={(v) => fmt(v, 2)} />
          <div className="grid grid-cols-3 gap-2 w-full mt-3">
            <MiniStat label="현재" value={fmt(dc.current_do, 2)} />
            <MiniStat label="권고" value={fmt(optimizedDo, 2)} color={dir === "down" ? "#2f7d54" : dir === "up" ? "#c4521f" : "#162019"} />
            <MiniStat label="Δ" value={fmtSigned(dc.best_do_change, 1)} color={dir === "down" ? "#2f7d54" : dir === "up" ? "#c4521f" : "#8a958f"} />
          </div>
        </div>
      </Card>
    </div>
  );
}

function MiniStat({ label, value, color = "#162019" }) {
  return (
    <div className="rounded-xl px-2 py-2 text-center" style={{ background: "#f2f5f4" }}>
      <div className="text-[10.5px] lbl mb-0.5">{label}</div>
      <div className="text-[14px] font-800 tnum" style={{ color }}>{value}</div>
    </div>
  );
}

/* ---------- prediction cards ---------- */
function PredictionRow({ data, metrics }) {
  const hColor = { 1: "#0f9aa6", 2: "#46b6bf", 3: "#8ad2d6" };
  const wOf = (h) => (metrics || []).find((m) => m.horizon === h);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data.predictions.map((p, i) => {
        const w = wOf(p.horizon);
        return (
          <Card key={p.horizon} className="fade-up" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <Badge tone="teal" variant="soft">H{p.horizon} · +{p.minutes_ahead}분 후</Badge>
              <Badge tone="neutral">R² {fmt(p.r2, 4)}</Badge>
            </div>
            <div className="flex items-end gap-2 mb-5">
              <span className="text-[44px] leading-none font-800 tnum" style={{ color: hColor[p.horizon] }}>{fmt(p.predicted_n2o)}</span>
              <span className="text-[13px] lbl mb-1.5 font-600">kg N/h</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-2xl px-3.5 py-3" style={{ background: "#f2f5f4" }}>
                <div className="text-[10.5px] font-600" style={{ color: "#0b7a84" }}>XGBOOST</div>
                <div className="text-[17px] font-800 tnum mt-0.5" style={{ color: "#162019" }}>{fmt(p.xgb_pred)}</div>
              </div>
              <div className="rounded-2xl px-3.5 py-3" style={{ background: "#f2f5f4" }}>
                <div className="text-[10.5px] font-600" style={{ color: "#c4521f" }}>LSTM</div>
                <div className="text-[17px] font-800 tnum mt-0.5" style={{ color: "#162019" }}>{fmt(p.lstm_pred)}</div>
              </div>
            </div>
            {w && <WeightBar wXgb={w.w_xgb} wLstm={w.w_lstm} />}
          </Card>
        );
      })}
    </div>
  );
}

/* ---------- DO control section ---------- */
function DOControlSection({ data }) {
  const dc = data.do_control;
  const ps = data.phase_status;
  const skip = !ps.is_aerobic;
  const optimizedDo = dc.current_do + dc.best_do_change;
  const dir = dc.best_do_change < 0 ? "down" : dc.best_do_change > 0 ? "up" : "hold";
  const tone = dir === "down" ? "green" : dir === "up" ? "orange" : "neutral";
  const bannerBg = dir === "down" ? "#e7f3ec" : dir === "up" ? "#fdeadf" : "#f2f5f4";
  const bannerTx = dir === "down" ? "#2f7d54" : dir === "up" ? "#c4521f" : "#5a6661";

  return (
    <Card className="fade-up relative overflow-hidden">
      <CardHead title="DO 제어 시나리오" sub="용존산소 변화량별 예측 N₂O · 최적 권고" onAction={() => navTo("backtest")} />
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        <div>
          <div className="flex items-end gap-3 mb-4">
            <div>
              <div className="text-[11.5px] lbl mb-1">현재 DO</div>
              <div className="text-[30px] font-800 tnum leading-none" style={{ color: "#162019" }}>{fmt(dc.current_do, 2)}</div>
            </div>
            <svg width="26" height="22" className="mb-1"><path d="M2 11h16M14 5l5 6-5 6" stroke="#aeb6b2" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div>
              <div className="text-[11.5px] lbl mb-1">권고 DO</div>
              <div className="text-[30px] font-800 tnum leading-none" style={{ color: bannerTx }}>{fmt(optimizedDo, 2)}</div>
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <Badge tone={tone} variant="solid">DO {fmtSigned(dc.best_do_change, 1)} g O₂/m³</Badge>
            <Badge tone="red" variant="soft">최악 {dc.worst_horizon}</Badge>
          </div>
          <div className="rounded-2xl px-4 py-3 text-[13px] leading-relaxed" style={{ background: bannerBg, color: bannerTx }}>
            {dc.recommendation}
          </div>
        </div>
        <div>
          <DOScenarioChart scenarios={dc.scenarios} bestChange={dc.best_do_change} height={250} />
          <div className="flex items-center gap-4 mt-1">
            <LegendSwatch color="#3f9d6d" label="최적 권고" />
            <LegendSwatch color="#aab4ae" label="현재 유지" />
            <LegendSwatch color="#d3dad6" label="기타 시나리오" />
          </div>
        </div>
      </div>

      {skip && (
        <div className="absolute inset-0 grid place-items-center" style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(2px)" }}>
          <div className="text-center">
            <Badge tone="blue"><Dot color="#4571c4" /> ANAEROBIC</Badge>
            <div className="text-[18px] font-800 mt-3" style={{ color: "#162019" }}>혐기 구간 — DO 제어 스킵</div>
            <div className="text-[12.5px] lbl mt-1.5">혐기 단계에서는 폭기 제어가 적용되지 않습니다.</div>
          </div>
        </div>
      )}
    </Card>
  );
}
function LegendSwatch({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-3 h-3 rounded-[4px]" style={{ background: color }} />
      <span className="text-[12px] font-500 whitespace-nowrap" style={{ color: SC.body }}>{label}</span>
    </span>
  );
}

/* ---------- backtest ---------- */
function BacktestSection({ rows }) {
  if (!rows || !rows.length) {
    return <Card className="text-center py-10 text-[13px] lbl">백테스팅 데이터가 없습니다.</Card>;
  }
  const dirBadge = (ch) =>
    ch < 0 ? <Badge tone="green">{fmtSigned(ch, 1)} 하향</Badge> : ch > 0 ? <Badge tone="orange">{fmtSigned(ch, 1)} 상향</Badge> : <Badge tone="neutral">유지</Badge>;
  return (
    <Card pad="p-0" className="fade-up overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] tnum">
          <thead>
            <tr className="text-[11px] lbl text-left" style={{ background: "#f6f8f7" }}>
              <th className="font-600 py-3.5 px-6">시각</th>
              <th className="font-600 px-3 text-right">실측 N₂O</th>
              <th className="font-600 px-3 text-right">예측 N₂O</th>
              <th className="font-600 px-3 text-right">현재 DO</th>
              <th className="font-600 px-3 text-center">권고 DO 변화</th>
              <th className="font-600 px-6">권고 내용</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-[#eef1ef] hover:bg-[#f8faf9] transition">
                <td className="py-3 px-6" style={{ color: "#162019", fontWeight: 600 }}>{r.time.slice(5, 16)}</td>
                <td className="px-3 text-right font-700" style={{ color: "#162019" }}>{fmt(r.real_n2o)}</td>
                <td className="px-3 text-right" style={{ color: "#0b7a84", fontWeight: 600 }}>{fmt(r.base_n2o_pred)}</td>
                <td className="px-3 text-right" style={{ color: "#5a6661" }}>{fmt(r.current_do, 2)}</td>
                <td className="px-3 text-center">{dirBadge(r.best_do_change)}</td>
                <td className="px-6 py-3 text-[12px] max-w-[440px] truncate" style={{ color: "#5a6661" }}>{r.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ---------- model metrics (collapsible) ---------- */
function ModelMetricsSection({ metrics, open, onToggle }) {
  const has = metrics && metrics.length;
  if (!open || !has) return null;
  return (
    <Card className="fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] tnum">
            <thead>
              <tr className="text-[11px] lbl text-left border-b border-[#eef1ef]">
                <th className="font-600 py-3">HORIZON</th>
                <th className="font-600 text-right">예측시점</th>
                <th className="font-600 text-right">R²</th>
                <th className="font-600 text-right">RMSE</th>
                <th className="font-600 text-right">MAE</th>
                <th className="font-600 text-right">w_xgb</th>
                <th className="font-600 text-right">w_lstm</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, i) => {
                const ov = m.horizon === "overall";
                return (
                  <tr key={i} className="border-b border-[#f0f3f1]" style={ov ? { background: "#f2f5f4" } : {}}>
                    <td className="py-3 font-700" style={{ color: ov ? "#0b7a84" : "#162019" }}>{ov ? "OVERALL" : `H${m.horizon}`}</td>
                    <td className="text-right" style={{ color: "#8a958f" }}>{ov ? "all" : `+${m.minutes_ahead}분`}</td>
                    <td className="text-right font-700" style={{ color: "#162019" }}>{fmt(m.R2, 4)}</td>
                    <td className="text-right" style={{ color: "#5a6661" }}>{fmt(m.RMSE, 4)}</td>
                    <td className="text-right" style={{ color: "#5a6661" }}>{fmt(m.MAE, 4)}</td>
                    <td className="text-right" style={{ color: "#0b7a84" }}>{m.w_xgb === "" ? "—" : fmt(m.w_xgb, 2)}</td>
                    <td className="text-right" style={{ color: "#c4521f" }}>{m.w_lstm === "" ? "—" : fmt(m.w_lstm, 2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div>
          <div className="text-[13px] lbl mb-1 font-600">Horizon별 R²</div>
          <R2BarChart metrics={metrics} height={210} />
        </div>
      </div>
    </Card>
  );
}

Object.assign(window, {
  HeroSection, MetricRow, PredictionRow, DOControlSection, BacktestSection, ModelMetricsSection, AlertBox, InfoRow, MiniStat,
});
