/* ============================================================
   TreeRAG — Interactive Demo mock data
   Scenario: Medical-device regulatory documents (ISO 14971 / IEC 62304)
   No backend; all responses are canned to mirror the real app.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- PageIndex trees (hierarchical, page-level) ---------- */
  const ISO14971 = {
    document_name: "ISO 14971:2019",
    full_title: "Medical devices — Application of risk management to medical devices",
    pages: 78,
    tree: {
      id: "root", title: "ISO 14971:2019", page_ref: "p.1",
      summary: "의료기기 전(全) 수명주기에 위험 관리를 적용하기 위한 국제 표준.",
      children: [
        { id: "s1", title: "1  Scope", page_ref: "p.1",
          summary: "표준의 적용 범위와 대상 의료기기를 규정한다." },
        { id: "s3", title: "3  Terms and definitions", page_ref: "p.2–8",
          summary: "harm, hazard, risk, residual risk 등 핵심 용어 정의." },
        { id: "s4", title: "4  General requirements for risk management", page_ref: "p.9–14",
          summary: "위험 관리 시스템의 일반 요구사항.",
          children: [
            { id: "s4-1", title: "4.1  Risk management process", page_ref: "p.9", summary: "위험 관리 프로세스의 전체 구조를 정의한다." },
            { id: "s4-2", title: "4.2  Management responsibilities", page_ref: "p.11", summary: "최고 경영진의 책임과 자원 배정." },
            { id: "s4-3", title: "4.3  Competence of personnel", page_ref: "p.12", summary: "위험 관리 수행 인력의 역량 요건." },
            { id: "s4-4", title: "4.4  Risk management plan", page_ref: "p.12", summary: "위험 관리 계획서에 포함되어야 할 항목." },
            { id: "s4-5", title: "4.5  Risk management file", page_ref: "p.14", summary: "위험 관리 파일의 추적성 요구사항." }
          ] },
        { id: "s5", title: "5  Risk analysis", page_ref: "p.15–19",
          summary: "위험 분석 프로세스 — 의도된 사용, 위해 식별, 위험 추정.",
          children: [
            { id: "s5-1", title: "5.1  Risk analysis process", page_ref: "p.15", summary: "위험 분석 절차의 개요." },
            { id: "s5-2", title: "5.2  Intended use & foreseeable misuse", page_ref: "p.16", summary: "의도된 사용과 합리적으로 예측 가능한 오용." },
            { id: "s5-4", title: "5.4  Identification of hazards", page_ref: "p.17", summary: "위해 및 위해 상황의 식별." },
            { id: "s5-5", title: "5.5  Risk estimation", page_ref: "p.18", summary: "발생 확률 × 심각도로 위험을 추정." }
          ] },
        { id: "s6", title: "6  Risk evaluation", page_ref: "p.20",
          summary: "추정된 위험의 수용 가능성을 판정한다." },
        { id: "s7", title: "7  Risk control", page_ref: "p.21–27",
          summary: "위험 통제 옵션 분석과 구현, 잔여 위험 평가.",
          children: [
            { id: "s7-1", title: "7.1  Risk control option analysis", page_ref: "p.21", summary: "본질적 안전 설계 → 보호 수단 → 정보 제공 순의 우선순위." },
            { id: "s7-2", title: "7.2  Implementation of control measures", page_ref: "p.23", summary: "통제 수단의 구현과 검증." },
            { id: "s7-3", title: "7.3  Residual risk evaluation", page_ref: "p.24", summary: "통제 후 남은 잔여 위험의 평가." },
            { id: "s7-4", title: "7.4  Benefit-risk analysis", page_ref: "p.25", summary: "수용 불가 위험에 대한 이익-위험 분석." }
          ] },
        { id: "s8", title: "8  Evaluation of overall residual risk", page_ref: "p.28",
          summary: "전체 잔여 위험을 종합적으로 평가한다." },
        { id: "s9", title: "9  Risk management review", page_ref: "p.29",
          summary: "출시 전 위험 관리 활동의 적정성을 검토한다." },
        { id: "s10", title: "10  Production & post-production", page_ref: "p.30–33",
          summary: "생산 및 시판 후 정보 수집과 피드백 루프." }
      ]
    }
  };

  const IEC62304 = {
    document_name: "IEC 62304:2006",
    full_title: "Medical device software — Software life cycle processes",
    pages: 64,
    tree: {
      id: "root2", title: "IEC 62304:2006", page_ref: "p.1",
      summary: "의료기기 소프트웨어의 수명주기 프로세스 표준.",
      children: [
        { id: "i4", title: "4  General requirements", page_ref: "p.10", summary: "품질 시스템·위험 관리·소프트웨어 안전 등급(A/B/C)." },
        { id: "i5", title: "5  Software development process", page_ref: "p.14–28", summary: "계획·요구사항·아키텍처·구현·통합·시스템 시험." },
        { id: "i7", title: "7  Software risk management", page_ref: "p.34", summary: "ISO 14971을 소프트웨어에 연계 적용." },
        { id: "i8", title: "8  Software configuration management", page_ref: "p.40", summary: "형상 식별·변경 관리·추적성." },
        { id: "i9", title: "9  Software problem resolution", page_ref: "p.44", summary: "문제 보고·분석·변경 검증." }
      ]
    }
  };

  /* ---------- Suggested prompts ---------- */
  const SUGGESTIONS = {
    ko: [
      "ISO 14971의 위험 관리 프로세스 주요 단계는?",
      "위험 통제(Risk control)의 우선순위는 어떻게 되나요?",
      "잔여 위험(residual risk)은 어떻게 평가하나요?",
      "ISO 14971과 IEC 62304의 관계를 비교해줘"
    ],
    en: [
      "What are the main steps of the ISO 14971 risk management process?",
      "What is the priority order for risk control?",
      "How is residual risk evaluated?",
      "Compare the relationship between ISO 14971 and IEC 62304"
    ]
  };

  /* ---------- Canned answers ----------
     Each answer: array of segments. A segment is either
     { t: "text" } or { cite: { doc, page, node } } or { warn: "low-confidence text" }
     ------------------------------------------------------------------ */
  const ANSWERS = {
    // 1) process steps
    process: {
      match: ["프로세스", "단계", "process", "step", "주요"],
      traversal: ["root", "s4", "s4-1", "s5", "s6", "s7", "s8", "s9", "s10"],
      ko: [
        { t: "ISO 14971이 정의하는 위험 관리 프로세스는 다음의 연속된 활동으로 구성됩니다.\n\n" },
        { t: "1. **위험 분석(Risk analysis)** — 의도된 사용을 정의하고 위해와 위해 상황을 식별한 뒤 각 위험을 추정합니다 " },
        { cite: { doc: "ISO 14971", page: "15", node: "s5" } },
        { t: ".\n2. **위험 평가(Risk evaluation)** — 추정된 위험이 수용 가능한지 판정합니다 " },
        { cite: { doc: "ISO 14971", page: "20", node: "s6" } },
        { t: ".\n3. **위험 통제(Risk control)** — 옵션을 분석하고 통제 수단을 구현해 잔여 위험을 평가합니다 " },
        { cite: { doc: "ISO 14971", page: "21", node: "s7" } },
        { t: ".\n4. **전체 잔여 위험 평가(Overall residual risk)** — 모든 통제 이후 남은 위험을 종합 판단합니다 " },
        { cite: { doc: "ISO 14971", page: "28", node: "s8" } },
        { t: ".\n5. **위험 관리 검토(Risk management review)** — 출시 전 활동의 적정성을 검토합니다 " },
        { cite: { doc: "ISO 14971", page: "29", node: "s9" } },
        { t: ".\n6. **생산 및 시판 후 활동(Production & post-production)** — 시판 후 정보를 수집해 위험 관리에 피드백합니다 " },
        { cite: { doc: "ISO 14971", page: "30", node: "s10" } },
        { t: ".\n\n이 프로세스 전체는 4장의 위험 관리 시스템 요구사항 아래에서 계획되고 문서화됩니다 " },
        { cite: { doc: "ISO 14971", page: "9", node: "s4-1" } },
        { t: "." }
      ],
      en: [
        { t: "ISO 14971 defines the risk management process as the following sequence of activities.\n\n" },
        { t: "1. **Risk analysis** — define intended use, identify hazards and hazardous situations, then estimate each risk " },
        { cite: { doc: "ISO 14971", page: "15", node: "s5" } },
        { t: ".\n2. **Risk evaluation** — decide whether each estimated risk is acceptable " },
        { cite: { doc: "ISO 14971", page: "20", node: "s6" } },
        { t: ".\n3. **Risk control** — analyse options, implement measures, and evaluate residual risk " },
        { cite: { doc: "ISO 14971", page: "21", node: "s7" } },
        { t: ".\n4. **Overall residual risk evaluation** " },
        { cite: { doc: "ISO 14971", page: "28", node: "s8" } },
        { t: ".\n5. **Risk management review** before release " },
        { cite: { doc: "ISO 14971", page: "29", node: "s9" } },
        { t: ".\n6. **Production & post-production** monitoring " },
        { cite: { doc: "ISO 14971", page: "30", node: "s10" } },
        { t: ".\n\nThe whole process is planned and documented under the Clause 4 risk-management system requirements " },
        { cite: { doc: "ISO 14971", page: "9", node: "s4-1" } },
        { t: "." }
      ]
    },
    // 2) risk control priority
    control: {
      match: ["통제", "control", "우선순위", "priority", "통제 수단"],
      traversal: ["root", "s7", "s7-1", "s7-2", "s7-3"],
      ko: [
        { t: "위험 통제 옵션은 7.1에 따라 다음 **우선순위**로 적용해야 합니다 " },
        { cite: { doc: "ISO 14971", page: "21", node: "s7-1" } },
        { t: ".\n\n1. **본질적 안전 설계(Inherently safe design)** — 설계 단계에서 위해 자체를 제거하거나 줄입니다.\n2. **보호 수단(Protective measures)** — 알람·차폐 등 기기 자체 또는 제조 공정의 보호 장치를 적용합니다.\n3. **안전 정보(Information for safety)** — 경고·사용 설명서 등으로 사용자에게 위험을 알립니다.\n\n구현된 통제 수단은 검증되어야 하며 " },
        { cite: { doc: "ISO 14971", page: "23", node: "s7-2" } },
        { t: ", 적용 후에는 잔여 위험을 다시 평가합니다 " },
        { cite: { doc: "ISO 14971", page: "24", node: "s7-3" } },
        { t: ". " },
        { warn: "정보 제공만으로 수용 불가 위험을 수용 가능 수준으로 낮출 수 있습니다." },
        { t: "" }
      ],
      en: [
        { t: "Risk control options must be applied in the following **priority order** per Clause 7.1 " },
        { cite: { doc: "ISO 14971", page: "21", node: "s7-1" } },
        { t: ".\n\n1. **Inherently safe design** — eliminate or reduce the hazard at the design stage.\n2. **Protective measures** — alarms, guards, or process protections in the device itself.\n3. **Information for safety** — warnings and instructions for use.\n\nImplemented measures must be verified " },
        { cite: { doc: "ISO 14971", page: "23", node: "s7-2" } },
        { t: ", and residual risk re-evaluated afterwards " },
        { cite: { doc: "ISO 14971", page: "24", node: "s7-3" } },
        { t: ". " },
        { warn: "Information for safety alone can reduce an unacceptable risk to an acceptable level." },
        { t: "" }
      ]
    },
    // 3) residual risk
    residual: {
      match: ["잔여", "residual", "평가"],
      traversal: ["root", "s7", "s7-3", "s7-4", "s8"],
      ko: [
        { t: "잔여 위험은 두 수준에서 평가됩니다.\n\n**개별 잔여 위험** — 각 통제 수단 구현 후 7.3에 따라 남은 위험을 평가합니다 " },
        { cite: { doc: "ISO 14971", page: "24", node: "s7-3" } },
        { t: ". 수용 불가 시 7.4의 **이익-위험 분석(benefit-risk analysis)**을 통해 의료적 이익이 위험을 상회하는지 판단합니다 " },
        { cite: { doc: "ISO 14971", page: "25", node: "s7-4" } },
        { t: ".\n\n**전체 잔여 위험** — 모든 개별 위험을 종합하여 8장에서 전체 잔여 위험을 평가합니다 " },
        { cite: { doc: "ISO 14971", page: "28", node: "s8" } },
        { t: ". 이 결과는 위험 관리 검토(9장)의 입력이 됩니다." }
      ],
      en: [
        { t: "Residual risk is evaluated at two levels.\n\n**Individual residual risk** — after each control measure, remaining risk is evaluated per Clause 7.3 " },
        { cite: { doc: "ISO 14971", page: "24", node: "s7-3" } },
        { t: ". If not acceptable, a **benefit-risk analysis** (7.4) judges whether medical benefit outweighs the risk " },
        { cite: { doc: "ISO 14971", page: "25", node: "s7-4" } },
        { t: ".\n\n**Overall residual risk** — all individual risks are aggregated and evaluated in Clause 8 " },
        { cite: { doc: "ISO 14971", page: "28", node: "s8" } },
        { t: ", feeding the risk management review (Clause 9)." }
      ]
    },
    // 4) comparison (multi-doc -> table)
    compare: {
      match: ["62304", "비교", "compare", "관계", "차이", "relationship"],
      traversal: ["root", "s4", "s7", "root2", "i7"],
      multiDoc: true,
      ko: [
        { t: "두 표준은 상호 보완적입니다. ISO 14971은 위험 관리의 **상위 프레임워크**를 제공하고, IEC 62304는 그 프레임워크를 **소프트웨어 수명주기**에 적용합니다 " },
        { cite: { doc: "IEC 62304", page: "34", node: "i7" } },
        { t: ".\n\n" },
        { table: {
          head: ["관점", "ISO 14971", "IEC 62304"],
          rows: [
            ["대상", "모든 의료기기", "의료기기 소프트웨어"],
            ["핵심", "위험 관리 프로세스", "소프트웨어 수명주기 프로세스"],
            ["위험 연계", "전체 위험 관리 정의", "ISO 14971을 SW에 연계 (7장)"],
            ["등급", "위험 수용성 판정", "안전 등급 A / B / C"]
          ]
        } },
        { t: "\nIEC 62304의 7장은 명시적으로 ISO 14971의 위험 통제 요구사항을 소프트웨어 항목에 연결합니다 " },
        { cite: { doc: "ISO 14971", page: "21", node: "s7" } },
        { t: "." }
      ],
      en: [
        { t: "The two standards are complementary. ISO 14971 provides the **top-level risk management framework**, while IEC 62304 applies it to the **software life cycle** " },
        { cite: { doc: "IEC 62304", page: "34", node: "i7" } },
        { t: ".\n\n" },
        { table: {
          head: ["Aspect", "ISO 14971", "IEC 62304"],
          rows: [
            ["Scope", "All medical devices", "Medical device software"],
            ["Focus", "Risk management process", "Software life-cycle process"],
            ["Risk link", "Defines whole risk mgmt", "Links to ISO 14971 (Clause 7)"],
            ["Classes", "Risk acceptability", "Safety class A / B / C"]
          ]
        } },
        { t: "\nClause 7 of IEC 62304 explicitly ties ISO 14971's risk-control requirements to software items " },
        { cite: { doc: "ISO 14971", page: "21", node: "s7" } },
        { t: "." }
      ]
    },
    // fallback
    fallback: {
      traversal: ["root", "s3", "s5", "s7"],
      ko: [
        { t: "해당 질문과 가장 관련된 노드를 트리에서 탐색했습니다. ISO 14971의 핵심 개념은 위해(harm)·위험(risk)·잔여 위험으로 정의되며 " },
        { cite: { doc: "ISO 14971", page: "2", node: "s3" } },
        { t: ", 위험 분석(5장) → 평가(6장) → 통제(7장)의 흐름으로 관리됩니다 " },
        { cite: { doc: "ISO 14971", page: "15", node: "s5" } },
        { t: ". 더 구체적인 조항을 질문하시면 해당 페이지를 인용해 답변드리겠습니다." }
      ],
      en: [
        { t: "I traversed the tree to the nodes most relevant to your question. ISO 14971 defines its core concepts as harm, risk and residual risk " },
        { cite: { doc: "ISO 14971", page: "2", node: "s3" } },
        { t: ", managed through analysis (Cl.5) → evaluation (Cl.6) → control (Cl.7) " },
        { cite: { doc: "ISO 14971", page: "15", node: "s5" } },
        { t: ". Ask about a specific clause for a page-cited answer." }
      ]
    }
  };

  /* ---------- i18n UI strings ---------- */
  const UI = {
    ko: {
      newChat: "새 대화", search: "대화 검색…", docs: "문서", tree: "트리 구조",
      settings: "설정", performance: "성능", upload: "PDF 업로드",
      placeholder: "ISO 14971 문서에 대해 질문하세요…", send: "전송",
      thinking: "트리 탐색 중", deepOn: "Deep Traversal", sources: "출처",
      domain: "문서 도메인", language: "응답 언어", maxDepth: "최대 깊이", maxBranch: "분기 수",
      deepDesc: "LLM 가이드 탐색 (대용량 문서 권장)", selectCtx: "Shift+클릭으로 컨텍스트 노드 선택",
      ctxSelected: "개 노드 선택됨", clearCtx: "해제",
      perfTitle: "성능 대시보드", totalQ: "총 쿼리", avgT: "평균 응답", avgCtx: "평균 컨텍스트",
      deepUse: "Deep 사용률", recent: "최근 쿼리", contextReduce: "컨텍스트 절감",
      page: "페이지", close: "닫기", nodesVisited: "노드 탐색", greeting: "무엇이든 물어보세요",
      greetingSub: "업로드된 규제 문서를 계층 트리로 탐색해 페이지 단위로 인용된 답을 드립니다.",
      domains: ["일반", "의료", "법률", "금융", "학술"], lowConf: "낮은 신뢰도"
    },
    en: {
      newChat: "New chat", search: "Search chats…", docs: "Documents", tree: "Tree structure",
      settings: "Settings", performance: "Performance", upload: "Upload PDF",
      placeholder: "Ask about the ISO 14971 documents…", send: "Send",
      thinking: "Traversing tree", deepOn: "Deep Traversal", sources: "Sources",
      domain: "Document domain", language: "Response language", maxDepth: "Max depth", maxBranch: "Max branches",
      deepDesc: "LLM-guided navigation (recommended for large docs)", selectCtx: "Shift+Click to select context nodes",
      ctxSelected: " node(s) selected", clearCtx: "clear",
      perfTitle: "Performance dashboard", totalQ: "Total queries", avgT: "Avg response", avgCtx: "Avg context",
      deepUse: "Deep usage", recent: "Recent queries", contextReduce: "Context reduction",
      page: "Page", close: "Close", nodesVisited: "nodes visited", greeting: "Ask me anything",
      greetingSub: "I traverse your uploaded regulatory PDFs as a hierarchical tree and answer with page-level citations.",
      domains: ["General", "Medical", "Legal", "Financial", "Academic"], lowConf: "Low confidence"
    },
    ja: {
      newChat: "新規チャット", search: "チャット検索…", docs: "ドキュメント", tree: "ツリー構造",
      settings: "設定", performance: "パフォーマンス", upload: "PDFアップロード",
      placeholder: "ISO 14971 文書について質問…", send: "送信",
      thinking: "ツリー探索中", deepOn: "Deep Traversal", sources: "出典",
      domain: "ドメイン", language: "応答言語", maxDepth: "最大深度", maxBranch: "分岐数",
      deepDesc: "LLM誘導ナビゲーション（大規模文書推奨）", selectCtx: "Shift+クリックでコンテキスト選択",
      ctxSelected: " ノード選択", clearCtx: "解除",
      perfTitle: "パフォーマンス", totalQ: "総クエリ", avgT: "平均応答", avgCtx: "平均コンテキスト",
      deepUse: "Deep使用率", recent: "最近のクエリ", contextReduce: "コンテキスト削減",
      page: "ページ", close: "閉じる", nodesVisited: "ノード探索", greeting: "何でも質問してください",
      greetingSub: "アップロードされた規制文書を階層ツリーとして探索し、ページ単位の引用付きで回答します。",
      domains: ["一般", "医療", "法律", "金融", "学術"], lowConf: "低信頼度"
    }
  };

  /* ---------- Seed chat sessions (sidebar) ---------- */
  const SESSIONS = [
    { id: "se1", title: "위험 관리 프로세스 단계", time: "오늘", active: true },
    { id: "se2", title: "Risk control priority order", time: "오늘" },
    { id: "se3", title: "잔여 위험 평가 방법", time: "어제" },
    { id: "se4", title: "14971 vs 62304 비교", time: "어제" },
    { id: "se5", title: "Software safety classes", time: "11월 12일" }
  ];

  /* expose */
  window.TREE_DEMO = {
    DOCS: [ISO14971, IEC62304],
    SUGGESTIONS, ANSWERS, UI, SESSIONS
  };
})();
