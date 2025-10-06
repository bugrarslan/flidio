import Image from "next/image";
import Link from "next/link";

const featureHighlights = [
  {
    title: "AI-tailored itineraries",
    description:
      "Combine your traveler profile, budget, and vibe preferences to produce bespoke day-by-day plans in seconds."
  },
  {
    title: "Flexible trip builder",
    description:
      "Quickly add destinations, dates, budgets, and trip vibes with intuitive inputs and native date pickers."
  },
  {
    title: "Offline-ready storage",
    description:
      "Keep every itinerary locally on your device with SQLite persistence for reliable, on-the-go access."
  },
  {
    title: "Pro subscription perks",
    description:
      "Unlock unlimited itineraries, AI priority, and advanced personalization with Flidio Pro via RevenueCat."
  }
];

const faqItems = [
  {
    question: "Do I need an API key to get started?",
    answer:
      "No. Flidio Pro covers AI usage out of the box. Power users can add their own Gemini API key in Settings for even faster responses."
  },
  {
    question: "Which platforms does Flidio support?",
    answer:
      "Flidio runs on iOS and Android through our Expo-powered React Native app, offering a consistent experience everywhere."
  },
  {
    question: "How does the subscription work?",
    answer:
      "We rely on RevenueCat for secure billing. Manage your subscription directly in the App Store or Google Play with just one tap."
  }
];

const supportLinks = [
  {
    heading: "Privacy & data safety",
    description:
      "Understand how Flidio handles on-device storage, analytics, and subscription data in plain language.",
    href: "/privacy"
  },
  {
    heading: "Terms of use",
    description:
      "Learn about fair-use policies, subscription access, and guidelines that keep the community thriving.",
    href: "/terms"
  },
  {
    heading: "Get in touch",
    description:
      "Reach the Flidio team for product support, partnerships, or press inquiries any time.",
    href: "/contact"
  }
];

const navigation = [
  { href: "#features", label: "Features" },
  { href: "#screenshots", label: "Screenshots" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" }
];

export default function HomePage() {
  return (
    <main>
      <nav>
        <div className="nav-content">
          <span className="logo">Flidio</span>
          <ul>
            {navigation.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
          <div className="hero-actions">
            <Link href="#download" className="btn btn-secondary">
              Download app
            </Link>
            <Link href="#pricing" className="btn btn-primary">
              Unlock Pro
            </Link>
          </div>
        </div>
      </nav>

      <section className="hero" id="hero">
        <div className="container">
          <h1>Plan unforgettable journeys with AI-guided precision.</h1>
          <p>
            Flidio blends your unique traveler profile with Gemini-powered intelligence to craft custom itineraries, manage vacation budgets, and keep every detail at your fingertips.
          </p>
          <div className="hero-actions">
            <Link href="#download" className="btn btn-primary">
              Get Flidio now
            </Link>
            <Link href="#screenshots" className="btn btn-secondary">
              Browse app tour
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="container">
          <h2 className="section-heading">Everything you need for smarter travel planning</h2>
          <p className="section-subtitle">
            From the initial spark to landing back home, Flidio keeps your adventures organized, personalized, and ready to share.
          </p>
          <div className="features-grid">
            {featureHighlights.map((feature) => (
              <article key={feature.title} className="feature-card">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="screenshots">
        <div className="container">
          <h2 className="section-heading">Take a peek inside the app</h2>
          <p className="section-subtitle">
            Beautifully crafted screens that highlight itinerary insights, subscription perks, and personalized travel vibes.
          </p>
          <div className="screenshot-grid">
            <div className="screenshot-item">
              <Image
                src="/screenshots/screen-1.png"
                alt="Flidio create trip screen"
                width={320}
                height={640}
                priority
              />
              <h4>Trip builder modal</h4>
              <p>Describe your dream escape, select dates, and pick trip vibes in seconds.</p>
            </div>
            <div className="screenshot-item">
              <Image
                src="/screenshots/screen-2.svg"
                alt="Flidio Pro promotion"
                width={320}
                height={640}
              />
              <h4>Flidio Pro spotlight</h4>
              <p>See exactly what you unlock with premium itineraries and AI boosts.</p>
            </div>
            <div className="screenshot-item">
              <Image
                src="/screenshots/screen-3.png"
                alt="Flidio settings screen"
                width={320}
                height={640}
              />
              <h4>Settings in sync</h4>
              <p>Update API keys, manage subscriptions, and tailor themes to your workflow.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="container">
          <h2 className="section-heading">Fair pricing for every type of traveler</h2>
          <p className="section-subtitle">
            Start free with essential planning tools, then upgrade to Flidio Pro for unlimited itineraries and AI power users perks.
          </p>
          <div className="features-grid">
            <article className="feature-card">
              <h3>Free plan</h3>
              <p>
                Explore the app, build sample trips, and test AI suggestions using your own Gemini API key. Ideal for casual planners.
              </p>
            </article>
            <article className="feature-card">
              <h3>Flidio Pro – $2.99/month</h3>
              <p>
                Unlock unlimited AI itineraries, premium travel tips, offline sync, and priority support. Manage subscriptions via RevenueCat.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="container">
          <h2 className="section-heading">Frequently asked questions</h2>
          <div className="faq-grid">
            {faqItems.map((item) => (
              <div key={item.question} className="faq-card">
                <h4>{item.question}</h4>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="support">
        <div className="container">
          <h2 className="section-heading">Legal & support resources</h2>
          <p className="section-subtitle">
            Dive deeper into how Flidio protects your privacy, establishes fair-use guidelines, and stays accessible for every traveler.
          </p>
          <div className="legal-section">
            {supportLinks.map((card) => (
              <div key={card.href} className="legal-block">
                <h3>{card.heading}</h3>
                <p>{card.description}</p>
                <Link href={card.href} className="btn btn-secondary" style={{ width: "fit-content", marginTop: "1rem" }}>
                  Read more
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="download">
        <div className="container">
          <div className="callout">
            <h2>Ready to chart your next adventure?</h2>
            <p>
              Download Flidio today to craft bespoke itineraries, sync traveler preferences, and keep every trip detail in one place.
            </p>
            <div className="hero-actions">
              <Link href="https://apps.apple.com" className="btn btn-primary">
                App Store
              </Link>
              <Link href="https://play.google.com" className="btn btn-secondary">
                Google Play
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer>
        © {new Date().getFullYear()} Flidio. Crafted with care by the Flidio team.
        <br />
        Built with React Native, Expo, and Google Generative AI.
      </footer>
    </main>
  );
}
