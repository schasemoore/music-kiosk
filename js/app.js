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
    studio: '<path d="M6 3v18M12 3v18M18 3v18" stroke-width="2" stroke-linecap="round"/><circle cx="6" cy="9" r="2" stroke-width="2" fill="none"/><circle cx="12" cy="15" r="2" stroke-width="2" fill="none"/><circle cx="18" cy="7" r="2" stroke-width="2" fill="none"/>',
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
  const studioViewEl = document.getElementById("studio-view");
  const studioMedia = document.getElementById("studio-media");
  const studioPhoto = document.getElementById("studio-photo");
  const hotspotLayer = document.getElementById("hotspot-layer");
  const studioEyebrow = document.getElementById("studio-eyebrow");
  const studioName = document.getElementById("studio-name");
  const studioTagline = document.getElementById("studio-tagline");
  const studioApply = document.getElementById("studio-apply");

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
    const { department, cta, idleTimeoutMs, splashIntervalMs, galleryCaptions, splash, areas, logo, luckyManStudio } = content;

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
          return `
        <div class="area-tile ${sizeClass}" data-area="${a.id}" style="--tile-color:${a.theme};--drift-dur:${driftDur}s;--drift-delay:${driftDelay}s">
          <button class="tile-open" data-area="${a.id}" aria-label="Preview ${a.name}">
            <svg class="ghost-icon" viewBox="0 0 24 24" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${ICONS[a.icon] || ICONS.ensemble}</svg>
            <span class="tile-scrim"></span>
            <span class="tile-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
            </span>
            <span class="tile-text">
              <h3>${a.name}</h3>
              <span class="tagline">${a.tagline}</span>
            </span>
          </button>
        </div>`;
        })
        .join("");

      // Lucky Man Studio: appended after the mapped areas, not part of
      // areas[] itself (it doesn't reorder with them, and its CMS fields are
      // a different shape entirely — see openStudio below). Still a plain
      // .area-tile so it packs into the same dense grid as everything else.
      if (luckyManStudio) {
        const sizeClass = luckyManStudio.size === "large" ? "size-large" : "size-normal";
        programList.insertAdjacentHTML(
          "beforeend",
          `
        <div class="area-tile ${sizeClass}" id="studio-tile" style="--tile-color:${luckyManStudio.theme || "#0b2341"}">
          <button class="tile-open" id="studio-tile-open" aria-label="Open ${luckyManStudio.name}">
            <svg class="ghost-icon" viewBox="0 0 24 24" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${ICONS.studio}</svg>
            <span class="tile-scrim"></span>
            <span class="tile-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
            </span>
            <span class="tile-text">
              <h3>${luckyManStudio.name}</h3>
              <span class="tagline">${luckyManStudio.tagline || ""}</span>
            </span>
          </button>
        </div>`
        );
      }

      programList.querySelectorAll(".tile-open[data-area]").forEach((tile) => {
        tile.addEventListener("click", () => openPreview(tile.dataset.area));
      });
      const studioTileOpen = document.getElementById("studio-tile-open");
      if (studioTileOpen) studioTileOpen.addEventListener("click", openStudio);

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
      if (luckyManStudio) {
        probeImage(luckyManStudio.image).then((ok) => {
          if (!ok) return;
          const tileOpen = document.getElementById("studio-tile-open");
          if (!tileOpen) return;
          const img = document.createElement("img");
          img.className = "tile-photo";
          img.alt = luckyManStudio.name;
          img.src = luckyManStudio.image;
          tileOpen.parentElement.prepend(img);
          const ghost = tileOpen.querySelector(".ghost-icon");
          if (ghost) ghost.style.display = "none";
        });
      }
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
    // animating real `left`/`top`/`width`/`height` — not `transform: scale`.
    // A tile's aspect ratio essentially never matches the viewport's (on
    // this kiosk's portrait layout the two can differ by 10x+), and a
    // `transform: scale(sx,sy)` on a shape-changing box stretches the photo
    // inside it non-uniformly. Countering that stretch with extra transform
    // math (tried: a second inverse-scaled animation, then a per-frame rAF
    // loop computing the exact inverse) kept the image undistorted but
    // still looked wrong — the crop window it's forced to reveal shifts
    // unnaturally as a shape-changing box's non-uniform scale changes.
    // Animating real width/height instead sidesteps the whole problem:
    // `object-fit: cover` on the inner `<img>` recomputes correctly, with
    // zero custom math, for whatever box size the browser is actually
    // laying out at each frame — the same way it would for any ordinary
    // resize. It's one `position: fixed` element, isolated from document
    // flow, so relayout is cheap; this was worth it for correctness.
    //
    // The flight also has to *start and end* looking exactly like the tile,
    // not just have the right rect. The hub tile's photo isn't a plain
    // cover-fit of the raw image: it's a 110%-sized, continuously
    // drifting/zooming Ken Burns layer (`.tile-photo`, `tile-drift`), plus a
    // scrim, name, tagline, and arrow on top. A clone that begins as a bare,
    // un-zoomed cover crop of the photo visibly jumps on frame 1 (different
    // zoom/crop) and the tile's text vanishes instantly. So: with a `tileEl`,
    // the clone's photo layer is placed at the tile photo's *actual current*
    // rendered rect (read via getBoundingClientRect, which includes the drift
    // transform) and animates to/from the full-frame fit, and a copy of the
    // tile's scrim/text/arrow is faded out (opening) or back in (closing)
    // over the flight. Used by openPreview/openStudio (tile -> fullscreen)
    // and closePreview/closeStudio (fullscreen -> tile).
    //
    // opts: { tileEl, mode: "open"|"close", tilePhotoSrc } — all optional.
    // `tilePhotoSrc` (close only) is the tile's own photo when it differs
    // from `photoSrc` (e.g. the visitor swiped to another carousel slide):
    // the tile's photo crossfades in over the flight so the clone lands on
    // what the tile actually shows instead of hard-cutting at the end.

    function flipFly(fromRect, toRect, photoSrc, themeColor, onLanded, opts) {
      const { tileEl, mode, tilePhotoSrc } = opts || {};
      // Material's standard ease (slow start, fast middle, soft landing).
      // The previous cubic-bezier(.2,.8,.2,1) was so front-loaded that ~78%
      // of a tile-to-fullscreen growth happened in the first 120ms and the
      // rest crawled — read as a lurch-then-drag rather than a smooth grow.
      const duration = 520;
      const easing = "cubic-bezier(.4,0,.2,1)";
      const px = (r) => ({ left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });

      const tileRect = mode === "close" ? toRect : fromRect;
      const tilePhotoEl = tileEl && tileEl.querySelector(".tile-photo");
      const pr = tilePhotoEl ? tilePhotoEl.getBoundingClientRect() : null;
      const smallPhoto = pr
        ? { left: pr.left - tileRect.left, top: pr.top - tileRect.top, width: pr.width, height: pr.height }
        : { left: 0, top: 0, width: tileRect.width, height: tileRect.height };
      const fullFrom = { left: 0, top: 0, width: fromRect.width, height: fromRect.height };
      const fullTo = { left: 0, top: 0, width: toRect.width, height: toRect.height };
      const photoFrom = mode === "open" ? smallPhoto : fullFrom;
      const photoTo = mode === "close" ? smallPhoto : fullTo;

      const clone = document.createElement("div");
      clone.className = "pop-clone";
      Object.assign(clone.style, px(fromRect), { position: "fixed", overflow: "hidden", zIndex: "120" });
      clone.style.willChange = "left, top, width, height";

      const layers = [];
      const addPhotoLayer = (src) => {
        const el = document.createElement(src ? "img" : "div");
        if (src) el.src = src;
        else el.style.backgroundImage = `linear-gradient(150deg, color-mix(in srgb, ${themeColor} 65%, white 12%), ${themeColor} 55%, color-mix(in srgb, ${themeColor} 82%, black 30%))`;
        el.style.cssText += ";position:absolute;object-fit:cover;";
        Object.assign(el.style, px(photoFrom));
        clone.appendChild(el);
        layers.push(el);
        return el;
      };
      addPhotoLayer(photoSrc);
      const tileLayer = mode === "close" && tilePhotoSrc && tilePhotoSrc !== photoSrc ? addPhotoLayer(tilePhotoSrc) : null;

      // Tile chrome (scrim/arrow/name/tagline), copied so it inherits the
      // tile's own descendant-selector styles, and faded rather than cut.
      let chrome = null;
      if (tileEl) {
        chrome = document.createElement("div");
        chrome.className = "area-tile" + (tileEl.classList.contains("size-large") ? " size-large" : "");
        chrome.style.cssText = "position:absolute;inset:0;background:none;pointer-events:none;";
        [".tile-scrim", ".tile-arrow", ".tile-text"].forEach((sel) => {
          const node = tileEl.querySelector(sel);
          if (node) chrome.appendChild(node.cloneNode(true));
        });
        chrome.style.opacity = mode === "close" ? "0" : "1";
        clone.appendChild(chrome);
      }
      document.body.appendChild(clone);

      const anim = clone.animate([px(fromRect), px(toRect)], { duration, easing, fill: "forwards" });
      layers.forEach((el) => {
        el.animate([px(photoFrom), px(photoTo)], { duration, easing, fill: "forwards" });
      });
      if (tileLayer) {
        tileLayer.style.opacity = "0";
        tileLayer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 340, delay: 60, easing: "linear", fill: "both" });
      }
      if (chrome) {
        if (mode === "close") {
          chrome.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: duration - 240, easing: "linear", fill: "both" });
        } else {
          chrome.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: "linear", fill: "forwards" });
        }
      }

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
        flipFly(fromRect, toRect, photoSrc, area.theme, reveal, { tileEl, mode: "open" });
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
          const tilePhoto = tileEl.querySelector(".tile-photo");
          flipFly(fromRect, toRect, photoSrc, area.theme, () => {}, {
            tileEl,
            mode: "close",
            tilePhotoSrc: tilePhoto ? tilePhoto.src : null,
          });
          previewEl.classList.remove("active");
        }, 150);
      } else {
        previewEl.classList.remove("active");
      }
    }

    document.getElementById("preview-close").addEventListener("click", closePreview);

    // -------------------------------------------------------------- Lucky Man Studio: full photo + tappable hotspots
    // Unlike every area tile, this one doesn't open the carousel/facts/Apply
    // preview at all — it pops (same FLIP mechanism) straight to a full
    // picture of the studio with hotspot markers over real equipment. See
    // reference/architecture.md and reference/design-system.md.

    // Tiny, deliberately limited markdown -> HTML for hotspot body text
    // (matches what Decap's "markdown" WYSIWYG widget stores). Escapes raw
    // HTML first, then re-introduces only **bold**, *italic*, and
    // [text](url) links, plus blank-line paragraphs. Not a general-purpose
    // parser — if a body ever needs more than that, upgrade this instead of
    // trusting raw HTML from content.json.
    function renderRichText(md) {
      if (!md) return "";
      const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return md
        .split(/\n\s*\n/)
        .map((para) => {
          let p = escape(para.trim());
          p = p.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
          p = p.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
          p = p.replace(/\*([^*]+)\*/g, "<em>$1</em>");
          p = p.replace(/\n/g, "<br>");
          return `<p>${p}</p>`;
        })
        .join("");
    }

    // studio-media is full-bleed (object-fit:cover, same as every other
    // tile's preview photo) — it crops rather than letterboxes, so a
    // hotspot's raw x/y% from content.json (a position on the *original*
    // photo) has to be re-mapped through the same scale-and-align math the
    // browser applies for object-fit:cover + object-position to land on the
    // right pixel of the *cropped, on-screen* photo. Recomputed on load and
    // on resize. When the crop hides part of the photo (a portrait display,
    // say — a landscape photo cover-fit into a tall box shows only its
    // middle third), the visitor can drag to pan; studioPan is the
    // object-position fraction (0..1) per axis, starting centered so it
    // matches the pop-out clone's crop exactly at hand-off.
    const studioPan = { x: 0.5, y: 0.5 };

    function studioCoverMetrics() {
      const natW = studioPhoto.naturalWidth;
      const natH = studioPhoto.naturalHeight;
      const box = studioMedia.getBoundingClientRect();
      if (!natW || !natH || !box.width || !box.height) return null;
      const scale = Math.max(box.width / natW, box.height / natH);
      const renderedW = natW * scale;
      const renderedH = natH * scale;
      return { box, renderedW, renderedH, overX: Math.max(0, renderedW - box.width), overY: Math.max(0, renderedH - box.height) };
    }

    const STUDIO_HINT = "Tap the glowing markers to explore the studio's gear";
    const STUDIO_HINT_PAN = "Swipe to look around, and tap the glowing markers to explore the gear";

    function positionHotspots() {
      const m = studioCoverMetrics();
      if (!m) return;
      const { box, renderedW, renderedH } = m;
      const offsetX = (box.width - renderedW) * studioPan.x;
      const offsetY = (box.height - renderedH) * studioPan.y;
      studioPhoto.style.objectPosition = `${studioPan.x * 100}% ${studioPan.y * 100}%`;
      studioTagline.textContent = m.overX > box.width * 0.12 ? STUDIO_HINT_PAN : STUDIO_HINT;
      hotspotLayer.querySelectorAll(".hotspot").forEach((el) => {
        const x = parseFloat(el.dataset.x);
        const y = parseFloat(el.dataset.y);
        const xPct = ((offsetX + (x / 100) * renderedW) / box.width) * 100;
        const yPct = ((offsetY + (y / 100) * renderedH) / box.height) * 100;
        el.style.left = `${xPct}%`;
        el.style.top = `${yPct}%`;
        el.classList.toggle("flip", xPct > 62);
      });
    }
    window.addEventListener("resize", positionHotspots);

    function closeAllHotspots() {
      hotspotLayer.querySelectorAll(".hotspot.open").forEach((h) => {
        h.classList.remove("open");
        h.querySelector(".hotspot-trigger").setAttribute("aria-expanded", "false");
      });
    }

    function renderHotspots(studio) {
      hotspotLayer.innerHTML = (studio.hotspots || [])
        .map(
          (h, i) => `
        <div class="hotspot" data-x="${h.x}" data-y="${h.y}" style="--hc:${h.color || "#0b2341"};--i:${i}" data-index="${i}">
          <button class="hotspot-trigger" aria-label="${h.title} — tap for details" aria-expanded="false">
            <span class="hotspot-ring"></span>
            <span class="hotspot-dot"></span>
          </button>
          <div class="hotspot-callout">
            <div class="callout-card">
              <div class="callout-title">${h.title}</div>
              <span class="callout-line"></span>
              <div class="callout-body">${renderRichText(h.body)}</div>
            </div>
          </div>
        </div>`
        )
        .join("");

      hotspotLayer.querySelectorAll(".hotspot-trigger").forEach((trigger) => {
        trigger.addEventListener("click", (e) => {
          e.stopPropagation();
          const hotspot = trigger.closest(".hotspot");
          const willOpen = !hotspot.classList.contains("open");
          closeAllHotspots();
          if (willOpen) {
            hotspot.classList.add("open");
            trigger.setAttribute("aria-expanded", "true");
          }
        });
      });

      positionHotspots();
    }

    function openStudio() {
      if (!luckyManStudio) return;
      const tileEl = document.getElementById("studio-tile");
      const photoImg = tileEl && tileEl.querySelector(".tile-photo");
      const photoSrc = photoImg ? photoImg.src : null;

      studioViewEl.style.setProperty("--theme", luckyManStudio.theme || "#0b2341");
      studioEyebrow.textContent = department.name;
      studioName.textContent = luckyManStudio.name;
      // Deliberately not luckyManStudio.tagline (that's for the hub tile) —
      // once you're already in the full-screen view, an actionable nudge
      // toward the hotspots is more useful than the tile's own description.
      studioTagline.textContent = STUDIO_HINT;
      studioApply.href = cta.url;
      studioApply.textContent = cta.label;
      studioPan.x = 0.5;
      studioPan.y = 0.5;
      closeAllHotspots();

      // Paint the real photo + hotspots into the still-hidden overlay before
      // the pop-out even starts (same trick as openPreview) — the tile's
      // photo is the same file, already cached, so by the time the clone
      // lands this is ready and the hand-off is seamless.
      studioPhoto.src = luckyManStudio.image || "";
      renderHotspots(luckyManStudio);
      studioViewEl.classList.remove("info-visible");

      const reveal = () => {
        studioViewEl.style.transition = "none";
        studioViewEl.classList.add("active");
        void studioViewEl.offsetWidth;
        studioViewEl.style.transition = "";
        requestAnimationFrame(() => studioViewEl.classList.add("info-visible"));
        positionHotspots();
      };

      if (tileEl && !prefersReducedMotion()) {
        const fromRect = tileEl.getBoundingClientRect();
        const toRect = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        flipFly(fromRect, toRect, photoSrc, luckyManStudio.theme, reveal, { tileEl, mode: "open" });
      } else {
        reveal();
      }
    }

    function closeStudio() {
      if (!studioViewEl.classList.contains("active")) return;
      closeAllHotspots();
      const tileEl = document.getElementById("studio-tile");
      const photoSrc = studioPhoto.getAttribute("src");
      studioViewEl.classList.remove("info-visible");

      if (tileEl && !prefersReducedMotion()) {
        setTimeout(() => {
          const fromRect = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
          const toRect = tileEl.getBoundingClientRect();
          const tilePhoto = tileEl.querySelector(".tile-photo");
          flipFly(fromRect, toRect, photoSrc, luckyManStudio && luckyManStudio.theme, () => {}, {
            tileEl,
            mode: "close",
            tilePhotoSrc: tilePhoto ? tilePhoto.src : null,
          });
          studioViewEl.classList.remove("active");
        }, 150);
      } else {
        studioViewEl.classList.remove("active");
      }
    }

    studioPhoto.addEventListener("load", positionHotspots);
    // Drag to pan when the cover crop hides part of the photo. A drag also
    // ends in a click on the media, which must not count as "tapped the
    // photo" (that closes the open hotspot), hence studioDragged.
    let studioDrag = null;
    let studioDragged = false;
    studioMedia.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".hotspot")) return;
      studioDrag = { x: e.clientX, y: e.clientY, panX: studioPan.x, panY: studioPan.y };
      studioDragged = false;
      studioMedia.setPointerCapture(e.pointerId);
    });
    studioMedia.addEventListener("pointermove", (e) => {
      if (!studioDrag) return;
      const dx = e.clientX - studioDrag.x;
      const dy = e.clientY - studioDrag.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) studioDragged = true;
      const m = studioCoverMetrics();
      if (!m || !studioDragged) return;
      if (m.overX > 1) studioPan.x = Math.min(1, Math.max(0, studioDrag.panX - dx / m.overX));
      if (m.overY > 1) studioPan.y = Math.min(1, Math.max(0, studioDrag.panY - dy / m.overY));
      positionHotspots();
    });
    const endStudioDrag = () => { studioDrag = null; };
    studioMedia.addEventListener("pointerup", endStudioDrag);
    studioMedia.addEventListener("pointercancel", endStudioDrag);
    // Tapping the photo itself (not a marker) closes whatever hotspot is open.
    studioMedia.addEventListener("click", () => {
      if (studioDragged) return;
      closeAllHotspots();
    });
    document.getElementById("studio-close").addEventListener("click", closeStudio);

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
      closeStudio();
      closeLightbox();
      setActiveView("hub");
    });

    // Undocumented staff reset: double-click/double-tap the logo to force
    // the attract screen up immediately, instead of waiting out idleTimeoutMs.
    // Not exposed anywhere in the UI on purpose.
    document.getElementById("brand-home").addEventListener("dblclick", (e) => {
      e.preventDefault();
      goHomeAndAttract();
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
      if (luckyManStudio && luckyManStudio.image) {
        pool.push({ src: luckyManStudio.image, theme: luckyManStudio.theme || "#0b2341" });
      }
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
      closeStudio();
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

    // Deliberately no "mousemove" here — on a laptop/trackpad, the cursor
    // drifting near the kiosk shouldn't count as a "tap." Only an actual
    // press/click (pointerdown covers touch and mouse alike) or a key does.
    ["pointerdown", "touchstart", "keydown"].forEach((evt) =>
      document.addEventListener(evt, resetIdle, { passive: true })
    );

    attractEl.addEventListener("click", resetIdle);

    // -------------------------------------------------------------- init

    renderHub();
    renderEqualizer(document.getElementById("eq-strip-hub"), 40);
    renderEqualizer(document.getElementById("eq-strip-attract"), 24);
    setActiveView("hub");
    // Boot straight to the attract/slideshow screen, not the hub — a kiosk
    // should open on its "come look" screen, not drop a visitor straight
    // into the tile grid. .active goes on synchronously, before
    // buildAttractWall's async image probing even starts, so there's no
    // flash of the hub underneath while the wall's photos are still
    // loading; goHomeAndAttract (called once probing finishes) then starts
    // the wall/caption timers on top of that. The idle timer itself only
    // gets armed once the user actually dismisses this and reaches the hub
    // — see resetIdle's wiring below, unchanged.
    attractEl.classList.add("active");
    buildAttractWall().then(goHomeAndAttract);
  }
})();
