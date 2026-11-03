import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnnouncementBar } from "./AnnouncementBar";
import { Phone, Compass, Menu, X } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full transition-all">
      {/* Top Announcement Bar - 1 single line with smooth marquee ticker when overflow */}
      <AnnouncementBar />

      {/* Main Navbar - rounded bubbly pill style with #657B6A matching original reference */}
      <div className="w-full pt-3 pb-2 px-3 sm:px-6 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 pointer-events-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0 group py-1">
            <img
              src="https://vibe.filesafe.space/1790196628861484830/assets/1d550afa-3cde-43cf-b5e7-67b08b8974ed.png"
              alt="The Bridges Tennessee"
              className="h-16 sm:h-20 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-md"
            />
          </Link>

          {/* Desktop Navigation Links - rounded bubbly pill pill-bar */}
          <nav className="hidden xl:flex items-center space-x-1 lg:space-x-1.5 px-4 py-2 rounded-full bg-[#657B6A]/90 hover:bg-[#657B6A] backdrop-blur-md text-white text-sm font-medium shadow-lg border border-white/20 transition-colors">
            <Link
              to="/"
              className="px-3.5 py-1.5 rounded-full hover:bg-black/15 transition-colors"
              activeProps={{
                className: "px-3.5 py-1.5 rounded-full text-white bg-black/25 font-semibold",
              }}
              activeOptions={{ exact: true }}
            >
              Home
            </Link>
            <Link
              to="/amenities"
              className="px-3.5 py-1.5 rounded-full hover:bg-black/15 transition-colors"
              activeProps={{
                className: "px-3.5 py-1.5 rounded-full text-white bg-black/25 font-semibold",
              }}
            >
              Amenities
            </Link>
            <Link
              to="/weddings-events"
              className="px-3.5 py-1.5 rounded-full hover:bg-black/15 transition-colors"
              activeProps={{
                className: "px-3.5 py-1.5 rounded-full text-white bg-black/25 font-semibold",
              }}
            >
              The Willows
            </Link>
            <Link
              to="/events"
              className="px-3.5 py-1.5 rounded-full hover:bg-black/15 transition-colors"
              activeProps={{
                className: "px-3.5 py-1.5 rounded-full text-white bg-black/25 font-semibold",
              }}
            >
              Events
            </Link>
            <Link
              to="/christmas"
              className="px-3.5 py-1.5 rounded-full hover:bg-black/15 transition-colors"
              activeProps={{
                className: "px-3.5 py-1.5 rounded-full text-white bg-black/25 font-semibold",
              }}
            >
              Christmas Events
            </Link>
            <Link
              to="/massage-wellness"
              className="px-3.5 py-1.5 rounded-full hover:bg-black/15 transition-colors"
              activeProps={{
                className: "px-3.5 py-1.5 rounded-full text-white bg-black/25 font-semibold",
              }}
            >
              Massage &amp; Wellness
            </Link>
            <Link
              to="/about-us"
              className="px-3.5 py-1.5 rounded-full hover:bg-black/15 transition-colors"
              activeProps={{
                className: "px-3.5 py-1.5 rounded-full text-white bg-black/25 font-semibold",
              }}
            >
              About Us
            </Link>
            <Link
              to="/gallery"
              activeProps={{
                className: "px-3.5 py-1.5 rounded-full text-white bg-black/25 font-semibold",
              }}
            >
              Gallery
            </Link>
            <Link
              to="/contact-us"
              className="px-3.5 py-1.5 rounded-full hover:bg-black/15 transition-colors"
              activeProps={{
                className: "px-3.5 py-1.5 rounded-full text-white bg-black/25 font-semibold",
              }}
            >
              Contact Us
            </Link>
          </nav>

          {/* Top-right: phone number + directions */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <a
              href="tel:+19317225589"
              aria-label="Call The Bridges at 931-722-5589"
              className="inline-flex items-center gap-1.5 text-white text-sm font-semibold hover:text-white/90 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>931-722-5589</span>
            </a>
            <a
              href="https://maps.app.goo.gl/HiuVGpDerVDiNx4S7"
              target="_blank"
              rel="noreferrer"
              aria-label="Directions to The Bridges"
              className="w-11 h-11 rounded-full bg-[#657B6A]/90 hover:bg-[#657B6A] border border-white/25 flex items-center justify-center text-white transition-all shadow-md active:scale-95"
            >
              <Compass className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile hamburger */}
          <div className="flex xl:hidden items-center space-x-2">
            <a
              href="tel:+19317225589"
              className="p-2.5 rounded-full bg-[#657B6A] text-white sm:hidden border border-white/25 shadow-md"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2.5 rounded-full bg-[#657B6A] text-white hover:bg-[#596d5e] border border-white/25 shadow-md focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden mx-3 sm:mx-6 rounded-2xl bg-[#657B6A]/98 border border-white/25 px-4 pt-3 pb-6 space-y-2 backdrop-blur-xl shadow-2xl text-white">
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
            to="/christmas"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-200 hover:bg-white/10"
          >
            Christmas Events
          </Link>
          <Link
            to="/massage-wellness"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-200 hover:bg-white/10"
          >
            Massage &amp; Wellness
          </Link>
          <Link
            to="/about-us"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-200 hover:bg-white/10"
          >
            About Us
          </Link>
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
