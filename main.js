const yearEl = document.getElementById("year");
const nav = document.querySelector(".navbar-glass");
const heroStack = document.querySelector(".hero-stack");
const navLinks = document.querySelectorAll("#navbarMenu .nav-link");
const navbarMenu = document.getElementById("navbarMenu");
const introAudio = document.getElementById("introAudio");
const introUnlockBtn = document.getElementById("introUnlockBtn");

if (introAudio) {
  const showUnlockBtn = () => {
    if (introUnlockBtn) {
      introUnlockBtn.classList.remove("d-none");
    }
  };

  const hideUnlockBtn = () => {
    if (introUnlockBtn) {
      introUnlockBtn.classList.add("d-none");
    }
  };

  const playIntro = () => {
    const playPromise = introAudio.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          hideUnlockBtn();
        })
        .catch(() => {
          showUnlockBtn();
        });
    }
  };

  const unlockByGesture = () => {
    const retryPromise = introAudio.play();
    if (retryPromise && typeof retryPromise.then === "function") {
      retryPromise
        .then(() => {
          hideUnlockBtn();
        })
        .catch(() => {
          showUnlockBtn();
        });
    }
  };

  introAudio.currentTime = 0;
  introAudio.volume = 1;

  if (document.readyState === "complete") {
    playIntro();
  } else {
    window.addEventListener("load", playIntro, { once: true });
  }

  introAudio.addEventListener(
    "canplaythrough",
    () => {
      if (introAudio.paused) {
        playIntro();
      }
    },
    { once: true }
  );

  document.addEventListener("pointerdown", unlockByGesture, { once: true });
  document.addEventListener("keydown", unlockByGesture, { once: true });
  document.addEventListener("touchstart", unlockByGesture, { once: true });

  if (introUnlockBtn) {
    introUnlockBtn.addEventListener("click", unlockByGesture);
  }

  introAudio.addEventListener("play", () => {
    hideUnlockBtn();
  });

  introAudio.addEventListener("error", () => {
    if (!introUnlockBtn) {
      return;
    }

    introUnlockBtn.classList.remove("d-none");
    introUnlockBtn.disabled = true;
    introUnlockBtn.textContent = "Khong the phat nhac";
  });
}

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

if (window.AOS) {
  window.AOS.init({
    duration: 700,
    easing: "ease-out-cubic",
    once: false,
    mirror: true,
    offset: 70,
  });
}

const handleNavState = () => {
  if (!nav) {
    return;
  }

  if (window.scrollY > 12) {
    nav.classList.add("navbar-solid");
  } else {
    nav.classList.remove("navbar-solid");
  }
};

handleNavState();
document.addEventListener("scroll", handleNavState, { passive: true });

if (heroStack) {
  heroStack.addEventListener("pointermove", (event) => {
    const rect = heroStack.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    heroStack.style.transform = `rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(
      x * 8
    ).toFixed(2)}deg)`;
  });

  heroStack.addEventListener("pointerleave", () => {
    heroStack.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
}

if (navbarMenu && window.bootstrap) {
  const collapse = new window.bootstrap.Collapse(navbarMenu, { toggle: false });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 992 && navbarMenu.classList.contains("show")) {
        collapse.hide();
      }
    });
  });
}

const movieShowcases = document.querySelectorAll(".movie-showcase");

