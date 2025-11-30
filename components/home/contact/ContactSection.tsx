"use client";

import styles from "./ContactSection.module.css";
import { useForm, ValidationError } from "@formspree/react";
import { MessageCircle, Mail, Phone, MapPin } from "lucide-react";

export default function ContactSection() {
  const [state, handleSubmit] = useForm("mrbdjbjr");

  return (
    <section className={styles.contactSection} id="contact">
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.sectionTitle}>
            Let&apos;s Craft Your <span>Digital Presence</span>
          </h2>
          <p className={styles.sectionText}>
            At King Web Innovation, we help businesses shine online. Reach out
            to discover how a custom website can elevate your brand and drive
            growth.
          </p>
        </header>

        <main className={styles.main}>
          <div className={styles.contactOptions}>
            <h3 className={styles.subTitle}>Connect with Us</h3>
            <p className={styles.subText}>
              Pick the most convenient way to reach King Web Innovation. Our
              team is ready to bring your ideas to life.
            </p>

            <div className={styles.option}>
              <MessageCircle className={styles.icon} size={24} />
              <div>
                <h4 className={styles.optionTitle}>WhatsApp Chat</h4>
                <p className={styles.optionText}>
                  Fast responses to all your questions
                </p>
                <a
                  href="https://wa.me/19414480584"
                  className={styles.btn}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            <div className={styles.option}>
              <Mail className={styles.icon} size={24} />
              <div>
                <h4 className={styles.optionTitle}>Email Support</h4>
                <p className={styles.optionText}>kingwebinnovation@gmail.com</p>
                <a
                  href="mailto:kingwebinnovation@gmail.com"
                  className={styles.btn}
                >
                  Send Email
                </a>
              </div>
            </div>

            <div className={styles.option}>
              <Phone className={styles.icon} size={24} />
              <div>
                <h4 className={styles.optionTitle}>Call Our Team</h4>
                <p className={styles.optionText}>+1 516 564-7395</p>
                <a href="tel:+15165647395" className={styles.btn}>
                  Call Now
                </a>
              </div>
            </div>

            <div className={styles.option}>
              <MapPin className={styles.icon} size={24} />
              <div>
                <h4 className={styles.optionTitle}>Visit Us</h4>
                <p className={styles.optionText}>
                  Long Island, NY, United States
                </p>
                <a
                  href="https://www.google.com/maps/place/Long+Island,+NY,+USA/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.btn}
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>

          <div className={styles.contactForm}>
            <h3 className={styles.formTitle}>Start Your Project</h3>
            <p className={styles.formText}>
              Share your vision and requirements. Our experts will respond
              within 24 hours to help bring your website to life.
            </p>

            {state.succeeded ? (
              <p className={styles.successMessage}>
                Thanks for contacting King Web Innovation! We&apos;ll reach out
                shortly.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.row}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    required
                    className={styles.input}
                  />
                  <input
                    type="text"
                    name="business"
                    placeholder="Your business name"
                    className={styles.input}
                  />
                </div>

                <div className={styles.row}>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    required
                    className={styles.input}
                  />
                  <ValidationError
                    prefix="Email"
                    field="email"
                    errors={state.errors}
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+1 941 448 0584"
                    className={styles.input}
                  />
                </div>

                <textarea
                  id="message"
                  name="message"
                  placeholder="Describe your business, the type of website you need, and any special features or design preferences..."
                  required
                  className={styles.textarea}
                />
                <ValidationError
                  prefix="Message"
                  field="message"
                  errors={state.errors}
                />

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={state.submitting}
                >
                  {state.submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </section>
  );
}
