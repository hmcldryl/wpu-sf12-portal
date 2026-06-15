// SF-12 v1.0 Standardized Score Lookup Table
// Source: Ware, J.E., Kosinski, M., & Keller, S.D. (1996).
//   A 12-Item Short-Form Health Survey. Medical Care, 34(3), 220–233.
//   https://doi.org/10.1097/00005650-199603000-00003
// Verified against: https://orthotoolkit.com/sf-12/
// Format: [physicalValue, mentalValue]

const SF12_LOOKUP: Record<string, Record<number, [number, number]>> = {
  // Q1: General Health (1=Excellent, 2=Very Good, 3=Good, 4=Fair, 5=Poor)
  Q1: {
    1: [0, 0],
    2: [-1.31872, -0.06064],
    3: [-3.02396, 0.03482],
    4: [-5.56461, -0.16891],
    5: [-8.37399, -1.71175],
  },
  // Q2: Moderate Activities (1=Limited a lot, 2=Limited a little, 3=Not limited)
  Q2: {
    1: [-7.23216, 3.93115],
    2: [-3.45555, 1.8684],
    3: [0, 0],
  },
  // Q3: Climbing Stairs (1=Limited a lot, 2=Limited a little, 3=Not limited)
  Q3: {
    1: [-6.24397, 2.68282],
    2: [-2.73557, 1.43103],
    3: [0, 0],
  },
  // Q4: Accomplished less due to physical health (1=Yes, 2=No)
  Q4: {
    1: [-4.61617, 1.4406],
    2: [0, 0],
  },
  // Q5: Limited in kind of work due to physical health (1=Yes, 2=No)
  Q5: {
    1: [-5.51747, 1.66968],
    2: [0, 0],
  },
  // Q6: Accomplished less due to emotional problems (1=Yes, 2=No)
  Q6: {
    1: [3.04365, -6.82672],
    2: [0, 0],
  },
  // Q7: Didn't do work as carefully due to emotional problems (1=Yes, 2=No)
  Q7: {
    1: [2.32091, -5.69921],
    2: [0, 0],
  },
  // Q8: Pain interfered with work (1=Not at all … 5=Extremely)
  Q8: {
    1: [0, 0],
    2: [-1.2248, -0.13697],
    3: [-2.37408, -0.55033],
    4: [-3.8013, -0.79952],
    5: [-6.50522, -3.0175],
  },
  // Q9: Felt calm and peaceful (1=All of the time … 5=None of the time)
  Q9: {
    1: [4.61446, -16.15384],
    2: [3.41593, -10.77911],
    3: [2.34247, -8.09914],
    4: [1.28044, -4.59055],
    5: [0, 0],
  },
  // Q10: Had a lot of energy (1=All of the time … 5=None of the time)
  Q10: {
    1: [-6.29724, 3.9361],
    2: [-4.88962, 2.32031],
    3: [-3.29805, 1.56766],
    4: [-1.65178, 0.63738],
    5: [0, 0],
  },
  // Q11: Felt downhearted and blue (1=All of the time … 5=None of the time)
  Q11: {
    1: [1.22268, -18.1942],
    2: [0.91578, -12.15879],
    3: [0.56495, -9.47281],
    4: [0.29241, -4.61217],
    5: [0, 0],
  },
  // Q12: Social activities interfered (1=All of the time … 5=None of the time)
  Q12: {
    1: [-6.19825, 2.32585],
    2: [-3.62993, 0.73479],
    3: [-2.2654, -0.27545],
    4: [-0.73654, -0.13193],
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
