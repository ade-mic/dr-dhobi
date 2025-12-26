import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { RiShirtLine } from "react-icons/ri";
import { FaShirt } from "react-icons/fa6";
import { FaShippingFast } from "react-icons/fa";
import { BsFillTelephoneFill } from "react-icons/bs";
import { GiWashingMachine } from "react-icons/gi";
import { MdIron, MdDryCleaning } from "react-icons/md";
import { BiCloset } from "react-icons/bi";

const services = [
  {
    name: "Dry Cleaning",
    copy: "Premium solvents, hand finishing, and inspection before delivery.",
    badge: "48h turnaround",
    icon: <RiShirtLine />,
    features: [
      "Suitable for delicate fabrics (silk, wool, cashmere)",
      "Removes tough stains without water damage",
      "Professional pressing & packaging",
      "Suits, formal wear, designer garments"
    ],
    pricing: "Starting at ₹150 per piece"
  },
  {
    name: "Wash & Fold",
    copy: "Eco detergents, soft water rinse, and neatly packed folds.",
    badge: "Same-day available",
    icon: <FaShirt />,
    features: [
      "Eco-friendly detergents for sensitive skin",
      "Soft water treatment for fabric care",
      "Sorted by color & fabric type",
      "Perfect for everyday wear"
    ],
    pricing: "₹30 per kg (min 3kg)"
  },
  {
    name: "Express Pickup",
    copy: "On time pickup promise anywhere within Bangalore.",
    badge: "Live tracking",
    icon: <FaShippingFast />,
    features: [
      "Pickup within 30 minutes of booking",
      "Real-time rider location tracking",
      "Contactless pickup & delivery",
      "Available 7 days a week (7 AM - 10 PM)"
    ],
    pricing: "Free pickup for orders above ₹300"
  },
  {
    name: "Steam Ironing",
    copy: "Professional steam pressing for wrinkle-free perfection.",
    badge: "24h service",
    icon: <MdIron />,
    features: [
      "Commercial-grade steam pressing",
      "Removes stubborn creases",
      "Safe for all fabric types",
      "Shirts, trousers, sarees, kurtas"
    ],
    pricing: "Starting at ₹25 per piece"
  },
  {
    name: "Premium Laundry",
    copy: "Specialized care for your expensive and designer garments.",
    badge: "Hand wash",
    icon: <MdDryCleaning />,
    features: [
      "Hand washing for delicate items",
      "Individual garment treatment",
      "Stain protection coating available",
      "Ideal for party wear & ethnic clothing"
    ],
    pricing: "Starting at ₹200 per piece"
  },
  {
    name: "Wardrobe Care",
    copy: "Complete seasonal wardrobe cleaning and storage solutions.",
    badge: "Bulk discount",
    icon: <BiCloset />,
    features: [
      "Deep cleaning for entire wardrobe",
      "Moth & bacteria protection",
      "Vacuum-sealed storage packaging",
      "Perfect for seasonal clothing"
    ],
    pricing: "Custom quotes for bulk orders"
  },
];

const steps = [
  "Lock a slot",
  "We pickup & sort",
  "Smart wash & dry",
  "Delivery under 48h",
];

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Koramangala",
    rating: 5,
    text: "Amazing service! They picked up my clothes in 20 minutes and returned them perfectly ironed. Highly recommend!",
  },
  {
    name: "Rajesh Kumar",
    location: "Whitefield",
    rating: 5,
    text: "Best laundry service in Bangalore. Very professional and the quality of cleaning is top-notch.",
  },
  {
    name: "Ananya Reddy",
    location: "HSR Layout",
    text: "Love the convenience! WhatsApp updates and tracking make it so easy. Will never go back to traditional laundry.",
    rating: 5,
  },
];

