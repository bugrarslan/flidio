import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Flidio Privacy Policy",
  description:
    "Learn how Flidio keeps your travel data secure, how subscriptions are processed, and the controls you have over your information."
};

const sections = [
  {
    heading: "Information we store",
    paragraphs: [
      "Flidio prioritizes on-device privacy. Trip plans, itineraries, and traveler profiles remain on your device using secure local storage (SQLite and AsyncStorage).",
      "We collect anonymous analytics to understand feature usage and performance. These analytics never include itinerary content, custom prompts, or personally identifying information."
    ]
  },
  {
    heading: "Subscription data",
    paragraphs: [
      "When you subscribe to Flidio Pro, payments are processed through Apple App Store or Google Play using RevenueCat. We do not see, transmit, or store your payment card numbers.",
      "RevenueCat provides us with anonymized entitlement information (for example, whether your subscription is active) so the app can unlock Pro features." 
    ]
  },
  {
    heading: "AI requests",
    paragraphs: [
      "Itinerary generation calls Google Gemini. We only send the trip context you provide (destination, budget, vibe, and traveler profile data if you opt in). No credentials or payment information are ever shared.",
      "If you provide your own API key, requests are made directly from your device and governed by Google’s privacy policy." 
    ]
  },
  {
    heading: "Your controls",
    paragraphs: [
      "You can clear your traveler profile, settings, or the entire itinerary database from Settings at any time. Deleting the app removes all locally stored data.",
      "For analytics opt-out or data deletion requests, contact hello@flidio.app with your device ID. We will handle requests within 30 days." 
    ]
  }
];

export default function PrivacyPage() {
  return (
    <main className="section">
      <div className="container" style={{ maxWidth: "760px" }}>
        <Link href="/" className="btn btn-secondary" style={{ marginBottom: "2rem" }}>
          ← Back to home
        </Link>
        <h1 className="section-heading" style={{ textAlign: "left" }}>
          Privacy Policy
        </h1>
        <p className="section-subtitle" style={{ textAlign: "left" }}>
          Updated October 2025 – Flidio is designed to keep your travel plans private while still delivering powerful AI-driven assistance.
        </p>

        <div className="legal-section">
          {sections.map((section) => (
            <article key={section.heading} className="legal-block">
              <h3>{section.heading}</h3>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          ))}
        </div>

        <footer style={{ marginTop: "2rem", color: "var(--muted)" }}>
          Questions about this policy? Email <a href="mailto:hello@flidio.app">hello@flidio.app</a>.
        </footer>
      </div>
    </main>
  );
}
