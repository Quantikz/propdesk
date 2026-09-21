(() => {
  const site = document.getElementById("site");
  const desk = document.getElementById("desk");
  const pages = {
    home: document.getElementById("page-home"),
    firms: document.getElementById("page-firms"),
    how: document.getElementById("page-how"),
  };
  function path() {
    const raw = (location.hash || "#/").replace(/^#/, "");
    return raw.startsWith("/") ? raw : "/" + raw;
  }
  function show(name) {
    Object.entries(pages).forEach(([k, el]) => {
      if (el) el.hidden = k !== name;
    });
    document.querySelectorAll(".site-links a[data-nav]").forEach((a) => {
      a.classList.toggle("on", a.getAttribute("data-nav") === name);
    });
  }
  function route() {
    const p = path();
    const onDesk = p === "/desk" || p.startsWith("/desk/");
    if (site) site.hidden = onDesk;
    if (desk) desk.hidden = !onDesk;
    document.body.style.overflow = onDesk ? "hidden" : "auto";
    if (onDesk) return;
    if (p.startsWith("/firms")) show("firms");
    else if (p.startsWith("/how")) show("how");
    else show("home");
    window.scrollTo(0, 0);
  }
  function renderFirms() {
    const grid = document.getElementById("firmGrid");
    const KB = window.PROPDESK_KB;
    if (!grid || !KB) return;
    grid.innerHTML = "";
    Object.values(KB.firms).forEach((f) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "firm-card";
      b.innerHTML = `<div class="row"><span class="firm-dot" style="background:${f.color}"></span><h3>${f.name}</h3></div>
        <small>${f.models[0]} · ${f.profitSplit}</small>
        <small>${f.drawdown}</small>`;
      b.onclick = () => {
        localStorage.setItem("pd_firm", f.id);
        location.hash = "#/desk";
        location.reload();
      };
      grid.appendChild(b);
    });
  }
  window.addEventListener("hashchange", route);
  if (!location.hash) location.hash = "#/";
  renderFirms();
  route();
})();
