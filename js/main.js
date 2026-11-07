(function () {
  document.documentElement.classList.add("js");

  /* ---------- Dil (TR / EN) ---------- */
  var nodes = document.querySelectorAll("[data-i18n]");
  var tr = {};
  nodes.forEach(function (el) { tr[el.dataset.i18n] = el.textContent; });
  var meta = {
    tr: { title: document.title, nav: "Menü", prev: "Önceki", next: "Sonraki", close: "Kapat" },
    en: { title: "Ece Ünsal, PT | Physiotherapist in Isparta · Home & Online", nav: "Menu", prev: "Previous", next: "Next", close: "Close" }
  };

  function setLang(lang) {
    var dict = lang === "en" ? window.I18N_EN || {} : tr;
    nodes.forEach(function (el) {
      var v = dict[el.dataset.i18n];
      if (v != null) el.textContent = v;
    });
    document.documentElement.lang = lang;
    document.title = meta[lang].title;
    document.getElementById("navToggle").setAttribute("aria-label", meta[lang].nav);
    document.querySelector('.slider__btn[data-dir="-1"]').setAttribute("aria-label", meta[lang].prev);
    document.querySelector('.slider__btn[data-dir="1"]').setAttribute("aria-label", meta[lang].next);
    document.querySelector(".lightbox__close").setAttribute("aria-label", meta[lang].close);
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

  /* ---------- Mobil menü ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  function closeMenu() { links.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });

  /* ---------- Kaydırınca menü gölgesi ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() { nav.classList.toggle("is-scrolled", window.scrollY > 10); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Görünme animasyonu ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Sertifika lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = lb.querySelector("img");
  var lastFocus = null;
  function openLb(src) {
    lastFocus = document.activeElement;
    lbImg.src = src;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    lb.querySelector(".lightbox__close").focus();
  }
  function closeLb() {
    lb.hidden = true;
    lbImg.src = "";
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll(".cert[data-full]").forEach(function (b) {
    b.addEventListener("click", function () { openLb(b.dataset.full); });
  });
  lb.addEventListener("click", function (e) { if (e.target !== lbImg) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { if (!lb.hidden) closeLb(); closeMenu(); }
  });

  /* ---------- Yorum kaydırıcı ---------- */
  var slider = document.getElementById("slider");
  var track = slider.querySelector(".slider__track");
  var slides = track.children;
  var dotsWrap = slider.querySelector(".slider__dots");
  var current = 0, timer = null;
  for (var i = 0; i < slides.length; i++) {
    var d = document.createElement("button");
    d.type = "button";
    d.setAttribute("role", "tab");
    d.setAttribute("aria-label", String(i + 1));
    d.addEventListener("click", (function (n) { return function () { go(n); restart(); }; })(i));
    dotsWrap.appendChild(d);
  }
  function go(n) {
    current = (n + slides.length) % slides.length;
    track.style.transform = "translateX(" + (-100 * current) + "%)";
    dotsWrap.querySelectorAll("button").forEach(function (b, idx) {
      b.setAttribute("aria-selected", String(idx === current));
    });
  }
  function restart() {
    clearInterval(timer);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timer = setInterval(function () { go(current + 1); }, 7000);
    }
  }
  slider.querySelectorAll(".slider__btn").forEach(function (b) {
    b.addEventListener("click", function () { go(current + Number(b.dataset.dir)); restart(); });
  });
  var startX = null;
  track.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend", function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { go(current + (dx < 0 ? 1 : -1)); restart(); }
    startX = null;
  });
  go(0);
  restart();

  /* ---------- Google Takvim randevu ---------- */
  var booking = document.getElementById("randevu");
  var calUrl = (booking.dataset.calendarUrl || "").trim();
  if (/^https:\/\/calendar\.google\.com\//.test(calUrl)) {
    var frame = document.createElement("iframe");
    frame.src = calUrl;
    frame.title = "Randevu takvimi";
    frame.loading = "lazy";
    var cal = document.getElementById("calendar");
    cal.innerHTML = "";
    cal.appendChild(frame);
  }
})();
