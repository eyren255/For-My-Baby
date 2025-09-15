// Global enhancements: floating decor, scroll reveal, and button sparkles
(function () {
    function ready(fn) {
        if (document.readyState !== "loading") fn();
        else document.addEventListener("DOMContentLoaded", fn);
    }

    function addFloatingDecor() {
        // Use existing .decor if present, else create one at body level
        let decor = document.querySelector(".decor");
        if (!decor) {
            decor = document.createElement("div");
            decor.className = "decor";
            document.body.appendChild(decor);
        }
        // If already populated, skip
        if (decor.childElementCount > 6) return;
        const count = 16;
        for (let i = 0; i < count; i++) {
            const s = document.createElement("span");
            const left = Math.random() * 100;
            const delay = Math.random() * 8;
            const bottom = -10 - Math.random() * 30; // start below viewport
            const size = 14 + Math.random() * 10;
            s.style.left = left.toFixed(2) + "%";
            s.style.bottom = bottom.toFixed(2) + "%";
            s.style.animationDelay = delay.toFixed(2) + "s";
            s.style.fontSize = size.toFixed(0) + "px";
            decor.appendChild(s);
        }
    }

    function setupReveal() {
        const els = Array.from(document.querySelectorAll(".reveal"));
        // Auto-tag common elements if they don't already have reveal
        const candidates = [".feature-card", ".section", ".timeline .item", ".grid.gallery img"];
        candidates.forEach((sel) => {
            document.querySelectorAll(sel).forEach((el) => {
                if (!el.classList.contains("reveal")) el.classList.add("reveal");
            });
        });

        const all = Array.from(document.querySelectorAll(".reveal"));
        if (!("IntersectionObserver" in window)) {
            all.forEach((e) => e.classList.add("in"));
            return;
        }
        const ob = new IntersectionObserver(
            (entries) => {
                entries.forEach((en) => {
                    if (en.isIntersecting) {
                        en.target.classList.add("in");
                        ob.unobserve(en.target);
                    }
                });
            },
            { threshold: 0.1 }
        );
        all.forEach((e) => ob.observe(e));
    }

    function setupSparkleBurst() {
        const buttons = document.querySelectorAll(".sparkle");
        buttons.forEach((btn) => {
            btn.addEventListener("mouseenter", (e) => {
                const burst = document.createElement("span");
                burst.textContent = "✨";
                burst.style.position = "absolute";
                burst.style.pointerEvents = "none";
                burst.style.transition = "transform 300ms ease, opacity 300ms ease";
                burst.style.opacity = "0";
                burst.style.transform = "translate(-50%, -50%) scale(0.8)";
                // Ensure container can place absolute children
                btn.style.position = btn.style.position || "relative";
                const rect = btn.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                burst.style.left = x + "%";
                burst.style.top = y + "%";
                btn.appendChild(burst);
                requestAnimationFrame(() => {
                    burst.style.opacity = "1";
                    burst.style.transform = "translate(-50%, -60%) scale(1)";
                });
                setTimeout(() => burst.remove(), 400);
            });
        });
    }

    ready(() => {
        addFloatingDecor();
        setupReveal();
        setupSparkleBurst();
    });
})();

