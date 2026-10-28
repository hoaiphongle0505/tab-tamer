---
name: Tab Tamer
description: A compact local-first workspace for browser tabs.
colors:
  primary: "#176d50"
  primary-hover: "#12563f"
  primary-soft: "#e7f2eb"
  canvas: "#f6f8f5"
  surface: "#ffffff"
  ink: "#1d2925"
  muted: "#68746b"
  rule: "#e5eae5"
typography:
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 700
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "11px"
    fontWeight: 400
rounded:
  sm: "7px"
  md: "9px"
  lg: "10px"
  pill: "999px"
spacing:
  xs: "3px"
  sm: "7px"
  md: "9px"
  lg: "14px"
  xl: "19px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    height: "38px"
    padding: "0 9px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "38px"
    padding: "0 9px"
  input-search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "8px"
    height: "35px"
    padding: "0 9px"
---

# Design System: Tab Tamer

## Overview

**Creative North Star: "The Browser Filing Desk"**

The popup is a small working surface for sorting and returning to browser pages. Its visual language borrows from a tidy filing desk: a light paper-like canvas, dark readable type, ruled section boundaries, and a leaf-green action color. The compact utility layout keeps the tabs themselves—not decoration—at the center.

Controls stay familiar and direct. Site initials stand in for remote favicon loading, saved workspaces read as simple rows, and empty states explain the next useful action.

**Key Characteristics:**
- Compact, list-led organization
- Green primary actions on a light neutral ground
- Fine dividers instead of stacked dashboard cards
- Browser-native system typography

## Colors

The palette pairs one green action family with a light canvas and dark, high-contrast text.

### Primary
- **Leaf Green** (#176d50): The primary organize action and live tab count.
- **Deep Leaf** (#12563f): Hover state for the primary action.
- **Soft Leaf** (#e7f2eb): Workspace marker surface.

### Neutral
- **Paper Canvas** (#f6f8f5): Popup background.
- **White Surface** (#ffffff): Search field and secondary controls.
- **Ink** (#1d2925): Primary text.
- **Muted Ink** (#68746b): Supporting text and placeholders.
- **Rule** (#e5eae5): Section and row dividers.

## Typography

**Display Font:** System UI (with platform sans-serif fallbacks)  
**Body Font:** System UI (with platform sans-serif fallbacks)

**Character:** Native and compact; the interface uses familiar browser-scale labels rather than a separate display face.

### Hierarchy
- **Title** (700, 16px): Product name.
- **Section heading** (700, 14px): Tab search and workspace sections.
- **Body** (400–700, 11px): Actions, tab titles, and workspace names.
- **Supporting label** (400–650, 9–10px): Site names, dates, counts, and hints.

## Layout

The extension popup is 390px wide, with a 340px minimum. A single column orders the window count and actions before tab search, then workspaces. Tab results and saved workspaces have independent vertical scrolling so a crowded window does not push actions out of reach. Sections are separated by thin rules and small spacing steps; the popup itself scrolls when the host window is short.

## Elevation & Depth

The interface is flat by default. A restrained shadow appears under transient toast feedback, while focus is communicated through a clear green-tinted outline and search-field emphasis. No decorative surface shadows or gradients are used.

## Shapes

Controls and compact row markers use 7–10px radii. The local-only status uses a pill silhouette. Tab and workspace entries remain flat rows rather than separate cards.

## Components

### Buttons
- **Shape:** 9px radius.
- **Primary:** Leaf-green fill, white text, 38px height; used for the main organize action.
- **Secondary:** White fill with a fine neutral border; used for saving.
- **Hover / Focus:** Primary darkens on hover; keyboard focus receives a visible 3px outline.

### Inputs / Fields
- **Style:** White surface, fine neutral border, 8px radius, 35px search height.
- **Focus:** Green-tinted outline; placeholders use muted ink for legibility.
- **Error:** Save-name validation uses the browser's native required-field feedback.

### Tab and Workspace Rows
- **Style:** Flat, compact rows with a site initial or soft-green workspace marker.
- **Behavior:** Tab rows switch to the chosen page; workspace rows expose explicit restore and delete actions.
- **Hover / Focus:** A light green-neutral hover surface and visible keyboard outline.

## Do's and Don'ts

### Do:
- **Do** keep open tabs and saved workspaces as the main content.
- **Do** use local browser storage and avoid external assets or service calls.
- **Do** preserve clear focus states and readable supporting text.

### Don't:
- **Don't** add remote favicons, fonts, or decorative imagery to the popup.
- **Don't** turn the tab list into a stack of generic cards.
- **Don't** hide partial browser-operation failures.
