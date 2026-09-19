/* Optional live-model hook.
   Leave this file as-is to run on the built-in FAQ engine.
   To plug a real model later, either:

   1) Set localStorage.PROPDESK_OPENAI_KEY and uncomment the fetch below, or
   2) Point window.PROPDESK_AI_ENDPOINT at your own backend that accepts
      { system, user, firm } and returns { text }.

   Escalation email backend (optional):
     window.PROPDESK_MAIL_ENDPOINT = "/api/send-case";
*/

window.PROPDESK_AI = {
  async complete({ system, user, firm, files }) {
    const endpoint = window.PROPDESK_AI_ENDPOINT || localStorage.getItem("PROPDESK_AI_ENDPOINT");
    const key = localStorage.getItem("PROPDESK_OPENAI_KEY");

    if (endpoint) {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system, user, firm, files }),
      });
      if (!res.ok) throw new Error("AI endpoint " + res.status);
      return res.json();
    }

    if (key) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + key,
        },
        body: JSON.stringify({
          model: localStorage.getItem("PROPDESK_MODEL") || "gpt-4o-mini",
          temperature: 0.2,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user + (files && files.length ? "\n\nAttached: " + files.join(", ") : "") },
          ],
        }),
      });
      if (!res.ok) throw new Error("OpenAI " + res.status);
      const data = await res.json();
      return { text: data.choices[0].message.content };
    }

    return null;
  },
};
