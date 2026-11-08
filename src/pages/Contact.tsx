import { useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowUpRight, CheckCircle2, Globe2, Leaf, Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import FrostedSelect from "../components/FrostedSelect";
import { submitEnquiry } from "../services/enquiry";
import { trackEvent } from "../services/analytics";

const initialForm = { name: "", email: "", contact: "", subject: "product-info", message: "" };
const subjects = [
  { value: "product-info", label: "Product information" },
  { value: "dealer-inquiry", label: "Bulk & dealer enquiry" },
  { value: "technical-support", label: "Technical support" },
  { value: "consultation", label: "General consultation" },
];

export default function Contact() {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
    setStatus(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    const enquiry = Object.fromEntries(Object.entries(formData).map(([key, value]) => [key, value.trim()])) as typeof formData;
    if (!enquiry.name || !enquiry.message) {
      setStatus({ type: "error", message: "Please enter your name and message." });
      const field = event.currentTarget.elements.namedItem(!enquiry.name ? "name" : "message");
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    const endpoint = import.meta.env.VITE_APP_SCRIPT_EXCEL_URL?.trim();
    if (!endpoint) {
      setStatus({ type: "error", message: "The enquiry form is temporarily unavailable. Please email info@vhnglobal.com or call +91 72768 00399 to reach us directly." });
      return;
    }
    setIsSubmitting(true);
    setStatus(null);
    try {
      await submitEnquiry(enquiry);
      trackEvent("generate_lead", { form_source: "contact", delivery_status: "confirmed" });
      setStatus({ type: "success", message: "Your enquiry has been submitted. Thank you for connecting with VHN Global." });
      setFormData(initialForm);
    } catch {
      setStatus({ type: "error", message: "We couldn’t confirm your enquiry. Please email info@vhnglobal.com before sending it again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-orb contact-orb-green" aria-hidden="true" />
      <div className="contact-orb contact-orb-sand" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="contact-intro" aria-labelledby="contact-heading" data-reveal>
          <div>
            <span className="section-label">Contact VHN Global</span>
            <h1 id="contact-heading">Let’s grow<br /><span>something great.</span></h1>
          </div>
          <div className="contact-intro-note">
            <span className="contact-world-icon"><Globe2 className="w-5 h-5" /></span>
            <p>Rooted in India. Connected worldwide.<br /><span>Let’s find the right growing solution for you.</span></p>
          </div>
        </section>

        <div className="contact-grid">
          <aside className="contact-sidebar" aria-label="Contact information">
            <div className="contact-story" data-reveal>
              <img src="/images/cocopeat-drying-yard.png" alt="Cocopeat drying yard concept with coconut palms and compressed blocks" className="contact-story-image" />
              <div className="contact-story-shade" aria-hidden="true" />
              <div className="contact-story-content">
                <span className="contact-photo-badge"><Leaf className="w-3.5 h-3.5" /> Naturally connected</span>
                <div className="contact-story-caption">
                  <span className="text-xs uppercase tracking-[0.18em] text-emerald-100">From coconut to cultivation</span>
                  <h2>Better conversations.<br />Better beginnings.</h2>
                  <p>From cocopeat enquiries to your next export partnership, we’re here to help.</p>
                </div>
              </div>
            </div>

            <div className="contact-details glass-panel" data-reveal>
              <p className="contact-small-label">A direct connection</p>
              <a href="mailto:info@vhnglobal.com" className="contact-detail-link">
                <span className="contact-detail-icon"><Mail className="w-5 h-5" /></span>
                <span className="min-w-0"><span className="contact-detail-label">Email our team</span><span className="contact-detail-value break-all">info@vhnglobal.com</span></span>
                <ArrowUpRight className="contact-link-arrow" aria-hidden="true" />
              </a>
              <a href="tel:+917276800399" className="contact-detail-link">
                <span className="contact-detail-icon"><Phone className="w-5 h-5" /></span>
                <span><span className="contact-detail-label">Give us a call</span><span className="contact-detail-value">+91 72768 00399</span></span>
                <ArrowUpRight className="contact-link-arrow" aria-hidden="true" />
              </a>
              <a href="https://www.google.com/maps/search/?api=1&query=Pune%2C+Maharashtra+412307%2C+India" target="_blank" rel="noreferrer" className="contact-detail-link">
                <span className="contact-detail-icon"><MapPin className="w-5 h-5" /></span>
                <span><span className="contact-detail-label">Find us in India</span><span className="contact-detail-value">Pune, Maharashtra 412307</span></span>
                <ArrowUpRight className="contact-link-arrow" aria-hidden="true" />
              </a>
            </div>
          </aside>

          <section className="contact-form-panel glass-panel" aria-labelledby="enquiry-heading" data-reveal>
            <div className="contact-form-heading">
              <div>
                <p className="contact-small-label">Start a conversation</p>
                <h2 id="enquiry-heading">Tell us what you have in mind.</h2>
              </div>
              <span className="contact-send-icon" aria-hidden="true"><Send className="w-5 h-5" /></span>
            </div>
            <p className="contact-form-description">Looking for product details, bulk supply, or a new partnership? Share a few details and let’s take it from there.</p>

            <form onSubmit={handleSubmit} className="contact-form" aria-busy={isSubmitting}>
              <fieldset disabled={isSubmitting} className="contact-fieldset">
                <legend className="sr-only">Your enquiry details</legend>
                <div className="contact-field-row">
                  <div className="contact-field">
                    <label htmlFor="contact-name">Full name <span aria-hidden="true">*</span></label>
                    <input id="contact-name" name="name" autoComplete="name" value={formData.name} onChange={handleChange} required maxLength={120} placeholder="Your full name" className="input" />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="contact-email">Email address <span aria-hidden="true">*</span></label>
                    <input id="contact-email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} required maxLength={254} placeholder="you@company.com" className="input" />
                  </div>
                </div>
                <div className="contact-field">
                  <label htmlFor="contact-phone">Phone number <span className="contact-optional">Optional</span></label>
                  <input id="contact-phone" name="contact" type="tel" autoComplete="tel" value={formData.contact} onChange={handleChange} maxLength={40} placeholder="Include your country code" className="input" />
                </div>
                <div className="contact-field">
                  <label id="contact-subject-label" htmlFor="contact-subject">What can we help you with? <span aria-hidden="true">*</span></label>
                  <FrostedSelect id="contact-subject" name="subject" value={formData.subject} options={subjects}
                    disabled={isSubmitting} required onChange={(subject) => {
                      setFormData((current) => ({ ...current, subject }));
                      setStatus(null);
                    }} />
                </div>
                <div className="contact-field">
                  <label htmlFor="contact-message">Your message <span aria-hidden="true">*</span></label>
                  <textarea id="contact-message" name="message" value={formData.message} onChange={handleChange} required rows={5} maxLength={5000} placeholder="Tell us about the products, quantities, or destination you’re considering…" className="input" />
                </div>
              </fieldset>

              {status && <div role={status.type === "error" ? "alert" : "status"} className={`contact-feedback ${status.type === "success" ? "contact-feedback-success" : "contact-feedback-error"}`}>
                {status.type === "success" && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                <p>{status.message}</p>
              </div>}

              <div className="contact-form-bottom">
                <p><span aria-hidden="true">*</span> Required fields<br /><span>Your details are used to respond to your enquiry.</span></p>
                <button type="submit" disabled={isSubmitting} className="btn-primary inline-flex">
                  {isSubmitting ? <>Sending <Loader2 className="w-4 h-4 animate-spin" /></> : <>Send enquiry <ArrowUpRight className="w-4 h-4" /></>}
                </button>
              </div>
            </form>
          </section>
        </div>
        <div className="contact-bottom-note"><Leaf className="w-4 h-4" aria-hidden="true" /><span>Good growth starts with a conversation.</span></div>
      </div>
    </div>
  );
}
