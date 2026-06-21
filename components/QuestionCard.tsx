import { QuestionStep } from "@/lib/sf12Questions";

interface QuestionCardProps {
  step: QuestionStep;
  values: Record<string, number | undefined>;
  onChange: (questionId: string, value: number) => void;
}

export default function QuestionCard({ step, values, onChange }: QuestionCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-[#0927eb] mb-4">{step.title}</h2>

      {step.preamble && (
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">{step.preamble}</p>
      )}

      <div className="space-y-8">
        {step.questions.map((question) => (
          <fieldset key={question.id}>
            <legend className="font-medium text-gray-800 mb-3">{question.text}</legend>
            <div className="space-y-2">
              {question.options.map((option) => {
                const checked = values[question.id] === option.value;
                return (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 border rounded-md px-4 py-3 cursor-pointer transition-colors ${
                      checked
                        ? "border-[#0927eb] bg-[#0927eb]/5 ring-1 ring-[#0927eb]"
                        : "border-gray-200 hover:border-[#fff504]"
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={checked}
                      onChange={() => onChange(question.id, option.value)}
                      className="accent-[#0927eb] w-4 h-4"
                    />
                    <span className="text-sm text-gray-800">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}
