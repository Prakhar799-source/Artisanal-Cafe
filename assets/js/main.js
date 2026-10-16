/**
 * Atelier Botanica - Main Controller & Micro-interactions
 * Responsive drawer, dynamic business hours, menu filtering, tasting notes modal & tasting flight
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize App Modules
  initHeaderAndMobileNav();
  initLiveBusinessHours();
  initMenuCatalog();
  initInteractiveMap();
  initNewsletterAndContact();

  // Instantiate reservation engine
  if (typeof ReservationManager === "function") {
    window.reservationManager = new ReservationManager();
  }
});

/* ==========================================================================
   Toast Notification System
   ========================================================================== */
window.showToast = function (message, duration = 3000) {
  let toast = document.getElementById("globalToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "globalToast";
    toast.className = "toast-notice";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    <span>${message}</span>
  `;
  toast.classList.add("show");

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
};

/* ==========================================================================
   Header & Mobile Drawer Navigation
   ========================================================================== */
function initHeaderAndMobileNav() {
  const header = document.querySelector(".site-header");
  const mobileToggle = document.querySelector(".mobile-toggle");
  const drawerOverlay = document.querySelector(".mobile-drawer-overlay");
  const drawer = document.querySelector(".mobile-drawer");
  const closeDrawerBtn = document.querySelector(".close-drawer-btn");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");

  // Sticky header scroll detection
  window.addEventListener("scroll", () => {
    if (window.scrollY > 25) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }, { passive: true });

  // Open drawer
  function openDrawer() {
    mobileToggle.classList.add("active");
    drawerOverlay.classList.add("active");
    drawer.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  // Close drawer
  function closeDrawer() {
    mobileToggle.classList.remove("active");
    drawerOverlay.classList.remove("active");
    drawer.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      if (drawer.classList.contains("active")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener("click", closeDrawer);

  mobileLinks.forEach(link => {
    link.addEventListener("click", () => {
      closeDrawer();
    });
  });

  // Active section scrollspy
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach(link => {
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(sec => observer.observe(sec));
}

/* ==========================================================================
   Live Business Hours & Real-Time Status Engine
   ========================================================================== */
function initLiveBusinessHours() {
  if (typeof CAFE_HOURS === "undefined") return;

  const clockEl = document.getElementById("liveCurrentTime");
  const statusPillNav = document.getElementById("navStatusPill");
  const statusPillHours = document.getElementById("hoursStatusLarge");
  const hoursTableBody = document.getElementById("hoursTableBody");

  function evaluateHours() {
    const now = new Date();
    const currentDayIdx = now.getDay(); // 0 is Sunday
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMinute;

    // Display formatted current time
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    }

    const todayConfig = CAFE_HOURS.schedule.find(s => s.dayIndex === currentDayIdx);
    if (!todayConfig) return;

    const [openH, openM] = todayConfig.open.split(":").map(Number);
    const [closeH, closeM] = todayConfig.close.split(":").map(Number);

    const openTimeVal = openH * 60 + openM;
    const closeTimeVal = closeH * 60 + closeM;

    const isOpen = currentTimeVal >= openTimeVal && currentTimeVal < closeTimeVal;
    const isClosingSoon = isOpen && (closeTimeVal - currentTimeVal <= 45);

    // Update Nav Pill
    if (statusPillNav) {
      const dot = statusPillNav.querySelector(".status-dot");
      const text = statusPillNav.querySelector(".status-text");

      if (isOpen) {
        dot.className = "status-dot open";
        text.textContent = isClosingSoon ? "Closing Soon" : "Open Today";
      } else {
        dot.className = "status-dot closed";
        text.textContent = "Closed Now";
      }
    }

    // Update Hours Section Badge
    if (statusPillHours) {
      if (isOpen) {
        statusPillHours.className = "current-status-large open";
        statusPillHours.innerHTML = `
          <span class="status-dot open"></span>
          <span>Open Today • Closes at ${formatTime12h(todayConfig.close)}</span>
        `;
      } else {
        const nextDayIdx = (currentDayIdx + 1) % 7;
        const nextDayConfig = CAFE_HOURS.schedule.find(s => s.dayIndex === nextDayIdx);
        statusPillHours.className = "current-status-large closed";
        statusPillHours.innerHTML = `
          <span class="status-dot closed"></span>
          <span>Closed Now • Opens ${currentTimeVal < openTimeVal ? 'Today' : 'Tomorrow'} at ${formatTime12h(nextDayConfig.open)}</span>
        `;
      }
    }

    // Render Weekly Schedule Table
    if (hoursTableBody) {
      hoursTableBody.innerHTML = CAFE_HOURS.schedule.map(item => {
        const isToday = item.dayIndex === currentDayIdx;
        return `
          <div class="hours-row ${isToday ? 'is-today' : ''}">
            <div class="day-name">
              ${item.day}
              ${isToday ? '<span class="day-badge-today">Today</span>' : ''}
            </div>
            <div class="day-time">
              ${item.label}
            </div>
          </div>
        `;
      }).join("");
    }
  }

  function formatTime12h(militaryTime) {
    const [h, m] = militaryTime.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const normalH = h % 12 === 0 ? 12 : h % 12;
    return `${normalH}:${String(m).padStart(2, "0")} ${period}`;
  }

  evaluateHours();
  setInterval(evaluateHours, 30000); // refresh every 30s
}

/* ==========================================================================
   Interactive Categorized Menu Engine
   ========================================================================== */
function initMenuCatalog() {
  if (typeof MENU_DATA === "undefined") return;

  let currentCategory = "all";
  let activeDietary = null;
  let searchQuery = "";
  let tastingFlight = [];

  const gridEl = document.getElementById("menuGridContainer");
  const tabBtns = document.querySelectorAll(".category-tab-btn");
  const searchInput = document.getElementById("menuSearchInput");
  const dietaryChips = document.querySelectorAll(".dietary-chip");
  const flightDock = document.getElementById("flightDock");
  const dockCount = document.getElementById("dockItemCount");
  const dockTotal = document.getElementById("dockTotalAmount");
  const dockReserveBtn = document.getElementById("dockReserveBtn");

  // Tasting Notes Modal elements
  const modal = document.getElementById("tastingNotesModal");
  const closeModalBtn = document.getElementById("closeTastingModal");

  // Tab Filtering
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.category;
      renderMenu();
    });
  });

  // Dietary Chip Filtering
  dietaryChips.forEach(chip => {
    chip.addEventListener("click", () => {
      const selected = chip.dataset.dietary;
      if (activeDietary === selected) {
        activeDietary = null;
        chip.classList.remove("active");
      } else {
        dietaryChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        activeDietary = selected;
      }
      renderMenu();
    });
  });

  // Search Filtering
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderMenu();
    });
  }

  function renderMenu() {
    if (!gridEl) return;

    const filtered = MENU_DATA.filter(item => {
      // Category match
      const matchCategory = currentCategory === "all" || item.category === currentCategory;

      // Dietary match
      let matchDietary = true;
      if (activeDietary) {
        if (activeDietary === "signature") {
          matchDietary = item.tag && (item.tag.includes("Signature") || item.tag.includes("Roaster's Pick") || item.tag.includes("Bakery Star"));
        } else {
          matchDietary = item.dietary && item.dietary.includes(activeDietary);
        }
      }

      // Search match
      let matchSearch = true;
      if (searchQuery) {
        const textToSearch = [
          item.name,
          item.description,
          item.origin,
          item.tag,
          ...(item.tastingNotes || [])
        ].join(" ").toLowerCase();
        matchSearch = textToSearch.includes(searchQuery);
      }

      return matchCategory && matchDietary && matchSearch;
    });

    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <svg style="margin: 0 auto 1rem; color: var(--espresso-600);" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <h3 style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--espresso-950); margin-bottom: 0.5rem;">No artisanal offerings match your search</h3>
          <p style="font-size: 0.9375rem;">Try clearing the dietary filter or searching for "espresso", "croissant", or "matcha".</p>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = filtered.map(item => {
      const isAdded = tastingFlight.some(f => f.id === item.id);
      return `
        <article class="menu-card" data-item-id="${item.id}">
          <div class="card-img-wrap">
            <img src="${item.image}" alt="${item.name}" loading="lazy" />
            <span class="card-tag-badge">${item.tag}</span>
            ${item.scaScore ? `
              <span class="card-sca-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ${item.scaScore}
              </span>
            ` : ''}
          </div>
          <div class="card-body">
            <div class="card-header-row">
              <h3 class="card-title">${item.name}</h3>
              <span class="card-price">$${item.price.toFixed(2)}</span>
            </div>
            <div class="card-origin-meta">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${item.origin}</span>
            </div>
            <p class="card-desc">${item.description}</p>
            
            <div class="tasting-notes-row">
              ${(item.tastingNotes || []).map(note => `<span class="note-chip">${note}</span>`).join("")}
            </div>

            <div class="card-footer">
              <button type="button" class="btn-details view-notes-btn" data-id="${item.id}">
                <span>Tasting Notes & Origin</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button type="button" class="btn-add-flight ${isAdded ? 'added' : ''}" data-id="${item.id}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                <span>${isAdded ? 'Selected' : 'Tasting Flight'}</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    attachMenuCardListeners();
  }

  function attachMenuCardListeners() {
    // Open tasting modal
    gridEl.querySelectorAll(".view-notes-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const item = MENU_DATA.find(m => m.id === btn.dataset.id);
        if (item) openTastingModal(item);
      });
    });

    // Add to tasting flight
    gridEl.querySelectorAll(".btn-add-flight").forEach(btn => {
      btn.addEventListener("click", () => {
        const itemId = btn.dataset.id;
        const item = MENU_DATA.find(m => m.id === itemId);
        if (!item) return;

        const existsIndex = tastingFlight.findIndex(f => f.id === itemId);
        if (existsIndex >= 0) {
          tastingFlight.splice(existsIndex, 1);
          btn.classList.remove("added");
          btn.querySelector("span").textContent = "Tasting Flight";
          window.showToast(`Removed ${item.name} from tasting flight`);
        } else {
          tastingFlight.push(item);
          btn.classList.add("added");
          btn.querySelector("span").textContent = "Selected";
          window.showToast(`Added ${item.name} to tasting flight!`);
        }

        updateFlightDock();
      });
    });
  }

  function updateFlightDock() {
    if (!flightDock) return;

    if (tastingFlight.length > 0) {
      flightDock.classList.add("visible");
      const count = tastingFlight.length;
      const total = tastingFlight.reduce((acc, curr) => acc + curr.price, 0);

      if (dockCount) dockCount.textContent = count;
      if (dockTotal) dockTotal.textContent = `$${total.toFixed(2)}`;

      // Pass down to table reservation engine
      if (window.reservationManager) {
        window.reservationManager.updateWishlistItems(tastingFlight);
      }
    } else {
      flightDock.classList.remove("visible");
      if (window.reservationManager) {
        window.reservationManager.updateWishlistItems([]);
      }
    }
  }

  if (dockReserveBtn) {
    dockReserveBtn.addEventListener("click", () => {
      const reservationSec = document.getElementById("reservations");
      if (reservationSec) {
        reservationSec.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  function openTastingModal(item) {
    if (!modal) return;

    const imgEl = document.getElementById("modalDetailImg");
    const titleEl = document.getElementById("modalDetailTitle");
    const categoryEl = document.getElementById("modalDetailCategory");
    const originEl = document.getElementById("modalDetailOrigin");
    const roastEl = document.getElementById("modalDetailRoast");
    const processEl = document.getElementById("modalDetailProcess");
    const brewEl = document.getElementById("modalDetailBrew");
    const pairEl = document.getElementById("modalDetailPairing");
    const notesWrap = document.getElementById("modalDetailNotes");
    const descEl = document.getElementById("modalDetailDesc");
    const priceEl = document.getElementById("modalDetailPrice");

    if (imgEl) imgEl.src = item.image;
    if (titleEl) titleEl.textContent = item.name;
    if (categoryEl) categoryEl.textContent = item.tag || item.category;
    if (originEl) originEl.textContent = item.origin;
    if (roastEl) roastEl.textContent = item.roast || "Specialty Prep";
    if (processEl) processEl.textContent = item.process || "Artisan Craft";
    if (brewEl) brewEl.textContent = item.brewMethod || "To Order";
    if (pairEl) pairEl.textContent = item.pairWith || "Any of our single-origin coffees";
    if (descEl) descEl.textContent = item.description;
    if (priceEl) priceEl.textContent = `$${item.price.toFixed(2)}`;

    if (notesWrap) {
      notesWrap.innerHTML = (item.tastingNotes || []).map(note => `
        <span class="note-chip" style="font-size: 0.8125rem; padding: 0.35rem 0.85rem;">${note}</span>
      `).join("");
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeTastingModal() {
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  if (closeModalBtn) closeModalBtn.addEventListener("click", closeTastingModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeTastingModal();
    });
  }

  // Initial render
  renderMenu();
}

/* ==========================================================================
   Interactive Map Component & Actions
   ========================================================================== */
function initInteractiveMap() {
  const mapSvg = document.getElementById("interactiveMapSvg");
  const zoomInBtn = document.getElementById("mapZoomIn");
  const zoomOutBtn = document.getElementById("mapZoomOut");
  const resetBtn = document.getElementById("mapReset");
  const copyAddressBtn = document.getElementById("copyAddressBtn");

  let currentViewBox = { x: 0, y: 0, w: 800, h: 500 };
  const initialViewBox = { ...currentViewBox };

  function applyViewBox() {
    if (!mapSvg) return;
    mapSvg.setAttribute("viewBox", `${currentViewBox.x} ${currentViewBox.y} ${currentViewBox.w} ${currentViewBox.h}`);
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", () => {
      if (currentViewBox.w > 400) {
        currentViewBox.x += 40;
        currentViewBox.y += 25;
        currentViewBox.w -= 80;
        currentViewBox.h -= 50;
        applyViewBox();
      }
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", () => {
      if (currentViewBox.w < 1200) {
        currentViewBox.x -= 40;
        currentViewBox.y -= 25;
        currentViewBox.w += 80;
        currentViewBox.h += 50;
        applyViewBox();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      currentViewBox = { ...initialViewBox };
      applyViewBox();
    });
  }

  // Copy address to clipboard
  if (copyAddressBtn) {
    copyAddressBtn.addEventListener("click", () => {
      const address = "148 Franklin Street, Greenpoint, Brooklyn, NY 11222";
      if (navigator.clipboard) {
        navigator.clipboard.writeText(address).then(() => {
          window.showToast("Address copied to clipboard!");
        }).catch(() => {
          fallbackCopyText(address);
        });
      } else {
        fallbackCopyText(address);
      }
    });
  }

  function fallbackCopyText(text) {
    const tempInput = document.createElement("input");
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    window.showToast("Address copied to clipboard!");
  }
}

/* ==========================================================================
   Newsletter Signup & Contact Form
   ========================================================================== */
function initNewsletterAndContact() {
  const newsletterForm = document.getElementById("footerNewsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector("input[type='email']");
      if (input && input.value) {
        window.showToast(`Thank you! Roaster's dispatch sent to ${input.value}`);
        input.value = "";
      }
    });
  }
}