movieShowcases.forEach((showcase) => {
  const promoText = showcase.querySelector(".movie-promo-text");
  const defaultPromoText = promoText ? promoText.textContent : "";

  if (!promoText) {
    return;
  }

  const phrasesRaw = showcase.getAttribute("data-phrases");
  let phrases = [];

  if (phrasesRaw) {
    try {
      const parsedPhrases = JSON.parse(phrasesRaw);
      if (Array.isArray(parsedPhrases)) {
        phrases = parsedPhrases.filter((item) => typeof item === "string" && item.trim());
      }
    } catch {
      phrases = [];
    }
  }

  if (phrases.length === 0) {
    return;
  }

  let activeIndex = 0;
  let intervalId;
  let swapTimeoutId;

  const renderPromoCharacters = (text) => {
    promoText.innerHTML = "";

    const fragment = document.createDocumentFragment();
    [...text].forEach((char, index) => {
      const span = document.createElement("span");
      span.className = "promo-char";
      span.style.setProperty("--char-index", String(index));
      span.textContent = char === " " ? "\u00A0" : char;
      fragment.appendChild(span);
    });

    promoText.appendChild(fragment);
  };

  const setPhrase = () => {
    promoText.classList.add("swap-out");

    if (swapTimeoutId) {
      window.clearTimeout(swapTimeoutId);
      swapTimeoutId = undefined;
    }

    swapTimeoutId = window.setTimeout(() => {
      renderPromoCharacters(phrases[activeIndex]);
      promoText.classList.remove("swap-out");
      swapTimeoutId = undefined;
    }, 130);
  };

  const startRotate = (speed = 2500) => {
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = undefined;
    }

    intervalId = window.setInterval(() => {
      activeIndex = (activeIndex + 1) % phrases.length;
      setPhrase();
    }, speed);
  };

  const clearSwapTimeout = () => {
    if (swapTimeoutId) {
      window.clearTimeout(swapTimeoutId);
      swapTimeoutId = undefined;
    }
  };

  const enableHoverBoost = () => {
    showcase.classList.add("is-hovered");
    clearSwapTimeout();
    startRotate(1300);
  };

  const disableHoverBoost = () => {
    showcase.classList.remove("is-hovered");
    clearSwapTimeout();
    startRotate(2500);
  };

  renderPromoCharacters(defaultPromoText || phrases[0]);
  startRotate(2500);

  showcase.addEventListener("mouseenter", enableHoverBoost);
  showcase.addEventListener("focusin", enableHoverBoost);
  showcase.addEventListener("mouseleave", disableHoverBoost);

  showcase.addEventListener("focusout", (event) => {
    if (!showcase.contains(event.relatedTarget)) {
      disableHoverBoost();
    }
  });
});

const coverMovieShowcases = document.querySelectorAll(".gongcha-showcase, .realestate-showcase");

if (coverMovieShowcases.length > 0) {
  const updateCoverShowcaseScale = () => {
    coverMovieShowcases.forEach((showcase) => {
      const styles = window.getComputedStyle(showcase);
      const sourceWidth = Number.parseFloat(styles.getPropertyValue("--movie-iframe-width"));
      const sourceHeight = Number.parseFloat(styles.getPropertyValue("--movie-iframe-height"));

      if (
        !Number.isFinite(sourceWidth) ||
        !Number.isFinite(sourceHeight) ||
        sourceWidth <= 0 ||
        sourceHeight <= 0
      ) {
        return;
      }

      const targetWidth = showcase.clientWidth;
      const targetHeight = showcase.clientHeight;

      if (targetWidth <= 0 || targetHeight <= 0) {
        return;
      }

      // Keep iframe always in cover mode so no empty area appears in the preview card.
      const coverScale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight) + 0.012;

      showcase.style.setProperty("--movie-iframe-scale", coverScale.toFixed(4));
      showcase.style.setProperty("--movie-iframe-scale-hover", (coverScale + 0.006).toFixed(4));
    });
  };

  let resizeRafId = 0;

  const handleCoverResize = () => {
    if (resizeRafId) {
      window.cancelAnimationFrame(resizeRafId);
    }

    resizeRafId = window.requestAnimationFrame(() => {
      updateCoverShowcaseScale();
      resizeRafId = 0;
    });
  };

  updateCoverShowcaseScale();
  window.addEventListener("load", updateCoverShowcaseScale, { once: true });
  window.addEventListener("resize", handleCoverResize, { passive: true });
}

