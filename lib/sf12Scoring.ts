// SF-12 Standardized Score Lookup Table
// Source: Ware, J.E., Kosinski, M., & Keller, S.D. (1996).
//   A 12-Item Short-Form Health Survey. Medical Care, 34(3), 220–233.
//   https://doi.org/10.1097/00005650-199603000-00003
// Coefficients verified against: https://orthotoolkit.com/sf-12/
// Format: [physicalDelta, mentalDelta]
// Q9-Q11 use 6 response options (includes "A Good Bit of the Time").
// Best-health anchor ([0,0]) differs per question: Q9→1, Q10→1, Q11→6, Q12→5.

export const SF12_LOOKUP: Record<string, Record<number, [number, number]>> = {
  // Q1: General Health (1=Excellent … 5=Poor; best=1)
  Q1: {
    1: [0, 0],
    2: [-1.31872, -0.06064],
    3: [-3.02396, 0.03482],
    4: [-5.56461, -0.16891],
    5: [-8.37399, -1.71175],
  },
  // Q2: Moderate Activities (1=Limited a lot, 2=Limited a little, 3=Not limited; best=3)
  Q2: {
    1: [-7.23216, 3.93115],
    2: [-3.45555, 1.86840],
    3: [0, 0],
  },
  // Q3: Climbing Stairs (1=Limited a lot, 2=Limited a little, 3=Not limited; best=3)
  Q3: {
    1: [-6.24397, 2.68282],
    2: [-2.73557, 1.43103],
    3: [0, 0],
  },
  // Q4: Accomplished less due to physical health (1=Yes, 2=No; best=2)
  Q4: {
    1: [-4.61617, 1.44060],
    2: [0, 0],
  },
  // Q5: Limited in kind of work due to physical health (1=Yes, 2=No; best=2)
  Q5: {
    1: [-5.51747, 1.66968],
    2: [0, 0],
  },
  // Q6: Accomplished less due to emotional problems (1=Yes, 2=No; best=2)
  Q6: {
    1: [3.04365, -6.82672],
    2: [0, 0],
  },
  // Q7: Didn't do work as carefully due to emotional problems (1=Yes, 2=No; best=2)
  Q7: {
    1: [2.32091, -5.69921],
    2: [0, 0],
  },
  // Q8: Pain interfered with work (1=Not at all … 5=Extremely; best=1)
  Q8: {
    1: [0, 0],
    2: [-3.80130, 0.90384],
    3: [-6.50522, 1.49384],
    4: [-8.38063, 1.76691],
    5: [-11.25544, 1.48619],
  },
  // Q9: Felt calm and peaceful (1=All … 6=None; best=1 "All of the time")
  Q9: {
    1: [0, 0],
    2: [0.66514, -1.94949],
    3: [1.36689, -4.09842],
    4: [2.37241, -6.31121],
    5: [2.90426, -7.92717],
    6: [3.46638, -10.19085],
  },
  // Q10: Had a lot of energy (1=All … 6=None; best=1 "All of the time")
  Q10: {
    1: [0, 0],
    2: [-0.42251, -0.92057],
    3: [-1.14387, -1.65178],
    4: [-1.61850, -3.29805],
    5: [-2.02168, -4.88962],
    6: [-2.44706, -6.02409],
  },
  // Q11: Felt downhearted and blue (1=All … 6=None; best=6 "None of the time")
  Q11: {
    1: [4.61446, -16.15395],
    2: [3.41593, -10.77911],
    3: [2.34247, -8.09914],
    4: [1.28044, -4.59055],
    5: [0.41188, -1.95934],
    6: [0, 0],
  },
  // Q12: Social activities interfered (1=All … 5=None; best=5 "None of the time")
  Q12: {
    1: [-0.33682, -6.29724],
    2: [-0.94342, -8.26066],
    3: [-0.18043, -5.63286],
    4: [0.11038, -3.13896],
    5: [0, 0],
  },
};

const PCS_CONSTANT = 56.57706;
const MCS_CONSTANT = 60.75781;

export const SF12_QUESTION_KEYS = [
  "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10", "Q11", "Q12",
] as const;

export interface SF12Scores {
  pcs12: number;
  mcs12: number;
}

export type SF12Weights = Record<string, Record<string, [number, number]>>;

export const DEFAULT_WEIGHTS: SF12Weights = Object.fromEntries(
  Object.entries(SF12_LOOKUP).map(([q, answers]) => [
    q,
    Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, v])),
  ])
);

export function computeWithWeights(
  responses: Record<string, number>,
  weights: SF12Weights
): SF12Scores {
  let pcsSum = 0;
  let mcsSum = 0;
  for (const [q, response] of Object.entries(responses)) {
    const vals = weights[q]?.[String(response)];
    if (!vals) continue;
    pcsSum += vals[0];
    mcsSum += vals[1];
  }
  return {
    pcs12: parseFloat((pcsSum + PCS_CONSTANT).toFixed(2)),
    mcs12: parseFloat((mcsSum + MCS_CONSTANT).toFixed(2)),
  };
}

export function computeSF12Scores(responses: Record<string, number>): SF12Scores {
  let pcsSum = 0;
  let mcsSum = 0;

  for (const [q, response] of Object.entries(responses)) {
    const [pVal, mVal] = SF12_LOOKUP[q][response];
    pcsSum += pVal;
    mcsSum += mVal;
  }

  return {
    pcs12: parseFloat((pcsSum + PCS_CONSTANT).toFixed(2)),
    mcs12: parseFloat((mcsSum + MCS_CONSTANT).toFixed(2)),
  };
}

// Self-test (development only): pick the "best health" response for each
// question (the one whose lookup value is [0, 0]) — for that combination the
// sum of lookup values is 0, so PCS must equal PCS_CONSTANT and MCS must
// equal MCS_CONSTANT exactly.
if (process.env.NODE_ENV !== "production") {
  const bestHealth: Record<string, number> = {};
  for (const q of SF12_QUESTION_KEYS) {
    for (const [response, [pVal, mVal]] of Object.entries(SF12_LOOKUP[q])) {
      if (pVal === 0 && mVal === 0) {
        bestHealth[q] = Number(response);
        break;
      }
    }
  }

  const { pcs12, mcs12 } = computeSF12Scores(bestHealth);
  // Raw constants are 56.57706 / 60.75781; rounded to 2 decimals by computeSF12Scores.
  const expectedPcs = parseFloat(PCS_CONSTANT.toFixed(2));
  const expectedMcs = parseFloat(MCS_CONSTANT.toFixed(2));

  if (Math.abs(pcs12 - expectedPcs) > 1e-6 || Math.abs(mcs12 - expectedMcs) > 1e-6) {
    console.error(
      `[sf12Scoring self-test] FAILED: expected PCS=${expectedPcs}, MCS=${expectedMcs}, got PCS=${pcs12}, MCS=${mcs12}`
    );
  }
}
