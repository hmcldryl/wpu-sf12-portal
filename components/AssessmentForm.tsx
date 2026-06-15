"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";
import SelectWithOther from "./SelectWithOther";
import { SF12_STEPS } from "@/lib/sf12Questions";
import { computeSF12Scores } from "@/lib/sf12Scoring";
import { EmploymentType, RespondentInfo, YesNo } from "@/lib/types";
import {
  ACADEMIC_RANK_OPTIONS,
  AGE_GROUP_OPTIONS,
  CAMPUS_OPTIONS,
  COLLEGE_UNIT_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  GENDER_OPTIONS,
  SEX_AT_BIRTH_OPTIONS,
} from "@/lib/respondentOptions";

const TOTAL_STEPS = SF12_STEPS.length + 2; // respondent info + questions + review

const EMPTY_RESPONDENT: RespondentInfo = {
  collegeUnit: "",
  campus: "",
  ageGroup: "",
  sexAtBirth: "",
  gender: "",
  employmentType: "Faculty",
  academicRank: undefined,
  employmentStatus: "",
  salaryGrade: 0,
  walkableSpaces: "Yes",
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
      if (!respondent.collegeUnit.trim()) return false;
      if (!respondent.campus.trim()) return false;
      if (!respondent.ageGroup.trim()) return false;
      if (!respondent.sexAtBirth.trim()) return false;
      if (!respondent.gender.trim()) return false;
      if (!respondent.employmentType) return false;
      if (respondent.employmentType === "Faculty" && !respondent.academicRank?.trim()) return false;
      if (!respondent.employmentStatus.trim()) return false;
      if (!respondent.salaryGrade || respondent.salaryGrade <= 0) return false;
      if (!respondent.walkableSpaces) return false;
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
            <SelectWithOther
              label="College / Unit"
              required
              value={respondent.collegeUnit}
              options={COLLEGE_UNIT_OPTIONS}
              onChange={(v) => setRespondent({ ...respondent, collegeUnit: v })}
              otherPlaceholder="Please specify your college / unit"
            />

            <SelectWithOther
              label="Campus / Station"
              required
              value={respondent.campus}
              options={CAMPUS_OPTIONS}
              onChange={(v) => setRespondent({ ...respondent, campus: v })}
              otherPlaceholder="Please specify your campus / station"
            />

            <SelectWithOther
              label="Age"
              required
              value={respondent.ageGroup}
              options={AGE_GROUP_OPTIONS}
              onChange={(v) => setRespondent({ ...respondent, ageGroup: v })}
              otherPlaceholder="Please specify your age group"
            />

            <SelectWithOther
              label="Sex at Birth"
              required
              value={respondent.sexAtBirth}
              options={SEX_AT_BIRTH_OPTIONS}
              onChange={(v) => setRespondent({ ...respondent, sexAtBirth: v })}
              otherPlaceholder="Please specify"
            />

            <SelectWithOther
              label="Gender"
              required
              value={respondent.gender}
              options={GENDER_OPTIONS}
              onChange={(v) => setRespondent({ ...respondent, gender: v })}
              otherPlaceholder="Please specify"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type <span className="text-red-500">*</span>
              </label>
              <select
                value={respondent.employmentType}
                onChange={(e) => {
                  const employmentType = e.target.value as EmploymentType;
                  setRespondent({
                    ...respondent,
                    employmentType,
                    academicRank: employmentType === "Faculty" ? respondent.academicRank : undefined,
                  });
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              >
                <option value="Faculty">Faculty</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

            {respondent.employmentType === "Faculty" && (
              <SelectWithOther
                label="Academic Rank"
                required
                value={respondent.academicRank ?? ""}
                options={ACADEMIC_RANK_OPTIONS}
                onChange={(v) => setRespondent({ ...respondent, academicRank: v })}
                otherPlaceholder="Please specify your academic rank"
              />
            )}

            <SelectWithOther
              label="Employment Status"
              required
              value={respondent.employmentStatus}
              options={EMPLOYMENT_STATUS_OPTIONS}
              onChange={(v) => setRespondent({ ...respondent, employmentStatus: v })}
              otherPlaceholder="Please specify your employment status"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary Grade <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={33}
                value={respondent.salaryGrade || ""}
                onChange={(e) => setRespondent({ ...respondent, salaryGrade: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability of walkable spaces near your workplace <span className="text-red-500">*</span>
              </label>
              <select
                value={respondent.walkableSpaces}
                onChange={(e) => setRespondent({ ...respondent, walkableSpaces: e.target.value as YesNo })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
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
            You&apos;re about to submit your responses. Click submit to receive your health
            assessment results.
          </p>
          <dl className="text-sm text-gray-700 space-y-1 mb-6">
            <div className="flex justify-between border-b border-gray-100 py-1">
              <dt>College / Unit</dt>
              <dd>{respondent.collegeUnit}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1">
              <dt>Campus / Station</dt>
              <dd>{respondent.campus}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1">
              <dt>Age</dt>
              <dd>{respondent.ageGroup}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1">
              <dt>Sex at Birth</dt>
              <dd>{respondent.sexAtBirth}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1">
              <dt>Gender</dt>
              <dd>{respondent.gender}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1">
              <dt>Employment Type</dt>
              <dd>{respondent.employmentType}</dd>
            </div>
            {respondent.academicRank && (
              <div className="flex justify-between border-b border-gray-100 py-1">
                <dt>Academic Rank</dt>
                <dd>{respondent.academicRank}</dd>
              </div>
            )}
            <div className="flex justify-between border-b border-gray-100 py-1">
              <dt>Employment Status</dt>
              <dd>{respondent.employmentStatus}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1">
              <dt>Salary Grade</dt>
              <dd>{respondent.salaryGrade}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1">
              <dt>Walkable Spaces Available</dt>
              <dd>{respondent.walkableSpaces}</dd>
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