const selfcareShowcases = document.querySelectorAll(".selfcare-showcase");

selfcareShowcases.forEach((showcase) => {
  const imageEl = showcase.querySelector(".selfcare-media-image");
  const videoEl = showcase.querySelector(".selfcare-media-video");
  const statusLabel = showcase.querySelector(".selfcare-status");

  if (!imageEl || !videoEl) {
    return;
  }

  const rawSources = showcase.getAttribute("data-media-sources");
  let sources = [];

  if (rawSources) {
    try {
      const parsedSources = JSON.parse(rawSources);
      if (Array.isArray(parsedSources)) {
        sources = parsedSources
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean);
      }
    } catch {
      sources = [];
    }
  }

  if (sources.length === 0) {
    showcase.classList.add("has-media-error");
    if (statusLabel) {
      statusLabel.textContent = "Chua co media";
    }
    return;
  }

  const imagePattern = /\.(jpg|jpeg|png|gif|webp|avif)$/i;
  const videoPattern = /\.(mp4|webm|ogg)$/i;
  const imageDurationMs = 3200;

  let activeIndex = 0;
  let consecutiveErrorCount = 0;
  let imageTimeoutId;

  const clearImageTimeout = () => {
    if (imageTimeoutId) {
      window.clearTimeout(imageTimeoutId);
      imageTimeoutId = undefined;
    }
  };

  const updateStatus = () => {
    if (!statusLabel) {
      return;
    }

    statusLabel.textContent = `Media ${activeIndex + 1}/${sources.length}`;
  };

  const moveToNext = () => {
    activeIndex = (activeIndex + 1) % sources.length;
    showActive();
  };

  const showActive = () => {
    clearImageTimeout();

    const currentSource = sources[activeIndex];
    const isImage = imagePattern.test(currentSource);
    const isVideo = videoPattern.test(currentSource);

    if (!isImage && !isVideo) {
      consecutiveErrorCount += 1;
      if (consecutiveErrorCount >= sources.length) {
        showcase.classList.add("has-media-error");
        if (statusLabel) {
          statusLabel.textContent = "Khong the tai media";
        }
        return;
      }

      moveToNext();
      return;
    }

    updateStatus();

    if (isImage) {
      videoEl.pause();
      videoEl.removeAttribute("src");
      videoEl.load();

      imageEl.hidden = false;
      videoEl.hidden = true;

      imageEl.src = currentSource;
      imageTimeoutId = window.setTimeout(moveToNext, imageDurationMs);
      return;
    }

    imageEl.hidden = true;
    videoEl.hidden = false;

    videoEl.src = currentSource;
    videoEl.load();

    const playPromise = videoEl.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Browser autoplay policy may block play before user interaction.
      });
    }
  };

  imageEl.addEventListener("load", () => {
    consecutiveErrorCount = 0;
  });

  imageEl.addEventListener("error", () => {
    consecutiveErrorCount += 1;

    if (consecutiveErrorCount >= sources.length) {
      showcase.classList.add("has-media-error");
      if (statusLabel) {
        statusLabel.textContent = "Khong the tai media";
      }
      return;
    }

    moveToNext();
  });

  videoEl.addEventListener("loadeddata", () => {
    consecutiveErrorCount = 0;
  });

  videoEl.addEventListener("ended", moveToNext);

  videoEl.addEventListener("error", () => {
    consecutiveErrorCount += 1;

    if (consecutiveErrorCount >= sources.length) {
      showcase.classList.add("has-media-error");
      if (statusLabel) {
        statusLabel.textContent = "Khong the tai media";
      }
      return;
    }

    moveToNext();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden || videoEl.hidden || showcase.classList.contains("has-media-error")) {
      return;
    }

    const playPromise = videoEl.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  });

  showActive();
});

const musicVideoShowcases = document.querySelectorAll(".music-video-showcase");

