import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-[#1a3a5c] text-white py-6 px-4 text-center flex flex-col items-center">
        <Image src="/wpu-logo.png" alt="Western Philippines University" width={64} height={64} className="mb-2" />
        <p className="text-sm font-medium text-[#c8a951] uppercase tracking-wide">
          Western Philippines University
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold mt-1">WPU SF-12 Portal</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#1a3a5c] mb-4">
            Health Assessment Survey
          </h2>
          <p className="text-gray-600 mb-2">
            This short health survey takes about <strong>2 minutes</strong> to
            complete and consists of <strong>12 questions</strong>.
          </p>
          <p className="text-gray-600 mb-8">
            At the end, you&apos;ll receive an immediate, personalized health
            assessment summary.
          </p>

          <Link
            href="/assessment"
            className="inline-block bg-[#c8a951] hover:bg-[#ddc379] text-[#1a3a5c] font-semibold px-8 py-3 rounded-md transition-colors shadow-sm"
          >
            Start Assessment
          </Link>
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
