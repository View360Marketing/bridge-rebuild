import React from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#18211b] text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Logo & Contact Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="https://vibe.filesafe.space/1790196628861484830/assets/1d550afa-3cde-43cf-b5e7-67b08b8974ed.png"
                alt="The Bridges"
                className="w-14 h-14 object-contain"
              />
            </div>
            <div className="space-y-2 text-xs text-stone-300 pt-1">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#88b283] shrink-0 mt-0.5" />
                <span>299 Natural Bridge Park Rd, Waynesboro, TN 38485</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#88b283] shrink-0" />
                <a href="tel:+19317225589" className="hover:text-white transition-colors">
                  +1 (931) 722-5589
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#88b283] shrink-0" />
                <a
                  href="mailto:info@thebridgestn.com"
                  className="hover:text-white transition-colors"
                >
                  info@thebridgestn.com
                </a>
              </p>
            </div>
          </div>

          {/* Park Operating Hours */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-semibold text-white">Park Hours</h4>
            <div className="text-xs space-y-2 text-stone-300">
              <p className="text-stone-300">Call for operating hours</p>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                Rooms, cabins, and event spaces remain available for your next stay or celebration.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/amenities" className="hover:text-white transition-colors">
                  Amenities
                </Link>
              </li>
              <li>
                <Link to="/weddings-events" className="hover:text-white transition-colors">
                  The Willows
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/massage-wellness" className="hover:text-white transition-colors">
                  Massage &amp; Wellness
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media & Call to Action */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-white">
              Gather, Stay, and Unwind Beside the Bridges
            </h4>
            <div>
              <Link
                to="/contact-us"
                className="inline-block bg-white hover:bg-stone-100 text-stone-900 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
              >
                Get In Touch
              </Link>
            </div>
            <div className="pt-2">
              <h5 className="font-serif text-sm font-semibold text-white mb-2">Social Media</h5>
              <div className="flex flex-col gap-1.5 text-xs text-stone-300">
                <a
                  href="https://share.google/IXYzS5MoS9I9r1aZv"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Google
                </a>
                <a
                  href="https://www.facebook.com/thebridgestn/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Facebook
                </a>
                <a
                  href="https://www.instagram.com/thebridges.tn/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p className="font-serif text-stone-200 tracking-wider text-base">
            Explore. Dine. Unwind.
          </p>
          <p>Copyright © 2026 The Bridges | All Rights Reserved</p>
          <div className="flex items-center space-x-4">
            <Link to="/contact-us" className="hover:text-stone-200">
              Terms &amp; Condition
            </Link>
            <Link to="/contact-us" className="hover:text-stone-200">
              Privacy Policy
            </Link>
            <Link to="/admin/login" className="hover:text-stone-200 transition-colors">
              Staff Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
