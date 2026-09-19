(() => {
  const KB = window.PROPDESK_KB;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const state = {
    firmId: localStorage.getItem("pd_firm") || "ftmo",
    email: localStorage.getItem("pd_email") || "",
    accountId: localStorage.getItem("pd_account") || "",
    chats: JSON.parse(localStorage.getItem("pd_chats") || "[]"),
    activeId: null,
    pendingFiles: [],
    sending: false,
  };

  const els = {
    firm: $("#firmSelect"),
    email: $("#userEmail"),
    account: $("#accountId"),
    history: $("#historyList"),
    thread: $("#threadInner"),
    empty: $("#emptyState"),
    input: $("#composerInput"),
    send: $("#sendBtn"),
    attach: $("#attachInput"),
    attachRow: $("#attachRow"),
    overlay: $("#profileOverlay"),
    toast: $("#toast"),
    modelName: $("#modelName"),
    sidebar: $("#sidebar"),
  };

  function firm() {
    return KB.firms[state.firmId] || KB.firms.ftmo;
  }

  function persistProfile() {
    localStorage.setItem("pd_firm", state.firmId);
    localStorage.setItem("pd_email", state.email);
    localStorage.setItem("pd_account", state.accountId);
  }

  function persistChats() {
    localStorage.setItem("pd_chats", JSON.stringify(state.chats.slice(0, 40)));
  }

  function uid() {
    return Math.random().toString(36).slice(2, 10);
  }

  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    setTimeout(() => els.toast.classList.remove("show"), 2400);
  }

  function initials(email) {
    const base = (email || "T").trim()[0] || "T";
    return base.toUpperCase();
  }

  function renderProfile() {
    els.firm.value = state.firmId;
    els.email.value = state.email;
    els.account.value = state.accountId;
    $("#userLabel").textContent = state.email || "Trader";
    $("#userSub").textContent = state.accountId ? `Acct ${state.accountId}` : "Add email & account ID";
    $("#userAv").textContent = initials(state.email);
    const f = firm();
    els.modelName.textContent = `${f.short} specialist`;
    $("#firmDot").style.background = f.color;
    const emptyH = els.empty && els.empty.querySelector("h2");
    if (emptyH) emptyH.textContent = `How can I help with ${f.name}?`;
  }

  function renderHistory() {
    els.history.innerHTML = "";
    if (!state.chats.length) {
      els.history.innerHTML = `<div class="hist-item"><span>No tickets yet</span></div>`;
      return;
    }
    state.chats.forEach((c) => {
      const d = document.createElement("div");
      d.className = "hist-item" + (c.id === state.activeId ? " active" : "");
      d.innerHTML = `<span>${escapeHtml(c.title)}</span>`;
      d.onclick = () => openChat(c.id);
      els.history.appendChild(d);
    });
  }

  function currentChat() {
    return state.chats.find((c) => c.id === state.activeId);
  }

  function newChat() {
    const chat = {
      id: uid(),
      title: "New ticket",
      firmId: state.firmId,
      createdAt: Date.now(),
      messages: [],
    };
    state.chats.unshift(chat);
    state.activeId = chat.id;
    persistChats();
    renderHistory();
    renderThread();
    els.input.focus();
  }

  function openChat(id) {
    state.activeId = id;
    renderHistory();
    renderThread();
  }

  function renderThread() {
    const chat = currentChat();
    $$(".msg", els.thread).forEach((n) => n.remove());
    if (!chat || !chat.messages.length) {
      els.empty.style.display = "flex";
      const f = firm();
      const emptyH = els.empty.querySelector("h2");
      if (emptyH) emptyH.textContent = `How can I help with ${f.name}?`;
      return;
    }
    els.empty.style.display = "none";
    chat.messages.forEach((m) => els.thread.appendChild(renderMsg(m)));
    els.thread.parentElement.scrollTop = els.thread.parentElement.scrollHeight;
  }

  function renderMsg(m) {
    const wrap = document.createElement("div");
    wrap.className = "msg";
    const av = document.createElement("div");
    av.className = m.role === "user" ? "av-user" : "av-bot";
    av.textContent = m.role === "user" ? initials(state.email) : "P";
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = `<div class="who">${m.role === "user" ? "You" : "PropDesk"}</div>
      <div class="body">${formatBody(m.content)}</div>`;
    if (m.files && m.files.length) {
      const row = document.createElement("div");
      row.className = "meta-row";
      m.files.forEach((f) => {
        const c = document.createElement("span");
        c.className = "chip";
        c.textContent = "📎 " + f.name;
        row.appendChild(c);
      });
      bubble.appendChild(row);
    }
    if (m.chips) {
      const row = document.createElement("div");
      row.className = "meta-row";
      m.chips.forEach((ch) => {
        const c = document.createElement("span");
        c.className = "chip " + (ch.tone || "");
        c.textContent = ch.text;
        row.appendChild(c);
      });
      bubble.appendChild(row);
    }
    if (m.caseDraft) bubble.appendChild(renderCase(m.caseDraft));
    wrap.append(av, bubble);
    return wrap;
  }

  function renderCase(draft) {
    const card = document.createElement("div");
    card.className = "case-card";
    card.innerHTML = `<h4>Escalation case — ready to send</h4>
      <pre>${escapeHtml(draft.body)}</pre>
      <div class="case-actions"></div>`;
    const actions = card.querySelector(".case-actions");
    const mail = document.createElement("button");
    mail.className = "btn btn-primary";
    mail.textContent = `Email ${draft.firmName} support`;
    mail.onclick = () => sendCase(draft);
    const copy = document.createElement("button");
    copy.className = "btn btn-secondary";
    copy.textContent = "Copy case";
    copy.onclick = async () => {
      await navigator.clipboard.writeText(draft.body);
      toast("Case copied");
    };
    const dl = document.createElement("button");
    dl.className = "btn btn-secondary";
    dl.textContent = "Download .txt";
    dl.onclick = () => downloadTxt(draft);
    actions.append(mail, copy, dl);
    return card;
  }

  function formatBody(text) {
    return escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[(.+?)\]\((https?:\/\/.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function scoreTopic(q, topic) {
    const t = q.toLowerCase();
    let score = 0;
    topic.tags.forEach((tag) => {
      if (t.includes(tag)) score += tag.length > 8 ? 3 : 2;
    });
    topic.title.toLowerCase().split(" ").forEach((w) => {
      if (w.length > 3 && t.includes(w)) score += 1;
    });
    return score;
  }

  function classify(q, hasFiles) {
    const t = q.toLowerCase();
    const escalateHit = KB.escalateSignals.some((s) => t.includes(s));
    const selfHit = KB.notFirmFaultSignals.some((s) => t.includes(s));
    const scores = KB.topics
      .map((topic) => ({ topic, score: scoreTopic(t, topic) }))
      .sort((a, b) => b.score - a.score);
    const best = scores[0].score >= 2 ? scores[0].topic : null;
    let intent = "faq";
    if (escalateHit && hasFiles && !selfHit) intent = "escalate";
    else if (escalateHit && !hasFiles) intent = "need_evidence";
    else if (best) intent = "faq";
    else intent = "clarify";
    return { intent, topic: best, escalateHit, selfHit };
  }

  function needsProfile() {
    return !state.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email);
  }

  function buildCase(userText, files) {
    const f = firm();
    const id = "PD-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + uid().slice(0, 4).toUpperCase();
    const fileList = files.length
      ? files.map((x, i) => `  ${i + 1}. ${x.name} (${Math.round(x.size / 1024)} KB)`).join("\n")
      : "  (trader will attach screenshots to the email)";
    const body = `SUBJECT: Formal review request — ${f.name} account ${state.accountId || "[missing]"} [${id}]

To: ${f.supportEmail}
From / reply-to: ${state.email}
CC: ${state.email}

Hello ${f.name} Support,

This case was compiled by PropDesk, an independent trader support desk. The trader believes the issue is on the firm side and has provided evidence. Please reply directly to the trader at ${state.email}.

CASE ID: ${id}
FIRM: ${f.name}
TRADER EMAIL: ${state.email}
ACCOUNT / LOGIN: ${state.accountId || "Not provided — trader to confirm"}
DATE OPENED: ${new Date().toUTCString()}

ISSUE AS DESCRIBED BY THE TRADER
${userText.trim()}

EVIDENCE ATTACHED
${fileList}

WHAT WE ARE ASKING
1. Confirm the exact rule clause (quote the current terms) that applies.
2. Reconcile dashboard figures against the attached statement / screenshots.
3. If a payout was already approved, provide the processor reference and ETA.
4. If an operational error is confirmed, state the remedy (restore account, honor payout, or refund).

Please keep the trader copied on all replies.

Regards,
PropDesk on behalf of ${state.email}
${id}
`;
    return {
      id,
      to: f.supportEmail,
      firmName: f.name,
      subject: `Formal review request — ${f.name} account ${state.accountId || "unknown"} [${id}]`,
      body,
    };
  }

  function downloadTxt(draft) {
    const blob = new Blob([draft.body], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${draft.id}.txt`;
    a.click();
  }

  function sendCase(draft) {
    const log = JSON.parse(localStorage.getItem("pd_sent") || "[]");
    log.unshift({ ...draft, sentAt: Date.now(), email: state.email });
    localStorage.setItem("pd_sent", JSON.stringify(log.slice(0, 50)));
    const mailto = `mailto:${encodeURIComponent(draft.to)}?cc=${encodeURIComponent(state.email)}&subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
    if (window.PROPDESK_MAIL_ENDPOINT) {
      fetch(window.PROPDESK_MAIL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: draft.to, cc: state.email, subject: draft.subject, text: draft.body, caseId: draft.id }),
      })
        .then((r) => {
          if (!r.ok) throw new Error("mail endpoint failed");
          toast("Case emailed to " + draft.firmName);
        })
        .catch(() => {
          window.location.href = mailto;
          toast("Opened email draft — attach files before sending");
        });
    } else {
      window.location.href = mailto;
      toast("Opened email draft — attach your screenshots before sending");
    }
  }

  async function think(userText, files) {
    const f = firm();
    const { intent, topic, selfHit } = classify(userText, files.length > 0);
    if (window.PROPDESK_AI && typeof window.PROPDESK_AI.complete === "function") {
      try {
        const out = await window.PROPDESK_AI.complete({
          system: systemPrompt(f),
          user: userText,
          firm: f,
          files: files.map((x) => x.name),
        });
        if (out && out.text) return out;
      } catch (err) {
        console.warn("AI hook failed, using FAQ engine", err);
      }
    }
    if (intent === "escalate") {
      const draft = buildCase(userText, files);
      return {
        text:
          `I treated this as a firm-side issue because you described an operational failure and attached evidence.\n\n` +
          `I will not argue trading performance. I compiled a case for ${f.name} support (${f.supportEmail}) with your email as the reply-to so they talk to you, not to this desk.\n\n` +
          `Review the draft below. Send it only if the facts are accurate. Attach the same files to the email — mailbox drafts cannot carry browser uploads automatically.\n\n` +
          KB.disclaimer,
        chips: [
          { text: "Firm-fault path", tone: "bad" },
          { text: draft.id, tone: "warn" },
          { text: files.length + " file(s)", tone: "ok" },
        ],
        caseDraft: draft,
      };
    }
    if (intent === "need_evidence") {
      return {
        text:
          `This sounds like it could be on ${f.name} — but I will not email them without evidence. Empty accusations get ignored and can flag your profile.\n\n` +
          `Attach at least two of:\n` +
          `• Dashboard screenshot showing the rule / payout status\n` +
          `• Account statement or trade list with server timestamps\n` +
          `• Denial / breach email with the exact wording\n` +
          `• Payment receipt if this is a double charge or missing account\n\n` +
          `Also confirm your email and account ID in the left panel so the case has a reply path.\n\n` +
          `Then resend the same description. If the facts hold, I will compile and open an email to ${f.supportEmail}.`,
        chips: [
          { text: "Evidence required", tone: "warn" },
          { text: f.short, tone: "" },
        ],
      };
    }
    if (topic) {
      let extra = "";
      if (selfHit) {
        extra =
          "\n\nFrom what you wrote, this looks like a rule you triggered — not a back-office error. I can still explain the rule and the cleanest next step. I will not email the firm just to relitigate a loss.";
      }
      return {
        text: topic.answer(f) + extra + "\n\n" + KB.disclaimer,
        chips: [
          { text: topic.title, tone: "ok" },
          { text: f.short, tone: "" },
        ],
      };
    }
    return {
      text:
        `I can resolve most ${f.name} questions from the published rule patterns: targets, daily/max loss, consistency, news, EAs, KYC, payouts, resets, and platform errors.\n\n` +
        `Tell me the plan name (e.g. Stellar 2-Step, $100k Challenge, 50k PA) and what happened, in this shape:\n` +
        `1. What you expected\n` +
        `2. What the dashboard / email actually says\n` +
        `3. Dates and account ID\n\n` +
        `If this is ${f.name}'s operational fault, attach screenshots. I only escalate when there is evidence.\n\n` +
        KB.disclaimer,
      chips: [{ text: "Need a bit more", tone: "warn" }],
    };
  }

  function systemPrompt(f) {
    return `You are PropDesk, an independent support agent for prop-firm traders.
Firm in this ticket: ${f.name}. Support inbox: ${f.supportEmail}.
Use only documented program patterns. Do not give trade signals.
Resolve FAQ issues yourself. Escalate to the firm by compiling a factual case ONLY when the trader shows evidence of firm-side operational fault (wrong calc vs dashboard, approved payout past SLA, outage-caused breach, fee with no account, rule not in terms).
Never escalate normal rule breaches, consistency parks, early payout requests, or incomplete KYC.
Reply-to must be the trader email. Be direct, calm, specific.`;
  }

  async function handleSend(textFromSuggest) {
    const text = (textFromSuggest || els.input.value || "").trim();
    if (!text || state.sending) return;
    if (!currentChat()) newChat();
    const chat = currentChat();
    const files = state.pendingFiles.map((f) => ({ name: f.name, size: f.size, type: f.type }));
    chat.messages.push({ role: "user", content: text, files, ts: Date.now() });
    if (chat.title === "New ticket") chat.title = text.slice(0, 42);
    chat.firmId = state.firmId;
    els.input.value = "";
    autoGrow();
    state.pendingFiles = [];
    renderAttach();
    persistChats();
    renderHistory();
    renderThread();
    if (needsProfile() && classify(text, files.length > 0).intent === "escalate") {
      openProfile(true);
    }
    state.sending = true;
    els.send.disabled = true;
    const typing = document.createElement("div");
    typing.className = "msg";
    typing.id = "typingRow";
    typing.innerHTML = `<div class="av-bot">P</div><div class="bubble"><div class="who">PropDesk</div><div class="typing"><i></i><i></i><i></i></div></div>`;
    els.empty.style.display = "none";
    els.thread.appendChild(typing);
    els.thread.parentElement.scrollTop = els.thread.parentElement.scrollHeight;
    await new Promise((r) => setTimeout(r, 450 + Math.min(1200, text.length * 8)));
    const reply = await think(text, files);
    typing.remove();
    chat.messages.push({
      role: "assistant",
      content: reply.text,
      chips: reply.chips,
      caseDraft: reply.caseDraft || null,
      ts: Date.now(),
    });
    persistChats();
    renderThread();
    state.sending = false;
    els.send.disabled = false;
    els.input.focus();
  }

  function renderAttach() {
    els.attachRow.innerHTML = "";
    state.pendingFiles.forEach((f, i) => {
      const p = document.createElement("span");
      p.className = "file-pill";
      p.innerHTML = `${escapeHtml(f.name)} <button type="button">✕</button>`;
      p.querySelector("button").onclick = () => {
        state.pendingFiles.splice(i, 1);
        renderAttach();
      };
      els.attachRow.appendChild(p);
    });
  }

  function autoGrow() {
    const el = els.input;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
    els.send.disabled = !el.value.trim() && !state.pendingFiles.length;
  }

  function openProfile(force) {
    $("#profEmail").value = state.email;
    $("#profAccount").value = state.accountId;
    $("#profNote").textContent = force
      ? "Add a real email before I send anything to the firm. They need a reply path."
      : "Used as reply-to on every escalation email.";
    els.overlay.classList.add("show");
  }

  function populateFirms() {
    els.firm.innerHTML = "";
    Object.values(KB.firms).forEach((f) => {
      const o = document.createElement("option");
      o.value = f.id;
      o.textContent = f.name;
      els.firm.appendChild(o);
    });
  }

  function wire() {
    populateFirms();
    renderProfile();
    renderHistory();
    renderThread();
    autoGrow();
    els.firm.onchange = () => {
      state.firmId = els.firm.value;
      persistProfile();
      renderProfile();
      toast(firm().name + " selected");
    };
    els.email.oninput = () => {
      state.email = els.email.value.trim();
      persistProfile();
      renderProfile();
    };
    els.account.oninput = () => {
      state.accountId = els.account.value.trim();
      persistProfile();
      renderProfile();
    };
    $("#newChatBtn").onclick = newChat;
    $("#menuBtn").onclick = () => els.sidebar.classList.toggle("open");
    $("#userChip").onclick = () => openProfile(false);
    $("#saveProfile").onclick = () => {
      state.email = $("#profEmail").value.trim();
      state.accountId = $("#profAccount").value.trim();
      persistProfile();
      renderProfile();
      els.overlay.classList.remove("show");
    };
    $("#cancelProfile").onclick = () => els.overlay.classList.remove("show");
    els.overlay.addEventListener("click", (e) => {
      if (e.target === els.overlay) els.overlay.classList.remove("show");
    });
    els.input.addEventListener("input", autoGrow);
    els.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
    els.send.onclick = () => handleSend();
    $("#attachBtn").onclick = () => els.attach.click();
    els.attach.onchange = () => {
      state.pendingFiles = state.pendingFiles.concat([...els.attach.files]);
      els.attach.value = "";
      renderAttach();
    };
    $$("[data-suggest]").forEach((b) => {
      b.onclick = () => handleSend(b.getAttribute("data-suggest"));
    });
    if (state.chats.length) {
      state.activeId = state.chats[0].id;
      renderHistory();
      renderThread();
    }
  }

  wire();
})();
