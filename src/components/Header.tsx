import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnnouncementBar } from "./AnnouncementBar";
import { Phone, Compass, Menu, X, ChevronDown } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full transition-all">
      {/* Top Announcement Bar - 1 single line with smooth marquee ticker when overflow */}
      <AnnouncementBar />

      {/* Main Navbar - transparent liquid glass aesthetic matching the reference website */}
      <div className="bg-[#1b251e]/85 backdrop-blur-md border-b border-white/10 text-white transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0 group py-1">
              <img
                src="https://vibe.filesafe.space/1790196628861484830/assets/1d550afa-3cde-43cf-b5e7-67b08b8974ed.png"
                alt="The Bridges Tennessee"
                className="h-14 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center space-x-1 lg:space-x-2 text-sm font-medium text-stone-100">
              <Link
                to="/"
                className="px-3 py-2 rounded-full hover:bg-white/10 transition-colors"
                activeProps={{ className: "px-3 py-2 rounded-full text-white bg-white/15" }}
                activeOptions={{ exact: true }}
              >
                Home
              </Link>
              <Link
                to="/amenities"
                className="px-3 py-2 rounded-full hover:bg-white/10 transition-colors"
                activeProps={{ className: "px-3 py-2 rounded-full text-white bg-white/15" }}
              >
                Amenities
              </Link>
              <Link
                to="/weddings-events"
                className="px-3 py-2 rounded-full hover:bg-white/10 transition-colors"
                activeProps={{ className: "px-3 py-2 rounded-full text-white bg-white/15" }}
              >
                The Willows
              </Link>
              <Link
                to="/events"
                className="px-3 py-2 rounded-full hover:bg-white/10 transition-colors"
                activeProps={{ className: "px-3 py-2 rounded-full text-white bg-white/15" }}
              >
                Events
              </Link>
              <Link
                to="/massage-wellness"
                className="px-3 py-2 rounded-full hover:bg-white/10 transition-colors"
                activeProps={{ className: "px-3 py-2 rounded-full text-white bg-white/15" }}
              >
                Massage &amp; Wellness
              </Link>
              <a
                href="https://www.airbnb.com/users/show/244417704"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-full hover:bg-white/10 transition-colors"
              >
                Book Room
              </a>

              {/* About dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setAboutDropdownOpen(true)}
                onMouseLeave={() => setAboutDropdownOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center px-3 py-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <span>About Us</span>
                  <ChevronDown className="ml-1 w-3.5 h-3.5" />
                </button>

                {aboutDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-44 rounded-xl shadow-xl bg-[#202c23] border border-white/15 py-2 z-50 backdrop-blur-lg">
                    <Link
                      to="/gallery"
                      className="block px-4 py-2 text-xs text-stone-200 hover:bg-white/10 hover:text-white"
                    >
                      Gallery
                    </Link>
                    <Link
                      to="/contact-us"
                      className="block px-4 py-2 text-xs text-stone-200 hover:bg-white/10 hover:text-white"
                    >
                      Contact Us
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Header Action Round Glass Buttons (Phone & Directions) */}
            <div className="hidden sm:flex items-center space-x-2.5 shrink-0">
              <a
                href="tel:+19317225589"
                aria-label="Call The Bridges"
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 flex items-center justify-center text-white transition-all shadow-sm active:scale-95"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="https://maps.app.goo.gl/HiuVGpDerVDiNx4S7"
                target="_blank"
                rel="noreferrer"
                aria-label="Directions to The Bridges"
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 flex items-center justify-center text-white transition-all shadow-sm active:scale-95"
              >
                <Compass className="w-4 h-4" />
              </a>
            </div>

            {/* Mobile hamburger */}
            <div className="flex xl:hidden items-center space-x-2">
              <a
                href="tel:+19317225589"
                className="p-2 rounded-full bg-white/15 text-white sm:hidden border border-white/20"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                type="button"
                className="p-2 rounded-lg text-white hover:bg-white/15 focus:outline-hidden"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#18221b]/98 border-b border-white/15 px-4 pt-3 pb-6 space-y-2 backdrop-blur-xl">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10"
          >
            Home
          </Link>
          <Link
            to="/amenities"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-200 hover:bg-white/10"
          >
            Amenities
          </Link>
          <Link
            to="/weddings-events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-200 hover:bg-white/10"
          >
            The Willows
          </Link>
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-200 hover:bg-white/10"
          >
            Events
          </Link>
          <Link
            to="/massage-wellness"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-200 hover:bg-white/10"
          >
            Massage &amp; Wellness
          </Link>
          <a
            href="https://www.airbnb.com/users/show/244417704"
            target="_blank"
            rel="noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-200 hover:bg-white/10"
          >
            Book Room
          </a>
          <Link
            to="/gallery"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-200 hover:bg-white/10"
          >
            Gallery
          </Link>
          <Link
            to="/contact-us"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-200 hover:bg-white/10"
          >
            Contact Us
          </Link>
          <div className="pt-4 flex flex-col gap-2">
            <a
              href="https://thebridgestn.holidayfuture.com/all-listings"
              target="_blank"
              rel="noreferrer"
              className="w-full text-center bg-white/15 hover:bg-white/25 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              Explore Stays
            </a>
            <a
              href="tel:19317225589"
              className="w-full text-center bg-[#2f4032] hover:bg-[#243327] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors border border-white/20"
            >
              Call 931-722-5589
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
