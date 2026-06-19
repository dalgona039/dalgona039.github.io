/* global React, ReactDOM */
const { useState, useRef, useEffect, useCallback } = React;
const D = window.TREE_DEMO;

/* ---------------- tiny icon set (inline svg) ---------------- */
const Ic = {
  tree: (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v6m0 0a3 3 0 1 0 0 6m0-6a3 3 0 1 1 0 6m0 0v6m-7-3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm14 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></svg>,
  plus: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  search: (p) => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  send: (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"/></svg>,
  settings: (p) => <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>,
  chart: (p) => <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 3v18h18M7 16v-5M12 16V8M17 16v-9"/></svg>,
  chevron: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m9 18 6-6-6-6"/></svg>,
  file: (p) => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>,
  upload: (p) => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>,
  close: (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>,
  warn: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>,
  spark: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>
};

const LANGS = [["ko","KR"],["en","EN"],["ja","JP"]];

/* ---------------- helpers ---------------- */
function pickAnswer(text) {
  const A = D.ANSWERS, q = text.toLowerCase();
  const hit = (k) => A[k].match.some((m) => q.includes(m.toLowerCase()));
  if (hit("compare")) return "compare";
  if (hit("process")) return "process";
  if (hit("control")) return "control";
  if (hit("residual")) return "residual";
  return "fallback";
}
function flattenTree(node, out = []) { out.push(node); (node.children || []).forEach((c) => flattenTree(c, out)); return out; }

/* renders **bold** + newlines inside a text segment */
function RichText({ value }) {
  const lines = value.split("\n");
  return lines.map((ln, i) => (
    <React.Fragment key={i}>
      {ln.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
        part.startsWith("**")
          ? <strong key={j}>{part.slice(2, -2)}</strong>
          : <span key={j}>{part}</span>
      )}
      {i < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}

/* ---------------- Tree node ---------------- */
function TreeNode({ node, depth, open, setOpen, active, ctx, onCtx }) {
  const hasKids = (node.children || []).length > 0;
  const isOpen = open[node.id] !== false; // default open
  const isActive = active.includes(node.id);
  const isCtx = ctx.includes(node.id);
  return (
    <div className="tn">
      <div
        className={"tn-row" + (isActive ? " tn-active" : "") + (isCtx ? " tn-ctx" : "")}
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={(e) => {
          if (e.shiftKey) { onCtx(node.id); return; }
          if (hasKids) setOpen((o) => ({ ...o, [node.id]: o[node.id] === false }));
        }}
        title={node.summary}
      >
        {hasKids
          ? <span className={"tn-caret" + (isOpen ? " open" : "")}><Ic.chevron /></span>
          : <span className="tn-dot" />}
        <span className="tn-title">{node.title}</span>
        <span className="tn-page">{node.page_ref}</span>
      </div>
      {hasKids && isOpen && node.children.map((c) => (
        <TreeNode key={c.id} node={c} depth={depth + 1} open={open} setOpen={setOpen}
          active={active} ctx={ctx} onCtx={onCtx} />
      ))}
    </div>
  );
}

/* ---------------- Main app ---------------- */
function App() {
  const [lang, setLang] = useState("ko");
  const t = D.UI[lang];
  const [domain, setDomain] = useState(1); // Medical
  const [deep, setDeep] = useState(true);
  const [maxDepth, setMaxDepth] = useState(5);
  const [maxBranch, setMaxBranch] = useState(3);

  const [docIdx, setDocIdx] = useState(0);
  const [openMap, setOpenMap] = useState({});
  const [activeNodes, setActiveNodes] = useState([]); // highlighted (cited / traversed)
  const [ctxNodes, setCtxNodes] = useState([]);        // shift-selected
  const [showTree, setShowTree] = useState(true);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [thinking, setThinking] = useState(null); // {nodes:[], i}
  const [pdf, setPdf] = useState(null);            // {doc, page}
  const [panel, setPanel] = useState(null);        // 'settings' | 'perf'
  const [sessions] = useState(D.SESSIONS);
  const [activeSession, setActiveSession] = useState("se1");
  const [sQuery, setSQuery] = useState("");

  const scrollRef = useRef(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  const doc = D.DOCS[docIdx];

  const onCtx = useCallback((id) => {
    setCtxNodes((c) => c.includes(id) ? c.filter((x) => x !== id) : [...c, id]);
  }, []);

  async function ask(text) {
    if (!text.trim() || busy) return;
    const key = pickAnswer(text);
    const ans = D.ANSWERS[key];
    const segs = ans[lang] || ans.en;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);

    // make sure relevant doc panel is right one for comparison
    if (ans.multiDoc && docIdx !== 0) setDocIdx(0);

    // ---- traversal animation ----
    const visit = deep ? ans.traversal : flattenTree(doc.tree).map((n) => n.id);
    setActiveNodes([]);
    setThinking({ total: visit.length, i: 0 });
    for (let i = 0; i < visit.length; i++) {
      await sleep(deep ? 170 : 60);
      setActiveNodes((a) => [...a, visit[i]]);
      setThinking({ total: visit.length, i: i + 1 });
    }
    await sleep(260);
    setThinking(null);

    // ---- stream answer segment by segment ----
    const reduction = deep ? 88 + Math.floor(Math.random() * 8) : 0;
    const respTime = +(deep ? 2.1 + Math.random() * 0.8 : 1.3 + Math.random() * 0.5).toFixed(1);
    const ctxTok = deep ? 1100 + Math.floor(Math.random() * 600) : 11000 + Math.floor(Math.random() * 4000);
    const cited = segs.filter((s) => s.cite).map((s) => s.cite.node);
    const msg = { role: "assistant", lang, segs, shown: 0, deep, reduction, respTime, ctxTok, nodes: visit.length };
    setMessages((m) => [...m, msg]);
    for (let i = 1; i <= segs.length; i++) {
      await sleep(95);
      setMessages((m) => {
        const c = [...m]; const last = c[c.length - 1];
        c[c.length - 1] = { ...last, shown: i };
        return c;
      });
    }
    setActiveNodes(cited);      // keep cited nodes highlighted
    setBusy(false);
  }

  /* derived perf stats */
  const aMsgs = messages.filter((m) => m.role === "assistant");
  const totalQ = aMsgs.length;
  const avgT = totalQ ? (aMsgs.reduce((s, m) => s + m.respTime, 0) / totalQ).toFixed(1) : "0.0";
  const avgCtx = totalQ ? Math.round(aMsgs.reduce((s, m) => s + m.ctxTok, 0) / totalQ) : 0;
  const deepUse = totalQ ? Math.round(aMsgs.filter((m) => m.deep).length / totalQ * 100) : 0;

  const filteredSessions = sessions.filter((s) => s.title.toLowerCase().includes(sQuery.toLowerCase()));

  return (
    <div className="app">
      {/* ===== app header ===== */}
      <header className="hd">
        <div className="hd-brand">
          <span className="hd-logo">🌳</span>
          <span className="hd-name">TreeRAG</span>
          <span className="hd-sub">Hierarchical Document Intelligence</span>
        </div>
        <div className="hd-right">
          <span className="domain-pill">{t.domains[domain]}</span>
          <div className="lang-seg">
            {LANGS.map(([code, lbl]) => (
              <button key={code} className={"lang-b" + (lang === code ? " on" : "")}
                onClick={() => setLang(code)}>{lbl}</button>
            ))}
          </div>
          <button className="hd-ic" onClick={() => setPanel("perf")} title={t.performance}><Ic.chart /></button>
          <button className="hd-ic" onClick={() => setPanel("settings")} title={t.settings}><Ic.settings /></button>
          <button className={"hd-ic tree-toggle" + (showTree ? " on" : "")} onClick={() => setShowTree((v) => !v)} title={t.tree}><Ic.tree /></button>
        </div>
      </header>

      <div className="body">
        {/* ===== sidebar ===== */}
        <aside className="sb">
          <button className="newchat" onClick={() => { setMessages([]); setActiveNodes([]); setCtxNodes([]); }}>
            <Ic.plus /> {t.newChat}
          </button>
          <div className="sb-search">
            <Ic.search />
            <input value={sQuery} onChange={(e) => setSQuery(e.target.value)} placeholder={t.search} />
          </div>
          <div className="sb-list">
            {filteredSessions.map((s) => (
              <button key={s.id} className={"sess" + (activeSession === s.id ? " on" : "")}
                onClick={() => setActiveSession(s.id)}>
                <span className="sess-title">{s.title}</span>
                <span className="sess-time">{s.time}</span>
              </button>
            ))}
          </div>
          <div className="sb-foot">
            <div className="sb-foot-row"><Ic.file /> 2 {t.docs} · 142 pages</div>
            <div className="sb-foot-row muted">Gemini 3 Flash · {deep ? t.deepOn : "Flat"}</div>
          </div>
        </aside>

        {/* ===== chat ===== */}
        <main className="chat">
          <div className="chat-scroll" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="empty">
                <div className="empty-logo">🌳</div>
                <h2>{t.greeting}</h2>
                <p>{t.greetingSub}</p>
                <div className="sugs">
                  {(D.SUGGESTIONS[lang] || D.SUGGESTIONS.en).map((s, i) => (
                    <button key={i} className="sug" onClick={() => ask(s)}>
                      <Ic.spark /><span>{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => m.role === "user"
              ? <div key={i} className="msg-user"><div className="bubble-u">{m.text}</div></div>
              : <Answer key={i} m={m} t={t} onCite={(c) => setPdf(c)} />
            )}

            {thinking && (
              <div className="thinking">
                <span className="dots"><span></span><span></span><span></span></span>
                <span>{t.thinking} · {thinking.i}/{thinking.total} {t.nodesVisited}</span>
              </div>
            )}
          </div>

          {/* input */}
          <div className="composer">
            {ctxNodes.length > 0 && (
              <div className="ctx-bar">
                <span>{ctxNodes.length}{t.ctxSelected}</span>
                <button onClick={() => setCtxNodes([])}>{t.clearCtx}</button>
              </div>
            )}
            <div className="composer-row">
              <button className="comp-ic" title={t.upload}><Ic.upload /></button>
              <textarea
                value={input} rows={1}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
                placeholder={t.placeholder}
              />
              <button className="comp-send" disabled={busy || !input.trim()} onClick={() => ask(input)}>
                <Ic.send />
              </button>
            </div>
          </div>
        </main>

        {/* ===== document tree ===== */}
        {showTree && (
          <aside className="docp">
            <div className="docp-tabs">
              {D.DOCS.map((dd, i) => (
                <button key={i} className={"doc-tab" + (docIdx === i ? " on" : "")} onClick={() => setDocIdx(i)}>
                  <Ic.file /> {dd.document_name}
                </button>
              ))}
            </div>
            <div className="docp-meta">{doc.full_title} · {doc.pages}p</div>
            <div className="docp-hint">{t.selectCtx}</div>
            <div className="tree">
              <TreeNode node={doc.tree} depth={0} open={openMap} setOpen={setOpenMap}
                active={activeNodes} ctx={ctxNodes} onCtx={onCtx} />
            </div>
          </aside>
        )}
      </div>

      {/* ===== PDF viewer modal ===== */}
      {pdf && (
        <div className="overlay" onClick={() => setPdf(null)}>
          <div className="pdf" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-bar">
              <span><Ic.file /> {pdf.doc}.pdf — {t.page} {pdf.page}</span>
              <button onClick={() => setPdf(null)}><Ic.close /></button>
            </div>
            <div className="pdf-page">
              <div className="pdf-mock">
                <div className="pdf-head">{pdf.doc}</div>
                <div className="pdf-pagenum">— {pdf.page} —</div>
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="pdf-line" style={{ width: (60 + ((i * 37) % 38)) + "%" }} />
                ))}
                <div className="pdf-hl">{t.sources}: {pdf.doc}, p.{pdf.page}</div>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={"b" + i} className="pdf-line" style={{ width: (55 + ((i * 29) % 40)) + "%" }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== settings slide-over ===== */}
      {panel === "settings" && (
        <div className="overlay right" onClick={() => setPanel(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-hd"><h3>{t.settings}</h3><button onClick={() => setPanel(null)}><Ic.close /></button></div>
            <div className="field">
              <label>{t.domain}</label>
              <div className="seg wrap">
                {t.domains.map((d, i) => (
                  <button key={i} className={"seg-b" + (domain === i ? " on" : "")} onClick={() => setDomain(i)}>{d}</button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>{t.language}</label>
              <div className="seg">
                {LANGS.map(([code, lbl]) => (
                  <button key={code} className={"seg-b" + (lang === code ? " on" : "")} onClick={() => setLang(code)}>{lbl}</button>
                ))}
              </div>
            </div>
            <div className="field row">
              <div>
                <label>{t.deepOn}</label>
                <p className="field-desc">{t.deepDesc}</p>
              </div>
              <button className={"toggle" + (deep ? " on" : "")} onClick={() => setDeep((v) => !v)}><span /></button>
            </div>
            <div className="field">
              <label>{t.maxDepth}<b>{maxDepth}</b></label>
              <input type="range" min="1" max="10" value={maxDepth} onChange={(e) => setMaxDepth(+e.target.value)} />
            </div>
            <div className="field">
              <label>{t.maxBranch}<b>{maxBranch}</b></label>
              <input type="range" min="1" max="10" value={maxBranch} onChange={(e) => setMaxBranch(+e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* ===== performance modal ===== */}
      {panel === "perf" && (
        <div className="overlay" onClick={() => setPanel(null)}>
          <div className="perf" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-hd"><h3>{t.perfTitle}</h3><button onClick={() => setPanel(null)}><Ic.close /></button></div>
            <div className="perf-grid">
              <Stat label={t.totalQ} value={totalQ} />
              <Stat label={t.avgT} value={avgT + "s"} />
              <Stat label={t.avgCtx} value={avgCtx ? (avgCtx / 1000).toFixed(1) + "K" : "0"} sub="tokens" />
              <Stat label={t.deepUse} value={deepUse + "%"} accent />
            </div>
            <div className="perf-recent">
              <div className="perf-recent-h">{t.recent}</div>
              {aMsgs.length === 0 && <div className="perf-empty">—</div>}
              {messages.filter((m) => m.role === "user").slice(-6).reverse().map((m, i) => (
                <div key={i} className="perf-row"><span className="pq">{m.text}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, sub, accent }) {
  return (
    <div className={"stat" + (accent ? " accent" : "")}>
      <div className="stat-v">{value}</div>
      <div className="stat-l">{label}{sub ? <span> {sub}</span> : null}</div>
    </div>
  );
}

/* ---------------- Answer bubble ---------------- */
function Answer({ m, t, onCite }) {
  const visible = m.segs.slice(0, m.shown);
  const done = m.shown >= m.segs.length;
  return (
    <div className="msg-ai">
      <div className="ai-avatar">🌳</div>
      <div className="ai-body">
        <div className="ai-text">
          {visible.map((s, i) => {
            if (s.t !== undefined) return <RichText key={i} value={s.t} />;
            if (s.cite) return (
              <button key={i} className="cite" onClick={() => onCite(s.cite)}>
                {s.cite.doc}, p.{s.cite.page}
              </button>
            );
            if (s.warn) return (
              <span key={i} className="warnspan" title={t.lowConf}>
                <Ic.warn /> {s.warn}
              </span>
            );
            if (s.table) return <CiteTable key={i} table={s.table} />;
            return null;
          })}
          {!done && <span className="caret-blink" />}
        </div>
        {done && (
          <div className="ai-meta">
            <span className={"meta-pill" + (m.deep ? " deep" : "")}>
              {m.deep ? t.deepOn : "Flat"} · {m.nodes} {t.nodesVisited}
            </span>
            {m.deep && <span className="meta-pill green">{t.contextReduce} {m.reduction}%</span>}
            <span className="meta-pill ghost">{m.respTime}s</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CiteTable({ table }) {
  return (
    <div className="ctable-wrap">
      <table className="ctable">
        <thead><tr>{table.head.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
        <tbody>{table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