// Shared UI enhancements: page transitions, link fades, micro-interactions, reduced-motion friendly
(function () {
    const prefersReduced =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Page fade-in on load
    function addFadeIn() {
        if (prefersReduced) return;
        document.body.classList.add("fade-in");
        const onEnd = () => document.body.classList.remove("fade-in");
        document.body.addEventListener("animationend", onEnd, { once: true });
    }

    // Intercept same-origin link clicks for fade-out
    function enableLinkFades() {
        if (prefersReduced) return;
        document.addEventListener("click", (e) => {
            const a = e.target && (e.target.closest ? e.target.closest("a") : null);
            if (!a) return;
            const href = a.getAttribute("href");
            if (!href || a.target === "_blank" || a.hasAttribute("download")) return;
            // Only same-origin navigations
            const url = new URL(href, location.href);
            if (url.origin !== location.origin) return;
            // Ignore hash-only changes
            if (url.pathname === location.pathname && url.hash) return;
            e.preventDefault();
            document.body.classList.add("fade-out");
            const delay = 150;
            setTimeout(() => (location.href = url.href), delay);
        });
    }

    // Hero avatars subtle parallax
    function enableHeroParallax() {
        const hero = document.getElementById("hero");
        if (!hero) return;
        const avatars = hero.querySelectorAll(".avatar");
        if (!avatars.length) return;
        let rafId;
        function onMove(ev) {
            if (prefersReduced) return;
            const rect = hero.getBoundingClientRect();
            const x = (ev.clientX - rect.left) / rect.width - 0.5;
            const y = (ev.clientY - rect.top) / rect.height - 0.5;
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                avatars.forEach((img, i) => {
                    const depth = (i + 1) * 2;
                    img.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
                });
            });
        }
        function reset() {
            avatars.forEach((img) => {
                img.style.transform = "";
            });
        }
        hero.addEventListener("mousemove", onMove);
        hero.addEventListener("mouseleave", reset);
    }

    // Stagger reveal for any elements that already have class 'reveal' but not 'in'
    function enhanceReveals() {
        const items = Array.from(document.querySelectorAll(".reveal"));
        if (!items.length) return;
        let delay = 0;
        items.forEach((el) => {
            if (el.classList.contains("in")) return;
            el.style.transitionDelay = `${delay}ms`;
            delay = Math.min(delay + 60, 240);
        });
        // Remove inline delay when animation ends
        document.addEventListener("transitionend", (e) => {
            const t = e.target;
            if (t && t.classList && t.classList.contains("reveal")) {
                t.style.transitionDelay = "";
            }
        });
    }

    // Initialize once DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            addFadeIn();
            enableLinkFades();
            enableHeroParallax();
            enhanceReveals();
            renderChrome();
            initTabs();
        });
    } else {
        addFadeIn();
        enableLinkFades();
        enableHeroParallax();
        enhanceReveals();
        renderChrome();
        initTabs();
    }
})();

// Simple accessible tabs (ARIA) - reusable
function initTabs() {
    const containers = document.querySelectorAll('[role="tablist"]');
    containers.forEach((list) => {
        const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
        const panelIds = tabs.map((t) => t.getAttribute("aria-controls"));
        const panels = panelIds
            .map((id) => (id ? document.getElementById(id) : null))
            .filter(Boolean);

        function activate(idx, focus = true) {
            tabs.forEach((t, i) => {
                const selected = i === idx;
                t.setAttribute("aria-selected", String(selected));
                t.tabIndex = selected ? 0 : -1;
                if (focus && selected) t.focus();
            });
            panels.forEach((p, i) => {
                if (!p) return;
                p.hidden = i !== idx;
                if (i === idx) {
                    p.classList.add("active");
                } else {
                    p.classList.remove("active");
                }
            });
        }

        // Initialize default selection
        let selectedIdx = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
        if (selectedIdx < 0) selectedIdx = 0;
        activate(selectedIdx, false);

        // Click to activate
        tabs.forEach((t, i) => {
            t.addEventListener("click", () => activate(i, false));
            t.addEventListener("keydown", (e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    const dir = e.key === "ArrowRight" ? 1 : -1;
                    selectedIdx = (i + dir + tabs.length) % tabs.length;
                    activate(selectedIdx);
                }
            });
        });
    });
}

