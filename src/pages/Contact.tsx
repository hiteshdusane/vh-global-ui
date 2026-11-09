import { useState, type ChangeEvent, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronDown, Copy, Globe2, Layers, Leaf, Loader2, Mail, MapPin, MessageCircle, Package, Phone, Send, ShieldCheck, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { submitEnquiry } from "../services/enquiry";
import { trackEvent } from "../services/analytics";
import "./Contact.css";

const initialForm = { name: "", email: "", contact: "", subject: "product-info", message: "" };
const subjects = [
  { value: "product-info", label: "Product information", detail: "Find your right fit", icon: Leaf, placeholder: "Which products are you interested in? Share the format, specifications, and quantities you have in mind." },
  { value: "dealer-inquiry", label: "Bulk & dealer enquiry", detail: "Plan your next order", icon: Package, placeholder: "Tell us the products, order quantities, packaging preferences, and destination for your bulk enquiry." },
  { value: "technical-support", label: "Technical support", detail: "Get into the details", icon: Layers, placeholder: "Share your growing setup, product specifications, or technical questions so we can understand what you need." },
  { value: "consultation", label: "General consultation", detail: "Explore a possibility", icon: MessageCircle, placeholder: "Tell us about your business, what you are exploring, and how our team can help." },
];

export default function Contact() {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const reducedMotion = useReducedMotion();
  const activeSubject = subjects.find((subject) => subject.value === formData.subject) ?? subjects[0];
  const completedFields = [!!formData.name.trim(), /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()), !!formData.message.trim()].filter(Boolean).length;
  const reveal = { initial: reducedMotion ? false as const : { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.1 }, transition: { duration: reducedMotion ? 0 : 0.5 } };
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
    setStatus(null);
  };
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("info@vhnglobal.com");
      setCopyStatus("Email address copied.");
    } catch {
      setCopyStatus("Please copy info@vhnglobal.com or use the email link.");
    }
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
    if (!import.meta.env.VITE_APP_SCRIPT_EXCEL_URL?.trim()) {
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
    <div className="contact-page contact-rich">
      <div className="contact-orb contact-orb-green" aria-hidden="true" /><div className="contact-orb contact-orb-sand" aria-hidden="true" />
      <div className="contact-rich-container">
        <motion.section {...reveal} className="contact-intro" aria-labelledby="contact-heading">
          <div><span className="section-label">A connection worth making</span><h1 id="contact-heading">Good things start<br /><span>with a conversation.</span></h1><p className="contact-rich-lead">Your next growing idea. A product question. A new partnership.<br className="hidden sm:block" /> Let’s find the right starting point, together.</p></div>
          <div className="contact-intro-note"><span className="contact-world-icon"><Globe2 className="w-5 h-5" aria-hidden="true" /></span><p>From Pune, India.<br /><strong>Connected to your world.</strong></p><a href="#enquiry-form" className="contact-jump" aria-label="Go to the enquiry form"><ArrowDown className="w-4 h-4" aria-hidden="true" /></a></div>
        </motion.section>

        <div className="contact-grid">
          <motion.section {...reveal} id="enquiry-form" className="contact-form-panel glass-panel" aria-labelledby="enquiry-heading">
            <div className="contact-form-glow" aria-hidden="true" />
            <div className="contact-form-heading"><div><p className="contact-small-label">Make the first connection</p><h2 id="enquiry-heading">What’s on your mind?</h2></div><motion.span className="contact-send-icon" aria-hidden="true" whileHover={reducedMotion ? undefined : { rotate: -12, scale: 1.06 }}><Send className="w-5 h-5" /></motion.span></div>
            <p className="contact-form-description">A few details are all it takes. Choose a topic and tell us what your business needs.</p>
            <form onSubmit={handleSubmit} className="contact-form" aria-busy={isSubmitting}>
              <fieldset disabled={isSubmitting} className="contact-fieldset">
                <legend className="sr-only">Your enquiry details</legend>
                <div className="contact-topic-section"><p id="contact-topic-label" className="contact-topic-label">I’d like to talk about</p><div className="contact-topic-picker" role="group" aria-labelledby="contact-topic-label">{subjects.map(({ value, label, detail, icon: Icon }) => <motion.button type="button" key={value} aria-pressed={formData.subject === value} onClick={() => { setFormData((current) => ({ ...current, subject: value })); setStatus(null); }} whileHover={reducedMotion ? undefined : { y: -2 }} whileTap={reducedMotion ? undefined : { scale: 0.99 }}><span className="contact-topic-icon"><Icon className="w-4 h-4" aria-hidden="true" /></span><span><strong>{label}</strong><small>{detail}</small></span><span className="contact-topic-check" aria-hidden="true">{formData.subject === value && <Check className="w-3 h-3" />}</span></motion.button>)}</div><input type="hidden" name="subject" value={formData.subject} /></div>
                <div className="contact-form-divider"><span>About you</span><span>* Required fields</span></div>
                <div className="contact-field-row">
                  <div className="contact-field"><label htmlFor="contact-name">Full name <span aria-hidden="true">*</span></label><input id="contact-name" name="name" autoComplete="name" value={formData.name} onChange={handleChange} required maxLength={120} placeholder="Your full name" className="input" /></div>
                  <div className="contact-field"><label htmlFor="contact-email">Email address <span aria-hidden="true">*</span></label><input id="contact-email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} required maxLength={254} placeholder="you@company.com" className="input" /></div>
                </div>
                <div className="contact-field"><label htmlFor="contact-phone">Phone number <span className="contact-optional">Optional</span></label><input id="contact-phone" name="contact" type="tel" autoComplete="tel" value={formData.contact} onChange={handleChange} maxLength={40} placeholder="Include your country code" className="input" /></div>
                <div className="contact-field"><div className="contact-message-label"><label htmlFor="contact-message">Your message <span aria-hidden="true">*</span></label><span>{formData.message.length.toLocaleString()} / 5,000</span></div><textarea id="contact-message" name="message" value={formData.message} onChange={handleChange} required rows={5} maxLength={5000} placeholder={activeSubject.placeholder} className="input" /><p className="contact-message-hint"><Sprout className="w-3.5 h-3.5" aria-hidden="true" /> Product, quantity, destination — a little context helps.</p></div>
              </fieldset>
              <AnimatePresence initial={false}>{status && <motion.div key={status.type} initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.2 }} role={status.type === "error" ? "alert" : "status"} className={`contact-feedback ${status.type === "success" ? "contact-feedback-success" : "contact-feedback-error"}`}>{status.type === "success" && <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />}<p>{status.message}</p></motion.div>}</AnimatePresence>
              <div className="contact-ready"><span className="contact-ready-dots" aria-hidden="true">{[1, 2, 3].map((step) => <span key={step} data-complete={completedFields >= step} />)}</span><span>{completedFields === 3 ? "Your details are ready to send." : "A name, an email, and your idea. That’s all."}</span></div>
              <div className="contact-form-bottom"><p><ShieldCheck className="w-4 h-4" aria-hidden="true" /><span>Your details are used to<br />respond to your enquiry.</span></p><button type="submit" disabled={isSubmitting} className="btn-primary inline-flex">{isSubmitting ? <>Sending enquiry <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /></> : <>Let’s connect <ArrowUpRight className="w-4 h-4" aria-hidden="true" /></>}</button></div>
            </form>
          </motion.section>

          <aside className="contact-sidebar" aria-label="Contact information">
            <motion.div {...reveal} className="contact-story-shell">
              <Link to="/about#production-process" className="contact-story" aria-label="Explore how our cocopeat is made"><img src="/images/cocopeat-drying-yard.png" width={1536} height={1024} alt="Illustration of a cocopeat drying yard surrounded by coconut palms" className="contact-story-image" fetchPriority="high" /><div className="contact-story-shade" aria-hidden="true" /><div className="contact-story-content"><span className="contact-photo-badge"><Leaf className="w-3.5 h-3.5" aria-hidden="true" /> Naturally connected</span><div className="contact-story-caption"><span className="contact-story-eyebrow">From coconut to possibility</span><h2>Better conversations.<br />Better beginnings.</h2><p>From cocopeat to coir ropes, let’s explore what comes next for your business.</p><span className="contact-story-cta">Discover our story <ArrowUpRight className="w-4 h-4" aria-hidden="true" /></span></div></div></Link>
              <span className="contact-story-stamp"><Globe2 className="w-4 h-4" aria-hidden="true" /><span>India to your market</span></span>
            </motion.div>
            <motion.div {...reveal} className="contact-details glass-panel"><div className="contact-details-heading"><p className="contact-small-label">A more direct connection</p><span className="contact-details-dot" aria-hidden="true" /></div>
              <div className="contact-email-row"><a href="mailto:info@vhnglobal.com" className="contact-detail-link"><span className="contact-detail-icon"><Mail className="w-5 h-5" aria-hidden="true" /></span><span className="min-w-0"><span className="contact-detail-label">Write to us</span><span className="contact-detail-value">info@vhnglobal.com</span></span><ArrowUpRight className="contact-link-arrow" aria-hidden="true" /></a><button type="button" className="contact-copy-button" onClick={() => { void copyEmail(); }} aria-label="Copy email address"><Copy className="w-4 h-4" aria-hidden="true" /></button></div>
              <p className="contact-copy-status" role="status">{copyStatus}</p>
              <a href="tel:+917276800399" className="contact-detail-link"><span className="contact-detail-icon"><Phone className="w-5 h-5" aria-hidden="true" /></span><span><span className="contact-detail-label">Give us a call</span><span className="contact-detail-value">+91 72768 00399</span></span><ArrowUpRight className="contact-link-arrow" aria-hidden="true" /></a>
              <a href="https://www.google.com/maps/search/?api=1&query=Pune%2C+Maharashtra+412307%2C+India" target="_blank" rel="noreferrer" className="contact-detail-link"><span className="contact-detail-icon"><MapPin className="w-5 h-5" aria-hidden="true" /></span><span><span className="contact-detail-label">Our roots</span><span className="contact-detail-value">Pune, Maharashtra, India</span></span><ArrowUpRight className="contact-link-arrow" aria-hidden="true" /></a>
            </motion.div>
            <motion.div {...reveal} className="contact-next-card"><span className="contact-next-icon"><MessageCircle className="w-5 h-5" aria-hidden="true" /></span><div><h3>What happens next?</h3><p>Our team reviews your requirements and uses the contact details you share to continue the conversation.</p></div></motion.div>
          </aside>
        </div>

        <motion.section {...reveal} className="contact-faq" aria-labelledby="contact-faq-heading"><div><span className="section-label">A little clarity</span><h2 id="contact-faq-heading">Before we<br /><span>say hello.</span></h2><p>A few useful details to help you get started.</p></div><div className="contact-faq-list">
          <details><summary>What should I include in my enquiry?<ChevronDown className="w-4 h-4" aria-hidden="true" /></summary><p>Share the product, preferred format or specifications, approximate quantity, and destination. If you’re still exploring, tell us about your application and we can discuss the options.</p></details>
          <details><summary>Can I enquire about multiple products?<ChevronDown className="w-4 h-4" aria-hidden="true" /></summary><p>Yes. List the cocopeat products, coco chips, or coir ropes you’re interested in, along with any quantities or specifications for each.</p></details>
          <details><summary>Where can I explore the production process?<ChevronDown className="w-4 h-4" aria-hidden="true" /></summary><p>Visit our interactive cocopeat production journey for a closer look at each stage, from coconut husks to compressed blocks. <Link to="/about#production-process">Explore the process <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" /></Link></p></details>
        </div></motion.section>
        <div className="contact-bottom-note"><Leaf className="w-4 h-4" aria-hidden="true" /><span>Good growth starts with a conversation.</span></div>
      </div>
    </div>
  );
}
