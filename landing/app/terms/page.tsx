import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Flidio Terms of Use",
  description:
    "Review the guidelines for using Flidio, managing subscriptions, and keeping our community safe while traveling." 
};

const terms = [
  {
    heading: "Acceptance of terms",
    points: [
      "By installing or using Flidio you agree to these Terms of Use and our Privacy Policy.",
      "You must be at least 16 years old, or the age required by your jurisdiction to enter into digital service agreements." 
    ]
  },
  {
    heading: "App usage",
    points: [
      "Flidio provides itinerary suggestions for inspiration. You are responsible for verifying availability, pricing, visas, and safety before booking.",
      "Do not scrape, automate, or reverse engineer the app. Creating derivative services based on Flidio’s content is prohibited." 
    ]
  },
  {
    heading: "Subscriptions & billing",
    points: [
      "Flidio Pro is billed through the App Store or Google Play. Subscriptions automatically renew unless cancelled at least 24 hours before the renewal date.",
      "Manage or cancel your subscription directly in the respective app store. Uninstalling the app does not automatically cancel Pro access." 
    ]
  },
  {
    heading: "AI-generated content",
    points: [
      "AI itineraries may occasionally contain inaccuracies. Always double check recommendations, opening hours, and travel advisories.",
      "You are responsible for ensuring that generated prompts and outputs comply with local laws and travel restrictions." 
    ]
  },
  {
    heading: "Updates to these terms",
    points: [
      "We may update these terms as new features launch. Material changes will be announced in-app and via email when possible.",
      "Continued use of the app after updates become effective constitutes acceptance of the revised terms." 
    ]
  }
];

export default function TermsPage() {
  return (
    <main className="section">
      <div className="container" style={{ maxWidth: "760px" }}>
        <Link href="/" className="btn btn-secondary" style={{ marginBottom: "2rem" }}>
          ← Back to home
        </Link>
        <h1 className="section-heading" style={{ textAlign: "left" }}>
          Terms of Use
        </h1>
        <p className="section-subtitle" style={{ textAlign: "left" }}>
          Updated October 2025 – Please read these terms carefully to understand your rights and responsibilities when using Flidio.
        </p>

        <div className="legal-section">
          {terms.map((section) => (
            <article key={section.heading} className="legal-block">
              <h3>{section.heading}</h3>
              <ul style={{ paddingLeft: "1.25rem", color: "var(--muted)", lineHeight: 1.7 }}>
                {section.points.map((point) => (
                  <li key={point} style={{ marginBottom: "0.75rem" }}>
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <footer style={{ marginTop: "2rem", color: "var(--muted)" }}>
          For questions about these terms, contact <a href="mailto:hello@flidio.app">hello@flidio.app</a>.
        </footer>
      </div>
    </main>
  );
}