musicVideoShowcases.forEach((showcase) => {
  const player = showcase.querySelector(".music-video-player");
  const statusLabel = showcase.querySelector(".music-video-status");

  if (!player) {
    return;
  }

  const rawSources = showcase.getAttribute("data-video-sources");
  let sources = [];

  if (rawSources) {
    try {
      const parsedSources = JSON.parse(rawSources);
      if (Array.isArray(parsedSources)) {
        sources = parsedSources
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean);
      }
    } catch {
      sources = [];
    }
  }

  if (sources.length === 0) {
    showcase.classList.add("has-video-error");
    if (statusLabel) {
      statusLabel.textContent = "Chua co video mp4";
    }
    return;
  }

  let activeIndex = 0;
  let errorCount = 0;

  const updateStatus = () => {
    if (statusLabel) {
      statusLabel.textContent = `Video ${activeIndex + 1}/${sources.length}`;
    }
  };

  const loadActiveVideo = () => {
    player.src = sources[activeIndex];
    player.load();
    updateStatus();

    const playPromise = player.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Autoplay can be blocked depending on browser policy.
      });
    }
  };

  const playNextVideo = () => {
    activeIndex = (activeIndex + 1) % sources.length;
    errorCount = 0;
    loadActiveVideo();
  };

  player.addEventListener("ended", playNextVideo);

  player.addEventListener("error", () => {
    errorCount += 1;

    if (errorCount >= sources.length) {
      showcase.classList.add("has-video-error");
      if (statusLabel) {
        statusLabel.textContent = "Khong the tai video";
      }
      return;
    }

    activeIndex = (activeIndex + 1) % sources.length;
    loadActiveVideo();
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !showcase.classList.contains("has-video-error")) {
      const playPromise = player.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    }
  });

  loadActiveVideo();
});

const mediaGalleryModalEl = document.getElementById("mediaGalleryModal");
const mediaGalleryTitleEl = document.getElementById("mediaGalleryTitle");
const mediaGalleryCarouselEl = document.getElementById("mediaGalleryCarousel");
const mediaGalleryInnerEl = document.getElementById("mediaGalleryInner");

