import AssessmentForm from "@/components/AssessmentForm";

export default function AssessmentPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-[#1a3a5c] text-white py-4 px-4 text-center">
        <h1 className="text-lg font-semibold">WPU SF-12 Portal</h1>
      </header>
      <main className="flex-1">
        <AssessmentForm />
      </main>
    </div>
  );
}
