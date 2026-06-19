/* ============================================================
   app.jsx — N₂O Digital Twin Dashboard (light)
   ============================================================ */
const { useState, useEffect, useRef, useCallback } = React;
const AC = window.COLORS;
const {
  Logo, PillNav, Card, CardHead, Badge, Dot, Spinner, Skel, SectionTitle, ArrowOut, BellIcon,
  HeroSection, MetricRow, PredictionRow, DOControlSection, BacktestSection, ModelMetricsSection, ProcessViz,
  apiHealth, apiUpload, apiMetrics, apiBacktest, fmtCount, fmtRange,
} = window;

const NAV = [
  { id: "top", label: "대시보드" },
  { id: "forecast", label: "예측" },
  { id: "do", label: "DO 제어" },
  { id: "backtest", label: "백테스트" },
  { id: "models", label: "모델 성능" },
];

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - 92), behavior: "smooth" });
}
window.__navTo = scrollToId;

/* ---------------- Top bar ---------------- */
function TopBar({ health, active, onNav }) {
  const tone = health.state;
  const dotColor = tone === "ok" ? "#3f9d6d" : tone === "down" ? "#e5484d" : "#aeb6b2";
  const text = tone === "ok" ? "연결됨" : tone === "down" ? "연결 끊김" : "확인 중";
  return (
    <header className="sticky top-0 z-40">
      <div className="bg-[#e7ebea]/85 backdrop-blur-md border-b border-[#dfe4e1]">
        <div className="max-w-[1480px] mx-auto px-8 h-[72px] flex items-center justify-between gap-4">
          <Logo />
          <div className="hidden lg:block">
            <PillNav items={NAV} active={active} onSelect={onNav} />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-[#e6e9e7]">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${tone === "ok" ? "pulse-green" : ""}`} style={{ background: dotColor }} />
              <span className="text-[12.5px] font-600 text-[#162019] whitespace-nowrap">{text}</span>
              <span className="text-[11px] lbl hidden sm:inline">localhost:8000</span>
            </div>
            <button className="w-10 h-10 rounded-full bg-white border border-[#e6e9e7] grid place-items-center text-[#5a6661] hover:text-[#162019] transition relative">
              <BellIcon />
              {health.state === "down" && <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: "#ef6c3b" }} />}
            </button>
            <div className="w-10 h-10 rounded-full grid place-items-center text-white font-700 text-[13px]" style={{ background: "linear-gradient(140deg,#2a3a34,#16201d)" }}>
              OP
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Upload control (title row) ---------------- */
function UploadButton({ state, payload, onPick }) {
  const inputRef = useRef(null);
  if (state === "uploading") {
    return (
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white border border-[#e6e9e7]">
        <Spinner size={16} /><span className="text-[13px] font-600 text-[#162019]">분석 중…</span>
      </div>
    );
  }
  const done = state === "done" && payload;
  return (
    <div className="flex items-center gap-3">
      {done && (
        <div className="text-right hidden md:block">
          <div className="text-[12px] lbl">{fmtCount(payload.rows)} rows 로드됨</div>
          <div className="text-[11px] lbl">{fmtRange(payload.time_range)}</div>
        </div>
      )}
      <button
        onClick={() => inputRef.current && inputRef.current.click()}
        className="px-5 py-2.5 rounded-full text-[13.5px] font-700 transition whitespace-nowrap text-white"
        style={{ background: "#ef6c3b", boxShadow: "0 8px 20px -8px rgba(239,108,59,0.7)" }}
      >
        {done ? "다시 업로드" : "CSV 업로드"}
      </button>
      <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => onPick(e.target.files[0])} />
    </div>
  );
}

/* ---------------- Upload hero (no data) ---------------- */
function UploadHero({ state, error, onPick }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);
  return (
    <Card pad="p-8" className="fade-up">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); onPick(e.dataTransfer.files[0]); }}
        className="rounded-3xl py-14 px-6 flex flex-col items-center text-center border-2 border-dashed transition-colors"
        style={{ borderColor: drag ? "#0f9aa6" : "#d8ddda", background: drag ? "rgba(15,154,166,0.05)" : "transparent" }}
      >
        {state === "uploading" ? (
          <>
            <Spinner size={32} />
            <div className="text-[16px] font-700 text-[#162019] mt-5">예측 계산 중…</div>
            <div className="text-[13px] lbl mt-1.5">앙상블 모델 추론 및 DO 제어 최적화 진행 중</div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl grid place-items-center mb-5" style={{ background: "#e1f2f3" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f9aa6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 9l5-5 5 5M5 20h14" /></svg>
            </div>
            <div className="text-[19px] font-800 text-[#162019]">CSV 파일을 업로드하세요</div>
            <div className="text-[13.5px] lbl mt-2 max-w-md">공정 데이터 CSV를 드래그하거나 선택하면 N₂O 예측과 DO 제어 권고가 생성됩니다.</div>
            <button onClick={() => inputRef.current && inputRef.current.click()} className="mt-6 px-6 py-3 rounded-full text-white text-[14px] font-700 transition" style={{ background: "#ef6c3b", boxShadow: "0 10px 24px -8px rgba(239,108,59,0.7)" }}>
              CSV 파일 선택
            </button>
            <div className="text-[12px] lbl mt-4">지원 파일 · N2O_10min_phase_preserved.csv</div>
            <button onClick={() => window.__loadDemo && window.__loadDemo()} className="mt-4 text-[12.5px] font-700 transition hover:opacity-70" style={{ color: "#0b7a84" }}>
              또는 데모 데이터로 미리보기 →
            </button>
            {state === "error" && (
              <div className="mt-6 rounded-2xl px-5 py-4 max-w-md text-left" style={{ background: "#fce9e9" }}>
                <div className="text-[13px] font-700" style={{ color: "#c0383c" }}>업로드 실패 — 백엔드 연결을 확인하세요.</div>
                <div className="text-[12px] mt-1 break-all tnum" style={{ color: "#b85458" }}>{error}</div>
                <div className="text-[12px] mt-2 lbl">서버 점검용: 콘솔에서 <code style={{ color: "#0b7a84" }}>__loadDemo()</code> 로 샘플 미리보기 가능</div>
              </div>
            )}
          </>
        )}
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => onPick(e.target.files[0])} />
      </div>
    </Card>
  );
}

