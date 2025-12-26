import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { FaCheckCircle, FaLeaf, FaAward, FaUsers } from "react-icons/fa";
import { MdLocalShipping, MdSecurity } from "react-icons/md";

export default function AboutPage() {
  const values = [
    {
      icon: <FaCheckCircle />,
      title: "Quality First",
      description: "We use premium detergents and state-of-the-art equipment to ensure your clothes get the best care possible.",
    },
    {
      icon: <FaLeaf />,
      title: "Eco-Friendly",
      description: "Our processes are designed to minimize water waste and use biodegradable, skin-safe detergents.",
    },
    {
      icon: <MdLocalShipping />,
      title: "Timely Service",
      description: "We value your time. Our express pickup and 48-hour turnaround ensure you get your clothes when you need them.",
    },
    {
      icon: <MdSecurity />,
      title: "Safe & Secure",
      description: "Contactless pickup, secure packaging, and careful handling of all your garments with full accountability.",
    },
    {
      icon: <FaAward />,
      title: "Expert Team",
      description: "Our trained professionals specialize in fabric care, stain removal, and garment finishing.",
    },
    {
      icon: <FaUsers />,
      title: "Customer Focused",
      description: "Your satisfaction is our priority. We offer 100% satisfaction guarantee and responsive customer support.",
    },
  ];

  const whyWeDifferent = [
    {
      title: "Built for Bangalore",
      description: "We understand the busy lifestyle of Bangalore residents and built our service around your needs.",
    },
    {
      title: "Technology First",
      description: "Modern booking system, and instant updates - because your time matters.",
    },
    {
      title: "Quality at Heart",
      description: "We may be new, but we're obsessed with getting every detail right - from pickup to delivery.",
    },
  ];

  const team = [
    {
      name: "Dr. Abhishek Dasore",
      role: "Founder",
      image: "/team/founder.jpg",
      bio: "Building the laundry service I wished existed",
    },
  ];

  return (
    <div className={styles.page}>
      <main className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroGrid}>
            <div className={styles.heroImageWrapper}>
              <div className={styles.heroImageContainer}>
                <Image
                  src="/laundry1.jpg"
                  alt="Professional laundry service"
                  width={500}
                  height={400}
                  className={styles.heroImage}
                />
                <div className={styles.heroImageOverlay}>
                  <div className={styles.overlayBadge}>
                    ✨ Premium Care
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.heroText}>
              <h1>About Dr Dhobi</h1>
              <p className={styles.heroSubtitle}>
                We're on a mission to reimagine doorstep laundry service for modern 
                Bangalore - making it simple, reliable, and hassle-free.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className={styles.story}>
          <div className={styles.storyGrid}>
            <div className={styles.storyText}>
              <h2>Our Story</h2>
              <p>
                Dr Dhobi was born from a simple frustration: finding reliable, 
                quality laundry service in Bangalore shouldn't be this hard. As 
                working professionals ourselves, we knew there had to be a better way.
              </p>
              <p>
                We're a fresh startup with a clear mission - to bring professional 
                laundry care to your doorstep without the hassle. No more waiting weeks 
                for service, no more quality concerns, and no more unpredictable pricing. 
                Just honest, reliable laundry service that respects your time and clothes.
              </p>
              <p>
                We're starting in select areas of Bangalore, building our service 
                one satisfied customer at a time. Every piece of feedback helps us 
                improve, and every order is handled with care as if it's our first.
              </p>
            </div>
            <div className={styles.storyImage}>
              <Image
                src="/laundry2.jpg"
                alt="Professional laundry service"
                width={600}
                height={400}
                className={styles.image}
              />
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className={styles.values}>
          <h2>Our Values</h2>
          <div className={styles.valuesGrid}>
            {values.map((value) => (
              <article key={value.title} className={styles.valueCard}>
                <div className={styles.valueIcon}>{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Why Different Section */}
        <section className={styles.whyDifferent}>
          <h2>Why We're Different</h2>
          <div className={styles.differenceGrid}>
            {whyWeDifferent.map((item) => (
              <article key={item.title} className={styles.differenceCard}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Vision Section */}
        <section className={styles.vision}>
          <div className={styles.visionContent}>
            <h2>Our Vision</h2>
            <p>
              To become Bangalore's go-to laundry service by focusing on what matters: 
              quality, reliability, and customer satisfaction. We're not trying to be 
              the biggest - we're trying to be the best.
            </p>
            <div className={styles.commitments}>
              <div className={styles.commitment}>
                <strong>Transparent Pricing</strong>
                <span>No hidden charges, ever</span>
              </div>
              <div className={styles.commitment}>
                <strong>48-Hour Turnaround</strong>
                <span>Or we'll give you a discount</span>
              </div>
              <div className={styles.commitment}>
                <strong>100% Satisfaction</strong>
                <span>We'll make it right, guaranteed</span>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className={styles.team}>
          <h2>Meet the Team</h2>
          <p className={styles.teamIntro}>
            We're a small but passionate team dedicated to making your life easier
          </p>
          <div className={styles.teamGrid}>
            {team.map((member) => (
              <article key={member.name} className={styles.teamCard}>
                <div className={styles.teamImageWrapper}>
                  <div className={styles.teamImagePlaceholder}>
                    {member.name.charAt(0)}
                  </div>
                </div>
                <h3>{member.name}</h3>
                <p className={styles.role}>{member.role}</p>
                <p className={styles.bio}>{member.bio}</p>
              </article>
            ))}
          </div>
          <p className={styles.joinNote}>
            We're growing! If you're passionate about great service, reach out to us.
          </p>
        </section>

        {/* CTA Section */}
        <section className={styles.cta}>
          <h2>Be among our first customers</h2>
          <p>Help us build the best laundry service in Bangalore. Your feedback shapes our future.</p>
          <div className={styles.ctaButtons}>
            <Link href="/booking" className={styles.primaryBtn}>
              Book a Pickup
            </Link>
            <Link href="/quote" className={styles.secondaryBtn}>
              Get a Quote
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
