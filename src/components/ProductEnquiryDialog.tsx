import { useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowUpRight, Loader2, X } from "lucide-react";
import { submitEnquiry } from "../services/enquiry";
import ModalBackdrop from "./ModalBackdrop";
import { trackEvent } from "../services/analytics";

const emptyForm = { name: "", email: "", contact: "", message: "" };

export default function ProductEnquiryDialog({ productName, onClose }: { productName: string; onClose: () => void }) {
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setStatus(null);
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    const enquiry = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()])) as typeof form;
    if (!enquiry.name || !enquiry.message) {
      setStatus({ type: "error", message: "Please enter your name and requirements." });
      const field = event.currentTarget.elements.namedItem(!enquiry.name ? "name" : "message");
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    if (!import.meta.env.VITE_APP_SCRIPT_EXCEL_URL?.trim()) {
      setStatus({ type: "error", message: "The enquiry form is temporarily unavailable. Please email info@vhnglobal.com or call +91 72768 00399." });
      return;
    }
    setIsSubmitting(true);
    setStatus(null);
    try {
      await submitEnquiry({ ...enquiry, subject: `Product enquiry: ${productName}` });
      trackEvent("enquiry_submitted", { form_source: "product", delivery_status: "unconfirmed" });
      setStatus({ type: "success", message: "Your enquiry has been submitted. Thank you for contacting VHN Global." });
      setForm(emptyForm);
    } catch {
      setStatus({ type: "error", message: "We couldn’t submit your enquiry. Please try again or email info@vhnglobal.com." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalBackdrop onClose={onClose} className="product-enquiry-backdrop">
      <div role="dialog" aria-modal="true" aria-labelledby="product-enquiry-heading" className="modal-panel glass-panel product-enquiry-dialog w-full max-w-2xl p-5 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-5"><div><p className="product-eyebrow mb-2">Product enquiry</p><h2 id="product-enquiry-heading" className="text-2xl font-bold break-words">Let’s discuss your requirements.</h2></div><button type="button" className="product-icon-button shrink-0" onClick={onClose} aria-label="Close enquiry"><X className="w-5 h-5" /></button></div>
        <p className="product-enquiry-product mb-5">Enquiring about <strong>{productName}</strong></p>
        <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
          <fieldset disabled={isSubmitting} className="grid gap-4 min-w-0">
            <legend className="sr-only">Your contact details and product requirements</legend>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label htmlFor="product-enquiry-name" className="product-field-label">Full name *</label><input id="product-enquiry-name" name="name" autoComplete="name" value={form.name} onChange={handleChange} required maxLength={120} className="input" placeholder="Your name" /></div>
              <div><label htmlFor="product-enquiry-email" className="product-field-label">Email address *</label><input id="product-enquiry-email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required maxLength={254} className="input" placeholder="you@company.com" /></div>
            </div>
            <div><label htmlFor="product-enquiry-phone" className="product-field-label">Phone number <span className="product-field-optional">Optional</span></label><input id="product-enquiry-phone" name="contact" type="tel" autoComplete="tel" value={form.contact} onChange={handleChange} maxLength={40} className="input" placeholder="Include your country code" /></div>
            <div><label htmlFor="product-enquiry-message" className="product-field-label">Your requirements *</label><textarea id="product-enquiry-message" name="message" value={form.message} onChange={handleChange} required rows={4} maxLength={3000} className="input" placeholder="Share quantities, destination, and any product requirements." /></div>
          </fieldset>
          {status && <p role={status.type === "error" ? "alert" : "status"} className={`contact-feedback ${status.type === "success" ? "contact-feedback-success" : "contact-feedback-error"}`}>{status.message}</p>}
          <div className="product-enquiry-footer mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><p className="text-xs">* Required fields</p><button type="submit" disabled={isSubmitting} className="btn-primary inline-flex">{isSubmitting ? <>Submitting <Loader2 className="w-4 h-4 animate-spin" /></> : <>Send enquiry <ArrowUpRight className="w-4 h-4" /></>}</button></div>
        </form>
      </div>
    </ModalBackdrop>
  );
}
