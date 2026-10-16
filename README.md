# Atelier Botanica — Modern Artisanal Cafe Landing Page

A responsive, high-performance landing page for **Atelier Botanica**, a modern specialty micro-roastery and French pâtisserie based in Greenpoint, Brooklyn.

Crafted with a warm, tactile aesthetic blending **rich espresso browns**, **velvety creams**, and **soothing sage greens**.

---

## ✨ Features & Architecture

### 1. Palette & Aesthetics
- **Espresso Brown** (`#1f140e`, `#36231a`, `#493125`): Deep roast tones for typography, dark buttons, and brand emblems.
- **Warm Cream** (`#fdfcf9`, `#f8f4ec`, `#ece3d2`): Silk steamed-milk background, soft parchment cards, and soothing negative space.
- **Soft Sage Green** (`#62886f`, `#4c6d57`, `#e4eee6`): Botanical eucalyptus highlights, live status indicators, and herbal accents.
- **Roasted Caramel / Gold** (`#dfa458`, `#c6893b`): Accolade stars, special badges, and warm focal points.
- **Typography**: Editorial serif headers (*Cormorant Garamond*) paired with ultra-clean modern geometric sans (*Plus Jakarta Sans*).

### 2. Interactive Categorized Menu (`assets/js/menu-data.js`)
- **Categories**:
  - **Coffee & Tonics**: Single-origin pour-overs (Ethiopia Guji, Colombia Geisha), botanical cortados, iced ceremonial matcha, espresso tonics, velvet flat whites.
  - **Artisanal Pastries & Viennoiserie**: 72-hour laminated kouign-amann with pistachio & rose, cardamom morning buns, almond frangipane croissants, matcha Meyer lemon tarts, Valrhona sourdough cookies.
  - **Kitchen & All-Day Fare**: Avocado & foraged herb sourdough tartines, smoked salmon brioche, chanterelle poached eggs, botanical açaí superbowls, truffled gruyère croque monsieur.
- **Instant Search & Dietary Filters**: Real-time search across names, ingredients, and tasting notes with quick chips for 🌱 Vegan, 🌾 Gluten-Free, and ⭐ Signatures.
- **Tasting Notes & Origin Modal**: Click "Tasting Notes & Origin" on any item to view farm elevation, processing method, SCA cupping score, sensory flavor notes, and chef pairings.
- **Tasting Flight Wishlist Bar**: Interactive "Tasting Flight" bookmarking lets guests curate their dream order, preview estimated totals, and pass their items directly into the table reservation request.

### 3. Real-Time Business Hours Engine
- **Live Open/Closed Calculation**: Evaluates the visitor's local time against the cafe's daily schedule (Mon–Fri 7am–6pm, Sat–Sun 7:30am–7pm).
- **Pulsing Status Badges**: Both the navigation bar and the Roastery Hours card feature animated pulsing indicators (emerald when open, warm amber when closing soon or closed).
- **Weekly Schedule with Today Highlight**: Dynamically highlights today's row in the hours table.
- **Baking & Cupping Rituals**: Highlights daily 7:30 AM first-pour cupping and warm oven dispatches (8:00 AM & 12:30 PM).

### 4. Location & Interactive Map Component
- **Custom Vector Cartography**: An interactive SVG map of Greenpoint, Brooklyn showcasing Franklin Street, Transmitter Park, the East River waterfront, nearby G train subway, and the India Street NYC Ferry pier.
- **Interactive Map Controls**: Zoom In (+), Zoom Out (−), and Reset (↺) controls that smoothly adjust map scale and panning.
- **Pulsing Map Pin**: Custom animated espresso & caramel pin with expanding radar ripple effect.
- **One-Tap "Copy Address"**: Instant clipboard copy with smooth toast feedback.

### 5. Table Reservation Engine (`assets/js/reservation.js`)
- **Interactive Party Stepper**: 1 to 8 guests with animated counter.
- **Date Selector**: Quick chips for *Today*, *Tomorrow*, *In 2 Days*, plus full calendar date input.
- **Dynamic Time Slot Chips**: Morning sunshine, midday brunch, and golden hour slots.
- **Seating Zone Selection**:
  - 🌿 *The Botanical Atrium* (Lush monstera & skylights)
  - ☕ *The Barista Tasting Bar* (Front-row view of manual pour-overs)
  - ☀️ *The Sunlit Olive Courtyard* (Heated garden patio)
- **Real-Time Live Summary Card**: Reactive sidebar immediately reflects party size, chosen date, time, seating zone, and selected tasting items.
- **Booking Confirmation Modal**: Generates unique booking code (`#BOT-XXXX`), full receipt breakdown, and a one-click **"Add to Google Calendar"** action.

### 6. Mobile Navigation & Micro-Interactions
- **Glassmorphic Sticky Header**: Blurs gracefully upon scrolling down with micro-shadow.
- **Mobile Slide-Out Drawer**: Touch-friendly hamburger drawer with backdrop blur and animated transform transitions.
- **Steam Animation**: Multi-stroke SVG steam animation rising from the artisanal ceramic cup.
- **Subtle Tilt & Lift**: Tactile hover elevation on cards, buttons, and badges.

### 7. Performance & Zero Dependencies
- 100% Vanilla HTML5, modern CSS3 variables, and modular ES6 JavaScript.
- No heavy frameworks, bundlers, or runtime overhead required. Instant load times.

---

## 🚀 How to Run Locally

You can preview the landing page by launching Python's built-in web server:

```bash
cd /Users/prakharchaturvedi/.gemini/antigravity/scratch/artisanal-cafe
python3 -m http.server 8080
```

Then open your browser at:
```
http://localhost:8080
```
