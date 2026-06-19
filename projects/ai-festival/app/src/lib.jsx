/* ============================================================
   lib.jsx — API layer, formatters, color tokens, dev preview hook
   Backend: FastAPI @ http://localhost:8000  (실제 연결만 사용)
   ============================================================ */

const API_BASE = "http://localhost:8000";

/* ---- color tokens (light / premium monitoring) ---- */
const COLORS = {
  bg: "#e7ebea",
  card: "#ffffff",
  cardAlt: "#f2f5f4",
  ink: "#162019",
  body: "#5a6661",
  muted: "#939d98",
  line: "#e8ebe9",
  grid: "#eef1f0",
  gaugeTrack: "#e7ebe9",

  teal: "#0f9aa6",
  tealDark: "#0b7a84",
  tealSoft: "#e1f2f3",
  orange: "#ef6c3b",
  orangeSoft: "#fdeadf",
  red: "#e5484d",
  redSoft: "#fce9e9",
  green: "#3f9d6d",
  greenSoft: "#e7f3ec",
  blue: "#4571c4",
  blueSoft: "#e9eefa",
  amber: "#e0982f",
  amberSoft: "#fbf0d9",

  actual: "#243a33", // 실측 — dark ink line
  h1: "#0f9aa6", // +10 teal
  h2: "#46b6bf", // +20
  h3: "#8ad2d6", // +30
  slate: "#aeb6b2",

  goldenLo: 0.05,
  goldenHi: 0.08,
};

/* ---- formatters ---- */
const fmt = (v, d = 3) =>
  v === null || v === undefined || Number.isNaN(Number(v))
    ? "—"
    : Number(v).toFixed(d);

const fmtSigned = (v, d = 2) => {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "—";
  const n = Number(v);
  return (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n).toFixed(d);
};

const parseTs = (s) => {
  if (typeof s !== "string") return NaN;
  return new Date(s.replace(" ", "T")).getTime();
};

