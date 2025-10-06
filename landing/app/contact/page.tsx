import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Flidio",
  description:
    "Reach the Flidio team for customer support, partnerships, press, or community collaborations."
};

const contactMethods = [
  {
    title: "Customer support",
    details: [
      "Email: hello@flidio.app",
      "Average response time: within 2 business days",
      "For billing issues, include your App Store or Google Play receipt so we can assist faster."
    ]
  },
  {
    title: "Partnerships & press",
    details: [
      "Partnerships: partners@flidio.app",
      "Press inquiries: press@flidio.app",
      "Include a brief description of your organization and the opportunity timeline."
    ]
  },
  {
    title: "Community & feedback",
    details: [
      "Join our Discord: discord.gg/flidio",
      "Share feature requests: roadmap.flidio.app",
      "Follow @flidioapp on social for updates and traveler spotlights."
    ]
  }
];

export default function ContactPage() {
  return (
    <main className="section">
      <div className="container" style={{ maxWidth: "760px" }}>
        <Link href="/" className="btn btn-secondary" style={{ marginBottom: "2rem" }}>
          ← Back to home
        </Link>
        <h1 className="section-heading" style={{ textAlign: "left" }}>
          Contact Flidio
        </h1>
        <p className="section-subtitle" style={{ textAlign: "left" }}>
          We love hearing from travelers. Choose the channel that best fits your request and we’ll respond promptly.
        </p>

        <div className="legal-section">
          {contactMethods.map((method) => (
            <article key={method.title} className="legal-block">
              <h3>{method.title}</h3>
              <ul style={{ paddingLeft: "1.25rem", color: "var(--muted)", lineHeight: 1.7 }}>
                {method.details.map((detail) => (
                  <li key={detail} style={{ marginBottom: "0.65rem" }}>
                    {detail}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <footer style={{ marginTop: "2rem", color: "var(--muted)" }}>
          Prefer direct email? Write us at <a href="mailto:hello@flidio.app">hello@flidio.app</a> – we’re here to help.
        </footer>
      </div>
    </main>
  );
}
