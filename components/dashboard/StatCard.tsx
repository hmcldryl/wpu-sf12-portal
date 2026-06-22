interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
  accentColor?: string;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function StatCard({ label, value, detail, accentColor }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6"
      style={
        accentColor
          ? {
              borderTop: `4px solid ${accentColor}`,
              background: hexToRgba(accentColor, 0.04),
            }
          : undefined
      }
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p
        className="text-2xl font-bold mt-1"
        style={{ color: accentColor ?? "#111827" }}
      >
        {value}
      </p>
      {detail && <p className="text-xs text-gray-400 mt-1">{detail}</p>}
    </div>
  );
}
