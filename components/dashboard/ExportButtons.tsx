export default function ExportButtons() {
  return (
    <div className="flex gap-2">
      <a
        href="/api/export/csv"
        className="px-4 py-2 rounded-md border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-colors"
      >
        Export CSV
      </a>
      <a
        href="/api/export/pdf"
        className="px-4 py-2 rounded-md bg-[#c8a951] text-[#1a3a5c] text-sm font-semibold hover:bg-[#ddc379] transition-colors"
      >
        Export PDF
      </a>
    </div>
  );
}
