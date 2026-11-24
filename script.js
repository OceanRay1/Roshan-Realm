document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');

  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');

  const apply = (t) => {
    root.setAttribute('data-theme', t);
    // Updates screen-reader text
    if (toggleBtn) toggleBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  };
  apply(theme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // Show the dock only when hero scrolled out of view
  const dock = document.querySelector('.jump');
  const hero = document.querySelector('.hero');
  if (dock && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => dock.classList.toggle('visible', !e.isIntersecting))
      .observe(hero);
  } else if (dock) {
    dock.classList.add('visible');
  }

  // Highlight quick-jump for section in view
  const links = [...document.querySelectorAll('.jump a')];
  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const sections = [...map.keys()].map(id => document.getElementById(id)).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(a => a.classList.remove('active'));
          map.get(e.target.id)?.classList.add('active');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach(s => io.observe(s));
  }
});

(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targets = Array.from(document.querySelectorAll(".section-title[data-type]"));
  if (!targets.length) return;

  // Track per-element state so overlapping timers/events stay clean
  const state = new WeakMap();

  function getState(el) {
    if (!state.has(el)) {
      state.set(el, {
        runId: 0,
        timerId: null,
        isVisible: false,
        hasTypedInCurrentView: false,
      });
    }
    return state.get(el);
  }

  function clearScheduledTimer(s) {
    if (s.timerId !== null) {
      clearTimeout(s.timerId);
      s.timerId = null;
    }
  }

  function setFinalText(el, s) {
    clearScheduledTimer(s);
    s.runId += 1;
    const fullText = el.dataset.type || "";
    const textEl = el.querySelector(".typed-text");
    const cursorEl = el.querySelector(".typed-cursor");
    if (textEl) textEl.textContent = fullText;
    if (cursorEl) {
      cursorEl.classList.remove("is-typing");
      cursorEl.classList.add("is-done");
    }
  }

  function getNextDelay(char, nextChar) {
    let delay = 55 + Math.random() * 50;
    if (Math.random() < 0.12) delay += 55;
    if (char === "/" || char === " ") delay += 85;
    else if (char === "_") delay += 45;
    if (nextChar === "/") delay *= 0.85;
    return delay;
  }

  function startTyping(el) {
    const s = getState(el);
    clearScheduledTimer(s);
    const currentRun = ++s.runId;

    const fullText = el.dataset.type || "";
    const textEl = el.querySelector(".typed-text");
    const cursorEl = el.querySelector(".typed-cursor");
    if (!textEl) return;

    if (prefersReducedMotion) {
      setFinalText(el, s);
      return;
    }

    s.hasTypedInCurrentView = true;
    let i = 0;
    textEl.textContent = "";
    if (cursorEl) {
      cursorEl.classList.remove("is-done");
      cursorEl.classList.add("is-typing");
    }

    function step() {
      if (s.runId !== currentRun) return; // superseded by reset or new run

      if (i < fullText.length) {
        const currentChar = fullText[i];
        const nextChar = fullText[i + 1] || "";
        textEl.textContent += currentChar;
        i += 1;
        s.timerId = setTimeout(step, getNextDelay(currentChar, nextChar));
      } else {
        s.timerId = null;
        if (cursorEl) {
          cursorEl.classList.remove("is-typing");
          cursorEl.classList.add("is-done");
        }
      }
    }

    s.timerId = setTimeout(step, 180);
  }

  function resetTitle(el) {
    const s = getState(el);
    clearScheduledTimer(s);
    s.runId += 1;
    s.hasTypedInCurrentView = false;

    const textEl = el.querySelector(".typed-text");
    const cursorEl = el.querySelector(".typed-cursor");
    if (textEl) textEl.textContent = "";
    if (cursorEl) {
      cursorEl.classList.remove("is-typing", "is-done");
    }
  }

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    targets.forEach((el) => setFinalText(el, getState(el)));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        const s = getState(el);

        if (entry.isIntersecting) {
          s.isVisible = true;
          // start if tab is currently active and hasn't already started in this pass
          if (document.visibilityState === "visible" && !s.hasTypedInCurrentView) {
            startTyping(el);
          }
        } else {
          s.isVisible = false;
          resetTitle(el);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -30px 0px" }
  );

  targets.forEach((el) => observer.observe(el));

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      targets.forEach((el) => {
        const s = getState(el);
        if (s.isVisible) {
          startTyping(el);
        }
      });
    } else {
      targets.forEach((el) => {
        const s = getState(el);
        if (!s.isVisible) resetTitle(el);
      });
    }
  });
})();

(() => {
    const section = document.querySelector(".projects-carousel-section");
    if (!section) return;

    const viewport = section.querySelector(".carousel-viewport");
    const slides = Array.from(section.querySelectorAll(".carousel-slide"));
    const prevBtn = section.querySelector('[data-dir="-1"]');
    const nextBtn = section.querySelector('[data-dir="1"]');
    const dotsContainer = section.querySelector(".carousel-dots");

    if (slides.length <= 1) return;

    let activeIndex = 0;
    let isDragging = false;
    let startX = 0;
    let deltaX = 0;

    const dots = slides.map((_, idx) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", `Show project ${idx + 1}`);
        dot.addEventListener("click", () => goTo(idx));
        dotsContainer.appendChild(dot);
        return dot;
    });

    function render() {
        const total = slides.length;
        const prevIdx = (activeIndex - 1 + total) % total;
        const nextIdx = (activeIndex + 1) % total;

        slides.forEach((slide, idx) => {
            const isActive = idx === activeIndex;
            const isPrev = total > 2 ? idx === prevIdx : idx !== activeIndex && idx === nextIdx;
            const isNext = total > 2 ? idx === nextIdx : idx !== activeIndex && !isPrev;

            slide.classList.toggle("is-active", isActive);
            slide.classList.toggle("is-prev", isPrev && !isActive);
            slide.classList.toggle("is-next", isNext && !isActive);
            slide.setAttribute("aria-hidden", String(!isActive));
        });

        dots.forEach((dot, idx) => {
            dot.setAttribute("aria-selected", String(idx === activeIndex));
        });
    }

    function goTo(index) {
        const total = slides.length;
        activeIndex = ((index % total) + total) % total;
        render();
    }

    prevBtn.addEventListener("click", () => goTo(activeIndex - 1));
    nextBtn.addEventListener("click", () => goTo(activeIndex + 1));

    slides.forEach((slide, idx) => {
        slide.addEventListener("click", (e) => {
            if (e.target.closest("a")) return;
            if (Math.abs(deltaX) > 10) return;
            if (idx !== activeIndex) goTo(idx);
        });
    });

    viewport.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            goTo(activeIndex - 1);
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            goTo(activeIndex + 1);
        }
    });

    viewport.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        if (e.target.closest("a, button")) return;
        isDragging = true;
        startX = e.clientX;
        deltaX = 0;
        viewport.setPointerCapture(e.pointerId);
    });

    viewport.addEventListener("pointermove", (e) => {
        if (!isDragging) return;
        deltaX = e.clientX - startX;
    });

    function finishDrag() {
        if (!isDragging) return;
        isDragging = false;

        if (deltaX < -55) goTo(activeIndex + 1);
        else if (deltaX > 55) goTo(activeIndex - 1);
        deltaX = 0;
    }

    viewport.addEventListener("pointerup", finishDrag);
    viewport.addEventListener("pointercancel", finishDrag);

    render();
})();