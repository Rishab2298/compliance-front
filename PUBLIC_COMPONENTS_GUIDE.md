# Public Components Guide

## Overview
Reusable header and footer components for all public pages (landing, about, blog, etc.).

## Components Created

### 1. `PublicHeader.jsx`
- Fixed navigation bar with logo
- Navigation links: Features, How It Works, Pricing
- Theme toggle (light/dark)
- Sign in button / User profile
- Mobile responsive menu

### 2. `PublicFooter.jsx`
- 4-column footer layout
  - Company info
  - Product links
  - Company links
  - **Policies** (all 6 required policies)
- Bottom inline policy links
- Copyright notice
- Theme-aware styling

### 3. `PublicLayout.jsx`
- Wrapper component combining header + footer
- Handles theme background
- Easy to use for any public page

## Usage

### Option 1: Use PublicLayout (Recommended)
```jsx
import PublicLayout from "@/components/PublicLayout";

const YourPage = () => {
  return (
    <PublicLayout>
      {/* Your page content */}
      <section className="px-6 pt-32 pb-20">
        <div className="mx-auto max-w-7xl">
          <h1>Your Content</h1>
        </div>
      </section>
    </PublicLayout>
  );
};

export default YourPage;
```

### Option 2: Use Header/Footer Separately
```jsx
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

const YourPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <PublicHeader />
      <main>
        {/* Your content */}
      </main>
      <PublicFooter />
    </div>
  );
};
```

## Features

### Theme Support
- Automatically syncs with localStorage theme
- Dark mode (default)
- Light mode
- Seamless theme switching

### Navigation Links
All navigation links use hash anchors for smooth scrolling:
- `/#features` → Features section
- `/#how-it-works` → How It Works section
- `/#pricing` → Pricing section

### Policy Links (Footer)
All 6 required policies:
1. Terms of Service → `/policies/terms-of-service`
2. Privacy Policy → `/policies/privacy-policy`
3. Data Processing Addendum → `/policies/data-processing-agreement`
4. AI Fair Use Policy → `/policies/ai-fair-use-policy`
5. GDPR Data Processing → `/policies/gdpr-data-processing-addendum`
6. Complaints Policy → `/policies/complaints-policy`

### Responsive Design
- Desktop: Full navigation with all links
- Mobile: Hamburger menu with collapsible navigation

## Files

- `/src/components/PublicHeader.jsx` - Header component
- `/src/components/PublicFooter.jsx` - Footer component
- `/src/components/PublicLayout.jsx` - Layout wrapper
- `/src/pages/AboutPage.jsx` - Example usage

## Important Notes

1. **DO NOT** use these components on:
   - Sign-in pages
   - Sign-up pages
   - Authenticated dashboard pages

2. **USE** these components on:
   - Landing page
   - About page
   - Blog pages
   - Contact page
   - Any other public marketing pages

3. The header is **fixed** (sticky), so ensure your content has `pt-32` (or similar) to avoid overlapping

4. Theme changes are synchronized across all components using localStorage polling
