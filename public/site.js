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
  window.addEventListener("hashchange", route);
  if (!location.hash) location.hash = "#/";
  route();
})();
