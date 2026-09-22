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

  // Attract-screen panel wall — a different asymmetric split than the hub
  // wall (different panel count/spans) so it doesn't read as a rerun of it.
  const ATTRACT_PANELS = [
    { col: "1 / 9", row: "1 / 3" },
    { col: "9 / 13", row: "1" },
    { col: "9 / 13", row: "2" },
    { col: "1 / 6", row: "3" },
    { col: "6 / 13", row: "3" },
  ];

  function icon(name) {
    return `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ICONS.ensemble}</svg>`;
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  const viewHub = document.getElementById("view-hub");
  const viewArea = document.getElementById("view-area");
  const programList = document.getElementById("program-list");
  const areaContent = document.getElementById("area-content");
  const attractEl = document.getElementById("attract");
  const lightboxEl = document.getElementById("lightbox");
  const lightboxBody = document.getElementById("lightbox-body");
  const previewEl = document.getElementById("area-preview");
  const previewMedia = document.getElementById("preview-media");
  const previewEyebrow = document.getElementById("preview-eyebrow");
  const previewName = document.getElementById("preview-name");
  const previewTagline = document.getElementById("preview-tagline");
  const previewFacts = document.getElementById("preview-facts");
  const previewLearnMore = document.getElementById("preview-learn-more");
  const previewApply = document.getElementById("preview-apply");

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

    // Per-area CMS override (area.cta.url / area.cta.label, both optional) —
    // falls back to the site-wide Apply Button / QR Link above whenever
    // either half is left blank. Used by the tile pill, the preview
    // overlay's Apply button, and the full area page's ticket + QR.
    function resolveCta(area) {
      const override = (area && area.cta) || {};
      return { url: override.url || cta.url, label: override.label || cta.label };
    }

    // -------------------------------------------------------------- render hub (edge-to-edge poster wall)

    function renderHub() {
      programList.innerHTML = areas
        .map((a) => {
          const sizeClass = a.size === "large" ? "size-large" : "size-normal";
          const driftDur = (16 + Math.random() * 10).toFixed(1);
          const driftDelay = (-Math.random() * driftDur).toFixed(1);
          // The tile pill keeps its own short default ("Apply") regardless of
          // the site-wide cta.label — same rationale as always (space), but
          // now an area can override it via area.cta.label if it wants to.
          const tileCtaUrl = (a.cta && a.cta.url) || cta.url;
          const tileCtaLabel = (a.cta && a.cta.label) || "Apply";
          return `
        <div class="area-tile ${sizeClass}" data-area="${a.id}" style="--tile-color:${a.theme};--drift-dur:${driftDur}s;--drift-delay:${driftDelay}s">
          <button class="tile-open" data-area="${a.id}" aria-label="Preview ${a.name}">
            <svg class="ghost-icon" viewBox="0 0 24 24" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${ICONS[a.icon] || ICONS.ensemble}</svg>
            <span class="tile-scrim"></span>
            <span class="tile-text">
              <h3>${a.name}</h3>
              <span class="tagline">${a.tagline}</span>
            </span>
          </button>
          <a class="tile-cta btn" href="${tileCtaUrl}" target="_blank" rel="noopener" aria-label="Apply to ${a.name}">${tileCtaLabel}</a>
        </div>`;
        })
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
          const ghost = tileOpen.querySelector(".ghost-icon");
          if (ghost) ghost.style.display = "none";
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

    // -------------------------------------------------------------- tile preview: pop-out + carousel + quick facts

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
    let previewAutoTimer = null;

    function stopPreviewAutoplay() {
      if (previewAutoTimer) clearInterval(previewAutoTimer);
      previewAutoTimer = null;
    }

    // CMS field "previewPlayback" per area, default "photo":
    //   "photo"     — today's behavior: opens on the first item, manual swipe.
    //   "video"     — opens directly on the area's video (if it has one) and autoplays it.
    //   "slideshow" — auto-advances through every item on a timer, hands-free.
    function renderPreviewCarousel(area, items) {
      stopPreviewAutoplay();

      if (!items.length) {
        previewMedia.innerHTML = `
          <div class="preview-slide active">
            <div class="slide-fallback-icon">${icon(area.icon)}</div>
          </div>`;
        return;
      }

      const mode = area.previewPlayback || "photo";
      if (mode === "video") {
        const videoIndex = items.findIndex((item) => item.type === "video");
        if (videoIndex > 0) items.unshift(items.splice(videoIndex, 1)[0]);
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
      if (prevBtn) prevBtn.addEventListener("click", () => { stopPreviewAutoplay(); goToPreviewSlide(previewSlideIndex - 1); });
      if (nextBtn) nextBtn.addEventListener("click", () => { stopPreviewAutoplay(); goToPreviewSlide(previewSlideIndex + 1); });
      previewMedia.querySelectorAll(".preview-dots button").forEach((dot, i) => {
        dot.addEventListener("click", () => { stopPreviewAutoplay(); goToPreviewSlide(i); });
      });

      const firstVideo = previewMedia.querySelector(".preview-slide.active video");
      if (firstVideo) firstVideo.play().catch(() => {});

      if (mode === "slideshow" && items.length > 1 && !prefersReducedMotion()) {
        previewAutoTimer = setInterval(() => goToPreviewSlide(previewSlideIndex + 1), 4200);
      }
    }

    // ---- FLIP pop-out: a fixed-position clone flies from a tile's exact
    // rect to fill the viewport (or back again), via the Web Animations API
    // animating only `transform` (a matrix mapping the clone's box from its
    // start rect onto its end rect) — never width/height, so it stays off
    // the layout thread. Used by both openPreview (tile -> fullscreen) and
    // closePreview (fullscreen -> tile).

    function createVisualClone(photoSrc, themeColor) {
      const clone = document.createElement("div");
      clone.className = "pop-clone";
      if (photoSrc) {
        const img = document.createElement("img");
        img.src = photoSrc;
        img.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;";
        clone.appendChild(img);
      } else {
        const grad = document.createElement("div");
        grad.style.cssText = `position:absolute;inset:0;background-image:linear-gradient(150deg, color-mix(in srgb, ${themeColor} 65%, white 12%), ${themeColor} 55%, color-mix(in srgb, ${themeColor} 82%, black 30%));`;
        clone.appendChild(grad);
      }
      return clone;
    }

    function flipFly(fromRect, toRect, photoSrc, themeColor, onLanded) {
      const clone = createVisualClone(photoSrc, themeColor);
      clone.style.position = "fixed";
      clone.style.left = fromRect.left + "px";
      clone.style.top = fromRect.top + "px";
      clone.style.width = fromRect.width + "px";
      clone.style.height = fromRect.height + "px";
      clone.style.transformOrigin = "0 0";
      clone.style.overflow = "hidden";
      clone.style.zIndex = "120";
      clone.style.willChange = "transform";
      document.body.appendChild(clone);

      const sx = toRect.width / fromRect.width;
      const sy = toRect.height / fromRect.height;
      const tx = toRect.left - fromRect.left;
      const ty = toRect.top - fromRect.top;

      const anim = clone.animate(
        [{ transform: "matrix(1,0,0,1,0,0)" }, { transform: `matrix(${sx},0,0,${sy},${tx},${ty})` }],
        { duration: 480, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
      );
      anim.onfinish = () => {
        clone.remove();
        if (onLanded) onLanded();
      };
    }

    let currentPreviewArea = null;

    function openPreview(id) {
      const area = areas.find((a) => a.id === id);
      if (!area) return;
      currentPreviewArea = area;

      const tileEl = programList.querySelector(`.area-tile[data-area="${id}"]`);
      const photoImg = tileEl && tileEl.querySelector(".tile-photo");
      const photoSrc = photoImg ? photoImg.src : null;

      previewEl.style.setProperty("--theme", area.theme);
      previewEyebrow.textContent = department.name;
      previewName.textContent = area.name;
      previewTagline.textContent = area.tagline;
      previewFacts.innerHTML = area.facts.map((f) => `<li>${f}</li>`).join("");
      previewLearnMore.onclick = () => {
        closePreview();
        showArea(area.id);
      };
      const previewCta = resolveCta(area);
      previewApply.href = previewCta.url;
      previewApply.textContent = previewCta.label;

      // Paint the same photo/gradient the clone is about to fly with, so the
      // hand-off from clone to real overlay is seamless once it lands.
      previewMedia.innerHTML = `<div class="preview-slide active">${
        photoSrc ? `<img src="${photoSrc}" alt="${area.name}">` : `<div class="slide-fallback-icon">${icon(area.icon)}</div>`
      }</div>`;
      previewEl.classList.remove("info-visible");

      const reveal = () => {
        // No transition on this reveal — the clone already carried the
        // motion, so the modal itself should just appear instantly under it.
        previewEl.style.transition = "none";
        previewEl.classList.add("active");
        void previewEl.offsetWidth;
        previewEl.style.transition = "";
        requestAnimationFrame(() => previewEl.classList.add("info-visible"));
        resolveMediaList(buildMediaList(area)).then((items) => renderPreviewCarousel(area, items));
      };

      if (tileEl && !prefersReducedMotion()) {
        const fromRect = tileEl.getBoundingClientRect();
        const toRect = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        flipFly(fromRect, toRect, photoSrc, area.theme, reveal);
      } else {
        reveal();
      }
    }

    function closePreview() {
      stopPreviewAutoplay();
      const area = currentPreviewArea;
      currentPreviewArea = null;
      if (!area) {
        previewEl.classList.remove("active", "info-visible");
        return;
      }

      const tileEl = programList.querySelector(`.area-tile[data-area="${area.id}"]`);
      const activeSlide = previewMedia.querySelector(".preview-slide.active");
      let photoSrc = null;
      if (activeSlide) {
        const img = activeSlide.querySelector("img");
        const video = activeSlide.querySelector("video");
        photoSrc = img ? img.src : video ? video.poster || null : null;
      }
      previewMedia.querySelectorAll("video").forEach((v) => v.pause());
      previewEl.classList.remove("info-visible");

      if (tileEl && !prefersReducedMotion()) {
        setTimeout(() => {
          const fromRect = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
          const toRect = tileEl.getBoundingClientRect();
          flipFly(fromRect, toRect, photoSrc, area.theme, () => {});
          previewEl.classList.remove("active");
        }, 150);
      } else {
        previewEl.classList.remove("active");
      }
    }

    document.getElementById("preview-close").addEventListener("click", closePreview);

    // -------------------------------------------------------------- render area (media-led)

    function showArea(id) {
      const area = areas.find((a) => a.id === id);
      if (!area) return;
      const areaCta = resolveCta(area);

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
              <a class="btn btn-primary" href="${areaCta.url}">${areaCta.label}</a>
            </div>
            <div class="ticket-stub">
              <div id="qr-slot"></div>
              <span class="scan-note">Scan to apply</span>
            </div>
          </div>
        </div>
      `;

      // Hero media: prefer a dedicated hero shot, fall back to the first gallery photo, else the themed gradient stays.
      probeImage(area.hero || (area.photos && area.photos[0])).then((ok) => {
        if (!ok) return;
        const heroEl = document.querySelector(".area-hero");
        const img = document.createElement("img");
        img.className = "hero-media";
        img.alt = area.name;
        img.src = area.hero || area.photos[0];
        heroEl.prepend(img);
        const ghost = heroEl.querySelector(".hero-ghost");
        if (ghost) ghost.style.display = "none";
      });

      const wall = document.getElementById("gallery-wall");
      (area.photos || []).forEach((src, i) => {
        wall.appendChild(galleryCard("photo", src, `${area.name} — ${galleryCaptions[i % galleryCaptions.length]}`));
      });
      if (area.video) {
        wall.appendChild(galleryCard("video", area.video, `${area.name} — In performance`, area.poster));
      }

      renderQR(document.getElementById("qr-slot"), areaCta.url);

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

    // -------------------------------------------------------------- attract screen: cinematic multi-panel wall

    const slideshowEl = document.getElementById("splash-slideshow");
    const attractCaption = document.getElementById("attract-caption");
    let attractTimers = [];
    let attractPanelsReady = false;
    let captionTimer = null;

    function shuffle(arr) {
      const out = arr.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    }

    // Pool every image the app already knows about — splash slides plus
    // every area's hero/gallery photos — so the attract wall has real
    // variety without needing dedicated splash assets authored for it.
    function buildImagePool() {
      const pool = [];
      splash.forEach((s) => {
        if (s.media) pool.push({ src: s.media, theme: s.theme });
      });
      areas.forEach((a) => {
        if (a.hero) pool.push({ src: a.hero, theme: a.theme });
        (a.photos || []).forEach((src) => pool.push({ src, theme: a.theme }));
      });
      return pool;
    }

    async function buildAttractWall() {
      const pool = buildImagePool();
      const resolved = [];
      for (const item of pool) {
        const ok = await probeImage(item.src);
        if (ok) resolved.push(item);
      }
      const panelCount = ATTRACT_PANELS.length;
      const shuffled = shuffle(resolved.length ? resolved : [{ src: null, theme: "#0b2341" }]);
      const buckets = Array.from({ length: panelCount }, () => []);
      shuffled.forEach((item, i) => buckets[i % panelCount].push(item));
      buckets.forEach((b, i) => {
        if (!b.length) b.push(shuffled[i % shuffled.length]);
      });

      slideshowEl.innerHTML = ATTRACT_PANELS.map((p, i) => {
        const slides = buckets[i]
          .map(
            (item, si) => `
          <div class="panel-slide${si === 0 ? " active" : ""}" style="--slide-color:${item.theme}">
            ${
              item.src
                ? `<img class="panel-media" alt="" src="${item.src}" style="animation-delay:${(-Math.random() * 10).toFixed(1)}s">`
                : `<div class="slide-fallback"></div>`
            }
          </div>`
          )
          .join("");
        return `<div class="attract-panel" style="grid-column:${p.col};grid-row:${p.row}">${slides}</div>`;
      }).join("");

      attractPanelsReady = true;
    }

    function startAttractWall() {
      stopAttractWall();
      if (!attractPanelsReady) return;
      if (prefersReducedMotion()) return; // panels stay on their first (already-visible) slide
      slideshowEl.querySelectorAll(".attract-panel").forEach((panel) => {
        const slides = panel.querySelectorAll(".panel-slide");
        if (slides.length < 2) return;
        let idx = 0;
        const period = splashIntervalMs * (0.75 + Math.random() * 0.7);
        const timer = setInterval(() => {
          slides[idx].classList.remove("active");
          idx = (idx + 1) % slides.length;
          slides[idx].classList.add("active");
        }, period);
        attractTimers.push(timer);
      });
    }

    function stopAttractWall() {
      attractTimers.forEach((t) => clearInterval(t));
      attractTimers = [];
    }

    function startCaptionRotation() {
      stopCaptionRotation();
      if (!splash.length) return;
      let idx = 0;
      attractCaption.textContent = splash[0].caption;
      captionTimer = setInterval(() => {
        idx = (idx + 1) % splash.length;
        attractCaption.textContent = splash[idx].caption;
      }, splashIntervalMs);
    }

    function stopCaptionRotation() {
      if (captionTimer) clearInterval(captionTimer);
      captionTimer = null;
    }

    // -------------------------------------------------------------- idle / attract mode

    let idleTimer = null;

    function goHomeAndAttract() {
      setActiveView("hub");
      closeLightbox();
      closePreview();
      attractEl.classList.add("active");
      startAttractWall();
      startCaptionRotation();
    }

    function resetIdle() {
      if (attractEl.classList.contains("active")) {
        attractEl.classList.remove("active");
        stopAttractWall();
        stopCaptionRotation();
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
    buildAttractWall();
    renderEqualizer(document.getElementById("eq-strip-hub"), 40);
    renderEqualizer(document.getElementById("eq-strip-attract"), 24);
    setActiveView("hub");
    resetIdle();
  }
})();
