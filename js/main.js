(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var EN = window.I18N_EN || {};
  var currentLang = "tr";

  /* ---------- Dil (TR / EN) ---------- */
  var textNodes = document.querySelectorAll("[data-i18n]");
  var attrNodes = document.querySelectorAll("[data-i18n-attr]");
  var TR = Object.assign({}, window.I18N_TR_EXTRA || {});
  textNodes.forEach(function (el) { TR[el.dataset.i18n] = el.textContent; });
  function attrPairs(el) {
    return el.dataset.i18nAttr.split(",").map(function (p) { return p.split(":"); });
  }
  attrNodes.forEach(function (el) {
    attrPairs(el).forEach(function (p) { TR[p[1]] = el.getAttribute(p[0]); });
  });
  var titles = { tr: document.title, en: "Ece Ünsal, PT | Home and Online Physiotherapy in Isparta" };

  function t(key) { var d = currentLang === "en" ? EN : TR; return d[key] != null ? d[key] : TR[key]; }

  function setLang(lang) {
    currentLang = lang;
    textNodes.forEach(function (el) { var v = t(el.dataset.i18n); if (v != null) el.textContent = v; });
    attrNodes.forEach(function (el) {
      attrPairs(el).forEach(function (p) { var v = t(p[1]); if (v != null) el.setAttribute(p[0], v); });
    });
    var frame = document.querySelector("#calendar iframe");
    if (frame) frame.title = t("a.calendar");
    root.lang = lang;
    document.title = titles[lang];
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });
    try { localStorage.setItem("lang", lang); } catch (e) {}
  }
  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.lang); });
  });
  var saved = null;
  try { saved = localStorage.getItem("lang"); } catch (e) {}
  if (saved === "en") setLang("en");
  root.classList.remove("lang-pending");

  /* ---------- Mobil menü ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  function isOpen() { return links.classList.contains("is-open"); }
  function closeMenu(returnFocus) {
    if (!isOpen()) return;
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    if (returnFocus) toggle.focus();
  }
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    if (open) links.querySelector("a").focus();
  });
  links.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { closeMenu(false); }); });
  document.addEventListener("click", function (e) {
    if (isOpen() && !links.contains(e.target) && !toggle.contains(e.target)) closeMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu(true);
  });

  /* ---------- Kaydırınca menü gölgesi ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() { nav.classList.toggle("is-scrolled", window.scrollY > 10); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Görünme animasyonu ---------- */
  var reveals = document.querySelectorAll(".reveal");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }
  window.addEventListener("beforeprint", function () {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  });

  /* ---------- Sertifika lightbox (<dialog>) ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = lb.querySelector("img");
  document.querySelectorAll(".cert[data-full]").forEach(function (b) {
    b.addEventListener("click", function () {
      lbImg.src = b.dataset.full;
      lbImg.alt = b.querySelector("strong").textContent + " – " + b.querySelector(".cert__meta").textContent;
      if (typeof lb.showModal === "function") lb.showModal(); else window.open(b.dataset.full, "_blank");
    });
  });
  lb.querySelector(".lightbox__close").addEventListener("click", function () { lb.close(); });
  lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener("close", function () { lbImg.removeAttribute("src"); });

  /* ---------- Google Takvim randevu ---------- */
  var booking = document.getElementById("randevu");
  var calUrl = (booking.dataset.calendarUrl || "").trim();
  if (/^https:\/\/calendar\.google\.com\//.test(calUrl)) {
    var cal = document.getElementById("calendar");
    var frame = document.createElement("iframe");
    frame.title = t("a.calendar");
    frame.className = "is-loading";
    frame.addEventListener("load", function () {
      frame.classList.remove("is-loading");
      var ph = cal.querySelector(".booking__placeholder");
      if (ph) ph.remove();
    });
    frame.src = calUrl;
    cal.appendChild(frame);
  }
})();
