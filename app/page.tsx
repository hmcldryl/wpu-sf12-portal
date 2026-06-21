"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [consented, setConsented] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-[#0927eb] text-white py-6 px-4 text-center flex flex-col items-center">
        <Image src="/wpu-logo.png" alt="Western Philippines University" width={64} height={64} className="mb-2" />
        <p className="text-sm font-medium text-[#fff504] uppercase tracking-wide">
          Western Philippines University
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold mt-1">WPU SF-12 Portal</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#0927eb] mb-6 text-center">
            Health Assessment Survey
          </h2>

          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 text-gray-700 leading-relaxed space-y-4 text-sm sm:text-base shadow-sm">
            <p>Dear fellow members of the WPU community,</p>
            <p>
              The RIDE team would like to conduct a simple internal assessment of our health and
              well-being. The purpose is to generate evidence that will serve as a basis to support
              institutional planning and workforce development by promoting employee wellness. This
              has been approved by the Office of the University President.
            </p>
            <p>
              We would like to request that you take part in that assessment by answering this
              5-minute survey. Rest assured that your data will be kept private and confidential.
            </p>
            <p>Thank you and God bless!</p>
          </div>

          <label className="flex items-start gap-3 mb-8 cursor-pointer group">
            <input
              type="checkbox"
              checked={consented}
              onChange={(e) => setConsented(e.target.checked)}
              className="mt-1 h-4 w-4 flex-shrink-0 accent-[#0927eb] cursor-pointer"
            />
            <span className="text-sm sm:text-base text-gray-700 group-hover:text-gray-900 select-none">
              I consent to take part in this survey
            </span>
          </label>

          <div className="text-center">
            {consented ? (
              <Link
                href="/assessment"
                className="inline-block bg-[#fff504] hover:bg-[#e6dc04] text-[#0927eb] font-semibold px-8 py-3 rounded-md transition-colors shadow-sm"
              >
                Start Assessment
              </Link>
            ) : (
              <button
                disabled
                className="inline-block bg-gray-200 text-gray-400 font-semibold px-8 py-3 rounded-md cursor-not-allowed"
              >
                Start Assessment
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 py-4 px-4 text-center text-xs text-gray-500">
        Based on the SF-12v1 Health Survey (Ware, Kosinski &amp; Keller, 1996).
        This tool is for wellness awareness only and does not constitute a
        clinical diagnosis.
      </footer>
    </div>
  );
}
