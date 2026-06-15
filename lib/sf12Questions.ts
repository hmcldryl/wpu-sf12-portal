export interface QuestionOption {
  value: number;
  label: string;
}

export interface QuestionDef {
  id: string;
  text: string;
  options: QuestionOption[];
}

export interface QuestionStep {
  title: string;
  preamble?: string;
  questions: QuestionDef[];
}

const FREQUENCY_OPTIONS: QuestionOption[] = [
  { value: 1, label: "All of the time" },
  { value: 2, label: "Most of the time" },
  { value: 3, label: "Some of the time" },
  { value: 4, label: "A little of the time" },
  { value: 5, label: "None of the time" },
];

const YES_NO_OPTIONS: QuestionOption[] = [
  { value: 1, label: "Yes" },
  { value: 2, label: "No" },
];

const LIMITED_OPTIONS: QuestionOption[] = [
  { value: 1, label: "Yes, limited a lot" },
  { value: 2, label: "Yes, limited a little" },
  { value: 3, label: "No, not limited at all" },
];

export const SF12_STEPS: QuestionStep[] = [
  // Step 1 — Q1
  {
    title: "General Health",
    questions: [
      {
        id: "Q1",
        text: "In general, would you say your health is:",
        options: [
          { value: 1, label: "Excellent" },
          { value: 2, label: "Very Good" },
          { value: 3, label: "Good" },
          { value: 4, label: "Fair" },
          { value: 5, label: "Poor" },
        ],
      },
    ],
  },
  // Step 2 — Q2
  {
    title: "Moderate Activities",
    questions: [
      {
        id: "Q2",
        text: "Does your health now limit you in moderate activities, such as moving a table, pushing a vacuum cleaner, bowling, or playing golf?",
        options: LIMITED_OPTIONS,
      },
    ],
  },
  // Step 3 — Q3
  {
    title: "Climbing Stairs",
    questions: [
      {
        id: "Q3",
        text: "Does your health now limit you in climbing several flights of stairs?",
        options: LIMITED_OPTIONS,
      },
    ],
  },
  // Step 4 — Q4 + Q5
  {
    title: "Role-Physical",
    preamble:
      "During the past 4 weeks, have you had any of the following problems with your work or other regular daily activities as a result of your physical health?",
    questions: [
      {
        id: "Q4",
        text: "Accomplished less than you would like?",
        options: YES_NO_OPTIONS,
      },
      {
        id: "Q5",
        text: "Were limited in the kind of work or other activities?",
        options: YES_NO_OPTIONS,
      },
    ],
  },
  // Step 5 — Q6 + Q7
  {
    title: "Role-Emotional",
    preamble:
      "During the past 4 weeks, have you had any of the following problems with your work or other regular daily activities as a result of any emotional problems (such as feeling depressed or anxious)?",
    questions: [
      {
        id: "Q6",
        text: "Accomplished less than you would like?",
        options: YES_NO_OPTIONS,
      },
      {
        id: "Q7",
        text: "Didn't do work or other activities as carefully as usual?",
        options: YES_NO_OPTIONS,
      },
    ],
  },
  // Step 6 — Q8
  {
    title: "Bodily Pain",
    questions: [
      {
        id: "Q8",
        text: "During the past 4 weeks, how much did pain interfere with your normal work (including both work outside the home and housework)?",
        options: [
          { value: 1, label: "Not at all" },
          { value: 2, label: "A little bit" },
          { value: 3, label: "Moderately" },
          { value: 4, label: "Quite a bit" },
          { value: 5, label: "Extremely" },
        ],
      },
    ],
  },
  // Step 7 — Q9
  {
    title: "Calm and Peaceful",
    questions: [
      {
        id: "Q9",
        text: "How much of the time during the past 4 weeks have you felt calm and peaceful?",
        options: FREQUENCY_OPTIONS,
      },
    ],
  },
  // Step 8 — Q10
  {
    title: "Energy Levels",
    questions: [
      {
        id: "Q10",
        text: "How much of the time during the past 4 weeks did you have a lot of energy?",
        options: FREQUENCY_OPTIONS,
      },
    ],
  },
  // Step 9 — Q11
  {
    title: "Downhearted and Blue",
    questions: [
      {
        id: "Q11",
        text: "How much of the time during the past 4 weeks have you felt downhearted and blue?",
        options: FREQUENCY_OPTIONS,
      },
    ],
  },
  // Step 10 — Q12
  {
    title: "Social Functioning",
    questions: [
      {
        id: "Q12",
        text: "During the past 4 weeks, how much of the time has your physical health or emotional problems interfered with your social activities (like visiting with friends, relatives, etc.)?",
        options: FREQUENCY_OPTIONS,
      },
    ],
  },
];
