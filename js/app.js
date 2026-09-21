(function () {
  "use strict";

  const { DEPARTMENT, AREAS, CTA_URL, CTA_LABEL, IDLE_TIMEOUT_MS } = window.KIOSK_CONTENT;

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

  document.getElementById("dept-name").textContent = DEPARTMENT.name;
  document.getElementById("hero-title").textContent = DEPARTMENT.heroTitle;
  document.getElementById("hero-sub").textContent = DEPARTMENT.heroSub;

  document.querySelectorAll("[data-cta-url]").forEach((el) => {
    if (el.tagName === "A") el.href = CTA_URL;
  });
  document.querySelectorAll("[data-cta-label]").forEach((el) => {
    el.textContent = CTA_LABEL;
  });

  // ---------------------------------------------------------------- render hub (two-column program listing)

  function renderHub() {
    const mid = Math.ceil(AREAS.length / 2);
    const columns = [AREAS.slice(0, mid), AREAS.slice(mid)];

    programList.innerHTML = columns
      .map(
        (col) => `
        <div class="program-col">
          ${col
            .map(
              (a) => `
            <button class="area-row" data-area="${a.id}" style="--row-color:${a.theme}">
              <span class="icon-badge">${icon(a.icon)}</span>
              <span class="row-text">
                <h3>${a.name}</h3>
                <span class="tagline">${a.tagline}</span>
              </span>
              <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
            </button>`
            )
            .join("")}
        </div>`
      )
      .join("");

    programList.querySelectorAll(".area-row").forEach((row) => {
      row.addEventListener("click", () => showArea(row.dataset.area));
    });
  }

  // ---------------------------------------------------------------- render area

  function mediaFrame(src, alt, iconName) {
    const wrap = document.createElement("div");
    wrap.className = "photo-frame";
    wrap.innerHTML = `<div class="media-placeholder">${icon(iconName)}<span>Photo coming soon</span></div>`;

    const img = new Image();
    img.alt = alt;
    img.loading = "lazy";
    img.addEventListener("load", () => {
      wrap.innerHTML = "";
      wrap.appendChild(img);
      wrap.addEventListener("click", () => openLightbox("image", src, alt));
    });
    img.addEventListener("error", () => {
      /* keep placeholder */
    });
    img.src = src;
    return wrap;
  }

  function videoFrame(area) {
    const wrap = document.createElement("div");
    wrap.className = "video-frame";
    wrap.innerHTML = `<div class="media-placeholder">${icon(area.icon)}<span>Video coming soon</span></div>`;

    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.addEventListener("loadedmetadata", () => {
      wrap.innerHTML = `
        <video muted playsinline preload="metadata" poster="${area.poster}">
          <source src="${area.video}" type="video/mp4">
        </video>
        <div class="play-badge"><span class="circle"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7-11-7Z"/></svg></span></div>`;
      wrap.addEventListener("click", () => openLightbox("video", area.video, area.name));
    });
    probe.addEventListener("error", () => {
      /* keep placeholder */
    });
    probe.src = area.video;
    return wrap;
  }

  function showArea(id) {
    const area = AREAS.find((a) => a.id === id);
    if (!area) return;

    areaContent.style.setProperty("--theme", area.theme);
    areaContent.innerHTML = `
      <div class="area-band" style="--theme:${area.theme}">
        <div class="kicker">
          <span class="icon-badge">${icon(area.icon)}</span>
          <span class="dept-label">${DEPARTMENT.name}</span>
        </div>
        <h2>${area.name}</h2>
        <p class="tagline">${area.tagline}</p>
      </div>
      <div class="area-body">
        <p class="area-description">${area.description}</p>
        <ul class="fact-list" style="--theme:${area.theme}">${area.facts.map((f) => `<li>${f}</li>`).join("")}</ul>

        <p class="media-caption">Photos</p>
        <div class="media-grid" id="photo-grid" style="--theme:${area.theme}"></div>

        <p class="media-caption">Hear the ${area.name.toLowerCase()} program</p>
        <div id="video-slot" style="--theme:${area.theme}"></div>

        <div class="ticket">
          <div class="ticket-main">
            <h3>Apply to ${area.name}</h3>
            <p>Scan the code, or tap the button up top, to start your Auburn Music application.</p>
            <a class="btn btn-primary" href="${CTA_URL}" data-cta-url data-cta-label></a>
          </div>
          <div class="ticket-stub">
            <div id="qr-slot"></div>
            <span class="scan-note">Scan to apply</span>
          </div>
        </div>
      </div>
    `;

    document.querySelectorAll("#area-content [data-cta-label]").forEach((el) => (el.textContent = CTA_LABEL));

    const photoGrid = document.getElementById("photo-grid");
    area.photos.forEach((src, i) => photoGrid.appendChild(mediaFrame(src, `${area.name} photo ${i + 1}`, area.icon)));

    document.getElementById("video-slot").appendChild(videoFrame(area));

    renderQR(document.getElementById("qr-slot"), CTA_URL);

    viewArea.scrollTop = 0;
    setActiveView("area");
  }

  // ---------------------------------------------------------------- QR code

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

  // ---------------------------------------------------------------- lightbox

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

  // ---------------------------------------------------------------- view switching

  function setActiveView(name) {
    viewHub.classList.toggle("active", name === "hub");
    viewArea.classList.toggle("active", name === "area");
  }

  document.getElementById("back-to-hub").addEventListener("click", () => setActiveView("hub"));
  document.getElementById("brand-home").addEventListener("click", () => setActiveView("hub"));

  // ---------------------------------------------------------------- idle / attract mode

  let idleTimer = null;

  function goHomeAndAttract() {
    setActiveView("hub");
    closeLightbox();
    attractEl.classList.add("active");
  }

  function resetIdle() {
    attractEl.classList.remove("active");
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(goHomeAndAttract, IDLE_TIMEOUT_MS);
  }

  ["pointerdown", "touchstart", "mousemove", "keydown"].forEach((evt) =>
    document.addEventListener(evt, resetIdle, { passive: true })
  );

  attractEl.addEventListener("click", resetIdle);

  // ---------------------------------------------------------------- init

  renderHub();
  setActiveView("hub");
  resetIdle();
})();
