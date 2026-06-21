"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetDataButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/dashboard/reset", { method: "DELETE" });
      if (!res.ok) throw new Error("Reset failed");

      setOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong resetting the data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-md border border-red-300 text-red-200 text-sm font-medium hover:bg-red-500/10 transition-colors"
      >
        Reset Data
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-[#0927eb] mb-2">Reset all response data?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete all submitted SF-12 responses from the database. This
              action cannot be undone.
            </p>

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {loading ? "Resetting..." : "Yes, reset data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
