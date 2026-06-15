interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
}

export default function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-[#1a3a5c] mt-1">{value}</p>
      {detail && <p className="text-xs text-gray-400 mt-1">{detail}</p>}
    </div>
  );
}
