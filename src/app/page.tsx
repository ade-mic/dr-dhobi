import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { RiShirtLine } from "react-icons/ri";
import { FaShirt } from "react-icons/fa6";
import { FaShippingFast } from "react-icons/fa";
import { BsFillTelephoneFill } from "react-icons/bs";
const services = [
  {
    name: "Dry Cleaning",
    copy: "Premium solvents, hand finishing, and inspection before delivery.",
    badge: "48h turnaround",
    icon: <RiShirtLine />,
  },
  {
    name: "Wash & Fold",
    copy: "Eco detergents, soft water rinse, and neatly packed folds.",
    badge: "Same-day rider",
    icon: <FaShirt />,
  },
  {
    name: "Express Pickup",
    copy: "On time pickup promise anywhere within Bangalore.",
    badge: "Live tracking",
    icon: <FaShippingFast />,
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
                src="/laundry.jpg"
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
          {services.map((service) => (
            <article key={service.name}>
              <div className={styles.serviceIcon}>{service.icon}</div>
              <header>
                <p>{service.badge}</p>
                <h3>{service.name}</h3>
              </header>
              <p>{service.copy}</p>
            </article>
          ))}
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
