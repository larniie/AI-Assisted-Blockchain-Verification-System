const baseUrlInput = document.getElementById("baseUrl");
const modeSelect = document.getElementById("modeSelect");
const issueText = document.getElementById("issueText");
const verifyText = document.getElementById("verifyText");
const issueBtn = document.getElementById("issueBtn");
const verifyBtn = document.getElementById("verifyBtn");
const refreshChainBtn = document.getElementById("refreshChainBtn");
const output = document.getElementById("output");
const apiStatus = document.getElementById("apiStatus");
const chainLength = document.getElementById("chainLength");
const chainValid = document.getElementById("chainValid");
const pendingCount = document.getElementById("pendingCount");
const aiSummary = document.getElementById("aiSummary");
const aiConfidence = document.getElementById("aiConfidence");
const aiRisk = document.getElementById("aiRisk");
const aiRecommendations = document.getElementById("aiRecommendations");
const testApiBtn = document.getElementById("testApiBtn");
const saveApiBtn = document.getElementById("saveApiBtn");
const resetApiBtn = document.getElementById("resetApiBtn");
const helpTopic = document.getElementById("helpTopic");
const askExplainBtn = document.getElementById("askExplainBtn");
const askNextBtn = document.getElementById("askNextBtn");
const assistantOutput = document.getElementById("assistantOutput");

const DEFAULT_BASE_URL = "http://127.0.0.1:5000";
const STORAGE_BASE_URL = "bcvs_base_url";
const STORAGE_MODE = "bcvs_mode";
const STORAGE_OFFLINE_CHAIN = "bcvs_offline_chain";

const HELP_CONTENT = {
  overview: [
    "This app issues and verifies certificate text against blockchain records.",
    "Use Online mode for real backend validation, or Offline Demo for local testing.",
  ],
  "api-settings": [
    "API Settings controls where requests go and which mode you use.",
    "Use Test Connection to confirm backend health, Save URL to persist it, and Reset Default to restore defaults.",
  ],
  "issue-certificate": [
    "Issue Certificate writes a certificate hash into a blockchain block.",
    "Use exactly the final certificate text you plan to verify later.",
  ],
  "verify-certificate": [
    "Verify compares the typed certificate text against stored blockchain hashes.",
    "Even spacing/spelling differences can change the hash and fail verification.",
  ],
  "blockchain-panel": [
    "Blockchain panel shows current chain data, integrity state, and pending records.",
    "Use Refresh Chain after issuing certificates to confirm new blocks.",
  ],
  "ai-insights": [
    "AI Assistant Insights gives confidence, risk level, and recommendations.",
    "These insights are heuristic in frontend demo mode and should be treated as advisory.",
  ],
  "offline-mode": [
    "Offline Demo Mode runs without backend and stores demo chain data in browser localStorage.",
    "Great for demos, but not secure enough for production verification.",
  ],
  security: [
    "For production, add issuer authentication, digital signatures, and persistent database storage.",
    "Also add API rate limiting, audit logs, and HTTPS deployment.",
  ],
};

function printResult(title, data) {
  output.textContent = `${title}\n${"=".repeat(title.length)}\n${JSON.stringify(data, null, 2)}`;
}

function printAssistant(title, lines) {
  assistantOutput.textContent = `${title}\n${"=".repeat(title.length)}\n- ${lines.join("\n- ")}`;
}

function setApiStatus(text) {
  apiStatus.textContent = text;
}

function setLoading(button, isLoading, label) {
  button.disabled = isLoading;
  button.textContent = isLoading ? "Working..." : label;
}

function getBaseUrl() {
  return baseUrlInput.value.trim().replace(/\/$/, "");
}

function getMode() {
  return modeSelect.value;
}

function saveBaseUrl(url) {
  localStorage.setItem(STORAGE_BASE_URL, url);
}

function loadBaseUrl() {
  return localStorage.getItem(STORAGE_BASE_URL) || DEFAULT_BASE_URL;
}

function saveMode(mode) {
  localStorage.setItem(STORAGE_MODE, mode);
}

function loadMode() {
  return localStorage.getItem(STORAGE_MODE) || "online";
}

function simpleHash(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return `demo_${Math.abs(hash).toString(16)}_${text.length}`;
}

function normalizeCertificate(text) {
  return String(text || "").trim().replace(/\s+/g, " ");
}

function createOfflineGenesis() {
  return {
    length: 1,
    is_valid: true,
    pending_certificates: [],
    chain: [
      {
        index: 1,
        timestamp: Date.now() / 1000,
        certificate_hashes: [],
        previous_hash: "1",
        hash: "genesis",
      },
    ],
  };
}

