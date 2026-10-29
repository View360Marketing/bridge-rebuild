import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { MapPin, Phone, Mail, Clock, Compass, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { postTrackingEvent, buildTrackingPayload, INQUIRY_CATEGORY_FIELD_ID } from "@/lib/tracking";

export const Route = createFileRoute("/contact-us")({
  head: () => ({
    meta: [
      { title: "Contact Us | The Bridges TN" },
      {
        name: "description",
        content:
          "Contact The Bridges in Waynesboro, Tennessee. Inquire about 2027 weddings, corporate retreats, lodging availability, or plan a site tour.",
      },
      { property: "og:title", content: "Contact Us | The Bridges TN" },
      {
        property: "og:description",
        content: "Contact The Bridges in Waynesboro, TN for bookings, tours, and inquiries.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventType, setEventType] = useState("Wedding");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      toast.error("Please provide your first name, last name, and email.");
      return;
    }
    setSubmitted(true);
    toast.success("Thank you! Your inquiry has been sent to our team.");

    const payload = buildTrackingPayload("contact-form", "Contact Form");
    payload.formData = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      calendar_notes: message,
    };
    payload.formLabels = {
      first_name: "First Name",
      last_name: "Last Name",
      email: "Email",
      phone: "Phone",
      calendar_notes: "Your Message",
    };
    postTrackingEvent(payload, {
      customFields: {
        [INQUIRY_CATEGORY_FIELD_ID]: { value: eventType, label: "Inquiry Category" },
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans">
      <Header />

      {/* Header */}
      <section className="relative py-20 lg:py-28 border-b border-stone-200 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://vibe.filesafe.space/1790196628861484830/assets/cab64087-066e-4e81-bd41-ad9bd9aba5f4.jpg"
            alt="The Bridges resort grounds and scenery"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a231c]/85 via-[#1a231c]/55 to-[#1a231c]/20" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#88b283] block">
              GET IN TOUCH
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white tracking-tight leading-[1.1]">
              Contact The Bridges
            </h1>
            <p className="text-stone-200 text-base sm:text-lg leading-relaxed font-light">
              We would love to help you plan your 2027 wedding, group retreat, cabin stay, or
              private pool event. Reach out below and our team will get back to you promptly.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Details */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <h2 className="font-serif text-3xl font-bold text-stone-900">
                  Location &amp; Inquiries
                </h2>
                <p className="text-stone-600 text-sm leading-relaxed font-light">
                  Nestled in Wayne County, Tennessee, just minutes from the scenic Natchez Trace
                  Parkway.
                </p>
              </div>

              <div className="space-y-5 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#2a382c] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-stone-900">Address</h4>
                    <p className="text-stone-600">
                      299 Natural Bridge Park Rd, Waynesboro, TN 38485
                    </p>
                    <a
                      href="https://maps.app.goo.gl/HiuVGpDerVDiNx4S7"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#2a382c] font-semibold underline mt-1 inline-block"
                    >
                      Get Directions on Google Maps
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#2a382c] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-stone-900">Phone</h4>
                    <a
                      href="tel:+19317225589"
                      className="text-stone-600 hover:text-stone-900 transition-colors"
                    >
                      +1 (931) 722-5589
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#2a382c] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-stone-900">Email</h4>
                    <a
                      href="mailto:info@thebridgestn.com"
                      className="text-stone-600 hover:text-stone-900 transition-colors"
                    >
                      info@thebridgestn.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#2a382c] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-stone-900">Operating Hours</h4>
                    <p className="text-stone-600 text-xs">Call for seasonal operating hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-7">
              <div className="bg-[#faf8f5] p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-xs">
                <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
                  Send Us A Message
                </h3>
                <p className="text-xs text-stone-500 mb-6">
                  Fill out the form below and our team will get in touch regarding your dates.
                </p>

                {submitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-8 rounded-2xl text-center space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
                    <h4 className="font-bold text-lg">Thank You!</h4>
                    <p className="text-xs text-emerald-800">
                      Your message has been received. A member of our events and lodging staff will
                      reach out to you shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-stone-700 font-medium mb-1">First Name</label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className="w-full bg-white border border-stone-300 rounded-xl px-4 py-3 text-stone-800 focus:outline-hidden focus:border-[#2a382c]"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-700 font-medium mb-1">Last Name</label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          className="w-full bg-white border border-stone-300 rounded-xl px-4 py-3 text-stone-800 focus:outline-hidden focus:border-[#2a382c]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-stone-700 font-medium mb-1">Email</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          className="w-full bg-white border border-stone-300 rounded-xl px-4 py-3 text-stone-800 focus:outline-hidden focus:border-[#2a382c]"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-700 font-medium mb-1">Phone</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(931) 555-0199"
                          className="w-full bg-white border border-stone-300 rounded-xl px-4 py-3 text-stone-800 focus:outline-hidden focus:border-[#2a382c]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-700 font-medium mb-1">
                        Inquiry Category
                      </label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-3 text-stone-800 focus:outline-hidden focus:border-[#2a382c]"
                      >
                        <option value="Wedding">2027 Wedding / Reception</option>
                        <option value="Retreat">Corporate Retreat / Group Gathering</option>
                        <option value="Lodging">Cabins / Room Lodging</option>
                        <option value="RV">RV Park Site</option>
                        <option value="Pool Party">Pool Party / Wellness Rental</option>
                        <option value="General">General Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Your Message</label>
                      <textarea
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us about your estimated dates, guest count, or any questions..."
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-3 text-stone-800 focus:outline-hidden focus:border-[#2a382c]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold py-3.5 rounded-xl uppercase tracking-wider transition-colors shadow-sm text-xs cursor-pointer"
                    >
                      Submit Inquiry
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
