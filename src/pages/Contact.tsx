/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    subject: "",
    message: "",
  });

  const subjects = [
    { value: "product-info", label: "Product Information" },
    { value: "technical-support", label: "Technical Support" },
    { value: "dealer-inquiry", label: "Dealer Inquiry" },
    { value: "consultation", label: "Consultation" },
  ];

  const [open, setOpen] = useState(false);

  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const appsScriptUrl = import.meta.env.VITE_APP_SCRIPT_EXCEL_URL || "";

    try {
      const res = await fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        mode: "no-cors",
      });

      if (res.status === 200 || res.type === "opaque") {
        setStatus({
          type: "success",
          message: "Your message has been sent successfully!",
        });
        setFormData({
          name: "",
          email: "",
          contact: "",
          subject: "",
          message: "",
        });
      } else {
        setStatus({
          type: "error",
          message: "There was an error sending your message.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "Network error. Please try again later.",
      });
    }

    setTimeout(() => setStatus(null), 5000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const istTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-[130px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-500">
            Get in touch with our agricultural experts
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
                Get in Touch
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                  <p className="text-gray-500">
                    Pune, Maharashtra 412307
                  </p>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="w-6 h-6 text-cyan-600" />
                  <p className="text-gray-500">+91-7276800399</p>
                </div>

                <div className="flex items-start space-x-4">
                  <Mail className="w-6 h-6 text-yellow-600" />
                  <a
                    href="mailto:vhnglobal@gmail.com?subject=Business Inquiry&body=Hello VHN Global Team,"
                    className="text-gray-500 hover:underline"
                  >
                    vhnglobal@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Send us a Message
              </h2>
              <p className="text-gray-600 mb-8">
                We’d love to hear from you. Fill out the form and we’ll get back
                shortly.
              </p>

              {status && (
                <div
                  className={`mb-6 rounded-lg px-5 py-4 text-sm font-medium ${
                    status.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Full Name"
                    className="input"
                  />

                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Email Address"
                    className="input"
                  />
                </div>

                <input
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Contact Number"
                  className="input"
                />

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="
      input flex items-center justify-between
      text-sm sm:text-base
      py-3 sm:py-3.5 lg:py-4
    "
                  >
                    {subjects.find((s) => s.value === formData.subject)
                      ?.label || "Select a subject"}
                    <span className="ml-2 text-gray-400">▼</span>
                  </button>

                  {open && (
                    <ul
                      className="
        absolute z-50 mt-2 w-full rounded-lg
        border border-gray-200 bg-white shadow-lg
        max-h-60 overflow-y-auto
      "
                    >
                      {subjects.map((item) => (
                        <li
                          key={item.value}
                          onClick={() => {
                            setFormData({ ...formData, subject: item.value });
                            setOpen(false);
                          }}
                          className="
            cursor-pointer px-4 py-3 text-sm sm:text-base
            hover:bg-emerald-50
          "
                        >
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Write your message here..."
                  className="input resize-none"
                />

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-600 
        px-8 py-4 font-semibold text-white shadow-md transition 
        hover:bg-emerald-700 hover:shadow-lg 
        focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  Send Message
                  <Send className="ml-2 h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