if (
  mediaGalleryModalEl &&
  mediaGalleryTitleEl &&
  mediaGalleryCarouselEl &&
  mediaGalleryInnerEl &&
  window.bootstrap
) {
  const imagePattern = /\.(jpg|jpeg|png|gif|webp|avif)$/i;
  const videoPattern = /\.(mp4|webm|ogg)$/i;

  let activeGalleryTitle = "Thư viện media";
  let activeGalleryTotal = 0;

  const modal = new window.bootstrap.Modal(mediaGalleryModalEl);
  const carousel = new window.bootstrap.Carousel(mediaGalleryCarouselEl, {
    interval: false,
    ride: false,
    touch: true,
    wrap: true,
  });

  const parseSourceList = (raw) => {
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
      }
    } catch {
      return [];
    }

    return [];
  };

  const getShowcaseSources = (showcase) => {
    const mixedMediaRaw = showcase.getAttribute("data-media-sources");
    if (mixedMediaRaw) {
      return parseSourceList(mixedMediaRaw);
    }

    const videoRaw = showcase.getAttribute("data-video-sources");
    return parseSourceList(videoRaw);
  };

  const getShowcaseTitle = (showcase) => {
    const cardHeading = showcase.closest("article")?.querySelector("h3");
    if (cardHeading && cardHeading.textContent) {
      return cardHeading.textContent.trim();
    }

    return "Thư viện media";
  };

  const getShowcaseCurrentSource = (showcase) => {
    if (showcase.classList.contains("selfcare-showcase")) {
      const activeImage = showcase.querySelector(".selfcare-media-image:not([hidden])");
      const activeVideo = showcase.querySelector(".selfcare-media-video:not([hidden])");

      if (activeImage && activeImage.getAttribute("src")) {
        return activeImage.getAttribute("src");
      }

      if (activeVideo && activeVideo.getAttribute("src")) {
        return activeVideo.getAttribute("src");
      }

      return "";
    }

    const previewVideo = showcase.querySelector(".music-video-player");
    return previewVideo ? previewVideo.getAttribute("src") || "" : "";
  };

  const pauseGalleryVideos = () => {
    mediaGalleryInnerEl.querySelectorAll("video").forEach((video) => {
      video.pause();
    });
  };

  const playActiveGalleryVideo = () => {
    const activeVideo = mediaGalleryInnerEl.querySelector(".carousel-item.active video");
    if (!activeVideo) {
      return;
    }

    const playPromise = activeVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  const updateGalleryTitle = (index) => {
    mediaGalleryTitleEl.textContent = `${activeGalleryTitle} (${index + 1}/${activeGalleryTotal})`;
  };

  const buildGallerySlides = (sources) => {
    mediaGalleryInnerEl.innerHTML = "";

    sources.forEach((source, index) => {
      const item = document.createElement("div");
      item.className = `carousel-item${index === 0 ? " active" : ""}`;
      item.setAttribute("data-gallery-index", String(index));

      const stage = document.createElement("div");
      stage.className = "media-gallery-stage";

      if (imagePattern.test(source)) {
        const image = document.createElement("img");
        image.src = source;
        image.alt = `${activeGalleryTitle} - media ${index + 1}`;
        image.loading = "lazy";
        stage.appendChild(image);
      } else if (videoPattern.test(source)) {
        const video = document.createElement("video");
        video.src = source;
        video.controls = true;
        video.preload = "metadata";
        video.setAttribute("playsinline", "");
        stage.appendChild(video);
      }

      const caption = document.createElement("p");
      caption.className = "media-gallery-caption";
      caption.textContent = `Media ${index + 1}/${sources.length}`;

      item.append(stage, caption);
      mediaGalleryInnerEl.appendChild(item);
    });

    mediaGalleryCarouselEl.classList.toggle("is-single", sources.length <= 1);
  };

  const openGallery = (showcase) => {
    const sources = getShowcaseSources(showcase);
    if (sources.length === 0) {
      return;
    }

    activeGalleryTitle = getShowcaseTitle(showcase);
    activeGalleryTotal = sources.length;

    const currentSource = getShowcaseCurrentSource(showcase);
    const matchedIndex = currentSource ? sources.findIndex((source) => source === currentSource) : -1;
    const startIndex = matchedIndex >= 0 ? matchedIndex : 0;

    buildGallerySlides(sources);
    updateGalleryTitle(startIndex);
    modal.show();

    window.requestAnimationFrame(() => {
      carousel.to(startIndex);
      playActiveGalleryVideo();
    });
  };

  const galleryTargets = document.querySelectorAll(".selfcare-showcase, .music-video-showcase");

  galleryTargets.forEach((showcase) => {
    showcase.setAttribute("tabindex", "0");
    showcase.setAttribute("role", "button");
    showcase.setAttribute("aria-label", "Bấm để xem toàn bộ media");

    showcase.addEventListener("click", () => {
      openGallery(showcase);
    });

    showcase.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      openGallery(showcase);
    });
  });

  mediaGalleryCarouselEl.addEventListener("slide.bs.carousel", () => {
    pauseGalleryVideos();
  });

  mediaGalleryCarouselEl.addEventListener("slid.bs.carousel", () => {
    const activeItem = mediaGalleryInnerEl.querySelector(".carousel-item.active");
    const activeIndex = activeItem ? Number(activeItem.getAttribute("data-gallery-index") || "0") : 0;

    updateGalleryTitle(activeIndex);
    playActiveGalleryVideo();
  });

  mediaGalleryModalEl.addEventListener("hidden.bs.modal", () => {
    pauseGalleryVideos();
    mediaGalleryInnerEl.innerHTML = "";
  });
}

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  const statusEl = document.getElementById("contactFormStatus");
  const submitBtn = document.getElementById("contactSubmitBtn");
  const receiverEmail = (contactForm.getAttribute("data-receiver-email") || "").trim();
  const submitUrl = receiverEmail
    ? `https://formsubmit.co/ajax/${encodeURIComponent(receiverEmail)}`
    : "";
  const isLocalFileMode = window.location.protocol === "file:";

  const spamGuardKey = "hyun_contact_spam_guard_v1";
  const spamMinFillMs = 3500;
  const spamMinIntervalMs = 25000;
  const spamWindowMs = 10 * 60 * 1000;
  const spamMaxPerWindow = 3;
  const spamDuplicateWindowMs = 30 * 60 * 1000;

  let formOpenedAt = Date.now();

  const normalizeText = (value) => String(value || "").trim().replace(/\s+/g, " ").toLowerCase();

  const readSpamState = () => {
    try {
      const raw = window.localStorage.getItem(spamGuardKey);
      const parsed = raw ? JSON.parse(raw) : {};

      const submissions = Array.isArray(parsed.submissions)
        ? parsed.submissions.filter((time) => typeof time === "number")
        : [];

      const recentPayloads = Array.isArray(parsed.recentPayloads)
        ? parsed.recentPayloads.filter(
            (item) =>
              item &&
              typeof item.fingerprint === "string" &&
              typeof item.timestamp === "number"
          )
        : [];

      const lastSubmitAt = typeof parsed.lastSubmitAt === "number" ? parsed.lastSubmitAt : 0;

      return { submissions, recentPayloads, lastSubmitAt };
    } catch {
      return { submissions: [], recentPayloads: [], lastSubmitAt: 0 };
    }
  };

  const saveSpamState = (state) => {
    try {
      window.localStorage.setItem(spamGuardKey, JSON.stringify(state));
    } catch {
      // Ignore storage failures (private mode / blocked storage).
    }
  };

  const pruneSpamState = (state, now) => {
    const submissions = state.submissions.filter((time) => now - time <= spamWindowMs);
    const recentPayloads = state.recentPayloads.filter(
      (item) => now - item.timestamp <= spamDuplicateWindowMs
    );

    return {
      submissions,
      recentPayloads,
      lastSubmitAt: state.lastSubmitAt,
    };
  };

  const createPayloadFingerprint = (formData) => {
    const name = normalizeText(formData.get("ho_ten"));
    const topic = normalizeText(formData.get("chu_de"));
    const message = normalizeText(formData.get("loi_nhan"));
    return `${name}::${topic}::${message}`;
  };

  const validateSpamGuard = (formData) => {
    const now = Date.now();

    if (now - formOpenedAt < spamMinFillMs) {
      return {
        ok: false,
        message: "Bạn gửi quá nhanh. Vui lòng chờ vài giây rồi thử lại.",
      };
    }

    const state = pruneSpamState(readSpamState(), now);

    if (state.lastSubmitAt && now - state.lastSubmitAt < spamMinIntervalMs) {
      const waitSeconds = Math.ceil((spamMinIntervalMs - (now - state.lastSubmitAt)) / 1000);
      return {
        ok: false,
        message: `Bạn vừa gửi xong. Vui lòng chờ ${waitSeconds}s để gửi tiếp.`,
      };
    }

    if (state.submissions.length >= spamMaxPerWindow) {
      return {
        ok: false,
        message: "Bạn đã gửi quá nhiều lần trong thời gian ngắn. Vui lòng thử lại sau ít phút.",
      };
    }

    const fingerprint = createPayloadFingerprint(formData);
    const isDuplicate = state.recentPayloads.some((item) => item.fingerprint === fingerprint);

    if (isDuplicate) {
      return {
        ok: false,
        message: "Nội dung này vừa được gửi gần đây. Vui lòng chỉnh nội dung trước khi gửi lại.",
      };
    }

    return {
      ok: true,
      state,
      now,
      fingerprint,
    };
  };

  const commitSpamGuard = (state, now, fingerprint) => {
    const nextState = {
      submissions: [...state.submissions, now],
      recentPayloads: [...state.recentPayloads, { fingerprint, timestamp: now }],
      lastSubmitAt: now,
    };

    saveSpamState(nextState);
  };

  const setStatus = (message, tone = "info") => {
    if (!statusEl) {
      return;
    }

    statusEl.textContent = message;
    statusEl.classList.remove("text-secondary", "text-success", "text-danger");

    if (tone === "success") {
      statusEl.classList.add("text-success");
      return;
    }

    if (tone === "error") {
      statusEl.classList.add("text-danger");
      return;
    }

    statusEl.classList.add("text-secondary");
  };

  if (!submitUrl) {
    setStatus("Chưa cấu hình email nhận. Hãy đặt data-receiver-email trong form.", "error");
  }

  if (isLocalFileMode) {
    setStatus(
      "Bạn đang mở web bằng file trực tiếp. Hãy chạy qua localhost (VD: Live Server) để gửi email được.",
      "error"
    );
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!submitUrl) {
      return;
    }

    if (isLocalFileMode) {
      setStatus(
        "Không thể gửi email ở chế độ file://. Hãy mở bằng localhost rồi thử lại.",
        "error"
      );
      return;
    }

    if (!contactForm.reportValidity()) {
      return;
    }

    const formData = new FormData(contactForm);

    if (formData.get("_honey")) {
      setStatus("Yêu cầu không hợp lệ. Vui lòng thử lại.", "error");
      return;
    }

    if (!formData.get("chu_de")) {
      setStatus("Vui lòng chọn chủ đề trước khi gửi.", "error");
      return;
    }

    const spamGuardResult = validateSpamGuard(formData);
    if (!spamGuardResult.ok) {
      setStatus(spamGuardResult.message, "error");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-busy", "true");
    }

    setStatus("Đang gửi tin nhắn...", "info");

    try {
      const response = await fetch(submitUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || (result && result.success === "false")) {
        const apiMessage = result && typeof result.message === "string" ? result.message : "Gửi thất bại.";

        if (apiMessage.toLowerCase().includes("web server")) {
          throw new Error("FormSubmit yêu cầu mở web qua localhost hoặc hosting, không chạy bằng file trực tiếp.");
        }

        if (apiMessage.toLowerCase().includes("activate") || apiMessage.toLowerCase().includes("verify")) {
          throw new Error("Email nhận chưa xác minh. Hãy kiểm tra inbox huynh080104@gmail.com và bấm link xác nhận của FormSubmit.");
        }

        throw new Error(apiMessage);
      }

      contactForm.reset();
      commitSpamGuard(spamGuardResult.state, spamGuardResult.now, spamGuardResult.fingerprint);
      formOpenedAt = Date.now();
      setStatus("Đã gửi thành công. Bạn sẽ nhận email thông báo sớm.", "success");
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : "Gửi thất bại. Bạn thử lại sau nhé.";
      setStatus(message, "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute("aria-busy");
      }
    }
  });
}

const buildsContainer = document.querySelector('.builds-scroll-container');
const buildsBtnPrev = document.querySelector('.builds-btn-prev');
const buildsBtnNext = document.querySelector('.builds-btn-next');

if (buildsContainer && buildsBtnPrev && buildsBtnNext) {
  buildsBtnPrev.addEventListener('click', () => {
    const firstCard = buildsContainer.querySelector('.col-md-6, .col-lg-3');
    const scrollAmount = firstCard ? firstCard.offsetWidth : 300;
    buildsContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  buildsBtnNext.addEventListener('click', () => {
    const firstCard = buildsContainer.querySelector('.col-md-6, .col-lg-3');
    const scrollAmount = firstCard ? firstCard.offsetWidth : 300;
    buildsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
}