const fmtClock = (ts) => {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

const fmtRange = (range) => {
  if (!range || !range.length) return null;
  const f = (s) => (typeof s === "string" ? s.slice(0, 16) : s);
  return `${f(range[0])} → ${f(range[1])}`;
};

const fmtCount = (n) =>
  n === null || n === undefined ? "—" : Number(n).toLocaleString("en-US");

/* ---- API calls (real backend only) ---- */
async function apiHealth(signal) {
  const r = await fetch(`${API_BASE}/health`, { signal });
  if (!r.ok) throw new Error(`health ${r.status}`);
  return r.json();
}

async function apiUpload(file) {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(`upload ${r.status}`);
  return r.json();
}

async function apiMetrics() {
  const r = await fetch(`${API_BASE}/api/metrics`);
  if (!r.ok) throw new Error(`metrics ${r.status}`);
  return r.json();
}

async function apiBacktest() {
  const r = await fetch(`${API_BASE}/api/backtest`);
  if (!r.ok) throw new Error(`backtest ${r.status}`);
  return r.json();
}

/* ============================================================
   DEV PREVIEW HOOK — 백엔드가 없을 때 화면을 점검/시연하기 위한
   수동 훅. 자동 폴백이 아니며, UI 어디에도 연결돼 있지 않습니다.
   브라우저 콘솔에서  __loadDemo()  를 입력하면 샘플 데이터로
   대시보드를 채워볼 수 있습니다.  __clearDemo() 로 초기화.
   ============================================================ */
function buildDemo() {
  const STEP = 10 * 60 * 1000; // 10분
  const N = 144; // 24시간
  const start = new Date("2024-06-10T22:00:00").getTime();
  const chart_data = [];
  for (let i = 0; i < N; i++) {
    const ts = start + i * STEP;
    // 약 4시간 주기로 호기/혐기 블록 교대
    const block = Math.floor((i % 48) / 24);
    const is_aerobic = block === 0 ? 1 : 0;
    const base = is_aerobic ? 0.072 : 0.118;
    const wobble =
      0.012 * Math.sin(i / 3.1) + 0.006 * Math.sin(i / 1.3) + (Math.random() - 0.5) * 0.006;
    const n2o = Math.max(0.02, base + wobble);
    const cusum_alert = i === 58 || i === 59 || i === 112; // 몇 개의 경보
    chart_data.push({
      time: new Date(ts).toISOString().slice(0, 19).replace("T", " "),
      n2o: Number(n2o.toFixed(4)),
      is_aerobic,
      cusum_alert,
    });
  }
  const latest = chart_data[chart_data.length - 1];

  const payload = {
    rows: 105264,
    time_range: ["2022-06-11 22:00:00", "2024-06-11 22:00:00"],
    chart_data,
    predictions: [
      { horizon: 1, minutes_ahead: 10, predicted_n2o: 0.068, xgb_pred: 0.066, lstm_pred: 0.074, r2: 0.9498 },
      { horizon: 2, minutes_ahead: 20, predicted_n2o: 0.071, xgb_pred: 0.069, lstm_pred: 0.076, r2: 0.8974 },
      { horizon: 3, minutes_ahead: 30, predicted_n2o: 0.075, xgb_pred: 0.073, lstm_pred: 0.079, r2: 0.8446 },
    ],
    phase_status: {
      is_aerobic: true,
      in_golden_time: true,
      latest_n2o: latest.n2o,
      latest_cusum_alert: false,
      recent_alerts_36: 2,
    },
    do_control: {
      base_n2o: 0.072,
      current_do: 0.85,
      best_do_change: -0.3,
      recommendation: "DO 0.30 g O₂/m³ 하향 (0.8500 → 0.5500) [에너지 절감 + N₂O 저감]",
      worst_horizon: "H3",
      scenarios: [
        { do_change: -0.3, actual_change: -0.3, optimized_do: 0.55, pred_n2o: 0.061, delta: -0.011 },
        { do_change: -0.2, actual_change: -0.2, optimized_do: 0.65, pred_n2o: 0.064, delta: -0.008 },
        { do_change: -0.1, actual_change: -0.1, optimized_do: 0.75, pred_n2o: 0.068, delta: -0.004 },
        { do_change: 0.0, actual_change: 0.0, optimized_do: 0.85, pred_n2o: 0.072, delta: 0.0 },
        { do_change: 0.1, actual_change: 0.1, optimized_do: 0.95, pred_n2o: 0.076, delta: 0.004 },
        { do_change: 0.2, actual_change: 0.2, optimized_do: 1.05, pred_n2o: 0.079, delta: 0.008 },
        { do_change: 0.3, actual_change: 0.3, optimized_do: 1.15, pred_n2o: 0.083, delta: 0.011 },
      ],
    },
    model_info: {
      ensemble: "XGBoost v2 + LSTM v6 (Phase 피처)",
      overall_r2: 0.8972,
      horizons: "H1~H3 (10~30분)",
      features: 37,
    },
  };

  const metrics = [
    { horizon: 1, minutes_ahead: 10, R2: 0.9498, RMSE: 0.0334, MAE: 0.0177, w_xgb: 0.75, w_lstm: 0.25 },
    { horizon: 2, minutes_ahead: 20, R2: 0.8974, RMSE: 0.0478, MAE: 0.029, w_xgb: 0.65, w_lstm: 0.35 },
    { horizon: 3, minutes_ahead: 30, R2: 0.8446, RMSE: 0.0588, MAE: 0.0359, w_xgb: 0.6, w_lstm: 0.4 },
    { horizon: "overall", minutes_ahead: "all", R2: 0.8972, RMSE: 0.0478, MAE: 0.0275, w_xgb: "", w_lstm: "" },
  ];

  const backtest = [];
  const btStart = new Date("2024-03-24T14:00:00").getTime();
  const changes = [-0.3, -0.3, -0.2, 0.0, -0.3, -0.1, 0.2, -0.3, 0.0, -0.2, -0.3, 0.1, -0.3, -0.1, -0.3];
  for (let i = 0; i < 15; i++) {
    const ts = btStart + i * 6 * 60 * 60 * 1000;
    const real = 0.045 + Math.random() * 0.04;
    const base = real - 0.01 + Math.random() * 0.006;
    const ch = changes[i];
    const curDo = 0.82 + Math.random() * 0.08;
    const dir = ch < 0 ? "하향" : ch > 0 ? "상향" : "유지";
    backtest.push({
      time: new Date(ts).toISOString().slice(0, 19).replace("T", " "),
      real_n2o: Number(real.toFixed(4)),
      worst_horizon: "H3",
      base_n2o_pred: Number(base.toFixed(4)),
      current_do: Number(curDo.toFixed(4)),
      best_do_change: ch,
      optimized_do: Number((curDo + ch).toFixed(4)),
      recommendation:
        ch === 0
          ? "DO 유지 (제어 변경 없음)"
          : `DO ${Math.abs(ch).toFixed(2)} g O₂/m³ ${dir} (${curDo.toFixed(4)} → ${(curDo + ch).toFixed(4)}) [${ch < 0 ? "에너지 절감 + N₂O 저감" : "공정 안정"}]`,
    });
  }

  return { payload, metrics, backtest };
}

window.__loadDemo = function () {
  if (window.__demo && window.__demo.load) {
    window.__demo.load(buildDemo());
    return "✓ 샘플 데이터 로드됨 (미리보기용)";
  }
  return "앱이 아직 준비되지 않았습니다.";
};
window.__clearDemo = function () {
  if (window.__demo && window.__demo.clear) window.__demo.clear();
  return "✓ 초기화됨";
};

Object.assign(window, {
  API_BASE,
  COLORS,
  fmt,
  fmtSigned,
  parseTs,
  fmtClock,
  fmtRange,
  fmtCount,
  apiHealth,
  apiUpload,
  apiMetrics,
  apiBacktest,
  buildDemo,
});