function loadOfflineChain() {
  const raw = localStorage.getItem(STORAGE_OFFLINE_CHAIN);
  if (!raw) {
    const genesis = createOfflineGenesis();
    localStorage.setItem(STORAGE_OFFLINE_CHAIN, JSON.stringify(genesis));
    return genesis;
  }

  try {
    return JSON.parse(raw);
  } catch (_) {
    const genesis = createOfflineGenesis();
    localStorage.setItem(STORAGE_OFFLINE_CHAIN, JSON.stringify(genesis));
    return genesis;
  }
}

function saveOfflineChain(chainData) {
  localStorage.setItem(STORAGE_OFFLINE_CHAIN, JSON.stringify(chainData));
}

function offlineIssue(certificate) {
  const text = normalizeCertificate(certificate);
  if (!text) {
    return { status: 400, data: { error: "Certificate text is required." } };
  }

  const hash = simpleHash(text);
  const chainData = loadOfflineChain();
  const exists = chainData.chain.some((b) => (b.certificate_hashes || []).includes(hash));
  if (exists) {
    return {
      status: 200,
      data: { message: "Certificate already exists (offline demo)", certificate_hash: hash },
    };
  }

  const previous = chainData.chain[chainData.chain.length - 1];
  const block = {
    index: chainData.chain.length + 1,
    timestamp: Date.now() / 1000,
    certificate_hashes: [hash],
    previous_hash: previous.hash,
    hash: simpleHash(`${hash}_${Date.now()}`),
  };

  chainData.chain.push(block);
  chainData.length = chainData.chain.length;
  saveOfflineChain(chainData);

  return {
    status: 201,
    data: {
      message: "Certificate issued in Offline Demo Mode",
      certificate_hash: hash,
      block_index: block.index,
      mode: "offline",
    },
  };
}

function offlineVerify(certificate) {
  const text = normalizeCertificate(certificate);
  if (!text) {
    return { status: 400, data: { error: "Certificate text is required." } };
  }

  const hash = simpleHash(text);
  const chainData = loadOfflineChain();
  const found = chainData.chain.some((b) => (b.certificate_hashes || []).includes(hash));

  return {
    status: 200,
    data: found
      ? {
          valid: true,
          explanation: "Certificate found in Offline Demo chain.",
          mode: "offline",
        }
      : {
          valid: false,
          explanation: "Certificate not found in Offline Demo chain.",
          mode: "offline",
        },
  };
}

function offlineChain() {
  const chainData = loadOfflineChain();
  return { status: 200, data: chainData };
}

async function postJson(path, payload) {
  if (getMode() === "offline") {
    if (path === "/issue") return offlineIssue(payload.certificate);
    if (path === "/verify") return offlineVerify(payload.certificate);
  }

  setApiStatus("API: Request in progress...");
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  setApiStatus(response.ok ? "API: Connected" : "API: Response error");
  return { status: response.status, data };
}

async function getJson(path) {
  if (getMode() === "offline") {
    if (path === "/chain") return offlineChain();
  }

  setApiStatus("API: Request in progress...");
  const response = await fetch(`${getBaseUrl()}${path}`);
  const data = await response.json();
  setApiStatus(response.ok ? "API: Connected" : "API: Response error");
  return { status: response.status, data };
}

function renderChainStats(chainData) {
  chainLength.textContent = String(chainData.length ?? "-");
  chainValid.textContent = chainData.is_valid ? "Healthy" : "Tampered";
  pendingCount.textContent = String((chainData.pending_certificates || []).length);
}

function updateAiInsights(verificationData, certificateText) {
  const valid = Boolean(verificationData.valid);
  const length = certificateText.trim().length;
  const hasEnoughDetail = length >= 20;
  const confidence = valid ? (hasEnoughDetail ? 94 : 86) : (hasEnoughDetail ? 74 : 63);
  const risk = valid ? (hasEnoughDetail ? "Low" : "Medium") : "High";

  aiSummary.textContent = valid
    ? "AI assessment: Certificate pattern is consistent with recorded blockchain entry."
    : "AI assessment: Certificate does not map to a trusted blockchain record.";
  aiConfidence.textContent = `${confidence}%`;
  aiRisk.textContent = risk;

  const recommendations = valid
    ? [
        "Store the certificate hash and block index in your portal.",
        "Add issuer digital signatures for stronger proof.",
      ]
    : [
        "Re-check certificate text formatting.",
        "Confirm the issuer wrote this certificate on-chain.",
        "Escalate high-risk results for manual review.",
      ];

  aiRecommendations.innerHTML = "";
  recommendations.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    aiRecommendations.appendChild(li);
  });
}

function updateModeUi() {
  const mode = getMode();
  const offline = mode === "offline";
  baseUrlInput.disabled = offline;
  testApiBtn.disabled = offline;
  setApiStatus(offline ? "Mode: Offline Demo (No API)" : "Mode: Online API");
}

