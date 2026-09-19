(() => {
  const $ = (id) => document.getElementById(id);
  function openAI() {
    const overlay = $("aiOverlay");
    if (!overlay) return;
    const s = window.PROPDESK_AI && window.PROPDESK_AI.settings && window.PROPDESK_AI.settings();
    if (s) {
      if ($("aiProvider")) $("aiProvider").value = s.provider || "groq";
      if ($("aiKey")) $("aiKey").value = s.key || "";
      if ($("aiModel")) $("aiModel").value = s.model || "";
    }
    overlay.classList.add("show");
  }
  function saveAI() {
    const provider = ($("aiProvider") && $("aiProvider").value) || "groq";
    const preset = window.PROPDESK_AI && window.PROPDESK_AI.presets && window.PROPDESK_AI.presets[provider];
    const key = ($("aiKey") && $("aiKey").value.trim()) || "";
    const model = ($("aiModel") && $("aiModel").value.trim()) || (preset && preset.model) || "qwen/qwen3.8-27b";
    localStorage.setItem("PROPDESK_PROVIDER", provider);
    localStorage.setItem("PROPDESK_OPENAI_KEY", key);
    localStorage.setItem("PROPDESK_MODEL", model);
    if (preset) localStorage.setItem("PROPDESK_BASE", preset.base);
    if ($("aiOverlay")) $("aiOverlay").classList.remove("show");
  }
  const aiBtn = $("aiSettingsBtn");
  if (aiBtn) aiBtn.onclick = openAI;
  const cancel = $("cancelAI");
  if (cancel) cancel.onclick = () => $("aiOverlay") && $("aiOverlay").classList.remove("show");
  const save = $("saveAI");
  if (save) save.onclick = saveAI;
  const overlay = $("aiOverlay");
  if (overlay) overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("show");
  });
  window.pdOpenAI = openAI;
  window.pdSaveAI = saveAI;
})();
