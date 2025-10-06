# Flidio Landing Page

A marketing site for the Flidio mobile application, built with Next.js 14 and the App Router.

## Features

- Hero section articulating Flidio's value proposition
- Feature overview with AI itinerary, subscription, and storage highlights
- Screenshot gallery referencing bundled SVG placeholders (swap for real app captures)
- Pricing overview with free vs. Pro tiers
- FAQ section answering common product questions
- Legal & support section covering privacy, terms, and contact information
- Download call-to-action targeting iOS and Android stores

## Getting Started

```bash
npm install
npm run dev
```

The site will be available at `http://localhost:3000`.

## Updating Screenshots

Replace the SVG placeholder files in `public/screenshots/` with exported app screenshots (PNG/JPG/SVG). Keep the same filenames or update the `src` attributes in `app/page.tsx`.

## Deployment

Any Next.js-friendly hosting (Vercel, Netlify, Render, etc.) is supported. Build the site with:

```bash
npm run build
npm start
```

---

Crafted to complement the Flidio React Native application.
