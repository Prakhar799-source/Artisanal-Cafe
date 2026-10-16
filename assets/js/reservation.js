/**
 * Atelier Botanica - Table Reservation Engine
 * Interactive booking, real-time live summary, date/slot picker, and calendar integration
 */

class ReservationManager {
  constructor() {
    this.state = {
      guests: 2,
      date: this.getInitialDate(),
      time: "09:30 AM",
      seating: "greenhouse",
      seatingName: "The Botanical Atrium",
      name: "",
      email: "",
      phone: "",
      occasion: "Morning Coffee & Brunch",
      specialRequests: "",
      flightItems: []
    };

    this.initDOMReferences();
    this.bindEvents();
    this.renderSeatingOptions();
    this.renderTimeSlots();
    this.updateSummary();
  }

  getInitialDate() {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  formatDisplayDate(dateStr) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  initDOMReferences() {
    // Form elements
    this.guestsValueEl = document.getElementById("guestsCountValue");
    this.guestMinusBtn = document.getElementById("guestMinusBtn");
    this.guestPlusBtn = document.getElementById("guestPlusBtn");

    this.dateChipsWrap = document.getElementById("dateChipsContainer");
    this.customDateInput = document.getElementById("customDateInput");
    this.timeSlotsWrap = document.getElementById("timeSlotsContainer");
    this.seatingWrap = document.getElementById("seatingZonesContainer");

    this.form = document.getElementById("tableReservationForm");
    this.nameInput = document.getElementById("resNameInput");
    this.emailInput = document.getElementById("resEmailInput");
    this.phoneInput = document.getElementById("resPhoneInput");
    this.occasionInput = document.getElementById("resOccasionInput");
    this.notesInput = document.getElementById("resNotesInput");

    // Live summary display elements
    this.sumGuestsEl = document.getElementById("summaryGuests");
    this.sumDateEl = document.getElementById("summaryDate");
    this.sumTimeEl = document.getElementById("summaryTime");
    this.sumSeatingEl = document.getElementById("summarySeating");
    this.sumWishlistWrap = document.getElementById("summaryWishlistWrap");
    this.sumWishlistPreview = document.getElementById("summaryWishlistPreview");

    // Modal elements
    this.modalOverlay = document.getElementById("reservationConfirmModal");
    this.modalCloseBtn = document.getElementById("closeConfirmModal");
    this.modalDoneBtn = document.getElementById("confirmDoneBtn");
    this.calendarBtn = document.getElementById("addToCalendarBtn");
  }

  bindEvents() {
    // Guest stepper
    if (this.guestMinusBtn && this.guestPlusBtn) {
      this.guestMinusBtn.addEventListener("click", () => this.updateGuests(-1));
      this.guestPlusBtn.addEventListener("click", () => this.updateGuests(1));
    }

    // Date chips & custom picker
    if (this.dateChipsWrap) {
      this.dateChipsWrap.querySelectorAll(".date-chip-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          this.dateChipsWrap.querySelectorAll(".date-chip-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          const offsetDays = parseInt(btn.dataset.offset || "0", 10);
          const targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + offsetDays);
          const dateStr = targetDate.toISOString().split("T")[0];
          this.state.date = dateStr;
          if (this.customDateInput) this.customDateInput.value = dateStr;
          this.updateSummary();
        });
      });
    }

    if (this.customDateInput) {
      const todayStr = this.getInitialDate();
      this.customDateInput.min = todayStr;
      this.customDateInput.value = this.state.date;

      this.customDateInput.addEventListener("change", (e) => {
        this.state.date = e.target.value;
        if (this.dateChipsWrap) {
          this.dateChipsWrap.querySelectorAll(".date-chip-btn").forEach(b => b.classList.remove("active"));
        }
        this.updateSummary();
      });
    }

    // Input listeners for instant validation/summary
    if (this.nameInput) {
      this.nameInput.addEventListener("input", (e) => {
        this.state.name = e.target.value.trim();
      });
    }

    if (this.emailInput) {
      this.emailInput.addEventListener("input", (e) => {
        this.state.email = e.target.value.trim();
      });
    }

    if (this.phoneInput) {
      this.phoneInput.addEventListener("input", (e) => {
        this.state.phone = e.target.value.trim();
      });
    }

    if (this.occasionInput) {
      this.occasionInput.addEventListener("change", (e) => {
        this.state.occasion = e.target.value;
      });
    }

    if (this.notesInput) {
      this.notesInput.addEventListener("input", (e) => {
        this.state.specialRequests = e.target.value.trim();
      });
    }

    // Form submit
    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }

    // Modal close
    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener("click", () => this.closeConfirmationModal());
    }

    if (this.modalDoneBtn) {
      this.modalDoneBtn.addEventListener("click", () => this.closeConfirmationModal());
    }

    if (this.modalOverlay) {
      this.modalOverlay.addEventListener("click", (e) => {
        if (e.target === this.modalOverlay) this.closeConfirmationModal();
      });
    }
  }

  updateGuests(delta) {
    const newVal = this.state.guests + delta;
    if (newVal >= 1 && newVal <= 8) {
      this.state.guests = newVal;
      if (this.guestsValueEl) {
        this.guestsValueEl.textContent = `${this.state.guests} ${this.state.guests === 1 ? 'Guest' : 'Guests'}`;
      }
      if (this.guestMinusBtn) this.guestMinusBtn.disabled = this.state.guests <= 1;
      if (this.guestPlusBtn) this.guestPlusBtn.disabled = this.state.guests >= 8;
      this.updateSummary();
    }
  }

  renderTimeSlots() {
    if (!this.timeSlotsWrap) return;
    const slots = [
      "08:00 AM", "08:45 AM", "09:30 AM", "10:15 AM", 
      "11:00 AM", "12:00 PM", "01:15 PM", "02:30 PM", 
      "03:45 PM", "04:30 PM", "05:15 PM"
    ];

    this.timeSlotsWrap.innerHTML = slots.map(time => `
      <button type="button" class="time-slot-btn ${time === this.state.time ? 'active' : ''}" data-time="${time}">
        ${time}
      </button>
    `).join("");

    this.timeSlotsWrap.querySelectorAll(".time-slot-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.timeSlotsWrap.querySelectorAll(".time-slot-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.state.time = btn.dataset.time;
        this.updateSummary();
      });
    });
  }

  renderSeatingOptions() {
    if (!this.seatingWrap || typeof SEATING_AREAS === "undefined") return;

    this.seatingWrap.innerHTML = SEATING_AREAS.map(area => `
      <div class="seating-card ${area.id === this.state.seating ? 'active' : ''}" data-seating="${area.id}">
        <div class="seating-icon">
          ${this.getSeatingIcon(area.id)}
        </div>
        <div class="seating-name">${area.name}</div>
        <div class="seating-vibe">${area.vibe}</div>
      </div>
    `).join("");

    this.seatingWrap.querySelectorAll(".seating-card").forEach(card => {
      card.addEventListener("click", () => {
        this.seatingWrap.querySelectorAll(".seating-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        const found = SEATING_AREAS.find(a => a.id === card.dataset.seating);
        if (found) {
          this.state.seating = found.id;
          this.state.seatingName = found.name;
          this.updateSummary();
        }
      });
    });
  }

  getSeatingIcon(areaId) {
    switch (areaId) {
      case "greenhouse":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c0-4.4 3.6-8 8-8v-1a7 7 0 0 0-7-7 7 7 0 0 0-7 7v1c4.4 0 8 3.6 8 8Z"/></svg>`;
      case "pour-over-bar":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`;
      case "courtyard":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
      default:
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
    }
  }

  updateWishlistItems(items) {
    this.state.flightItems = items;
    if (this.sumWishlistWrap && this.sumWishlistPreview) {
      if (items.length > 0) {
        this.sumWishlistWrap.style.display = "block";
        this.sumWishlistPreview.innerHTML = items.map(item => `
          <div style="display:flex; justify-content:space-between; margin-bottom: 0.25rem;">
            <span>• ${item.name}</span>
            <span style="font-weight:600;">$${item.price.toFixed(2)}</span>
          </div>
        `).join("");
      } else {
        this.sumWishlistWrap.style.display = "none";
      }
    }
  }

  updateSummary() {
    if (this.sumGuestsEl) {
      this.sumGuestsEl.textContent = `${this.state.guests} ${this.state.guests === 1 ? 'Guest' : 'Guests'}`;
    }
    if (this.sumDateEl) {
      this.sumDateEl.textContent = this.formatDisplayDate(this.state.date);
    }
    if (this.sumTimeEl) {
      this.sumTimeEl.textContent = this.state.time;
    }
    if (this.sumSeatingEl) {
      this.sumSeatingEl.textContent = this.state.seatingName;
    }
  }

  handleFormSubmit() {
    // Basic validation
    const name = this.nameInput ? this.nameInput.value.trim() : "";
    const email = this.emailInput ? this.emailInput.value.trim() : "";
    const phone = this.phoneInput ? this.phoneInput.value.trim() : "";

    if (!name || !email || !phone) {
      if (typeof window.showToast === "function") {
        window.showToast("Please provide your name, email, and phone number.");
      } else {
        alert("Please provide your name, email, and phone number.");
      }
      return;
    }

    // Generate random booking code
    const bookingCode = `BOT-${Math.floor(1000 + Math.random() * 9000)}`;

    const bookingPayload = {
      code: bookingCode,
      ...this.state,
      name,
      email,
      phone,
      bookedAt: new Date().toISOString()
    };

    // Save to localStorage for demo persistence
    try {
      const stored = JSON.parse(localStorage.getItem("atelier_reservations") || "[]");
      stored.unshift(bookingPayload);
      localStorage.setItem("atelier_reservations", JSON.stringify(stored));
    } catch (e) {
      console.warn("Storage unavailable", e);
    }

    this.showConfirmationModal(bookingPayload);
  }

  showConfirmationModal(payload) {
    if (!this.modalOverlay) return;

    // Fill details
    const codeEl = document.getElementById("confirmBookingCode");
    const nameEl = document.getElementById("confirmGuestName");
    const dateEl = document.getElementById("confirmDate");
    const timeEl = document.getElementById("confirmTime");
    const seatingEl = document.getElementById("confirmSeating");
    const guestsEl = document.getElementById("confirmGuests");
    const emailEl = document.getElementById("confirmEmail");

    if (codeEl) codeEl.textContent = payload.code;
    if (nameEl) nameEl.textContent = payload.name;
    if (dateEl) dateEl.textContent = this.formatDisplayDate(payload.date);
    if (timeEl) timeEl.textContent = payload.time;
    if (seatingEl) seatingEl.textContent = payload.seatingName;
    if (guestsEl) guestsEl.textContent = `${payload.guests} Guests`;
    if (emailEl) emailEl.textContent = payload.email;

    // Setup calendar button
    if (this.calendarBtn) {
      this.calendarBtn.onclick = () => this.generateCalendarEvent(payload);
    }

    this.modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  generateCalendarEvent(payload) {
    const title = encodeURIComponent(`Atelier Botanica Table Reservation (${payload.code})`);
    const details = encodeURIComponent(`Reservation for ${payload.guests} guests at ${payload.seatingName}.\nSpecialty Coffee & Bakery, 148 Franklin St, Greenpoint NY.\nRef: ${payload.code}`);
    const location = encodeURIComponent("Atelier Botanica, 148 Franklin St, Greenpoint, Brooklyn, NY 11222");

    // Format date string for Google calendar
    const dateParts = payload.date.replace(/-/g, "");
    // Approximate hour
    let [hourStr, minPart] = payload.time.split(":");
    let [minStr, ampm] = minPart.split(" ");
    let hour = parseInt(hourStr, 10);
    if (ampm === "PM" && hour < 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    const startHourStr = String(hour).padStart(2, "0");
    const endHourStr = String(hour + 1).padStart(2, "0");

    const startTime = `${dateParts}T${startHourStr}${minStr}00`;
    const endTime = `${dateParts}T${endHourStr}${minStr}00`;

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
    window.open(gcalUrl, "_blank");
  }

  closeConfirmationModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  }
}
