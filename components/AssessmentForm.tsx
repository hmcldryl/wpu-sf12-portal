"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";
import { SF12_STEPS } from "@/lib/sf12Questions";
import { computeSF12Scores } from "@/lib/sf12Scoring";
import { EmploymentType, RespondentInfo, Sex } from "@/lib/types";

const TOTAL_STEPS = SF12_STEPS.length + 2; // respondent info + questions + review

const EMPTY_RESPONDENT: RespondentInfo = {
  name: "",
  employeeId: "",
  department: "",
  employmentType: "Faculty",
  age: 0,
  sex: "Male",
};

export default function AssessmentForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [respondent, setRespondent] = useState<RespondentInfo>(EMPTY_RESPONDENT);
  const [responses, setResponses] = useState<Record<string, number | undefined>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isQuestionStep = step >= 1 && step <= SF12_STEPS.length;
  const questionStep = isQuestionStep ? SF12_STEPS[step - 1] : null;
  const isReviewStep = step === TOTAL_STEPS - 1;

  function validateStep(): boolean {
    if (step === 0) {
      if (!respondent.name.trim()) return false;
      if (!respondent.department.trim()) return false;
      if (!respondent.employmentType) return false;
      if (!respondent.age || respondent.age <= 0) return false;
      if (!respondent.sex) return false;
      return true;
    }

    if (questionStep) {
      return questionStep.questions.every((q) => responses[q.id] !== undefined);
    }

    return true;
  }

  function goNext() {
    if (!validateStep()) {
      setError("Please complete all fields before continuing.");
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    const rawResponses: Record<string, number> = {};
    for (const s of SF12_STEPS) {
      for (const q of s.questions) {
        rawResponses[q.id] = responses[q.id] as number;
      }
    }

    const { pcs12, mcs12 } = computeSF12Scores(rawResponses);

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respondentInfo: respondent,
          rawResponses,
          pcs12,
          mcs12,
        }),
      });

      if (!res.ok) {
        throw new Error("Submission failed");
      }

      sessionStorage.setItem(
        "sf12_result",
        JSON.stringify({ respondent, rawResponses, pcs12, mcs12 })
      );

      router.push("/results");
    } catch {
      setError("Something went wrong submitting your responses. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <ProgressBar current={step + 1} total={TOTAL_STEPS} />
      </div>

      {step === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[#1a3a5c] mb-4">Respondent Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={respondent.name}
                onChange={(e) => setRespondent({ ...respondent, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                value={respondent.employeeId}
                onChange={(e) => setRespondent({ ...respondent, employeeId: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department / College <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={respondent.department}
                onChange={(e) => setRespondent({ ...respondent, department: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type <span className="text-red-500">*</span>
              </label>
              <select
                value={respondent.employmentType}
                onChange={(e) =>
                  setRespondent({ ...respondent, employmentType: e.target.value as EmploymentType })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              >
                <option value="Faculty">Faculty</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={respondent.age || ""}
                onChange={(e) => setRespondent({ ...respondent, age: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sex <span className="text-red-500">*</span>
              </label>
              <select
                value={respondent.sex}
                onChange={(e) => setRespondent({ ...respondent, sex: e.target.value as Sex })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {questionStep && (
        <QuestionCard
          step={questionStep}
          values={responses}
          onChange={(id, value) => setResponses({ ...responses, [id]: value })}
        />
      )}

      {isReviewStep && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[#1a3a5c] mb-4">Review &amp; Submit</h2>
          <p className="text-sm text-gray-600 mb-4">
            You&apos;re about to submit your responses for{" "}
            <strong>{respondent.name}</strong> ({respondent.department}). Click submit to
            receive your health assessment results.
          </p>
          <dl className="text-sm text-gray-700 space-y-1 mb-6">
            <div className="flex justify-between border-b border-gray-100 py-1">
              <dt>Employment Type</dt>
              <dd>{respondent.employmentType}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1">
              <dt>Age</dt>
              <dd>{respondent.age}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1">
              <dt>Sex</dt>
              <dd>{respondent.sex}</dd>
            </div>
          </dl>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>

        {isReviewStep ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 rounded-md bg-[#1a3a5c] text-white text-sm font-semibold hover:bg-[#2a4f7a] transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {submitting && (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {submitting ? "Submitting..." : "Submit"}
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            className="px-6 py-2 rounded-md bg-[#c8a951] text-[#1a3a5c] text-sm font-semibold hover:bg-[#ddc379] transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
