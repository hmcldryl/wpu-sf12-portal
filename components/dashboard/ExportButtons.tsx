export default function ExportButtons() {
  return (
    <div className="flex gap-2">
      <a
        href="/api/export/csv"
        className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#fff504] text-[#0076cd] text-sm font-semibold hover:bg-[#e6dc04] transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        CSV
      </a>
      <a
        href="/api/export/pdf"
        className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#fff504] text-[#0076cd] text-sm font-semibold hover:bg-[#e6dc04] transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        PDF
      </a>
    </div>
  );
}
