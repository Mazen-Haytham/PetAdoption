# Design System Document: The Editorial Companion

## 1. Overview & Creative North Star
**Creative North Star: "The Modern Sanctuary"**

This design system moves away from the "utility-first" look of typical animal shelters and adopts a high-end editorial approach. We treat pet adoption not as a transaction, but as a curated matchmaking experience. By utilizing a **Modern Sanctuary** aesthetic, we lean into expansive breathing room, intentional asymmetry, and a sophisticated "layered paper" philosophy. 

The system breaks the traditional rigid grid by allowing imagery to bleed across containers and using extreme typographic scale contrasts. We move beyond "trustworthy blue boxes" to create a space that feels calm, authoritative, and deeply professional.

---

## 2. Colors & Tonal Depth

### The Palette
We utilize a sophisticated range of Indigos and Navies, supported by a warm, Lavender-tinted neutral base to avoid the sterile feel of pure white.

*   **Primary Core:** `primary` (#4352b7) & `primary_container` (#5d6cd2).
*   **The Foundation:** `background` (#fbf8ff) and `surface` (#fbf8ff).
*   **The Depth:** `on_surface` (#1a1b22) and `secondary_fixed` (#e0e0ff).

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders for sectioning or containment. 
*   **Alternative:** Boundaries must be defined solely through background color shifts. For example, a `surface_container_low` card sitting on a `surface` background provides all the definition needed.
*   **The Ghost Border Fallback:** If a border is essential for accessibility (e.g., input fields), use the `outline_variant` token at **15% opacity**. Never use a 100% opaque stroke.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine stationery. 
1.  **Level 0 (Base):** `surface` (#fbf8ff). Use for the main canvas.
2.  **Level 1 (Sub-sections):** `surface_container_low` (#f4f2fc). Use for large layout blocks or sidebars.
3.  **Level 2 (Active Elements):** `surface_container_highest` (#e3e1eb). Use for interactive card states.

### The "Glass & Gradient" Rule
To elevate the platform above "standard" SaaS templates, use **Glassmorphism** for floating navigation bars or filter overlays. Use `surface_container_lowest` with a 70% opacity and a `20px` backdrop-blur. 

---

## 3. Typography: The Editorial Voice

We pair **Plus Jakarta Sans** (Display/Headlines) with **Manrope** (Body/Labels) to create a balance between geometric modernism and human readability.

*   **Display & Headline (Plus Jakarta Sans):** These are our "Hooks." Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero sections. Headlines should be bold and assertive, often placed asymmetrically to drive the eye through the page.
*   **Body & Title (Manrope):** These are our "Narrators." `body-lg` (1rem) should be used for pet descriptions with a generous line-height (1.6) to ensure the experience feels leisurely, not rushed.
*   **Hierarchy as Identity:** Use `label-sm` in all-caps with 0.05em tracking for metadata (e.g., "BREED," "AGE") to provide a professional, structured contrast to the fluid display type.

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are replaced by **Tonal Layering** and **Ambient Light.**

*   **The Layering Principle:** Depth is achieved by "stacking." Place a `surface_container_lowest` (White) card on a `surface_container` background. The subtle shift in hex code creates a "soft lift" that feels more premium than a heavy shadow.
*   **Ambient Shadows:** For floating elements (Modals/Quick-View), use a highly diffused shadow:
    *   *Blur:* 40px | *Spread:* -5px | *Color:* `on_surface` at 6% opacity.
    *   This mimics natural light and keeps the "Sanctuary" feeling light and airy.
*   **The Texture of Color:** Use subtle linear gradients for Primary CTAs, transitioning from `primary` (#4352b7) to `primary_container` (#5d6cd2) at a 135-degree angle. This adds a "soul" and depth that flat hex codes lack.

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`), `xl` rounded corners (1.5rem). Use `label-md` for text.
*   **Secondary:** No background. `surface_tint` text with a "Ghost Border" (15% opacity `outline`).
*   **Interaction:** On hover, the primary button should "lift" via a slightly increased `surface_container_highest` shadow.

### Cards (Pet Profiles)
*   **Architecture:** Strictly no dividers. Use `xl` (1.5rem) corner radius. 
*   **Visuals:** Use high-contrast typography (`title-lg` for names, `label-md` for traits) and generous padding (2rem).
*   **Nesting:** Place `secondary_container` chips inside a `surface_container_low` card for a nested, sophisticated depth.

### Input Fields
*   **Style:** `surface_container_lowest` background with a subtle `outline_variant` (20% opacity) border. 
*   **Corners:** `md` (0.75rem) to differentiate from the more "organic" `xl` curves of buttons and cards.

### Selection Chips
*   **Action:** Pill-shaped (`full` roundedness). 
*   **State:** Unselected chips should match `surface_container_high`. Selected chips transition to `primary` with `on_primary` text.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts where text blocks overlap image containers slightly to create a high-end feel.
*   **Do** use "Negative Space" as a design element. If a section feels crowded, double the padding.
*   **Do** use `tertiary` (#7f5300) sparingly for "Urgency" tags (e.g., "Available Today") to add a sophisticated warmth.

### Don’t:
*   **Don’t** use horizontal rules (`<hr>`) or 1px dividers to separate list items. Use 16px–24px of vertical white space or tonal background shifts instead.
*   **Don’t** use pure black (#000000) for text. Always use `on_surface` (#1a1b22) to maintain the soft lavender-indigo harmony.
*   **Don’t** use standard "system" shadows. If it looks like a default Material Design shadow, it is too heavy for this system.