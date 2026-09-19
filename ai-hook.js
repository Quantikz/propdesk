/* Live model client. Keys stay in the phone browser (localStorage). */
window.PROPDESK_AI = {
  presets: {
    groq: {
      label: "Groq (free, fast)",
      base: "https://api.groq.com/openai/v1",
      model: "llama-3.3-70b-versatile",
    },
    openrouter: {
      label: "OpenRouter",
      base: "https://openrouter.ai/api/v1",
      model: "openai/gpt-4o-mini",
    },
    openai: {
      label: "OpenAI",
      base: "https://api.openai.com/v1",
      model: "gpt-4o-mini",
    },
  },

  settings() {
    const provider = localStorage.getItem("PROPDESK_PROVIDER") || "groq";
    const preset = this.presets[provider] || this.presets.groq;
    return {
      provider,
      key: localStorage.getItem("PROPDESK_OPENAI_KEY") || "",
      base: localStorage.getItem("PROPDESK_BASE") || preset.base,
      model: localStorage.getItem("PROPDESK_MODEL") || preset.model,
    };
  },

  async complete({ system, messages }) {
    const s = this.settings();
    if (!s.key) return null;

    const url = s.base.replace(/\/$/, "") + "/chat/completions";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + s.key,
      },
      body: JSON.stringify({
        model: s.model,
        temperature: 0.3,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error("AI " + res.status + " " + err.slice(0, 180));
    }
    const data = await res.json();
    return { text: data.choices[0].message.content };
  },
};
