const yearEl = document.getElementById("year");
const nav = document.querySelector(".navbar-glass");
const heroStack = document.querySelector(".hero-stack");
const navLinks = document.querySelectorAll("#navbarMenu .nav-link");
const navbarMenu = document.getElementById("navbarMenu");

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

if (window.AOS) {
  window.AOS.init({
    duration: 700,
    easing: "ease-out-cubic",
    once: true,
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

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  const statusEl = document.getElementById("contactFormStatus");
  const submitBtn = document.getElementById("contactSubmitBtn");
  const receiverEmail = (contactForm.getAttribute("data-receiver-email") || "").trim();
  const submitUrl = receiverEmail
    ? `https://formsubmit.co/ajax/${encodeURIComponent(receiverEmail)}`
    : "";
  const isLocalFileMode = window.location.protocol === "file:";

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

    if (!formData.get("chu_de")) {
      setStatus("Vui lòng chọn chủ đề trước khi gửi.", "error");
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
