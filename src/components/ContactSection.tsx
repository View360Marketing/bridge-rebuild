import React, { useState } from "react";
import { Compass, Phone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function ContactSection() {
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEventType, setFormEventType] = useState("Wedding");
  const [formMessage, setFormMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail || !formName) {
      toast.error("Please fill in your name and email.");
      return;
    }
    setFormSubmitted(true);
    toast.success("Thank you! Your request has been received. We will contact you shortly.");
  };

  return (
    <section id="contact" className="relative py-28 text-white overflow-hidden">
      {/* Background image of Natural Bridge / Ice cave with gentle bright misty wash */}
      <div className="absolute inset-0">
        <img
          src="https://vibe.filesafe.space/1790196628861484830/assets/30945ebf-a148-4ad5-a769-9044e5e3bc37.jpg"
          alt="The Bridges Natural Landmark"
          className="w-full h-full object-cover filter brightness-95"
        />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center space-y-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#2f4032]">
          PLAN A VISIT
        </span>
        <h2 className="font-serif text-4xl sm:text-6xl font-bold text-stone-900 tracking-tight">
          Ready to see The Bridges?
        </h2>
        <p className="text-stone-700 text-base max-w-xl mx-auto">
          Whether you are booking a wedding, planning a company retreat, or visiting for a day pass,
          our team is happy to help you get started.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href="https://maps.app.goo.gl/HiuVGpDerVDiNx4S7"
            target="_blank"
            rel="noreferrer"
            className="bg-[#1b251e] hover:bg-black text-white font-medium px-8 py-3.5 rounded-full text-xs uppercase tracking-wider transition-colors shadow-md flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            <span>Get Directions</span>
          </a>
          <a
            href="tel:+19317225589"
            className="bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 font-semibold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider shadow-sm transition-colors flex items-center gap-2"
          >
            <Phone className="w-4 h-4 text-emerald-800" />
            <span>Call Now</span>
          </a>
        </div>
      </div>
    </section>
  );
}
