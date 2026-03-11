"use client";

import { useState } from "react";
import Link from "next/link";

// Copied static redesign layout from Dropbox version,
// trimmed to keep it self-contained and API-free in this test page.

function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-[#F2EEE2]/90 backdrop-blur-md border-b border-[#1A120810]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-xl text-[#1A1208]">
          FluffyFriends <span className="text-[#E8863A]">🐾</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6B5F4E]">
          {[
            ["Create", "/create"],
            ["How It Works", "#how-it-works"],
            ["Gallery", "#gallery"],
            ["Pricing", "#pricing"],
            ["Reviews", "#reviews"],
          ].map(([label, href]) => (
            <Link key={label} href={href} className="hover:text-[#1A1208] transition-colors">
              {label}
            </Link>
          ))}
        </div>
        <Link
          href="/create"
          className="bg-[#E8863A] hover:bg-[#d4762e] text-white font-semibold text-sm px-5 py-2.5 rounded-full shadow-md shadow-[#E8863A30] transition-all duration-200 hover:scale-[1.02]"
        >
          Create My Portrait
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F2EEE2] min-h-screen flex items-center">
      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #E8863A18 0%, transparent 60%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-24 grid lg:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col gap-7">
          <div className="flex items-center gap-2 w-fit bg-white border border-[#E8863A30] rounded-full px-4 py-2 shadow-sm">
            <span className="text-[#E8863A] text-sm">★★★★★</span>
            <span className="text-[#6B5F4E] text-sm font-medium">Loved by 2,400+ pet parents</span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-extrabold text-[#1A1208] leading-[1.08] tracking-tight">
            Your Pet,
            <br />
            <span className="text-[#E8863A]">Reimagined</span>
            <br />
            as Fine Art.
          </h1>

          <p className="text-lg text-[#6B5F4E] leading-relaxed max-w-md">
            Upload one photo. Choose a theme. Get a museum-quality portrait delivered to your inbox — print-ready up to
            A1 size.
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-[#6B5F4E]">
            {["One-time payment", "No subscription", "Happiness guarantee", "Delivered in minutes"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#E8863A20] flex items-center justify-center text-[#E8863A] text-xs">
                  ✓
                </span>
                {t}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 bg-[#E8863A] hover:bg-[#d4762e] text-white font-semibold text-base px-7 py-3.5 rounded-full shadow-lg shadow-[#E8863A40] transition-all duration-200 hover:scale-[1.02]"
            >
              Create My Portrait
              <span className="text-lg">→</span>
            </Link>
            <Link
              href="#gallery"
              className="inline-flex items-center gap-2 bg-white hover:bg-[#F2EEE2] text-[#1A1208] font-semibold text-base px-7 py-3.5 rounded-full border border-[#1A120820] transition-all duration-200"
            >
              See examples
            </Link>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-md">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#1A120830] aspect-[4/5] bg-[#2A1F0E]">
              <img
                src={`${process.env.NEXT_PUBLIC_SITE_URL || ""}/gallery/jimmy-fireman.jpg`}
                alt="Jimmy the fireman portrait"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-lg">
                <p className="text-xs text-[#6B5F4E] font-medium uppercase tracking-wider">Portrait for</p>
                <p className="text-[#1A1208] font-bold text-lg leading-tight">Jimmy 🐾</p>
              </div>
              <div className="absolute top-4 right-4 bg-[#E8863A] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                After ✨
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="bg-[#F2EEE2]">
      <Nav />
      <Hero />
    </main>
  );
}