/* ---------------- Skeleton preview ---------------- */
function SkeletonDash() {
  return (
    <div className="space-y-6 mt-6 opacity-70">
      <div className="grid lg:grid-cols-[380px_1fr] gap-6">
        <Card><Skel className="h-[148px] w-full mb-5" /><Skel className="h-4 w-28 mb-3" /><Skel className="h-16 w-full mb-5" /><Skel className="h-3 w-full mb-3" /><Skel className="h-3 w-full" /></Card>
        <Card><Skel className="h-5 w-48 mb-5" /><Skel className="h-[340px] w-full" /></Card>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[0, 1, 2, 3].map((i) => <Card key={i}><Skel className="h-4 w-24 mb-5" /><Skel className="h-[150px] w-full" /></Card>)}
      </div>
    </div>
  );
}

/* ---------------- App ---------------- */
function App() {
  const [health, setHealth] = useState({ state: "unknown" });
  const [uploadState, setUploadState] = useState("idle");
  const [uploadError, setUploadError] = useState("");
  const [data, setData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [backtest, setBacktest] = useState(null);
  const [showMetrics, setShowMetrics] = useState(true);
  const [active, setActive] = useState("top");

  useEffect(() => {
    let alive = true;
    const ping = async () => {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        const info = await apiHealth(ctrl.signal);
        clearTimeout(t);
        if (alive) setHealth({ state: "ok", info });
      } catch (e) {
        if (alive) setHealth((h) => ({ state: "down", info: h.info }));
      }
    };
    ping();
    const id = setInterval(ping, 5000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const loadAux = useCallback(async () => {
    try { setMetrics(await apiMetrics()); } catch (e) {}
    try { setBacktest(await apiBacktest()); } catch (e) {}
  }, []);
  useEffect(() => { loadAux(); }, [loadAux]);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setUploadState("uploading");
    setUploadError("");
    try {
      const payload = await apiUpload(file);
      setData(payload);
      setUploadState("done");
      loadAux();
    } catch (e) {
      setUploadError(String(e.message || e));
      setUploadState("error");
    }
  }, [loadAux]);

  useEffect(() => {
    window.__demo = {
      load: (demo) => { setData(demo.payload); setMetrics(demo.metrics); setBacktest(demo.backtest); setUploadState("done"); },
      clear: () => { setData(null); setMetrics(null); setBacktest(null); setUploadState("idle"); },
    };
    return () => { delete window.__demo; };
  }, []);

  // scrollspy
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 120;
      let cur = "top";
      for (const n of NAV) {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= y) cur = n.id;
      }
      setActive(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [data]);

  const hasData = uploadState === "done" && !!data;

  return (
    <div className="min-h-screen">
      <TopBar health={health} active={active} onNav={scrollToId} />

      <main className="max-w-[1480px] mx-auto px-8 pb-20">
        {/* title row */}
        <div className="flex items-end justify-between gap-4 pt-8 pb-7" id="top">
          <div>
            <div className="text-[13px] lbl mb-1.5">
              {hasData ? "실시간 공정 모니터링" : "데이터 업로드 대기 중"}
            </div>
            <h1 className="text-[34px] sm:text-[38px] font-800 tracking-tight leading-none text-[#162019]">N₂O 디지털 트윈</h1>
          </div>
          <UploadButton state={uploadState} payload={data} onPick={handleFile} />
        </div>

        {hasData ? (
          <div className="space-y-10">
            <ProcessViz data={data} />
            <HeroSection data={data} />
            <MetricRow data={data} metrics={metrics} />

            <div>
              <SectionTitle id="forecast" sub="XGBoost + LSTM">앙상블 예측</SectionTitle>
              <PredictionRow data={data} metrics={metrics} />
            </div>

            <div>
              <SectionTitle id="do" sub="용존산소 최적화 권고">DO 제어</SectionTitle>
              <DOControlSection data={data} />
            </div>

            <div>
              <SectionTitle id="backtest" sub={backtest ? `${backtest.length}건` : ""}>DO 제어 백테스팅</SectionTitle>
              <BacktestSection rows={backtest} />
            </div>

            <div>
              <SectionTitle
                id="models"
                sub="Horizon별 R² · RMSE · MAE"
                right={
                  <button
                    onClick={() => setShowMetrics((o) => !o)}
                    disabled={!(metrics && metrics.length)}
                    className="text-[13px] font-600 rounded-full px-4 py-2 border transition whitespace-nowrap"
                    style={{ background: "#fff", borderColor: "#e6e9e7", color: metrics && metrics.length ? "#162019" : "#c2cac5" }}
                  >
                    {showMetrics ? "접기 ▲" : "펼치기 ▼"}
                  </button>
                }
              >
                모델 성능 지표
              </SectionTitle>
              <ModelMetricsSection metrics={metrics} open={showMetrics} onToggle={setShowMetrics} />
            </div>

            <footer className="pt-6 border-t border-[#dfe4e1] flex flex-wrap items-center justify-between gap-3 text-[12px] lbl">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-600 text-[#5a6661]">{data.model_info.ensemble}</span>
                <span>· Features {data.model_info.features}</span>
                <span>· {data.model_info.horizons}</span>
                <span>· Overall R² {window.fmt(data.model_info.overall_r2, 4)}</span>
              </div>
              <div className="font-600">AI FESTIVAL · 경희대학교</div>
            </footer>
          </div>
        ) : (
          <>
            <UploadHero state={uploadState} error={uploadError} onPick={handleFile} />
            <SkeletonDash />
          </>
        )}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
