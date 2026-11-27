import type { OpportunityDTO, StudentProfileDTO } from "../../../lib/journey-contract";
import type { TFn } from "./i18n";

export type MatchSignal = { label: string; matched: boolean; detail: string };
export type MatchStatus = "eligible" | "nearly" | "review";
export type MatchedOpportunity = {
  item: OpportunityDTO;
  match: number | null;
  status: MatchStatus;
  signals: MatchSignal[];
  reason: string;
  gap?: string;
};

const normal = (value: string) => value.toLowerCase().replace(/[’']/g, "").trim();
const degreeKeys: Record<string, string> = {
  bachelor: "card.degree.bachelor",
  master: "card.degree.master",
  phd: "card.degree.phd",
};
const testLabels: Record<string, string> = {
  ielts: "IELTS",
  toefl: "TOEFL",
  duolingo: "Duolingo",
};

export function personalizeOpportunity(
  item: OpportunityDTO,
  profile: StudentProfileDTO | null,
  t: TFn,
): MatchedOpportunity {
  const degreeLabels = (level: string) => (degreeKeys[level] ? t(degreeKeys[level]) : level);
  // Locked listings carry no detail data, so a match breakdown would be meaningless.
  if (item.locked) {
    return {
      item,
      match: null,
      status: "review",
      signals: [],
      reason: t("match.locked"),
    };
  }
  if (!profile) {
    return {
      item,
      match: null,
      status: "review",
      signals: [],
      reason: t("match.signIn"),
    };
  }

  const degreeNames = item.degreeLevels.map((level) => degreeLabels(level));
  const degreeMatch =
    item.degreeLevels.length === 0 ||
    (profile.desiredDegree !== "" && item.degreeLevels.includes(profile.desiredDegree));

  const wantedField = normal(profile.preferredField);
  const fieldMatch =
    item.studyFields.length === 0 ||
    (wantedField !== "" &&
      item.studyFields.some((field) => {
        const value = normal(field);
        return value.includes(wantedField) || wantedField.includes(value);
      }));

  const wantedPlace = normal(profile.preferredDestination);
  const place = normal(item.country);
  const destinationMatch =
    wantedPlace !== "" && (place.includes(wantedPlace) || wantedPlace.includes(place));

  const fundingMatch =
    profile.fundingPreference !== "full" ||
    item.fundingType === "full" ||
    item.fundingType === "waiver";

  const minGpa = item.requirements.minimumGpa;
  const gpaMatch = minGpa === null || (profile.gpa !== null && profile.gpa >= minGpa);

  const minIelts = item.requirements.minimumIelts;
  const englishComparable = minIelts === null || profile.englishTest === "ielts";
  const englishMatch =
    minIelts === null || (englishComparable && profile.englishScore !== null && profile.englishScore >= minIelts);

  const signals: MatchSignal[] = [
    {
      label: t("match.degree"),
      matched: degreeMatch,
      detail:
        item.degreeLevels.length === 0
          ? t("match.noDegree")
          : degreeMatch
            ? t("match.degreeEligible", { degree: degreeLabels(profile.desiredDegree) })
            : profile.desiredDegree === ""
              ? t("match.setDegree")
              : t("match.listedFor", { list: degreeNames.join(t("match.or")) }),
    },
    {
      label: t("match.field"),
      matched: fieldMatch,
      detail:
        item.studyFields.length === 0
          ? t("match.openAll")
          : fieldMatch
            ? t("match.aligns", { field: profile.preferredField })
            : wantedField === ""
              ? t("match.addField")
              : t("match.listedFor", { list: item.studyFields.join(", ") }),
    },
    {
      label: t("match.destination"),
      matched: destinationMatch,
      detail: destinationMatch
        ? t("match.destMatch")
        : wantedPlace === ""
          ? t("match.addDest")
          : item.country,
    },
    {
      label: t("match.funding"),
      matched: fundingMatch,
      detail: fundingMatch
        ? t("match.fundMatch")
        : (item.fundingSummary ?? t("match.notFull")),
    },
    {
      label: t("match.gpa"),
      matched: gpaMatch,
      detail:
        minGpa === null
          ? t("match.noMin")
          : profile.gpa === null
            ? t("match.addGpa", { min: minGpa.toFixed(2) })
            : t("match.gpaCompare", { mine: profile.gpa.toFixed(2), min: minGpa.toFixed(2) }),
    },
    {
      label: minIelts === null ? t("match.english") : "IELTS",
      matched: englishMatch,
      detail:
        minIelts === null
          ? t("match.noMin")
          : !englishComparable
            ? t("match.notComparable", {
                min: minIelts.toFixed(1),
                test: testLabels[profile.englishTest] ?? t("match.testFallback"),
              })
            : profile.englishScore === null
              ? t("match.addIelts", { min: minIelts.toFixed(1) })
              : t("match.gpaCompare", {
                  mine: profile.englishScore.toFixed(1),
                  min: minIelts.toFixed(1),
                }),
    },
  ];

  const weights = [20, 20, 15, 15, 15, 15];
  const match = signals.reduce(
    (score, signal, index) => score + (signal.matched ? weights[index] : 0),
    0,
  );
  const missing = signals.filter((signal) => !signal.matched);
  const matched = signals.filter((signal) => signal.matched).map((signal) => signal.label);

  return {
    item,
    match,
    status: missing.length === 0 ? "eligible" : missing.length <= 2 ? "nearly" : "review",
    signals,
    reason: matched.length
      ? t("match.reasonMatched", { list: matched.slice(0, 3).join(", ") })
      : t("match.reasonLimited"),
    gap: missing.length
      ? t("match.gap", { label: missing[0].label, detail: missing[0].detail })
      : undefined,
  };
}

export function personalizedOpportunities(
  items: OpportunityDTO[],
  profile: StudentProfileDTO | null,
  t: TFn,
): MatchedOpportunity[] {
  return items
    .map((item) => personalizeOpportunity(item, profile, t))
    .sort((a, b) => (b.match ?? -1) - (a.match ?? -1));
}
