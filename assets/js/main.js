/* =========================================================
   TITIK FIKSI — Main Controller
   File: assets/js/main.js

   Fungsi:
   - Load data dari JSON (content/*)
   - Isi otomatis halaman Home / Works / Writings
   - Isi tombol sosial + platform otomatis (jika link ada)
   ========================================================= */

const TitikFiksi = (() => {

  const PATHS = {
    settings: "content/settings/settings_general.json",
    home: "content/home/home.json",
    works: "content/works/works.json",
    writings: "content/writings/writings.json"
  };

  const Utils = {
    async fetchJSON(path) {
      try {
        const res = await fetch(path, { cache: "no-store" });
        if (!res.ok) throw new Error(`Gagal load JSON: ${path}`);
        return await res.json();
      } catch (err) {
        console.error(err);
        return null;
      }
    },

    setText(selector, text) {
      const el = document.querySelector(selector);
      if (!el) return;
      el.textContent = text ?? "";
    },

    setLink(selector, url) {
      const el = document.querySelector(selector);
      if (!el) return;

      if (url && String(url).trim() !== "") {
        el.href = url;
        el.style.display = "inline-flex";
      } else {
        el.style.display = "none";
      }
    },

    safeText(value, fallback = "") {
      const v = (value ?? "").toString().trim();
      return v !== "" ? v : fallback;
    },

    truncate(text, max = 160) {
      const t = (text ?? "").toString().trim();
      if (!t) return "";
      if (t.length <= max) return t;
      return t.slice(0, max) + "...";
    },

    formatDate(dateStr) {
      if (!dateStr) return "";
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        });
      } catch {
        return dateStr;
      }
    },

    getCover(coverUrl) {
      if (coverUrl && String(coverUrl).trim() !== "") return coverUrl;
      return "assets/images/defaults/cover-default.jpg";
    }
  };

  /* =========================
     Apply Settings
     ========================= */
  async function applySettings() {
    const settings = await Utils.fetchJSON(PATHS.settings);
    if (!settings) return;

    // Judul tab browser
    if (settings.site_title) {
      document.title = document.title.includes("|")
        ? document.title
        : settings.site_title;
    }

    // Meta description (optional)
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && settings.meta_description) {
      metaDesc.setAttribute("content", settings.meta_description);
    }
  }

  /* =========================
     Apply Social + Platform
     ========================= */
  async function applyGlobalLinks() {
    const home = await Utils.fetchJSON(PATHS.home);
    if (!home) return;

    // Platform buttons
    Utils.setLink(".link-wattpad", home?.platforms?.wattpad);
    Utils.setLink(".link-goodnovel", home?.platforms?.goodnovel);
    Utils.setLink(".link-kbm", home?.platforms?.kbm);
    Utils.setLink(".link-maxnovel", home?.platforms?.maxnovel);
    Utils.setLink(".link-fizzo", home?.platforms?.fizzo);
    Utils.setLink(".link-karyakarsa", home?.platforms?.karyakarsa);

    // Social buttons
    Utils.setLink(".social-ig", home?.socials?.instagram);
    Utils.setLink(".social-fb", home?.socials?.facebook);
    Utils.setLink(".social-tw", home?.socials?.twitter);
    Utils.setLink(".social-tt", home?.socials?.tiktok);
    Utils.setLink(".social-yt", home?.socials?.youtube);
  }

  /* =========================
     Home Page
     ========================= */
  async function initHomePage() {
    const heroTitle = document.getElementById("hero-title");
    if (!heroTitle) return;

    const home = await Utils.fetchJSON(PATHS.home);
    if (!home) return;

    Utils.setText("#hero-title", home?.hero?.title || "Titik Fiksi");
    Utils.setText("#hero-subtitle", home?.hero?.subtitle || "Novelis • Penulis");
    Utils.setText("#intro-text", home?.hero?.intro || "");

    // YouTube embed
    const iframe = document.getElementById("youtube-frame");
    if (iframe) {
      const yt = home?.hero?.youtube_embed || "";
      if (yt.trim() !== "") {
        iframe.src = yt;
        iframe.style.display = "block";
      } else {
        iframe.style.display = "none";
      }
    }
  }

  /* =========================
     Works Page
     ========================= */
  function buildWorkCard(work) {
    const title = Utils.safeText(work?.title, "Judul belum diisi");
    const genre = Utils.safeText(work?.genre, "Genre belum diisi");
    const status = Utils.safeText(work?.status, "Ongoing");
    const synopsis = Utils.safeText(work?.synopsis, "Sinopsis belum ditulis.");
    const cover = Utils.getCover(work?.cover);

    const slug = Utils.safeText(work?.slug, "").toLowerCase();
    const detailUrl = slug ? `pages/works/${slug}.html` : null;

    const detailBtn = detailUrl
      ? `<a class="btn btn-primary" href="${detailUrl}">📖 Detail</a>`
      : "";

    return `
      <article class="glass-card work-card">
        <div class="work-cover">
          <img src="${cover}" alt="${title}" loading="lazy" />
        </div>

        <div class="work-meta">
          <span class="badge">📌 ${genre}</span>
          <span class="badge">✅ ${status}</span>
        </div>

        <h3 class="work-title">${title}</h3>
        <p class="work-desc">${Utils.truncate(synopsis, 160)}</p>

        <div class="work-actions">
          ${detailBtn}
        </div>
      </article>
    `;
  }

  async function initWorksPage() {
    const container = document.getElementById("works-container");
    if (!container) return;

    const data = await Utils.fetchJSON(PATHS.works);
    if (!data) {
      container.innerHTML = `<div class="glass-card" style="padding:16px;">Gagal memuat karya.</div>`;
      return;
    }

    const works = data.works || [];
    if (works.length === 0) {
      container.innerHTML = `<div class="glass-card" style="padding:16px;">Belum ada karya.</div>`;
      return;
    }

    container.innerHTML = works.map(buildWorkCard).join("");
  }

  /* =========================
     Writings Page
     ========================= */
  function buildWritingCard(w) {
    const title = Utils.safeText(w?.title, "Judul belum diisi");
    const category = Utils.safeText(w?.category, "Umum");
    const date = Utils.formatDate(w?.date);
    const content = Utils.safeText(w?.content, "");

    const slug = Utils.safeText(w?.slug, "").toLowerCase();
    const detailUrl = slug ? `pages/writings/${slug}.html` : null;

    const detailBtn = detailUrl
      ? `<a class="btn btn-primary" href="${detailUrl}">📄 Baca</a>`
      : "";

    return `
      <article class="glass-card writing-card">
        <h3 class="writing-title">${title}</h3>
        <div class="writing-meta">🗂️ ${category}${date ? " • 📅 " + date : ""}</div>
        <div class="writing-body">${Utils.truncate(content, 180) || "Belum ada isi tulisan."}</div>
        <div class="work-actions" style="margin-top:12px;">
          ${detailBtn}
        </div>
      </article>
    `;
  }

  async function initWritingsPage() {
    const container = document.getElementById("writings-container");
    if (!container) return;

    const data = await Utils.fetchJSON(PATHS.writings);
    if (!data) {
      container.innerHTML = `<div class="glass-card" style="padding:16px;">Gagal memuat tulisan.</div>`;
      return;
    }

    const writings = data.writings || [];
    if (writings.length === 0) {
      container.innerHTML = `<div class="glass-card" style="padding:16px;">Belum ada tulisan.</div>`;
      return;
    }

    container.innerHTML = writings.map(buildWritingCard).join("");
  }

  /* =========================
     INIT
     ========================= */
  async function init() {
    await applySettings();
    await applyGlobalLinks();
    await initHomePage();
    await initWorksPage();
    await initWritingsPage();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
  TitikFiksi.init();
});