function explainSelectedSection() {
  const topic = helpTopic.value;
  const lines = HELP_CONTENT[topic] || ["No explanation available for this section yet."];
  printAssistant(`AI Help: ${topic}`, lines);
}

function suggestNextSteps() {
  const mode = getMode();
  const chainLen = Number(chainLength.textContent) || 0;
  const steps = [];

  if (mode === "offline") {
    steps.push("You are in Offline Demo mode. Issue 1-2 certificates to build demo data.");
    steps.push("Run verification on one valid and one invalid sample to show full flow.");
    steps.push("Switch to Online mode when backend is ready for real verification.");
  } else {
    steps.push("Run Test Connection to confirm backend accessibility.");
    steps.push("Issue a certificate, then verify the same text to confirm success path.");
    steps.push("Verify a modified/fake version to validate rejection behavior.");
  }

  if (chainLen <= 1) {
    steps.push("Your chain is still near genesis. Add sample records for realistic testing.");
  }

  steps.push("For production: add signatures, auth, and persistent storage.");
  printAssistant("AI Help: Recommended Next Steps", steps);
}

async function refreshChain() {
  try {
    const result = await getJson("/chain");
    renderChainStats(result.data);
    printResult(`Chain Response (HTTP ${result.status})`, result.data);
  } catch (err) {
    setApiStatus("API: Offline / Unreachable");
    printResult("Chain Error", { error: String(err) });
  }
}

async function testApiConnection() {
  if (getMode() === "offline") {
    printResult("API Connection Test", {
      status: "skipped",
      message: "Offline Demo mode is active. No backend call needed.",
    });
    return;
  }

  try {
    setLoading(testApiBtn, true, "Test Connection");
    const result = await getJson("/chain");
    renderChainStats(result.data);
    printResult(`API Connection Test (HTTP ${result.status})`, {
      status: "ok",
      baseUrl: getBaseUrl(),
      chainLength: result.data.length,
      isValid: result.data.is_valid,
    });
  } catch (err) {
    setApiStatus("API: Offline / Unreachable");
    printResult("API Connection Test", {
      status: "failed",
      baseUrl: getBaseUrl(),
      error: String(err),
    });
  } finally {
    setLoading(testApiBtn, false, "Test Connection");
  }
}

issueBtn.addEventListener("click", async () => {
  const certificate = issueText.value;
  if (!certificate.trim()) {
    printResult("Issue Error", { error: "Certificate text is required." });
    return;
  }

  try {
    setLoading(issueBtn, true, "Issue Certificate");
    const result = await postJson("/issue", { certificate });
    printResult(`Issue Response (HTTP ${result.status})`, result.data);
    await refreshChain();
  } catch (err) {
    setApiStatus("API: Offline / Unreachable");
    printResult("Issue Error", { error: String(err) });
  } finally {
    setLoading(issueBtn, false, "Issue Certificate");
  }
});

verifyBtn.addEventListener("click", async () => {
  const certificate = verifyText.value;
  if (!certificate.trim()) {
    printResult("Verify Error", { error: "Certificate text is required." });
    return;
  }

  try {
    setLoading(verifyBtn, true, "Run Verification + AI Analysis");
    const result = await postJson("/verify", { certificate });
    printResult(`Verify Response (HTTP ${result.status})`, result.data);
    updateAiInsights(result.data, certificate);
  } catch (err) {
    setApiStatus("API: Offline / Unreachable");
    printResult("Verify Error", { error: String(err) });
  } finally {
    setLoading(verifyBtn, false, "Run Verification + AI Analysis");
  }
});

refreshChainBtn.addEventListener("click", refreshChain);
testApiBtn.addEventListener("click", testApiConnection);

saveApiBtn.addEventListener("click", () => {
  const url = getBaseUrl();
  if (!url) {
    printResult("API Settings", { error: "Please enter a valid backend URL." });
    return;
  }
  saveBaseUrl(url);
  saveMode(getMode());
  setApiStatus("Settings saved");
  printResult("API Settings", {
    message: "Settings saved.",
    baseUrl: url,
    mode: getMode(),
  });
});

resetApiBtn.addEventListener("click", () => {
  baseUrlInput.value = DEFAULT_BASE_URL;
  modeSelect.value = "online";
  saveBaseUrl(DEFAULT_BASE_URL);
  saveMode("online");
  updateModeUi();
  printResult("API Settings", {
    message: "Settings reset to default.",
    baseUrl: DEFAULT_BASE_URL,
    mode: "online",
  });
});

modeSelect.addEventListener("change", async () => {
  saveMode(getMode());
  updateModeUi();
  await refreshChain();
});

askExplainBtn.addEventListener("click", explainSelectedSection);
askNextBtn.addEventListener("click", suggestNextSteps);

baseUrlInput.value = loadBaseUrl();
modeSelect.value = loadMode();
updateModeUi();
refreshChain();
explainSelectedSection();