const faqs = [
  {
    q: "What areas do you serve in Bangalore?",
    a: "We cover 18 neighborhoods including Koramangala, Indiranagar, HSR Layout, Whitefield, Marathahalli, BTM, JP Nagar, and more.",
  },
  {
    q: "How does pricing work?",
    a: "We charge per piece with transparent pricing. Shirts start at ₹30, trousers at ₹40. Check our detailed pricing page for all items.",
  },
  {
    q: "What if I'm not satisfied?",
    a: "We offer 100% satisfaction guarantee. If you're not happy with the cleaning, we'll redo it for free or provide a full refund.",
  },
  {
    q: "Do you handle delicate fabrics?",
    a: "Absolutely! We specialize in silk, wool, leather, and designer wear with expert hand-finishing.",
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              {/* <p className={styles.pretitle}>Bangalore · Since 2014</p> */}
              <h1>
                Dr Dhobi
                <br />
                Premium doorstep laundry service.
              </h1>
              <p className={styles.subtitle}>
                Book drying, washing, or express pickup in seconds. Trusted teams,
                contactless handling, and real-time rider tracking across the city.
              </p>
              <div className={styles.heroCtas}>
                <Link href="/booking">Book a pickup</Link>
                <a href="tel:+918080808080"><BsFillTelephoneFill /> Call 080-8080-8080</a>
              </div>
            </div>
            <div className={styles.heroImage}>
              <Image
                src="/dhobi-hero.png"
                alt="Professional laundry service"
                width={600}
                height={450}
                priority
                className={styles.mainImage}
              />
            </div>
          </div>
          <div className={styles.statBoard}>
            <div>
              <strong>18+</strong>
              <span>Areas we serve in Bangalore</span>
            </div>
            <div>
              <strong>30 min</strong>
              <span>Average pickup time</span>
            </div>
            <div>
              <strong>48 hrs</strong>
              <span>Standard turnaround time</span>
            </div>
          </div>
        </section>

        <section className={styles.services}>
          <h2>Our Services</h2>
          <p className={styles.servicesIntro}>
            From everyday laundry to premium garment care, we offer comprehensive solutions for all your clothing needs
          </p>
          <div className={styles.serviceGrid}>
            {services.map((service) => (
              <article key={service.name} className={styles.serviceCard}>
                <div className={styles.serviceIcon}>{service.icon}</div>
                <header>
                  <span className={styles.serviceBadge}>{service.badge}</span>
                  <h3>{service.name}</h3>
                </header>
                <p className={styles.serviceCopy}>{service.copy}</p>
                <ul className={styles.serviceFeatures}>
                  {service.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                <p className={styles.servicePricing}>{service.pricing}</p>
                <Link href="/services" className={styles.serviceLink}>
                  Learn More →
                </Link>
              </article>
            ))}
          </div>
          <div className={styles.servicesFooter}>
            <Link href="/services" className={styles.viewAllServices}>
              View All Services & Pricing →
            </Link>
          </div>
        </section>

        <section className={styles.steps}>
          <h2>How Dr Dhobi flows</h2>
          <ol>
            {steps.map((step, index) => (
              <li key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.cta}>
          <div className={styles.ctaContent}>
            <div className={styles.ctaText}>
              <h2>Ready to experience hassle-free laundry?</h2>
              <p>
                Experience premium laundry service across Bangalore. Book your first
                pickup today and get 20% off!
              </p>
              <Link href="/booking" className={styles.ctaButton}>
                Book Your First Pickup →
              </Link>
            </div>
            <div className={styles.ctaImage}>
              <Image
                src="/laundry1.jpg"
                alt="Fresh clean laundry"
                width={500}
                height={350}
                className={styles.ctaImg}
              />
            </div>
          </div>
        </section>

        
        <section className={styles.testimonials}>
          <h2>What Our Customers Say</h2>
          <div className={styles.testimonialGrid}>
            {testimonials.map((t) => (
              <article key={t.name}>
                <div className={styles.stars}>
                  {"⭐".repeat(t.rating)}
                </div>
                <p className={styles.testimonialText}>&quot;{t.text}&quot;</p>
                <div className={styles.author}>
                  <strong>{t.name}</strong>
                  <span>{t.location}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.faq}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            {faqs.map((faq) => (
              <article key={faq.q}>
                <h3>{faq.q}</h3>
                <p>{faq.a}</p>
              </article>
            ))}
          </div>
        </section>

        
      </main>
    </div>
  );
}