// Shared header/footer renderer to avoid duplication
function renderChrome() {
    const path = location.pathname.replace(/\\+/g, "/");

    // Build links relative to current base path to support subfolder hosting
    const base = document.querySelector("base")?.href || location.origin + "/";
    function link(p) {
        try {
            return new URL(p, base).pathname + (p.endsWith("#hero") ? "#hero" : "");
        } catch {
            return p;
        }
    }
    const header = document.querySelector("header.site-header");
    if (header) {
        const wide = "container wide row between center";
        const currentPage = window.location.pathname;
        const isActive = (path) => {
            if (path === "/index.html#hero" || path === "/index.html") {
                return currentPage === "/" || currentPage === "/index.html";
            }
            return currentPage.includes(path.replace("/", ""));
        };

        const navHTML = `
            <a href="${link("/index.html#hero")}" ${
            isActive("/index.html#hero") ? 'aria-current="page"' : ""
        }>
                <span class="nav-icon">🏠</span>
                <span class="nav-text">Home</span>
            </a>
            <details class="menu">
                <summary class="chip">
                    <span class="nav-icon">🎉</span>
                    <span class="nav-text">Celebrate</span>
                </summary>
                <div class="menu-list card">
                    <a href="${link("/pages/anniversary.html")}" ${
            isActive("/pages/anniversary.html") ? 'aria-current="page"' : ""
        }>
                        <span class="nav-icon">📅</span>
                        <span class="nav-text">Anniversary</span>
                    </a>
                    <a href="${link("/pages/cards.html")}" ${
            isActive("/pages/cards.html") ? 'aria-current="page"' : ""
        }>
                        <span class="nav-icon">💌</span>
                        <span class="nav-text">Cards</span>
                    </a>
                    <a href="${link("/pages/reasons.html")}" ${
            isActive("/pages/reasons.html") ? 'aria-current="page"' : ""
        }>
                        <span class="nav-icon">💗</span>
                        <span class="nav-text">Reasons</span>
                    </a>
                </div>
            </details>
            <details class="menu">
                <summary class="chip">
                    <span class="nav-icon">💝</span>
                    <span class="nav-text">Memories</span>
                </summary>
                <div class="menu-list card">
                    <a href="${link("/pages/timeline.html")}" ${
            isActive("/pages/timeline.html") ? 'aria-current="page"' : ""
        }>
                        <span class="nav-icon">🗓️</span>
                        <span class="nav-text">Timeline</span>
                    </a>
                    <a href="${link("/pages/polaroid.html")}" ${
            isActive("/pages/polaroid.html") ? 'aria-current="page"' : ""
        }>
                        <span class="nav-icon">📷</span>
                        <span class="nav-text">Gallery</span>
                    </a>
                </div>
            </details>
            <details class="menu">
                <summary class="chip">
                    <span class="nav-icon">🎮</span>
                    <span class="nav-text">Play</span>
                </summary>
                <div class="menu-list card">
                    <a href="${link("/pages/quiz.html")}" ${
            isActive("/pages/quiz.html") ? 'aria-current="page"' : ""
        }>
                        <span class="nav-icon">💘</span>
                        <span class="nav-text">Love Quiz</span>
                    </a>
                    <a href="${link("/pages/tictactoe.html")}" ${
            isActive("/pages/tictactoe.html") ? 'aria-current="page"' : ""
        }>
                        <span class="nav-icon">❌⭕</span>
                        <span class="nav-text">Tic‑tac‑toe</span>
                    </a>
                </div>
            </details>
            <a href="${link("/pages/study.html")}" ${
            isActive("/pages/study.html") ? 'aria-current="page"' : ""
        }>
                <span class="nav-icon">📚</span>
                <span class="nav-text">Study</span>
            </a>
        `;

        header.innerHTML = `<div class="${wide}"><a class="brand" href="${link(
            "/index.html#hero"
        )}">For My Baby</a><nav class="nav">${navHTML}</nav><button id="themeToggle" class="chip" aria-label="Toggle theme">${
            document.documentElement.classList.contains("dark") ? "☀️ Day" : "🌙 Night"
        }</button></div>`;

        // Re-bind theme toggle (header was recreated)
        const btn = document.getElementById("themeToggle");
        if (btn) {
            btn.addEventListener("click", () => {
                const root = document.documentElement;
                const next = root.classList.contains("dark") ? "light" : "dark";
                if (next === "dark") {
                    root.classList.add("dark");
                    btn.textContent = "☀️ Day";
                } else {
                    root.classList.remove("dark");
                    btn.textContent = "🌙 Night";
                }
                localStorage.setItem("theme", next);
            });
        }
    }

    const footer = document.querySelector("footer.site-footer .container");
    if (footer) {
        footer.innerHTML = `Made with 💕 · © <span id="year"></span>`;
        const yearEl = document.getElementById("year");
        if (yearEl) yearEl.textContent = new Date().getFullYear();
    }

    // Enhanced dropdown navigation
    const menus = document.querySelectorAll(".nav details.menu");

    // Auto-close other dropdowns when one opens
    menus.forEach((menu) => {
        menu.addEventListener("toggle", (e) => {
            if (menu.open) {
                menus.forEach((otherMenu) => {
                    if (otherMenu !== menu && otherMenu.open) {
                        otherMenu.open = false;
                    }
                });
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".nav details.menu")) {
            menus.forEach((menu) => {
                menu.open = false;
            });
        }
    });

    // Close dropdowns on escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            menus.forEach((menu) => {
                menu.open = false;
            });
        }
    });
}
