import Image from "next/image";
import AssessmentForm from "@/components/AssessmentForm";

export default function AssessmentPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-[#0076cd] text-white py-4 px-4 text-center flex items-center justify-center gap-2">
        <Image src="/wpu-logo.png" alt="Western Philippines University" width={28} height={28} />
        <h1 className="text-lg font-semibold">WPU SF-12 Portal</h1>
      </header>
      <main className="flex-1">
        <AssessmentForm />
      </main>
    </div>
  );
}
