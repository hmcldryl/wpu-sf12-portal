# SF-12 Scoring Explained

## Two Output Scores

| Score | Measures | Constant Baseline |
|---|---|---|
| **PCS-12** | Physical health | 56.57706 |
| **MCS-12** | Mental health | 60.75781 |

Both are norm-based — 50 = US population average, SD = 10. Higher = better health.

---

## How It Works

### Step 1 — Map each answer to two delta values

Every question + answer maps to `[physicalDelta, mentalDelta]` via `SF12_LOOKUP` in `lib/sf12Scoring.ts`.

### Step 2 — Sum all 12 deltas separately

```
pcsSum = sum of physicalDelta for Q1–Q12
mcsSum = sum of mentalDelta   for Q1–Q12
```

### Step 3 — Add constants

```
PCS-12 = pcsSum + 56.57706
MCS-12 = mcsSum + 60.75781
```

Results are rounded to 2 decimal places.

---

## Best-Health Anchor

Each question has exactly one answer mapped to `[0, 0]`. It differs per question:

| Question | Best-health answer | Value |
|---|---|---|
| Q1 General Health | Excellent | 1 |
| Q2 Moderate Activities | Not limited | 3 |
| Q3 Climbing Stairs | Not limited | 3 |
| Q4 Accomplished less (physical) | No | 2 |
| Q5 Limited kind of work | No | 2 |
| Q6 Accomplished less (emotional) | No | 2 |
| Q7 Didn't do work carefully | No | 2 |
| Q8 Pain interfered | Not at all | 1 |
| Q9 Felt calm and peaceful | All of the time | 1 |
| Q10 Had a lot of energy | All of the time | 1 |
| Q11 Felt downhearted and blue | None of the time | 6 |
| Q12 Social activities interfered | None of the time | 5 |

If all answers are best-health, all deltas = 0 → PCS = 56.58, MCS = 60.76.

---

## Score Bands

Defined in `lib/dashboardUtils.ts`:

| Band | PCS or MCS Range |
|---|---|
| Above Average | ≥ 55 |
| Average | 45 – 54.9 |
| Below Average | < 45 |

---

## Health Category Cross-tab

`categorizeHealth` in `lib/dashboardUtils.ts`:

| Category | Condition |
|---|---|
| Healthy | PCS ≥ 45 and MCS ≥ 45 |
| Physical Concern | PCS < 45 and MCS ≥ 45 |
| Mental Concern | PCS ≥ 45 and MCS < 45 |
| Combined Concern | PCS < 45 and MCS < 45 |

---

## Full Lookup Table

Coefficients verified against orthotoolkit.com/sf-12/.
Source: Ware et al. (1996), *Medical Care* 34(3). doi:10.1097/00005650-199603000-00003

**Q9–Q11 have 6 response options** (includes "A Good Bit of the time" as value 3).

### Q1 — General Health

| Answer | Value | Physical Δ | Mental Δ |
|---|---|---|---|
| Excellent | 1 | 0 | 0 |
| Very Good | 2 | −1.31872 | −0.06064 |
| Good | 3 | −3.02396 | +0.03482 |
| Fair | 4 | −5.56461 | −0.16891 |
| Poor | 5 | −8.37399 | −1.71175 |

### Q2 — Moderate Activities limited?

| Answer | Value | Physical Δ | Mental Δ |
|---|---|---|---|
| Limited a lot | 1 | −7.23216 | +3.93115 |
| Limited a little | 2 | −3.45555 | +1.86840 |
| Not limited | 3 | 0 | 0 |

### Q3 — Climbing Stairs limited?

| Answer | Value | Physical Δ | Mental Δ |
|---|---|---|---|
| Limited a lot | 1 | −6.24397 | +2.68282 |
| Limited a little | 2 | −2.73557 | +1.43103 |
| Not limited | 3 | 0 | 0 |

### Q4 — Accomplished less (physical)?

| Answer | Value | Physical Δ | Mental Δ |
|---|---|---|---|
| Yes | 1 | −4.61617 | +1.44060 |
| No | 2 | 0 | 0 |

### Q5 — Limited kind of work (physical)?

| Answer | Value | Physical Δ | Mental Δ |
|---|---|---|---|
| Yes | 1 | −5.51747 | +1.66968 |
| No | 2 | 0 | 0 |

### Q6 — Accomplished less (emotional)?

| Answer | Value | Physical Δ | Mental Δ |
|---|---|---|---|
| Yes | 1 | +3.04365 | −6.82672 |
| No | 2 | 0 | 0 |

### Q7 — Didn't do work carefully (emotional)?

| Answer | Value | Physical Δ | Mental Δ |
|---|---|---|---|
| Yes | 1 | +2.32091 | −5.69921 |
| No | 2 | 0 | 0 |

### Q8 — Pain interfered with work

| Answer | Value | Physical Δ | Mental Δ |
|---|---|---|---|
| Not at all | 1 | 0 | 0 |
| A little bit | 2 | −3.80130 | +0.90384 |
| Moderately | 3 | −6.50522 | +1.49384 |
| Quite a bit | 4 | −8.38063 | +1.76691 |
| Extremely | 5 | −11.25544 | +1.48619 |

### Q9 — Felt calm and peaceful (6 options)

| Answer | Value | Physical Δ | Mental Δ |
|---|---|---|---|
| All of the time | 1 | 0 | 0 |
| Most of the time | 2 | +0.66514 | −1.94949 |
| A Good Bit of the time | 3 | +1.36689 | −4.09842 |
| Some of the time | 4 | +2.37241 | −6.31121 |
| A little of the time | 5 | +2.90426 | −7.92717 |
| None of the time | 6 | +3.46638 | −10.19085 |

### Q10 — Had a lot of energy (6 options)

| Answer | Value | Physical Δ | Mental Δ |
|---|---|---|---|
| All of the time | 1 | 0 | 0 |
| Most of the time | 2 | −0.42251 | −0.92057 |
| A Good Bit of the time | 3 | −1.14387 | −1.65178 |
| Some of the time | 4 | −1.61850 | −3.29805 |
| A little of the time | 5 | −2.02168 | −4.88962 |
| None of the time | 6 | −2.44706 | −6.02409 |

### Q11 — Felt downhearted and blue (6 options)

| Answer | Value | Physical Δ | Mental Δ |
|---|---|---|---|
| All of the time | 1 | +4.61446 | −16.15395 |
| Most of the time | 2 | +3.41593 | −10.77911 |
| A Good Bit of the time | 3 | +2.34247 | −8.09914 |
| Some of the time | 4 | +1.28044 | −4.59055 |
| A little of the time | 5 | +0.41188 | −1.95934 |
| None of the time | 6 | 0 | 0 |

### Q12 — Social activities interfered (5 options)

| Answer | Value | Physical Δ | Mental Δ |
|---|---|---|---|
| All of the time | 1 | −0.33682 | −6.29724 |
| Most of the time | 2 | −0.94342 | −8.26066 |
| Some of the time | 3 | −0.18043 | −5.63286 |
| A little of the time | 4 | +0.11038 | −3.13896 |
| None of the time | 5 | 0 | 0 |
