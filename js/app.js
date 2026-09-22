(function () {
  "use strict";

  const ICONS = {
    brass: '<path d="M4 16h6l4-4V8h6a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3h-3" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4" cy="16" r="2" stroke-width="2" fill="none"/><path d="M10 12V8" stroke-width="2" stroke-linecap="round"/>',
    woodwind: '<path d="M9 3v18M9 3a3 3 0 0 1 6 0v3H9M9 9h6v3H9m0 3h6v3a3 3 0 0 1-6 0" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    voice: '<path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" stroke-width="2" fill="none"/><path d="M6 11a6 6 0 0 0 12 0M12 18v3" stroke-width="2" fill="none" stroke-linecap="round"/>',
    piano: '<rect x="3" y="6" width="18" height="12" rx="1.5" stroke-width="2" fill="none"/><path d="M7 6v8M11 6v8M15 6v8M19 6v8" stroke-width="1.6" stroke-linecap="round"/>',
    commercial: '<path d="M3 15V9l14-4v14L3 15Z" stroke-width="2" fill="none" stroke-linejoin="round"/><path d="M17 9a4 4 0 0 1 0 6M20 6a8 8 0 0 1 0 12" stroke-width="2" fill="none" stroke-linecap="round"/>',
    composition: '<path d="M4 18V6M4 6l16-2v14l-16 2" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="18" cy="17" r="2" stroke-width="2" fill="none"/>',
    education: '<path d="M2 8l10-4 10 4-10 4-10-4Z" stroke-width="2" fill="none" stroke-linejoin="round"/><path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5M22 8v6" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    ensemble: '<circle cx="8" cy="8" r="3" stroke-width="2" fill="none"/><circle cx="17" cy="9" r="2.5" stroke-width="2" fill="none"/><path d="M2 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1M15 19v-1a4 4 0 0 1 4-4h.5a3 3 0 0 1 2.5 4.5" stroke-width="2" fill="none" stroke-linecap="round"/>',
  };

  function icon(name) {
    return `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ICONS.ensemble}</svg>`;
  }

  const viewHub = document.getElementById("view-hub");
  const viewArea = document.getElementById("view-area");
  const programList = document.getElementById("program-list");
  const areaContent = document.getElementById("area-content");
  const attractEl = document.getElementById("attract");
  const lightboxEl = document.getElementById("lightbox");
  const lightboxBody = document.getElementById("lightbox-body");
  const previewEl = document.getElementById("area-preview");
  const previewPanel = document.getElementById("preview-panel");
  const previewMedia = document.getElementById("preview-media");
  const previewEyebrow = document.getElementById("preview-eyebrow");
  const previewName = document.getElementById("preview-name");
  const previewTagline = document.getElementById("preview-tagline");
  const previewFacts = document.getElementById("preview-facts");
  const previewLearnMore = document.getElementById("preview-learn-more");

  // ---------------------------------------------------------------- media loading helpers
  // Try an image, then a video, then fall back to a themed color card. Used
  // anywhere a piece of content may or may not have real media yet.

  function probeImage(src) {
    return new Promise((resolve) => {
      if (!src) return resolve(false);
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  function probeVideo(src) {
    return new Promise((resolve) => {
      if (!src) return resolve(false);
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => resolve(true);
      v.onerror = () => resolve(false);
      v.src = src;
    });
  }

  // ---------------------------------------------------------------- boot: fetch content, then run the app
  // Content is edited either by hand in data/content.json or through the
  // Decap CMS admin UI at /admin, which writes to the same file.

  fetch("data/content.json", { cache: "no-store" })
    .then((r) => r.json())
    .then((content) => initApp(content))
    .catch((err) => {
      console.error("Failed to load data/content.json", err);
      document.body.innerHTML =
        '<div style="padding:60px;font-family:sans-serif;color:#17140f">Couldn\'t load kiosk content (data/content.json). Check the file exists and is valid JSON.</div>';
    });

  function initApp(content) {
    const { department, cta, idleTimeoutMs, splashIntervalMs, galleryCaptions, splash, areas, logo } = content;

    document.querySelectorAll(".brand-logo").forEach((img) => {
      if (logo) img.src = logo;
    });
    document.getElementById("dept-name").textContent = department.name;
    document.getElementById("hero-title").textContent = department.heroTitle;
    document.getElementById("hero-sub").textContent = department.heroSub;

    document.querySelectorAll("[data-cta-url]").forEach((el) => {
      if (el.tagName === "A") el.href = cta.url;
    });
    document.querySelectorAll("[data-cta-label]").forEach((el) => {
      el.textContent = cta.label;
    });

    // -------------------------------------------------------------- render hub (saturated poster-tile stage)

    function renderHub() {
      programList.innerHTML = areas
        .map(
          (a) => `
        <div class="area-tile" style="--tile-color:${a.theme}">
          <button class="tile-open" data-area="${a.id}" aria-label="Preview ${a.name}">
            <svg class="ghost-icon" viewBox="0 0 24 24" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${ICONS[a.icon] || ICONS.ensemble}</svg>
            <span class="tile-scrim"></span>
            <span class="tile-text">
              <h3>${a.name}</h3>
              <span class="tagline">${a.tagline}</span>
            </span>
          </button>
          <a class="tile-cta btn" href="${cta.url}" data-cta-url target="_blank" rel="noopener" aria-label="Apply to ${a.name}">Apply</a>
        </div>`
        )
        .join("");

      programList.querySelectorAll(".tile-open").forEach((tile) => {
        tile.addEventListener("click", () => openPreview(tile.dataset.area));
      });

      // Upgrade tiles to a real photo when one exists, without blocking the initial render.
      areas.forEach((a) => {
        const photoSrc = a.hero || (a.photos && a.photos[0]);
        probeImage(photoSrc).then((ok) => {
          if (!ok) return;
          const tileOpen = programList.querySelector(`.tile-open[data-area="${a.id}"]`);
          if (!tileOpen) return;
          const img = document.createElement("img");
          img.className = "tile-photo";
          img.alt = a.name;
          img.src = photoSrc;
          tileOpen.parentElement.prepend(img);
        });
      });
    }

    // -------------------------------------------------------------- equalizer bars (live texture)

    function renderEqualizer(container, count) {
      if (!container) return;
      let html = "";
      for (let i = 0; i < count; i++) {
        const dur = (0.7 + Math.random() * 0.9).toFixed(2);
        const delay = (Math.random() * -1.6).toFixed(2);
        const peak = 14 + Math.round(Math.random() * 26);
        html += `<span style="--eq-h:${peak}px;animation-duration:${dur}s;animation-delay:${delay}s"></span>`;
      }
      container.innerHTML = html;
    }

    // -------------------------------------------------------------- gallery card (photo or video, caption baked in)

    function galleryCard(kind, src, caption, posterSrc) {
      const wrap = document.createElement("div");
      wrap.className = "gallery-card";
      wrap.innerHTML = `<div class="media-placeholder">${icon("ensemble")}<span>${kind === "video" ? "Video" : "Photo"} coming soon</span></div>`;

      const probe = kind === "video" ? probeVideo(src) : probeImage(src);
      probe.then((ok) => {
        if (!ok) return;
        if (kind === "video") {
          wrap.innerHTML = `
            <video muted playsinline preload="metadata" poster="${posterSrc || ""}">
              <source src="${src}" type="video/mp4">
            </video>
            <div class="card-scrim"></div>
            <div class="play-badge"><span class="circle"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7-11-7Z"/></svg></span></div>
            <div class="card-caption">${caption}</div>`;
          wrap.addEventListener("click", () => openLightbox("video", src, caption));
        } else {
          wrap.innerHTML = `
            <img src="${src}" alt="${caption}">
            <div class="card-scrim"></div>
            <div class="card-caption">${caption}</div>`;
          wrap.addEventListener("click", () => openLightbox("image", src, caption));
        }
      });

      return wrap;
    }

    // -------------------------------------------------------------- tile preview modal (carousel + quick facts)

    function buildMediaList(area) {
      const items = [];
      if (area.hero) items.push({ type: "image", src: area.hero });
      (area.photos || []).forEach((src) => items.push({ type: "image", src }));
      if (area.video) items.push({ type: "video", src: area.video, poster: area.poster });
      return items;
    }

    async function resolveMediaList(rawItems) {
      const resolved = [];
      for (const item of rawItems) {
        const ok = item.type === "video" ? await probeVideo(item.src) : await probeImage(item.src);
        if (ok) resolved.push(item);
      }
      return resolved;
    }

    let previewSlideIndex = 0;

    function renderPreviewCarousel(area, items) {
      if (!items.length) {
        previewMedia.innerHTML = `
          <div class="preview-slide active">
            <div class="slide-fallback-icon">${icon(area.icon)}</div>
          </div>`;
        return;
      }

      previewMedia.innerHTML = `
        ${items
          .map(
            (item, i) => `
          <div class="preview-slide${i === 0 ? " active" : ""}" data-index="${i}">
            ${
              item.type === "video"
                ? `<video muted playsinline loop preload="metadata" poster="${item.poster || ""}"><source src="${item.src}" type="video/mp4"></video>`
                : `<img src="${item.src}" alt="${area.name}">`
            }
          </div>`
          )
          .join("")}
        ${
          items.length > 1
            ? `
          <button class="preview-nav prev" aria-label="Previous">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
          </button>
          <button class="preview-nav next" aria-label="Next">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
          </button>
          <div class="preview-dots">
            ${items.map((_, i) => `<button data-index="${i}" class="${i === 0 ? "active" : ""}" aria-label="Slide ${i + 1}"></button>`).join("")}
          </div>`
            : ""
        }
      `;

      previewSlideIndex = 0;

      function goToPreviewSlide(i) {
        const slides = previewMedia.querySelectorAll(".preview-slide");
        previewSlideIndex = (i + items.length) % items.length;
        slides.forEach((el, idx) => el.classList.toggle("active", idx === previewSlideIndex));
        previewMedia.querySelectorAll(".preview-dots button").forEach((el, idx) => el.classList.toggle("active", idx === previewSlideIndex));
        const video = slides[previewSlideIndex] && slides[previewSlideIndex].querySelector("video");
        if (video) video.play().catch(() => {});
      }

      const prevBtn = previewMedia.querySelector(".preview-nav.prev");
      const nextBtn = previewMedia.querySelector(".preview-nav.next");
      if (prevBtn) prevBtn.addEventListener("click", () => goToPreviewSlide(previewSlideIndex - 1));
      if (nextBtn) nextBtn.addEventListener("click", () => goToPreviewSlide(previewSlideIndex + 1));
      previewMedia.querySelectorAll(".preview-dots button").forEach((dot, i) => {
        dot.addEventListener("click", () => goToPreviewSlide(i));
      });

      const firstVideo = previewMedia.querySelector(".preview-slide.active video");
      if (firstVideo) firstVideo.play().catch(() => {});
    }

    function openPreview(id) {
      const area = areas.find((a) => a.id === id);
      if (!area) return;

      previewPanel.style.setProperty("--theme", area.theme);
      previewEyebrow.textContent = department.name;
      previewName.textContent = area.name;
      previewTagline.textContent = area.tagline;
      previewFacts.innerHTML = area.facts.map((f) => `<li>${f}</li>`).join("");
      previewMedia.innerHTML = `<div class="preview-slide active"><div class="slide-fallback-icon">${icon(area.icon)}</div></div>`;
      previewLearnMore.onclick = () => {
        closePreview();
        showArea(area.id);
      };

      previewEl.classList.add("active");

      resolveMediaList(buildMediaList(area)).then((items) => renderPreviewCarousel(area, items));
    }

    function closePreview() {
      previewEl.classList.remove("active");
      previewMedia.querySelectorAll("video").forEach((v) => v.pause());
    }

    document.getElementById("preview-close").addEventListener("click", closePreview);
    previewEl.addEventListener("click", (e) => {
      if (e.target === previewEl) closePreview();
    });

    // -------------------------------------------------------------- render area (media-led)

    function showArea(id) {
      const area = areas.find((a) => a.id === id);
      if (!area) return;

      areaContent.style.setProperty("--theme", area.theme);
      areaContent.innerHTML = `
        <div class="area-hero" style="--theme:${area.theme}">
          <svg class="hero-ghost" viewBox="0 0 24 24" fill="none" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">${ICONS[area.icon] || ICONS.ensemble}</svg>
          <div class="hero-scrim"></div>
          <div class="hero-content">
            <div class="dept-label">${department.name}</div>
            <h2>${area.name}</h2>
            <p class="tagline">${area.tagline}</p>
            <p class="area-description">${area.description}</p>
            <ul class="fact-list">${area.facts.map((f) => `<li>${f}</li>`).join("")}</ul>
          </div>
        </div>
        <div class="gallery-wall" id="gallery-wall"></div>
        <div class="area-cta-wrap">
          <div class="ticket">
            <div class="ticket-main">
              <h3>Apply to ${area.name}</h3>
              <p>Scan the code, or tap the button up top, to start your Auburn Music application.</p>
              <a class="btn btn-primary" href="${cta.url}" data-cta-url data-cta-label></a>
            </div>
            <div class="ticket-stub">
              <div id="qr-slot"></div>
              <span class="scan-note">Scan to apply</span>
            </div>
          </div>
        </div>
      `;

      document.querySelectorAll("#area-content [data-cta-label]").forEach((el) => (el.textContent = cta.label));

      // Hero media: prefer a dedicated hero shot, fall back to the first gallery photo, else the themed gradient stays.
      probeImage(area.hero || (area.photos && area.photos[0])).then((ok) => {
        if (!ok) return;
        const heroEl = document.querySelector(".area-hero");
        const img = document.createElement("img");
        img.className = "hero-media";
        img.alt = area.name;
        img.src = area.hero || area.photos[0];
        heroEl.prepend(img);
      });

      const wall = document.getElementById("gallery-wall");
      (area.photos || []).forEach((src, i) => {
        wall.appendChild(galleryCard("photo", src, `${area.name} — ${galleryCaptions[i % galleryCaptions.length]}`));
      });
      if (area.video) {
        wall.appendChild(galleryCard("video", area.video, `${area.name} — In performance`, area.poster));
      }

      renderQR(document.getElementById("qr-slot"), cta.url);

      viewArea.scrollTop = 0;
      setActiveView("area");
    }

    // -------------------------------------------------------------- QR code

    function renderQR(container, url) {
      container.innerHTML = "";
      try {
        const qr = qrcode(0, "M");
        qr.addData(url);
        qr.make();
        container.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2 });
      } catch (e) {
        container.textContent = "QR unavailable";
      }
    }

    // -------------------------------------------------------------- lightbox

    function openLightbox(kind, src, label) {
      lightboxBody.innerHTML =
        kind === "image"
          ? `<img src="${src}" alt="${label}">`
          : `<video src="${src}" controls autoplay playsinline></video>`;
      lightboxEl.classList.add("active");
    }

    function closeLightbox() {
      lightboxEl.classList.remove("active");
      lightboxBody.innerHTML = "";
    }

    document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
    lightboxEl.addEventListener("click", (e) => {
      if (e.target === lightboxEl) closeLightbox();
    });

    // -------------------------------------------------------------- view switching

    function setActiveView(name) {
      viewHub.classList.toggle("active", name === "hub");
      viewArea.classList.toggle("active", name === "area");
    }

    document.getElementById("back-to-hub").addEventListener("click", () => setActiveView("hub"));
    document.getElementById("brand-home").addEventListener("click", () => {
      closePreview();
      closeLightbox();
      setActiveView("hub");
    });

    // -------------------------------------------------------------- splash slideshow (attract screen)

    const slideshowEl = document.getElementById("splash-slideshow");
    const attractCaption = document.getElementById("attract-caption");
    let slideIndex = 0;
    let slideTimer = null;

    function renderSlideshow() {
      slideshowEl.innerHTML = splash
        .map(
          (s, i) => `
        <div class="slide${i === 0 ? " active" : ""}" data-index="${i}" style="--slide-color:${s.theme}">
          <div class="slide-fallback"></div>
        </div>`
        )
        .join("");

      splash.forEach((s, i) => {
        const slideEl = slideshowEl.querySelector(`.slide[data-index="${i}"]`);
        probeImage(s.media).then((ok) => {
          if (!ok) return;
          const img = document.createElement("img");
          img.className = "slide-media";
          img.alt = s.caption;
          img.src = s.media;
          slideEl.prepend(img);
        });
      });
    }

    function goToSlide(i) {
      const slides = slideshowEl.querySelectorAll(".slide");
      slides.forEach((el) => el.classList.remove("active"));
      slideIndex = (i + splash.length) % splash.length;
      slides[slideIndex].classList.add("active");
      attractCaption.textContent = splash[slideIndex].caption;
    }

    function startSlideshow() {
      stopSlideshow();
      slideTimer = setInterval(() => goToSlide(slideIndex + 1), splashIntervalMs);
    }

    function stopSlideshow() {
      if (slideTimer) clearInterval(slideTimer);
      slideTimer = null;
    }

    // -------------------------------------------------------------- idle / attract mode

    let idleTimer = null;

    function goHomeAndAttract() {
      setActiveView("hub");
      closeLightbox();
      closePreview();
      attractEl.classList.add("active");
      goToSlide(0);
      startSlideshow();
    }

    function resetIdle() {
      if (attractEl.classList.contains("active")) {
        attractEl.classList.remove("active");
        stopSlideshow();
      }
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(goHomeAndAttract, idleTimeoutMs);
    }

    ["pointerdown", "touchstart", "mousemove", "keydown"].forEach((evt) =>
      document.addEventListener(evt, resetIdle, { passive: true })
    );

    attractEl.addEventListener("click", resetIdle);

    // -------------------------------------------------------------- init

    renderHub();
    renderSlideshow();
    renderEqualizer(document.getElementById("eq-strip-hub"), 40);
    renderEqualizer(document.getElementById("eq-strip-attract"), 24);
    setActiveView("hub");
    resetIdle();
  }
})();
