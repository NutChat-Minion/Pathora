import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BadgeCheck,
  BookOpen,
  Bookmark,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Compass,
  FileCheck2,
  Flag,
  Filter,
  GraduationCap,
  Grid2X2,
  Heart,
  Info,
  Languages,
  Lock,
  MapPin,
  MousePointer2,
  Plane,
  Plus,
  Rocket,
  RotateCcw,
  Route,
  Search,
  ShieldCheck,
  Target,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import type {
  OpportunityDTO,
  OpportunityType,
  PlanDTO,
  PlanStatus,
  RoadmapStage,
  SettingsDTO,
  StudentProfileDTO,
} from "../../../lib/journey-contract";
import { planStatuses, roadmapStages, type PlanKey } from "../../../lib/journey-contract";
import { journeySteps } from "./data";
import {
  MatchedOpportunity,
  MatchStatus,
  personalizeOpportunity,
  personalizedOpportunities,
} from "./matching";
import { fetchOpportunityBySlug, useJourney } from "./store";
import ProfileAssets from "../ProfileAssets";
import { useT, type TFn } from "./i18n";

const typeLabels: Record<OpportunityType, string> = {
  scholarship: "card.type.scholarship",
  university: "card.type.university",
  program: "card.type.program",
};
const statusLabels: Record<MatchStatus, string> = {
  eligible: "card.status.eligible",
  nearly: "card.status.nearly",
  review: "card.status.review",
};
const planStatusLabels: Record<PlanStatus, string> = {
  interested: "card.planStatus.interested",
  preparing: "card.planStatus.preparing",
  ready: "card.planStatus.ready",
  submitted: "card.planStatus.submitted",
  accepted: "card.planStatus.accepted",
  rejected: "card.planStatus.rejected",
};
const degreeLabels = {
  bachelor: "card.degree.bachelor",
  master: "card.degree.master",
  phd: "card.degree.phd",
} as const;
const fundingLabels = {
  full: "card.funding.full",
  partial: "card.funding.partial",
  waiver: "card.funding.waiver",
  none: "card.funding.none",
} as const;

function parseDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`) : new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysUntil(iso: string | null | undefined): number | null {
  const date = parseDate(iso);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function useDates() {
  const { lang, t } = useT();
  const locale = lang === "th" ? "th-TH" : "en-GB";
  return useMemo(
    () => ({
      locale,
      t,
      full: (iso: string | null | undefined) =>
        parseDate(iso)?.toLocaleDateString(locale, {
          day: "numeric",
          month: "short",
          year: "numeric",
        }) ?? null,
      parts: (iso: string | null | undefined) => {
        const date = parseDate(iso);
        return date
          ? {
              day: date.toLocaleDateString(locale, { day: "numeric" }),
              month: date.toLocaleDateString(locale, { month: "short" }).toUpperCase(),
            }
          : null;
      },
    }),
    [locale, t],
  );
}

type DateTools = ReturnType<typeof useDates>;

function deadlineLabel(item: OpportunityDTO, dates: DateTools) {
  return dates.full(item.deadline) ?? item.deadlineNote ?? dates.t("card.seeOfficial");
}
const locationText = (item: OpportunityDTO) =>
  [item.city, item.country].filter(Boolean).join(", ");
const degreeText = (item: OpportunityDTO, t: TFn) =>
  item.degreeLevels.length
    ? item.degreeLevels.map((level) => t(degreeLabels[level])).join(" · ")
    : t("card.degree.all");
const fundingText = (item: OpportunityDTO, t: TFn) =>
  item.fundingSummary ||
  (item.fundingType ? t(fundingLabels[item.fundingType]) : t("card.funding.notListed"));

/** Wraps an account-only action so anonymous visitors are sent to sign in. */
function useAuthAction() {
  const { status } = useJourney();
  const navigate = useNavigate();
  const location = useLocation();
  return <A extends unknown[]>(action: (...args: A) => unknown) =>
    (...args: A) => {
      if (status !== "ready") {
        navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
        return;
      }
      return action(...args);
    };
}

/**
 * Like useAuthAction, but for opportunity actions (save / add to plan): anonymous visitors go to
 * sign in and viewers without a plan covering the listing's country go to pricing.
 */
function useItemAction() {
  const { status } = useJourney();
  const navigate = useNavigate();
  const location = useLocation();
  return <A extends unknown[]>(item: OpportunityDTO, action: (...args: A) => unknown) =>
    (...args: A) => {
      if (status !== "ready") {
        navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
        return;
      }
      if (item.locked) {
        navigate("/app/pricing");
        return;
      }
      return action(...args);
    };
}

function LockBadge({ item }: { item: OpportunityDTO }) {
  const { t } = useT();
  return (
    <Link
      to="/app/pricing"
      className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#fae5ed] px-3 py-1 text-[12px] font-bold text-[#9d3f68]"
    >
      <Lock size={13} />
      {t("card.unlockWith", { country: item.country })}
    </Link>
  );
}

function Thumb({ item, className = "" }: { item: OpportunityDTO; className?: string }) {
  return item.imageUrl ? (
    <img src={item.imageUrl} alt={item.imageAlt ?? ""} />
  ) : (
    <div
      aria-hidden="true"
      className={`grid place-items-center bg-gradient-to-br from-[#fae5ed] to-[#ffe5ad] text-[22px] font-extrabold text-[#9d3f68] ${className}`}
    >
      {item.institution.charAt(0).toUpperCase()}
    </div>
  );
}

function SourceNote({
  item,
  stopPointer = false,
}: {
  item: OpportunityDTO;
  stopPointer?: boolean;
}) {
  const dates = useDates();
  const { t } = useT();
  if (item.locked) return null;
  const checked = dates.full(item.lastVerifiedAt);
  return (
    <p className="source-note mt-2 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[11px] leading-4 text-[#756d7e]">
      <ShieldCheck size={13} />
      <span>{t(item.origin === "ai" ? "card.aiSummarized" : "card.verifyAt")}</span>
      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="font-bold text-[#9d3f68] underline"
        onPointerDown={stopPointer ? (event) => event.stopPropagation() : undefined}
      >
        {t("card.officialSource")}
      </a>
      {checked && <span>{t("card.checked", { date: checked })}</span>}
    </p>
  );
}

function MatchBadge({ match }: { match: number | null }) {
  const { t } = useT();
  if (match === null) return null;
  return (
    <div
      className={`match ${match >= 90 ? "great" : match >= 80 ? "good" : "review"}`}
      title={t("card.matchTitle")}
    >
      <strong>{match}%</strong>
      <span>{t("card.match")}</span>
      <Info size={13} />
    </div>
  );
}

function OpportunityCard({ m, compact = false }: { m: MatchedOpportunity; compact?: boolean }) {
  const { item } = m;
  const { saved, toggleSaved, addPlan, plans } = useJourney();
  const { t } = useT();
  const guard = useItemAction();
  const dates = useDates();
  const isSaved = saved.includes(item.id);
  const inPlan = plans.some((plan) => plan.opportunityId === item.id);
  return (
    <article className={`opportunity-card ${compact ? "compact" : ""}`}>
      <div className="card-image">
        <Thumb item={item} className="h-full w-full" />
        {item.sponsored && <span className="sponsored">{t("card.sponsored")}</span>}
        <button
          onClick={guard(item, () => toggleSaved(item.id))}
          aria-label={
            item.locked ? t("card.unlockToSave") : isSaved ? t("card.removeSaved") : t("card.saveItem")
          }
          className={isSaved ? "save saved" : "save"}
        >
          {item.locked ? <Lock size={18} /> : <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />}
        </button>
      </div>
      <div className="card-body">
        <div className="eyebrow">{t(typeLabels[item.type])}</div>
        <div className="card-heading">
          <div>
            <h3>{item.title}</h3>
            <p>{item.institution}</p>
          </div>
          <MatchBadge match={m.match} />
        </div>
        <div className="meta">
          <span>
            <MapPin size={15} />
            {locationText(item)}
          </span>
          <span>
            <GraduationCap size={15} />
            {degreeText(item, t)}
          </span>
        </div>
        <div className="funding">
          <CircleDollarSign size={17} />
          {fundingText(item, t)}
        </div>
        {!compact && m.match !== null && (
          <div className={`eligibility ${m.status === "eligible" ? "eligible" : "near"}`}>
            <strong>{t(statusLabels[m.status])}</strong>
            <span>{m.reason}</span>
            {m.gap && <em>{m.gap}</em>}
          </div>
        )}
        {item.locked && <LockBadge item={item} />}
        <Link className="opportunity-detail-link" to={`/scholarships/${item.slug}`}>
          {t("card.viewDetails")} <ArrowRight size={15} />
        </Link>
        <SourceNote item={item} />
        <div className="card-footer">
          <span>
            <Calendar size={15} />
            {deadlineLabel(item, dates)}
          </span>
          <button
            className={inPlan ? "text-action muted" : "text-action"}
            disabled={inPlan}
            onClick={guard(item, () => addPlan(item.id))}
          >
            {inPlan
              ? t("card.inPlanner")
              : item.locked
                ? t("card.unlockToPlan")
                : t("card.addToPlan")}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

function JourneyIllustration() {
  const { t } = useT();
  return (
    <svg
      className="journey-illustration"
      viewBox="0 0 600 620"
      role="img"
      aria-label={t("home.illustrationAlt")}
    >
      <path
        className="blob-shape"
        d="M100 101C162 31 292 32 389 69c91 35 158 128 139 234-18 103-59 211-156 257-94 44-230 30-297-56-66-84-46-190-33-270 10-65 18-88 58-133Z"
        fill="#ffe5ad"
      />
      <path
        className="route-line"
        d="M73 325c-35-102 17-215 116-266M429 73c89 24 145 96 150 188"
        fill="none"
        stroke="#9d3f68"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="3 16"
      />

      <g className="plane">
        <path
          d="m447 104 108-46-47 105-22-38-39-21Z"
          fill="#fffaf1"
          stroke="#352b45"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        <path
          d="m486 125 69-67-83 51"
          fill="none"
          stroke="#352b45"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>

      <g className="globe">
        <circle cx="304" cy="354" r="176" fill="#7fd4ba" stroke="#352b45" strokeWidth="9" />
        <path
          d="M171 247c27-41 63-60 105-67l19 27-23 28 15 29-35 13-12 32-45-4-30-24Z"
          fill="#fff5d8"
          stroke="#352b45"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        <path
          d="m369 205 42 14 10 31 38 21-10 44-31 6-22 44-34-5-24-39 15-31-20-37Z"
          fill="#f47b66"
          stroke="#352b45"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        <path
          d="m233 395 42-25 33 16 22 41-12 67-48 26-30-28-4-47-30-18Z"
          fill="#fff5d8"
          stroke="#352b45"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        <path
          d="M185 437c42 31 91 46 143 43 75-4 137-46 170-105"
          fill="none"
          stroke="#352b45"
          strokeWidth="6"
          strokeLinecap="round"
          opacity=".18"
        />
      </g>

      <g className="student">
        <path
          d="M210 144c2-44 36-70 78-58 33 10 48 43 37 76-10 30-35 47-67 39-32-9-50-29-48-57Z"
          fill="#f2b68e"
          stroke="#352b45"
          strokeWidth="8"
        />
        <path
          d="M216 142c-5-34 13-61 42-66 35-6 66 14 72 48-24-3-42-12-57-28-12 21-31 36-57 46Z"
          fill="#563b51"
          stroke="#352b45"
          strokeWidth="8"
          strokeLinejoin="round"
        />
        <circle cx="245" cy="151" r="5" fill="#352b45" />
        <circle cx="293" cy="149" r="5" fill="#352b45" />
        <path
          d="M254 171c10 8 21 8 31-1"
          fill="none"
          stroke="#352b45"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="m194 87 83-38 85 39-84 36-84-37Z"
          fill="#9d3f68"
          stroke="#352b45"
          strokeWidth="8"
          strokeLinejoin="round"
        />
        <path d="m336 99 2 44" fill="none" stroke="#352b45" strokeWidth="6" strokeLinecap="round" />
        <circle cx="338" cy="149" r="9" fill="#f5c451" stroke="#352b45" strokeWidth="5" />
        <path
          d="M195 253c5-49 37-75 80-71 49 4 75 33 78 88l-15 48-129-8-14-57Z"
          fill="#f26b5b"
          stroke="#352b45"
          strokeWidth="8"
          strokeLinejoin="round"
        />
        <path
          d="M235 202c17 18 35 19 53 0"
          fill="none"
          stroke="#fff5d8"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="m205 250-44 44 35 35"
          fill="none"
          stroke="#352b45"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m341 251 36 45-30 32"
          fill="none"
          stroke="#352b45"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <g className="book-stack">
        <path
          d="M79 484h132v35H79z"
          fill="#f26b5b"
          stroke="#352b45"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        <path
          d="M95 449h135v35H95z"
          fill="#f5c451"
          stroke="#352b45"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        <path
          d="M72 519h141v35H72z"
          fill="#9d3f68"
          stroke="#352b45"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        <path
          d="M104 458h71M91 492h76M94 528h76"
          stroke="#fffaf1"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>

      <g className="suitcase">
        <path
          d="M426 438h101c14 0 25 11 25 25v82H401v-82c0-14 11-25 25-25Z"
          fill="#f5c451"
          stroke="#352b45"
          strokeWidth="8"
        />
        <path
          d="M446 437v-22c0-10 8-18 18-18h25c10 0 18 8 18 18v22"
          fill="none"
          stroke="#352b45"
          strokeWidth="8"
        />
        <path
          d="M430 474h93M447 438v107M508 438v107"
          fill="none"
          stroke="#352b45"
          strokeWidth="6"
          opacity=".3"
        />
        <circle cx="430" cy="556" r="9" fill="#352b45" />
        <circle cx="524" cy="556" r="9" fill="#352b45" />
      </g>

      <g
        className="sparkle sparkle-one"
        fill="#f26b5b"
        stroke="#352b45"
        strokeWidth="4"
        strokeLinejoin="round"
      >
        <path d="m71 181 9 18 19 9-19 9-9 19-9-19-19-9 19-9 9-18Z" />
      </g>
      <g
        className="sparkle sparkle-two"
        fill="#f5c451"
        stroke="#352b45"
        strokeWidth="4"
        strokeLinejoin="round"
      >
        <path d="m526 324 7 14 15 7-15 7-7 15-7-15-14-7 14-7 7-14Z" />
      </g>
    </svg>
  );
}

export function Home() {
  const { t } = useT();
  const { status, opportunities, opportunitiesLoaded, profile } = useJourney();
  const dates = useDates();
  const startLink = status === "ready" ? "/app" : "/login?mode=register";
  const matched = useMemo(
    () => personalizedOpportunities(opportunities, profile, t),
    [opportunities, profile, t],
  );
  const topMatch = matched.find((m) => m.match !== null) ?? null;
  const nextDeadline =
    [...opportunities]
      .filter((item) => (daysUntil(item.deadline) ?? -1) >= 0)
      .sort(
        (a, b) =>
          (parseDate(a.deadline)?.getTime() ?? 0) - (parseDate(b.deadline)?.getTime() ?? 0),
      )[0] ?? null;
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <h1>
            {t("home.heroLine1")}
            <br />
            <em>{t("home.heroLine2")}</em>
          </h1>
          <p>{t("home.heroText")}</p>
          <div className="hero-actions">
            <Link to={startLink} className="btn btn-primary btn-lg">
              {t("home.start")} <ArrowRight className="hero-start-icon" size={18} />
            </Link>
            <Link to="/explore" className="btn btn-quiet btn-lg explore-outline-button">
              {t("home.exploreOpps")}
            </Link>
          </div>
          <div className="trust-row">
            <span>
              {t("home.trust1")}
            </span>
            <span>
              {t("home.trust2")}
            </span>
            <span>
              {t("home.trust3")}
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <JourneyIllustration />
          {topMatch && topMatch.match !== null && (
            <div className="floating-card match-float">
              <div>
                <small>{t("home.topMatch")}</small>
                <strong>{t("home.profileMatch", { match: topMatch.match })}</strong>
                <span>{topMatch.item.title}</span>
              </div>
            </div>
          )}
          {nextDeadline && (
            <div className="floating-card deadline-float">
              <div>
                <small>{t("home.nextDeadline")}</small>
                <strong>{dates.full(nextDeadline.deadline)}</strong>
                <span>{nextDeadline.title}</span>
              </div>
            </div>
          )}
          <div className="hero-dots" />
        </div>
      </section>
      <section className="trust-strip">
        <span>{t("home.stripLead")}</span>
        <strong>{t("home.stripScholarships")}</strong>
        <strong>{t("home.stripUniversities")}</strong>
        <strong>{t("home.stripPrograms")}</strong>
        <strong>{t("home.stripApplications")}</strong>
        <strong>{t("home.stripPredeparture")}</strong>
      </section>
      <section id="how" className="section how">
        <div className="section-heading centered">
          <h2 className="journey-heading">
            {t("home.journeyHeading1")}
            <br />
            {t("home.journeyHeading2")}
          </h2>
          <p>{t("home.journeyText")}</p>
        </div>
        <div className="steps">
          {journeySteps.map(([title, text], index) => (
            <div className="step" key={title}>
              <span>{index + 1}</span>
              <h3>{t(title)}</h3>
              <p>{t(text)}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section feature-section">
        <div className="section-heading">
          <h2>{t("home.stepsHeading")}</h2>
          <p>{t("home.stepsText")}</p>
        </div>
        {matched.length ? (
          <div className="card-grid">
            {matched.slice(0, 3).map((m) => (
              <OpportunityCard m={m} compact key={m.item.id} />
            ))}
          </div>
        ) : (
          <p className="text-center text-[14px] text-[#756d7e]">
            {opportunitiesLoaded ? t("common.emptyListings") : t("common.loadingListings")}
          </p>
        )}
        <div className="center-action">
          <Link to="/explore" className="btn btn-outline explore-outline-button">
            {t("home.exploreAll")} <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <section className="section why">
        <div className="why-photo">
          <img
            src="https://images.unsplash.com/photo-1627556704353-016baeb12c79?auto=format&fit=crop&w=1000&q=80"
            alt={t("home.photoAlt")}
          />
          <div>
            <strong>{t("home.onePath")}</strong>
            <span>{t("home.onePathSub")}</span>
          </div>
        </div>
        <div className="why-copy">
          <h2>{t("home.whyHeading")}</h2>
          {[
            [t("home.why1"), t("home.why1Text")],
            [t("home.why2"), t("home.why2Text")],
            [t("home.why3"), t("home.why3Text")],
          ].map(([title, text]) => (
            <div className="why-item" key={String(title)}>
              <div>
                <h3>{String(title)}</h3>
                <p>{String(text)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="final-cta">
        <div>
          <h2>{t("home.ctaHeading")}</h2>
        </div>
        <Link to={startLink} className="btn btn-gold btn-lg">
          {t("home.ctaButton")} <ArrowRight />
        </Link>
      </section>
    </main>
  );
}

export function Dashboard() {
  const { t, lang } = useT();
  const { profile, opportunities, saved, plans, profileCompletion, displayName, entitlement } =
    useJourney();
  const dates = useDates();
  const matched = useMemo(
    () => personalizedOpportunities(opportunities, profile, t),
    [opportunities, profile, t],
  );
  const recommendations = matched.filter((m) => m.item.type === "scholarship").slice(0, 5);
  const tasks = plans.flatMap((plan) => plan.tasks);
  const done = tasks.filter((task) => task.done).length;
  const readiness = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const today = new Date()
    .toLocaleDateString(dates.locale, { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
  const missingField = profile
    ? (
        [
          ["gpa", t("dashboard.field.gpa")],
          ["englishScore", t("dashboard.field.englishScore")],
          ["preferredField", t("dashboard.field.preferredField")],
          ["preferredDestination", t("dashboard.field.preferredDestination")],
          ["desiredDegree", t("dashboard.field.desiredDegree")],
          ["fundingPreference", t("dashboard.field.fundingPreference")],
          ["educationLevel", t("dashboard.field.educationLevel")],
          ["institution", t("dashboard.field.institution")],
          ["graduationYear", t("dashboard.field.graduationYear")],
          ["annualBudgetThb", t("dashboard.field.annualBudgetThb")],
          ["nationality", t("dashboard.field.nationality")],
        ] as [keyof StudentProfileDTO, string][]
      ).find(([key]) => profile[key] === "" || profile[key] === null)
    : undefined;
  const upcoming = [...plans]
    .sort(
      (a, b) =>
        (parseDate(a.targetDeadline)?.getTime() ?? Infinity) -
        (parseDate(b.targetDeadline)?.getTime() ?? Infinity),
    )
    .slice(0, 3);
  const milestoneDone = [
    profileCompletion >= 80,
    saved.length > 0,
    plans.length > 0,
    plans.some((plan) => ["submitted", "accepted"].includes(plan.status)),
    plans.some((plan) => plan.status === "accepted"),
  ];
  const activeMilestone = milestoneDone.findIndex((value) => !value);
  const milestoneLabels = [
    t("dashboard.milestone.profile"),
    t("dashboard.milestone.discover"),
    t("dashboard.milestone.prepare"),
    t("dashboard.milestone.apply"),
    t("dashboard.milestone.goAbroad"),
  ];
  return (
    <div className="app-page">
      <div className="welcome">
        <div>
          <span className="eyebrow">{today}</span>
          <h1>
            {t("dashboard.welcome", {
              name: displayName ? (lang === "th" ? ` ${displayName}` : `, ${displayName}`) : "",
            })}
          </h1>
          <p>{t("dashboard.sub")}</p>
          <Link
            to="/app/pricing"
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#fae5ed] px-3 py-1 text-[12px] font-bold text-[#9d3f68]"
          >
            <Lock size={13} />
            {entitlement.plan && ["active", "trialing"].includes(entitlement.status)
              ? t("dashboard.planLine", {
                  plan: t(PLAN_LABELS[entitlement.plan]),
                  countries:
                    entitlement.countryLimit === null
                      ? t("dashboard.allCountries")
                      : t("dashboard.countriesUsed", {
                          used: entitlement.selectedCountries.length,
                          limit: entitlement.countryLimit,
                        }),
                })
              : entitlement.status === "past_due"
                ? t("dashboard.pastDue")
                : t("dashboard.noPlan")}
          </Link>
        </div>
        <Link className="btn btn-primary" to="/app/explore">
          <Search className="explore-button-icon" size={17} strokeWidth={2.5} />
          {t("home.exploreOpps")}
        </Link>
      </div>
      <div className="dashboard-grid">
        <section className="panel profile-panel">
          <div
            className="ring"
            style={{ "--value": `${profileCompletion * 3.6}deg` } as React.CSSProperties}
          >
            <span>{profileCompletion}%</span>
          </div>
          <div>
            <span className="panel-label">{t("dashboard.profileStrength")}</span>
            <h2>
              {profileCompletion >= 80
                ? t("dashboard.strong")
                : profileCompletion >= 40
                  ? t("dashboard.goodStart")
                  : t("dashboard.buildProfile")}
            </h2>
            <p>
              {missingField
                ? t("dashboard.addField", { field: missingField[1] })
                : t("dashboard.complete")}
            </p>
            <Link to="/profile">
              {t("dashboard.improve")} <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        <section className="panel journey-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">{t("dashboard.myJourney")}</span>
              <h2>{t("dashboard.readiness")}</h2>
            </div>
            <strong>{readiness}%</strong>
          </div>
          <div className="progress">
            <i style={{ width: `${readiness}%` }} />
          </div>
          <div className="milestones">
            {milestoneLabels.map((label, index) => (
              <span
                key={label}
                className={
                  milestoneDone[index] ? "complete" : index === activeMilestone ? "active" : ""
                }
              >
                {milestoneDone[index] ? <Check /> : <i />}
                {label}
              </span>
            ))}
          </div>
        </section>
      </div>
      <section className="dashboard-section">
        <div className="panel-head">
          <div>
            <span className="panel-label">{t("dashboard.dailyMatches")}</span>
            <h2>{t("dashboard.swipeHeading")}</h2>
          </div>
          <Link to="/app/explore">
            {t("dashboard.exploreAllShort")} <ArrowRight size={16} />
          </Link>
        </div>
        {recommendations.length ? (
          <ScholarshipSwipe items={recommendations} dashboard />
        ) : (
          <Empty title={t("dashboard.noMatches")} text={t("common.emptyListings")} />
        )}
      </section>
      <div className="dashboard-grid lower">
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">{t("dashboard.upcoming")}</span>
              <h2>{t("dashboard.deadlinesTasks")}</h2>
            </div>
            <Link to="/applications">{t("dashboard.viewAll")}</Link>
          </div>
          {upcoming.length ? (
            upcoming.map((plan) => {
              const parts = dates.parts(plan.targetDeadline);
              return (
                <Link className="deadline-row" to="/applications" key={plan.id}>
                  <span className="date-box">
                    <strong>{parts?.day ?? "—"}</strong>
                    <small>{parts?.month ?? ""}</small>
                  </span>
                  <div>
                    <strong>{plan.title}</strong>
                    <small>
                      {t(planStatusLabels[plan.status])} ·{" "}
                      {t("dashboard.tasksLeft", { count: plan.tasks.filter((task) => !task.done).length })}
                    </small>
                  </div>
                  <ChevronRight />
                </Link>
              );
            })
          ) : (
            <Empty
              title={t("dashboard.noDeadlines")}
              text={t("dashboard.noDeadlinesText")}
              link="/app/explore"
            />
          )}
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">{t("dashboard.savedLabel")}</span>
              <h2>{t("dashboard.shortlist")}</h2>
            </div>
            <Link to="/saved">{t("dashboard.savedCount", { count: saved.length })}</Link>
          </div>
          {matched
            .filter((m) => saved.includes(m.item.id))
            .slice(0, 3)
            .map((m) => (
              <div className="saved-row" key={m.item.id}>
                <Thumb item={m.item} className="h-[42px] w-[42px] shrink-0 rounded-[9px]" />
                <div>
                  <strong>{m.item.title}</strong>
                  <small>{locationText(m.item)}</small>
                </div>
                {m.match !== null && <span>{m.match}%</span>}
              </div>
            ))}
        </section>
      </div>
    </div>
  );
}

function ScholarshipSwipe({
  items,
  dashboard = false,
}: {
  items: MatchedOpportunity[];
  dashboard?: boolean;
}) {
  const { saved, toggleSaved } = useJourney();
  const { t } = useT();
  const guard = useItemAction();
  const dates = useDates();
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [leaving, setLeaving] = useState<"left" | "right" | null>(null);
  const [history, setHistory] = useState<
    { index: number; itemId: string; addedToSaved: boolean }[]
  >([]);
  const itemKey = items.map((m) => m.item.id).join("|");

  useEffect(() => {
    setIndex(0);
    setDragX(0);
    setLeaving(null);
    setHistory([]);
  }, [itemKey]);

  const current = items[index];
  const decide = (liked: boolean) => {
    if (!current || leaving) return;
    const addedToSaved = liked && !current.item.locked && !saved.includes(current.item.id);
    if (addedToSaved) guard(current.item, () => toggleSaved(current.item.id))();
    setHistory((all) => [...all, { index, itemId: current.item.id, addedToSaved }]);
    setLeaving(liked ? "right" : "left");
    window.setTimeout(() => {
      setIndex((value) => value + 1);
      setDragX(0);
      setLeaving(null);
    }, 260);
  };

  const undo = () => {
    if (!history.length || leaving) return;
    const previous = history[history.length - 1];
    if (previous.addedToSaved && saved.includes(previous.itemId)) void toggleSaved(previous.itemId);
    setHistory((all) => all.slice(0, -1));
    setIndex(previous.index);
    setDragX(0);
  };

  const pointerUp = () => {
    if (dragStart === null) return;
    setDragStart(null);
    if (dragX > 85) decide(true);
    else if (dragX < -85) decide(false);
    else setDragX(0);
  };

  const restart = () => {
    setIndex(0);
    setHistory([]);
    setDragX(0);
    setLeaving(null);
  };

  return (
    <div className={`swipe-workspace ${dashboard ? "dashboard-swipe" : ""}`}>
      <section className="swipe-stage" aria-label={t("explore.swipeDeckLabel")}>
        <div className="swipe-stage-head">
          <div>
            <span>{dashboard ? t("explore.curatedDeck") : t("explore.personalDeck")}</span>
            <strong>
              {t("explore.remaining", {
                left: Math.max(items.length - index, 0),
                total: items.length,
              })}
            </strong>
          </div>
          <span className="swipe-saved-count">
            <Heart fill="currentColor" /> {t("explore.savedCount", { count: saved.length })}
          </span>
        </div>

        <div className="swipe-deck">
          {current ? (
            items.slice(index, index + 3).map((m, offset) => {
              const item = m.item;
              const isTop = offset === 0;
              const rotation = isTop ? dragX / 18 : offset % 2 ? 2.2 : -1.8;
              const translateX = leaving ? (leaving === "right" ? 620 : -620) : isTop ? dragX : 0;
              const translateY = offset * 10;
              const scale = 1 - offset * 0.045;
              return (
                <article
                  className={`swipe-card ${isTop ? "top-card" : ""} ${dragStart !== null && isTop ? "dragging" : ""} ${leaving && isTop ? `leaving-${leaving}` : ""}`}
                  key={item.id}
                  style={{
                    zIndex: 5 - offset,
                    transform: `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg) scale(${scale})`,
                    opacity: 1 - offset * 0.18,
                  }}
                  onPointerDown={
                    isTop
                      ? (event) => {
                          event.currentTarget.setPointerCapture(event.pointerId);
                          setDragStart(event.clientX - dragX);
                        }
                      : undefined
                  }
                  onPointerMove={
                    isTop && dragStart !== null
                      ? (event) => setDragX(event.clientX - dragStart)
                      : undefined
                  }
                  onPointerUp={isTop ? pointerUp : undefined}
                  onPointerCancel={
                    isTop
                      ? () => {
                          setDragStart(null);
                          setDragX(0);
                        }
                      : undefined
                  }
                >
                  {isTop && (
                    <>
                      <span
                        className="swipe-stamp pass"
                        style={{ opacity: Math.min(1, Math.max(0, -dragX / 85)) }}
                      >
                        {t("explore.pass")}
                      </span>
                      <span
                        className="swipe-stamp save"
                        style={{ opacity: Math.min(1, Math.max(0, dragX / 85)) }}
                      >
                        {t("explore.save")}
                      </span>
                    </>
                  )}
                  <div className="swipe-card-image">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.imageAlt ?? ""} draggable={false} />
                    ) : (
                      <Thumb item={item} className="h-full w-full" />
                    )}
                    <span>{t(typeLabels[item.type]).toUpperCase()}</span>
                    {m.match !== null && (
                      <div className="swipe-match">
                        <strong>{m.match}%</strong>
                        <small>{t("explore.matchCaps")}</small>
                      </div>
                    )}
                  </div>
                  <div className="swipe-card-content">
                    <span>{item.institution}</span>
                    <h2>{item.title}</h2>
                    <p className="swipe-location">
                      <MapPin /> {locationText(item)}
                    </p>
                    <div className="swipe-funding">
                      <CircleDollarSign />
                      <div>
                        <small>{t("explore.funding")}</small>
                        <strong>{fundingText(item, t)}</strong>
                      </div>
                    </div>
                    {m.match !== null && (
                    <div
                      className={`swipe-fit ${m.status === "eligible" ? "eligible" : ""}`}
                    >
                      <BadgeCheck />
                      <div>
                        <strong>{t(statusLabels[m.status])}</strong>
                        <p>{m.reason}</p>
                        {m.gap && <em>{m.gap}</em>}
                      </div>
                    </div>
                    )}
                    <Link
                      className="swipe-detail-link"
                      to={`/scholarships/${item.slug}`}
                      onPointerDown={(event) => event.stopPropagation()}
                    >
                      {t("explore.viewFull")} <ArrowRight />
                    </Link>
                    <div className="swipe-deadline">
                      <Calendar />
                      <span>{t("explore.deadline")}</span>
                      <strong>{deadlineLabel(item, dates)}</strong>
                    </div>
                    <SourceNote item={item} stopPointer />
                  </div>
                </article>
              );
            })
          ) : (
            <div className="swipe-finished">
              <span>
                <Trophy />
              </span>
              <h2>{t("explore.reviewedAll")}</h2>
              <p>{t("explore.reviewedText")}</p>
              <div>
                <button className="btn btn-outline" onClick={restart}>
                  <RotateCcw /> {t("explore.reviewAgain")}
                </button>
                <Link className="btn btn-primary" to="/saved">
                  {t("explore.viewSaved")} <ArrowRight />
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="swipe-controls">
          <button
            className="swipe-control undo"
            onClick={undo}
            disabled={!history.length || !!leaving}
            aria-label={t("explore.undoLabel")}
          >
            <RotateCcw />
          </button>
          <button
            className="swipe-control reject"
            onClick={() => decide(false)}
            disabled={!current || !!leaving}
            aria-label={t("explore.passLabel")}
          >
            <X />
          </button>
          <button
            className="swipe-control accept"
            onClick={() => decide(true)}
            disabled={!current || !!leaving}
            aria-label={t("explore.saveLabel")}
          >
            <Heart fill="currentColor" />
          </button>
        </div>
        <div className="swipe-control-labels">
          <span>{t("explore.undo")}</span>
          <span>{t("explore.passShort")}</span>
          <span>{t("explore.saveShort")}</span>
        </div>
      </section>

      {dashboard ? (
        <aside className="dashboard-match-panel">
          <div className="match-panel-heading">
            <span>
              <Target />
            </span>
            <div>
              <h3>
                {current
                  ? current.match !== null
                    ? t("home.profileMatch", { match: current.match })
                    : t("explore.signInToMatch")
                  : t("explore.deckComplete")}
              </h3>
            </div>
          </div>
          {current ? (
            <>
              <p>{t("explore.compareText")}</p>
              <div className="match-signals">
                {current.signals.slice(0, 3).map((signal) => (
                  <div className="match-signal" key={signal.label}>
                    <span>
                      <strong>{signal.label}</strong>
                      <em>{signal.matched ? t("explore.signalMatch") : t("explore.signalGap")}</em>
                    </span>
                    <i>
                      <b style={{ width: signal.matched ? "100%" : "35%" }} />
                    </i>
                  </div>
                ))}
              </div>
              <div className="dashboard-swipe-keys">
                <div>
                  <span className="key-pass">
                    <X />
                  </span>
                  <p>
                    <strong>{t("explore.passShort")}</strong>
                    {t("explore.swipeLeft")}
                  </p>
                </div>
                <div>
                  <span className="key-save">
                    <Heart />
                  </span>
                  <p>
                    <strong>{t("explore.saveShort")}</strong>
                    {t("explore.swipeRight")}
                  </p>
                </div>
              </div>
              <Link to="/profile" className="match-preference-link">
                {t("explore.tune")} <ArrowUpRight />
              </Link>
            </>
          ) : (
            <div className="match-panel-finished">
              <CheckCircle2 />
              <p>{t("explore.reflected")}</p>
              <Link to="/saved">
                {t("explore.openShortlist")} <ArrowRight />
              </Link>
            </div>
          )}
          <small className="match-panel-demo">
            <ShieldCheck /> {t("explore.guidance")}
          </small>
        </aside>
      ) : (
        <aside className="swipe-guide">
          <div className="swipe-guide-card">
            <span className="swipe-guide-icon">
              <MousePointer2 />
            </span>
            <span>{t("explore.howItWorks")}</span>
            <h2>{t("explore.swipeToShortlist")}</h2>
            <div className="gesture-row">
              <i className="left">
                <X />
              </i>
              <div>
                <strong>{t("explore.swipeLeft")}</strong>
                <p>{t("explore.leftHint")}</p>
              </div>
            </div>
            <div className="gesture-row">
              <i className="right">
                <Heart />
              </i>
              <div>
                <strong>{t("explore.swipeRight")}</strong>
                <p>{t("explore.rightHint")}</p>
              </div>
            </div>
            <p className="swipe-demo-note">
              <ShieldCheck /> {t("explore.savingNote")}
            </p>
          </div>
          <div className="swipe-tip">
            <div>
              <strong>{t("explore.tipTitle")}</strong>
              <p>{t("explore.tipText")}</p>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

export function Explore() {
  const { t } = useT();
  const { profile, opportunities, opportunitiesLoaded } = useJourney();
  const matched = useMemo(
    () => personalizedOpportunities(opportunities, profile, t),
    [opportunities, profile, t],
  );
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [swipeMode, setSwipeMode] = useState(
    params.get("mode") === "swipe" || params.get("type") === "Scholarship",
  );
  const type = params.get("type") || "All";
  const typeKey = type.toLowerCase();
  const filtered = useMemo(
    () =>
      matched.filter(
        ({ item }) =>
          (type === "All" || item.type === typeKey) &&
          `${item.title} ${item.institution} ${item.city ?? ""} ${item.country} ${item.studyFields.join(" ")} ${item.summary ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [matched, query, type, typeKey],
  );
  return (
    <div className="app-page explore-page">
      <div className="explore-title">
        <span className="section-kicker">{t("explore.kicker")}</span>
        <h1>{t("explore.title")}</h1>
        <p>{t("explore.subtitle")}</p>
      </div>
      <div className="search-bar">
        <Search />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("explore.searchPlaceholder")}
        />
        <button className="btn btn-primary">{t("explore.searchButton")}</button>
      </div>
      <div className="filter-row">
        <div className="tabs">
          {["All", "Scholarship", "University", "Program"].map((item) => (
            <button
              className={type === item ? "active" : ""}
              key={item}
              onClick={() => {
                setParams(item === "All" ? {} : { type: item });
                setSwipeMode(item === "Scholarship");
              }}
            >
              {item === "All"
                ? t("explore.tabAll")
                : item === "University"
                  ? t("explore.tabUniversity")
                  : item === "Scholarship"
                    ? t("explore.tabScholarship")
                    : t("explore.tabProgram")}
            </button>
          ))}
        </div>
        <div className="explore-view-actions">
          {type === "Scholarship" && (
            <div className="view-switch" aria-label={t("explore.scholarshipView")}>
              <button className={!swipeMode ? "active" : ""} onClick={() => setSwipeMode(false)}>
                <Grid2X2 /> {t("explore.grid")}
              </button>
              <button className={swipeMode ? "active" : ""} onClick={() => setSwipeMode(true)}>
                <Heart /> {t("explore.swipe")}
              </button>
            </div>
          )}
          {!swipeMode && (
            <button className="btn btn-outline">
              <Filter size={16} />
              {t("explore.moreFilters")}
            </button>
          )}
        </div>
      </div>
      <div className="results-meta">
        <span>
          {t("explore.found", { count: filtered.length })}
        </span>
        <span>
          <Info size={15} />
          {t("explore.resultsNote")}
        </span>
      </div>
      {!opportunitiesLoaded ? (
        <Empty title={t("explore.loadingTitle")} text={t("explore.loadingText")} />
      ) : type === "Scholarship" && swipeMode && filtered.length ? (
        <ScholarshipSwipe items={filtered} />
      ) : filtered.length ? (
        <div className="explore-grid">
          {filtered.map((m) => (
            <OpportunityCard m={m} key={m.item.id} />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <Empty title={t("explore.noListings")} text={t("common.emptyListings")} />
      ) : (
        <Empty
          title={t("explore.noResults")}
          text={t("explore.noResultsText")}
        />
      )}
    </div>
  );
}

function Empty({ title, text, link }: { title: string; text: string; link?: string }) {
  const { t } = useT();
  return (
    <div className="empty">
      <Compass />
      <strong>{title}</strong>
      <p>{text}</p>
      {link && (
        <Link to={link} className="btn btn-outline">
          {t("common.exploreOptions")}
        </Link>
      )}
    </div>
  );
}

export function Saved() {
  const { saved, addPlan, plans, profile, opportunities, opportunitiesLoaded, toggleSaved } =
    useJourney();
  const { t } = useT();
  const guard = useItemAction();
  const dates = useDates();
  const items = useMemo(
    () =>
      personalizedOpportunities(opportunities, profile, t).filter((m) => saved.includes(m.item.id)),
    [opportunities, profile, saved, t],
  );
  return (
    <div className="app-page">
      <PageTitle
        kicker={t("saved.kicker")}
        title={t("saved.title")}
        text={t("saved.text")}
      />
      <div className="saved-list">
        {items.length ? (
          items.map((m) => {
            const { item } = m;
            const inPlan = plans.some((p) => p.opportunityId === item.id);
            return (
              <div className="saved-item" key={item.id}>
                <Thumb item={item} className="h-[86px] w-[116px] shrink-0 rounded-[11px]" />
                <div className="saved-main">
                  <span>{t(typeLabels[item.type])}</span>
                  <h3>
                    <Link to={`/scholarships/${item.slug}`}>{item.title}</Link>
                  </h3>
                  <p>
                    <MapPin size={15} />
                    {locationText(item)} · {fundingText(item, t)}
                  </p>
                  <small>{t("saved.deadline", { date: deadlineLabel(item, dates) })}</small>
                  <SourceNote item={item} />
                </div>
                <MatchBadge match={m.match} />
                <div className="saved-actions">
                  <button
                    className="btn btn-primary"
                    disabled={inPlan}
                    onClick={guard(item, () => addPlan(item.id))}
                  >
                    {inPlan ? t("saved.addedToPlan") : t("saved.buildPlan")}
                  </button>
                  <button className="btn btn-quiet" onClick={() => void toggleSaved(item.id)}>
                    {t("saved.remove")}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <Empty
            title={t("saved.emptyTitle")}
            text={
              opportunitiesLoaded && opportunities.length === 0
                ? t("common.emptyListings")
                : t("saved.emptyText")
            }
            link="/app/explore"
          />
        )}
      </div>
    </div>
  );
}

export function ScholarshipDetail() {
  const { scholarshipId } = useParams();
  const { addPlan, plans, profile, saved, toggleSaved, opportunities, opportunitiesLoaded } =
    useJourney();
  const { t } = useT();
  const guard = useItemAction();
  const dates = useDates();
  const fromList = opportunities.find((item) => item.slug === scholarshipId) ?? null;
  const [fetched, setFetched] = useState<{ slug: string; item: OpportunityDTO | null } | null>(
    null,
  );
  useEffect(() => {
    if (fromList || !scholarshipId || !opportunitiesLoaded) return;
    let cancelled = false;
    void fetchOpportunityBySlug(scholarshipId).then((item) => {
      if (!cancelled) setFetched({ slug: scholarshipId, item });
    });
    return () => {
      cancelled = true;
    };
  }, [fromList, scholarshipId, opportunitiesLoaded]);
  const source = fromList ?? (fetched?.slug === scholarshipId ? fetched!.item : null);
  const m = useMemo(
    () => (source ? personalizeOpportunity(source, profile, t) : null),
    [source, profile, t],
  );

  if (!m) {
    const pending = !fromList && (!opportunitiesLoaded || fetched?.slug !== scholarshipId);
    return (
      <div className="app-page">
        <Empty
          title={pending ? t("detail.loading") : t("detail.notFound")}
          text={pending ? t("detail.fetching") : t("detail.notFoundText")}
          link={pending ? undefined : "/app/explore"}
        />
      </div>
    );
  }

  const { item } = m;
  const isSaved = saved.includes(item.id);
  const inPlan = plans.some((plan) => plan.opportunityId === item.id);

  return (
    <div className="app-page scholarship-detail">
      <Link className="detail-back" to="/app/explore">
        <ArrowRight /> {t("detail.back")}
      </Link>
      <section className="scholarship-hero">
        <Thumb item={item} className="h-full min-h-[200px] w-full" />
        {item.imageUrl && item.imageCredit ? (
          // Absolutely positioned so it never takes a grid cell and pushes the photo aside.
          <span className="pointer-events-none absolute bottom-2 left-3 z-[2] max-w-[40%] truncate rounded bg-black/40 px-1.5 py-0.5 text-[9px] text-white/85">
            {item.imageCredit}
          </span>
        ) : null}
        <div className="scholarship-hero-copy">
          <span className="section-kicker">{t(typeLabels[item.type]).toUpperCase()}</span>
          <p>{item.institution}</p>
          <h1>{item.title}</h1>
          <div className="detail-meta">
            <span>
              <MapPin /> {locationText(item)}
            </span>
            <span>
              <Calendar /> {t("detail.deadline", { date: deadlineLabel(item, dates) })}
            </span>
            <span>
              <CircleDollarSign /> {fundingText(item, t)}
            </span>
          </div>
          <div className="detail-actions">
            <button className="btn btn-outline" onClick={guard(item, () => toggleSaved(item.id))}>
              {item.locked ? <Lock /> : <Bookmark fill={isSaved ? "currentColor" : "none"} />}
              {item.locked ? t("card.unlockToSave") : isSaved ? t("detail.savedState") : t("detail.save")}
            </button>
            <button
              className="btn btn-primary"
              disabled={inPlan}
              onClick={guard(item, () => addPlan(item.id))}
            >
              {inPlan
                ? t("detail.inPlan")
                : item.locked
                  ? t("detail.unlockPlan")
                  : t("detail.buildPlan")}
            </button>
          </div>
          {item.locked && <LockBadge item={item} />}
        </div>
        {m.match !== null && (
          <div className={`detail-score ${m.match >= 80 ? "strong" : ""}`}>
            <strong>{m.match}%</strong>
            <span>{t("detail.profileMatch")}</span>
            <small>{t(statusLabels[m.status])}</small>
          </div>
        )}
      </section>

      {item.locked && (
        <section className="panel detail-section">
          <span className="panel-label">
            <Lock size={14} /> {t("detail.locked")}
          </span>
          <h2>{t("detail.unlockHeading", { country: item.country })}</h2>
          <p>{t("detail.unlockText", { country: item.country })}</p>
          <Link className="btn btn-primary" to="/app/pricing">
            {t("detail.seePlans")} <ArrowRight />
          </Link>
        </section>
      )}
      <div className="scholarship-detail-grid" style={item.locked ? { display: "none" } : undefined}>
        <main>
          {item.summary && (
            <section className="panel detail-section">
              <span className="panel-label">{t("detail.about")}</span>
              <h2>{t("detail.summary")}</h2>
              <p>{item.summary}</p>
              <SourceNote item={item} />
            </section>
          )}
          <section className="panel detail-section">
            <span className="panel-label">{t("detail.whyFits")}</span>
            <h2>{t("detail.transparent")}</h2>
            <p>{m.reason}</p>
            <div className="detail-signals">
              {m.signals.map((signal) => (
                <div className={signal.matched ? "matched" : "missing"} key={signal.label}>
                  <span>{signal.matched ? <CheckCircle2 /> : <CircleAlert />}</span>
                  <div>
                    <strong>{signal.label}</strong>
                    <p>{signal.detail}</p>
                  </div>
                  <em>{signal.matched ? t("explore.signalMatch") : t("detail.actionNeeded")}</em>
                </div>
              ))}
            </div>
          </section>
          <section className="panel detail-section requirements-section">
            <span className="panel-label">{t("detail.listedReqs")}</span>
            <h2>{t("detail.whatYouNeed")}</h2>
            <div>
              <p>
                <strong>{t("detail.minGpa")}</strong>
                <span>
                  {item.requirements.minimumGpa === null
                    ? t("detail.noMin")
                    : item.requirements.minimumGpa.toFixed(2)}
                </span>
              </p>
              <p>
                <strong>{t("detail.englishScore")}</strong>
                <span>
                  {item.requirements.minimumIelts === null
                    ? t("detail.noMin")
                    : t("detail.ieltsOrEq", { score: item.requirements.minimumIelts.toFixed(1) })}
                </span>
              </p>
              <p>
                <strong>{t("detail.eligibleDegree")}</strong>
                <span>
                  {item.degreeLevels.length
                    ? item.degreeLevels.map((level) => t(degreeLabels[level])).join(t("detail.or"))
                    : t("detail.notSpecified")}
                </span>
              </p>
              <p>
                <strong>{t("detail.studyFields")}</strong>
                <span>{item.studyFields.length ? item.studyFields.join(", ") : t("detail.allFields")}</span>
              </p>
              {item.requirements.notes && (
                <p>
                  <strong>{t("detail.notes")}</strong>
                  <span>{item.requirements.notes}</span>
                </p>
              )}
            </div>
          </section>
        </main>
        <aside>
          <section className={m.gap ? "detail-gap has-gap" : "detail-gap"}>
            {m.gap ? <CircleAlert /> : <CheckCircle2 />}
            <span>{m.gap ? t("detail.missingReq") : t("detail.reqMet")}</span>
            <h2>{m.gap || t("detail.metText")}</h2>
            <p>{t("detail.updateHint")}</p>
            <Link className="btn btn-outline" to="/profile">
              {t("detail.updateProfile")}
            </Link>
            <Link className="btn btn-primary" to="/prepare">
              {t("detail.openRoadmap")} <ArrowRight />
            </Link>
          </section>
          <small className="detail-disclaimer">
            <ShieldCheck /> {t("detail.disclaimer")}
          </small>
          <SourceNote item={item} />
        </aside>
      </div>
    </div>
  );
}

export function Applications() {
  const { plans, updateTask, updatePlan, addTask, deleteTask, deletePlan, error } = useJourney();
  const { t } = useT();
  const dates = useDates();
  const [newTasks, setNewTasks] = useState<Record<string, string>>({});
  const [newDates, setNewDates] = useState<Record<string, string>>({});
  return (
    <div className="app-page">
      <PageTitle
        kicker={t("applications.kicker")}
        title={t("applications.title")}
        text={t("applications.text")}
        action={
          <Link to="/app/explore" className="btn btn-primary">
            <Plus size={17} />
            {t("applications.add")}
          </Link>
        }
      />
      {error && (
        <p role="alert" className="mb-4 text-[12px] font-bold text-[#9d3f68]">
          {error}
        </p>
      )}
      {plans.length ? (
        <div className="plans">
          {plans.map((plan) => {
            const progress = plan.tasks.length
              ? Math.round((plan.tasks.filter((task) => task.done).length / plan.tasks.length) * 100)
              : 0;
            return (
              <section className="plan panel" key={plan.id}>
                <div className="plan-head">
                  <div>
                    <span>{t("applications.application")}</span>
                    <h2>{plan.title}</h2>
                    <p>
                      <Calendar size={15} />
                      {t("applications.targetDeadline", { date: dates.full(plan.targetDeadline) ?? t("applications.notSet") })}
                      <input
                        type="date"
                        aria-label={t("applications.changeDeadline")}
                        className="ml-2 rounded-md bg-[#f8f6f9] px-2 py-0.5 text-[11px]"
                        value={plan.targetDeadline?.slice(0, 10) ?? ""}
                        onChange={(e) =>
                          void updatePlan(plan.id, { targetDeadline: e.target.value || null })
                        }
                      />
                    </p>
                  </div>
                  <div className="plan-controls">
                    <div className="mini-progress">
                      <strong>{progress}%</strong>
                      <span>
                        <i style={{ width: `${progress}%` }} />
                      </span>
                    </div>
                    <select
                      value={plan.status}
                      onChange={(e) => void updatePlan(plan.id, { status: e.target.value as PlanStatus })}
                    >
                      {planStatuses.map((status) => (
                        <option key={status} value={status}>
                          {t(planStatusLabels[status])}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-lg text-[#d9554a] hover:bg-[#ffe9e7]"
                      aria-label={t("applications.removeAria", { title: plan.title })}
                      title={t("applications.removePlan")}
                      onClick={() => {
                        if (window.confirm(t("applications.confirmRemove", { title: plan.title })))
                          void deletePlan(plan.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="task-list">
                  {plan.tasks.map((task) => (
                    <div className="flex items-center gap-2" key={task.id}>
                      <button
                        className={task.done ? "task done min-w-0 flex-1" : "task min-w-0 flex-1"}
                        onClick={() => void updateTask(plan.id, task.id, { done: !task.done })}
                      >
                        <span>{task.done && <Check />}</span>
                        <strong>{task.title}</strong>
                        <small>{dates.full(task.dueDate) ?? t("applications.noDate")}</small>
                      </button>
                      <button
                        type="button"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#d9554a] hover:bg-[#ffe9e7]"
                        aria-label={t("applications.deleteTask", { title: task.title })}
                        onClick={() => void deleteTask(plan.id, task.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <form
                  className="add-task"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const title = newTasks[plan.id]?.trim();
                    if (title) {
                      void addTask(plan.id, title, newDates[plan.id] || null);
                      setNewTasks((all) => ({ ...all, [plan.id]: "" }));
                      setNewDates((all) => ({ ...all, [plan.id]: "" }));
                    }
                  }}
                >
                  <Plus size={17} />
                  <input
                    value={newTasks[plan.id] || ""}
                    onChange={(e) => setNewTasks((all) => ({ ...all, [plan.id]: e.target.value }))}
                    placeholder={t("applications.addTaskPlaceholder")}
                  />
                  <input
                    type="date"
                    aria-label={t("applications.taskDue")}
                    className="rounded-md bg-[#f8f6f9] px-2 text-[11px]"
                    value={newDates[plan.id] || ""}
                    onChange={(e) => setNewDates((all) => ({ ...all, [plan.id]: e.target.value }))}
                  />
                  <button>{t("applications.addTask")}</button>
                </form>
              </section>
            );
          })}
        </div>
      ) : (
        <Empty
          title={t("applications.emptyTitle")}
          text={t("applications.emptyText")}
          link="/app/explore"
        />
      )}
    </div>
  );
}

function PageTitle({
  kicker,
  title,
  text,
  action,
}: {
  kicker?: string;
  title: string;
  text: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        {kicker && <span className="section-kicker">{kicker}</span>}
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {action}
    </div>
  );
}

export function Prepare() {
  const { t } = useT();
  const { plans, opportunities, roadmap } = useJourney();
  const plan = plans.find((item) => item.id === roadmap?.activePlanId) ?? plans[0] ?? null;
  if (!plan) {
    return (
      <div className="app-page prepare-roadmap-page">
        <div className="prepare-heading">
          <div>
            <span className="section-kicker">{t("prepare.kicker")}</span>
            <h1>{t("prepare.title")}</h1>
            <p>{t("prepare.subtitle")}</p>
          </div>
        </div>
        <Empty
          title={t("prepare.chooseTarget")}
          text={t("prepare.chooseTargetText")}
          link="/app/explore"
        />
      </div>
    );
  }
  const opportunity = opportunities.find((item) => item.id === plan.opportunityId) ?? null;
  return <PrepareRoadmap plan={plan} opportunity={opportunity} />;
}

function PrepareRoadmap({
  plan,
  opportunity,
}: {
  plan: PlanDTO;
  opportunity: OpportunityDTO | null;
}) {
  const { plans, profile, roadmap, profileCompletion, updateRoadmap } = useJourney();
  const { t } = useT();
  const dates = useDates();
  const [selectedMilestone, setSelectedMilestone] = useState("academic");
  const completedStages: RoadmapStage[] = roadmap?.completedStages ?? [];

  const deadlineIso = plan.targetDeadline ?? opportunity?.deadline ?? null;
  const days = daysUntil(deadlineIso);
  const target = {
    name: opportunity?.institution ?? plan.title,
    program: opportunity?.title ?? plan.title,
    location: opportunity ? locationText(opportunity) : t("prepare.destinationFallback"),
    gpa: opportunity?.requirements.minimumGpa ?? null,
    ielts: opportunity?.requirements.minimumIelts ?? null,
    deadline: dates.full(deadlineIso) ?? opportunity?.deadlineNote ?? t("card.seeOfficial"),
    days,
  };
  const urgent = target.days !== null && target.days >= 0 && target.days < 60;
  const profileGpa = profile?.gpa ?? null;
  const ielts = profile?.englishTest === "ielts" ? (profile.englishScore ?? null) : null;
  const hasTarget = true;
  const meetsGpa = target.gpa === null || (profileGpa !== null && profileGpa >= target.gpa);
  const meetsIelts = target.ielts === null || (ielts !== null && ielts >= target.ielts);
  const hasBuild = completedStages.includes("build");
  const hasReview = completedStages.includes("review");
  const hasSubmit =
    completedStages.includes("submit") ||
    plans.some((item) => item.status === "submitted" || item.status === "accepted");

  const gpaRequirement =
    target.gpa === null
      ? t("prepare.gpaNone", { name: target.name })
      : t("prepare.gpaListed", {
          name: target.name,
          gpa: target.gpa.toFixed(2),
          profile:
            profileGpa === null
              ? t("prepare.gpaProfileNone")
              : t("prepare.gpaProfileHas", { gpa: profileGpa.toFixed(2) }),
        });
  const gpaMissing =
    target.gpa === null
      ? t("prepare.gpaMissNone")
      : profileGpa === null
        ? t("prepare.gpaMissAdd")
        : meetsGpa
          ? t("prepare.gpaMissAbove", { diff: Math.abs(profileGpa - target.gpa).toFixed(2) })
          : t("prepare.gpaMissBelow", { diff: (target.gpa - profileGpa).toFixed(2) });
  const ieltsRequirement =
    target.ielts === null
      ? t("prepare.ieltsNone", { name: target.name })
      : t("prepare.ieltsListed", {
          name: target.name,
          ielts: target.ielts.toFixed(1),
          profile:
            ielts === null
              ? t("prepare.ieltsProfileNone")
              : t("prepare.ieltsProfileHas", { ielts: ielts.toFixed(1) }),
        });
  const ieltsMissing =
    target.ielts === null
      ? t("prepare.ieltsMissNone")
      : meetsIelts
        ? t("prepare.ieltsMissMet")
        : ielts === null
          ? t("prepare.ieltsMissEnter")
          : t("prepare.ieltsMissBelow", { diff: (target.ielts - ielts).toFixed(1) });
  const ieltsProgress =
    target.ielts === null || meetsIelts
      ? 100
      : ielts === null
        ? 0
        : Math.round(Math.min(92, (ielts / target.ielts) * 100));
  const submitRequirement = t("prepare.submitReq", {
    name: target.name,
    deadline: target.deadline,
    extra: urgent && target.days !== null ? t("prepare.submitExtra", { days: target.days }) : "",
  });

  type RoadmapStatus = "complete" | "current" | "upcoming" | "locked";
  type RoadmapMilestone = {
    id: string;
    number: string;
    title: string;
    short: string;
    icon: typeof Compass;
    status: RoadmapStatus;
    progress: number;
    why: string;
    requirement: string;
    missing: string;
    actions: string[];
    criteria: string;
    resource: string;
    resourcePath: string;
  };

  const milestones = useMemo<RoadmapMilestone[]>(() => {
    const discoveryComplete = hasTarget;
    const eligibilityComplete = discoveryComplete && meetsGpa;
    const academicComplete = eligibilityComplete && meetsIelts;
    const buildComplete = academicComplete && hasBuild;
    const reviewComplete = buildComplete && hasReview;
    const statusFor = (complete: boolean, available: boolean, current: boolean): RoadmapStatus =>
      complete ? "complete" : !available ? "locked" : current ? "current" : "upcoming";

    return [
      {
        id: "discover",
        number: "01",
        title: t("prepare.m1.title"),
        short: t("prepare.m1.short"),
        icon: Compass,
        status: statusFor(discoveryComplete, true, !discoveryComplete),
        progress: discoveryComplete ? 100 : 60,
        why: t("prepare.m1.why"),
        requirement: t("prepare.m1.req", {
          program: target.program,
          name: target.name,
          location: target.location,
        }),
        missing: discoveryComplete
          ? t("prepare.m1.missOk")
          : t("prepare.m1.missGap"),
        actions: [t("prepare.m1.a1"), t("prepare.m1.a2")],
        criteria: t("prepare.m1.criteria"),
        resource: t("prepare.m1.resource"),
        resourcePath: "/explore",
      },
      {
        id: "eligibility",
        number: "02",
        title: t("prepare.m2.title"),
        short: t("prepare.m2.short"),
        icon: BadgeCheck,
        status: statusFor(meetsGpa && discoveryComplete, discoveryComplete, !meetsGpa),
        progress: meetsGpa ? 100 : 72,
        why: t("prepare.m2.why"),
        requirement: gpaRequirement,
        missing: gpaMissing,
        actions: [t("prepare.m2.a1"), t("prepare.m2.a2")],
        criteria: t("prepare.m2.criteria"),
        resource: t("prepare.m2.resource"),
        resourcePath: "/profile",
      },
      {
        id: "academic",
        number: "03",
        title: t("prepare.m3.title"),
        short: t("prepare.m3.short"),
        icon: Languages,
        status: statusFor(meetsIelts && meetsGpa, meetsGpa, meetsGpa && !meetsIelts),
        progress: ieltsProgress,
        why: t("prepare.m3.why"),
        requirement: ieltsRequirement,
        missing: ieltsMissing,
        actions: meetsIelts
          ? [t("prepare.m3.a1"), t("prepare.m3.a2")]
          : [t("prepare.m3.b1"), t("prepare.m3.b2"), t("prepare.m3.b3")],
        criteria:
          target.ielts === null
            ? t("prepare.m3.criteriaNone")
            : t("prepare.m3.criteria", { ielts: target.ielts.toFixed(1) }),
        resource: t("prepare.m3.resource"),
        resourcePath: "/profile",
      },
      {
        id: "build",
        number: "04",
        title: t("prepare.m4.title"),
        short: t("prepare.m4.short"),
        icon: FileCheck2,
        status: statusFor(hasBuild, meetsIelts, meetsIelts && !hasBuild),
        progress: hasBuild ? 100 : meetsIelts ? 45 : 0,
        why: t("prepare.m4.why"),
        requirement: t("prepare.m4.req", { program: target.program }),
        missing: hasBuild
          ? t("prepare.m4.missDone")
          : t("prepare.m4.missGap"),
        actions: [t("prepare.m4.a1"), t("prepare.m4.a2"), t("prepare.m4.a3")],
        criteria: t("prepare.m4.criteria"),
        resource: t("prepare.m4.resource"),
        resourcePath: "/applications",
      },
      {
        id: "review",
        number: "05",
        title: t("prepare.m5.title"),
        short: t("prepare.m5.short"),
        icon: ClipboardCheck,
        status: statusFor(hasReview, hasBuild, hasBuild && !hasReview),
        progress: hasReview ? 100 : hasBuild ? 25 : 0,
        why: t("prepare.m5.why"),
        requirement: t("prepare.m5.req", { name: target.name }),
        missing: hasBuild
          ? t("prepare.m5.missDone")
          : t("prepare.m5.missGap"),
        actions: [t("prepare.m5.a1"), t("prepare.m5.a2"), t("prepare.m5.a3")],
        criteria: t("prepare.m5.criteria"),
        resource: t("prepare.m5.resource"),
        resourcePath: "/applications",
      },
      {
        id: "submit",
        number: "06",
        title: t("prepare.m6.title"),
        short: t("prepare.m6.short"),
        icon: Rocket,
        status: statusFor(hasSubmit, hasReview, hasReview && !hasSubmit),
        progress: hasSubmit ? 100 : hasReview ? 20 : 0,
        why: t("prepare.m6.why"),
        requirement: submitRequirement,
        missing: hasReview
          ? t("prepare.m6.missDone")
          : t("prepare.m6.missGap"),
        actions: [t("prepare.m6.a1"), t("prepare.m6.a2"), t("prepare.m6.a3")],
        criteria: t("prepare.m6.criteria"),
        resource: t("prepare.m6.resource"),
        resourcePath: "/applications",
      },
    ];
  }, [
    hasBuild,
    hasReview,
    hasSubmit,
    hasTarget,
    meetsGpa,
    meetsIelts,
    target,
    gpaRequirement,
    gpaMissing,
    ieltsRequirement,
    ieltsMissing,
    ieltsProgress,
    submitRequirement,
    t,
  ]);

  const selected = milestones.find((item) => item.id === selectedMilestone) || milestones[2];
  const completedCount = milestones.filter((item) => item.status === "complete").length;
  const overallProgress = Math.round(
    milestones.reduce((total, milestone) => total + milestone.progress, 0) / milestones.length,
  );
  const nextMilestone =
    milestones.find((item) => item.status === "current") ||
    milestones.find((item) => item.status === "upcoming");
  const selectedHasGap =
    (selected.id === "academic" && !meetsIelts) || (selected.id === "eligibility" && !meetsGpa);

  const markComplete = (id: string) => {
    if (!(roadmapStages as string[]).includes(id)) return;
    const stage = id as RoadmapStage;
    void updateRoadmap({
      completedStages: completedStages.includes(stage)
        ? completedStages.filter((item) => item !== stage)
        : [...completedStages, stage],
    });
  };

  return (
    <div className="app-page prepare-roadmap-page">
      <div className="prepare-heading">
        <div>
          <span className="section-kicker">{t("prepare.kicker")}</span>
          <h1>{t("prepare.title")}</h1>
          <p>{t("prepare.subtitle")}</p>
        </div>
        <div className="prepare-demo-pill">
          <div>
            <strong>{t("prepare.personalized")}</strong>
            <span>{t("prepare.synced")}</span>
          </div>
        </div>
      </div>

      <section className="prepare-overview">
        <div
          className="prepare-progress-ring"
          style={{ "--prepare-progress": `${overallProgress * 3.6}deg` } as React.CSSProperties}
        >
          <div>
            <strong>{overallProgress}%</strong>
            <span>{t("prepare.ready")}</span>
          </div>
        </div>
        <div className="prepare-overview-copy">
          <span>{t("prepare.overall")}</span>
          <h2>{t("prepare.milestonesAchieved", { count: completedCount })}</h2>
          <p>
            {nextMilestone
              ? t("prepare.nextStep", { title: nextMilestone.title.toLowerCase() })
              : t("prepare.complete")}
          </p>
          <div className="prepare-achievements">
            <span>
              <Trophy /> {t("prepare.milestonesCount", { count: completedCount })}
            </span>
            <span>
              <Award /> {t("prepare.profileStrength", { percent: profileCompletion })}
            </span>
            {urgent && (
              <span className="urgent">
                <Clock3 /> {t("prepare.daysToDeadline", { days: target.days ?? 0 })}
              </span>
            )}
          </div>
        </div>
        <div className="prepare-controls">
          <label>
            {t("prepare.activeApp")}
            <select
              value={plan.id}
              onChange={(event) => void updateRoadmap({ activePlanId: event.target.value })}
            >
              {plans.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <small>
            <Info /> {t("prepare.updateHintBefore")}<Link to="/profile">{t("prepare.profileLink")}</Link>
          </small>
        </div>
      </section>

      <div className="prepare-context-bar">
        <div>
          <Building2 />
          <span>{t("prepare.target")}</span>
          <strong>{target.program}</strong>
          <small>
            {target.name} · {target.location}
          </small>
        </div>
        <div className={urgent ? "deadline urgent" : "deadline"}>
          <Calendar />
          <span>{t("prepare.appDeadline")}</span>
          <strong>{target.deadline}</strong>
          <small>
            {target.days === null
              ? t("prepare.checkSite")
              : target.days >= 0
                ? t("prepare.daysRemaining", { days: target.days })
                : t("prepare.deadlinePassed")}
          </small>
        </div>
        <Link to="/app/explore">
          {t("prepare.changeGoal")} <ArrowUpRight />
        </Link>
      </div>

      <div className="roadmap-workspace">
        <section className="roadmap-canvas">
          <div className="roadmap-canvas-head">
            <div>
              <span className="panel-label">{t("prepare.journeyMap")}</span>
              <h2>{t("prepare.followPath")}</h2>
              <p>{t("prepare.selectHint")}</p>
            </div>
            <div className="roadmap-legend">
              <span>
                <i className="complete" /> {t("prepare.status.complete")}
              </span>
              <span>
                <i className="current" /> {t("prepare.status.current")}
              </span>
              <span>
                <i className="upcoming" /> {t("prepare.status.upcoming")}
              </span>
              <span>
                <i className="locked" /> {t("prepare.status.locked")}
              </span>
            </div>
          </div>
          <div className="roadmap-map">
            <div className="roadmap-scenery" aria-hidden="true">
              <span className="map-cloud cloud-one" />
              <span className="map-cloud cloud-two" />
              <span className="map-doodle doodle-plane">
                <Plane />
              </span>
              <span className="map-doodle doodle-flag">
                <Flag />
              </span>
              <span className="map-doodle doodle-book">
                <BookOpen />
              </span>
              <span className="map-doodle doodle-cap">
                <GraduationCap />
              </span>
              <span className="map-land land-one" />
              <span className="map-land land-two" />
            </div>
            <svg
              className="roadmap-path"
              viewBox="0 0 900 410"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M145 105 C275 105 315 105 450 105 S715 105 755 105 C830 105 840 180 820 220 C800 265 735 300 755 305 C620 305 580 305 450 305 S270 305 145 305" />
              <path
                className="roadmap-path-progress"
                d="M145 105 C275 105 315 105 450 105 S715 105 755 105 C830 105 840 180 820 220 C800 265 735 300 755 305 C620 305 580 305 450 305 S270 305 145 305"
                pathLength="100"
                style={{ strokeDasharray: `${overallProgress} 100` }}
              />
            </svg>
            <div className="roadmap-grid">
              {milestones.map((milestone) => {
                const Icon = milestone.icon;
                return (
                  <button
                    key={milestone.id}
                    className={`roadmap-node ${milestone.status} ${selected.id === milestone.id ? "selected" : ""}`}
                    onClick={() => setSelectedMilestone(milestone.id)}
                    aria-pressed={selected.id === milestone.id}
                  >
                    <span className="roadmap-node-number">{milestone.number}</span>
                    <span className="roadmap-node-icon">
                      {milestone.status === "complete" ? (
                        <Check />
                      ) : milestone.status === "locked" ? (
                        <Lock />
                      ) : (
                        <Icon />
                      )}
                    </span>
                    <span className="roadmap-node-status">
                      {t(`prepare.status.${milestone.status}`)}
                    </span>
                    <strong>{milestone.title}</strong>
                    <small>{milestone.short}</small>
                    <span className="roadmap-node-progress">
                      <i style={{ width: `${milestone.progress}%` }} />
                    </span>
                    <em>{milestone.progress}%</em>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className={`milestone-detail ${selected.status}`}>
          <div className="milestone-detail-top">
            <span className="milestone-detail-icon">
              <selected.icon />
            </span>
            <div>
              <span>
                {t("prepare.milestoneCaps", {
                  number: selected.number,
                  status: t(`prepare.status.${selected.status}`).toUpperCase(),
                })}
              </span>
              <h2>{selected.title}</h2>
            </div>
            <strong>{selected.progress}%</strong>
          </div>
          <div className="milestone-detail-progress">
            <i style={{ width: `${selected.progress}%` }} />
          </div>

          {selected.status === "locked" && (
            <div className="milestone-locked-note">
              <Lock />
              <p>{t("prepare.lockedNote")}</p>
            </div>
          )}

          <div className="milestone-detail-section">
            <span>
              <Route /> {t("prepare.whyMatters")}
            </span>
            <p>{selected.why}</p>
          </div>
          <div className="milestone-requirement">
            <span>
              <Target /> {t("prepare.personalReq")}
            </span>
            <strong>{selected.requirement}</strong>
            <p className={selectedHasGap ? "gap" : ""}>
              {selectedHasGap ? <CircleAlert /> : <CheckCircle2 />}
              {selected.missing}
            </p>
          </div>
          <div className="milestone-detail-section">
            <span>
              <Flag /> {t("prepare.actions")}
            </span>
            <ol>
              {selected.actions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ol>
          </div>
          <div className="milestone-completion">
            <span>
              <BadgeCheck /> {t("prepare.criteria")}
            </span>
            <p>{selected.criteria}</p>
          </div>
          <div className="milestone-resource">
            <span>
              <BookOpen /> {t("prepare.resource")}
            </span>
            <Link to={selected.resourcePath}>
              {selected.resource} <ArrowUpRight />
            </Link>
          </div>
          {["build", "review", "submit"].includes(selected.id) && selected.status !== "locked" && (
            <div className="milestone-detail-actions">
              <button className="btn btn-primary" onClick={() => markComplete(selected.id)}>
                {selected.status === "complete" ? (
                  <>
                    <Check /> {t("prepare.completed")}
                  </>
                ) : (
                  t("prepare.markComplete")
                )}
              </button>
            </div>
          )}
          <small className="milestone-source-note">
            <ShieldCheck /> {t("prepare.guidance")}
          </small>
          {opportunity && <SourceNote item={opportunity} />}
        </aside>
      </div>
    </div>
  );
}

const PLAN_LABELS: Record<PlanKey, string> = {
  starter: "pricing.plan.starter",
  plus: "pricing.plan.plus",
  multi: "pricing.plan.multi",
  buffet: "pricing.plan.buffet",
};

const PRICING_PLANS: {
  key: PlanKey;
  priceThb: number;
  countries: string;
  description: string;
}[] = [
  {
    key: "starter",
    priceThb: 199,
    countries: "pricing.countries.starter",
    description: "pricing.desc.starter",
  },
  {
    key: "plus",
    priceThb: 299,
    countries: "pricing.countries.plus",
    description: "pricing.desc.plus",
  },
  {
    key: "multi",
    priceThb: 499,
    countries: "pricing.countries.multi",
    description: "pricing.desc.multi",
  },
  {
    key: "buffet",
    priceThb: 2199,
    countries: "pricing.countries.buffet",
    description: "pricing.desc.buffet",
  },
];

const destinationOptions = [
  "United Kingdom",
  "Australia",
  "United States",
  "Canada",
  "Japan",
  "Germany",
  "Netherlands",
  "New Zealand",
  "Singapore",
  "South Korea",
  "France",
  "Ireland",
];

const isTestMode = (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "").startsWith("pk_test_");

export function Pricing() {
  const { status, entitlement, startCheckout, openPortal, saveCountries, refresh } = useJourney();
  const { t } = useT();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const checkout = params.get("checkout");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [countryDraft, setCountryDraft] = useState("");
  const [countryError, setCountryError] = useState("");
  const live = ["active", "trialing"].includes(entitlement.status) && entitlement.plan !== null;
  const unlimited = entitlement.countryLimit === null;

  // After Stripe redirects back, the webhook may take a moment: refresh the journey once.
  useEffect(() => {
    if (checkout !== "success") return;
    const timer = window.setTimeout(() => {
      void refresh();
      setParams({}, { replace: true });
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [checkout, refresh, setParams]);

  const choose = async (plan: PlanKey) => {
    if (status !== "ready") {
      navigate("/login?next=/app/pricing");
      return;
    }
    setBusy(plan);
    setMessage("");
    const result = await startCheckout(plan);
    if (result.url) {
      window.location.href = result.url;
      return;
    }
    if (result.usePortal) {
      const portal = await openPortal();
      if (portal.url) {
        window.location.href = portal.url;
        return;
      }
      setMessage(portal.error ?? t("pricing.billingFailed"));
    } else {
      setMessage(result.error ?? t("pricing.checkoutFailed"));
    }
    setBusy(null);
  };

  const manage = async () => {
    setBusy("portal");
    setMessage("");
    const portal = await openPortal();
    if (portal.url) {
      window.location.href = portal.url;
      return;
    }
    setMessage(portal.error ?? t("pricing.billingFailed"));
    setBusy(null);
  };

  const persistCountries = async (next: string[]) => {
    setCountryError("");
    setBusy("countries");
    const result = await saveCountries(next);
    setBusy(null);
    if (!result.ok) setCountryError(result.error ?? t("pricing.saveFailed"));
    return result.ok;
  };

  const addCountry = async () => {
    const name = countryDraft.trim();
    if (!name) return;
    if (entitlement.selectedCountries.some((c) => c.toLowerCase() === name.toLowerCase())) {
      setCountryDraft("");
      return;
    }
    if (!unlimited && entitlement.selectedCountries.length >= (entitlement.countryLimit ?? 0)) {
      setCountryError(t("pricing.limitReached", { limit: entitlement.countryLimit ?? 0 }));
      return;
    }
    if (await persistCountries([...entitlement.selectedCountries, name])) setCountryDraft("");
  };

  return (
    <main className="pricing-page">
      <PageTitle
        title={t("pricing.title")}
        text={
          <>
            {t("pricing.text1")}
            <br />
            {t("pricing.text2")}
          </>
        }
      />
      {checkout === "success" && (
        <p className="panel" role="status">
          {t("pricing.success")}
        </p>
      )}
      {checkout === "cancel" && (
        <p className="panel" role="status">
          {t("pricing.cancelled")}
        </p>
      )}
      {message && (
        <p className="panel" role="alert">
          {message}
        </p>
      )}
      {isTestMode && (
        <p className="text-center text-[12px] text-[#756d7e]">
          {t("pricing.testMode")}
        </p>
      )}
      <div className="pricing-grid">
        {PRICING_PLANS.map((plan) => {
          const current = live && entitlement.plan === plan.key;
          return (
            <article
              className={plan.key === "buffet" ? "price-card featured" : "price-card"}
              key={plan.key}
            >
              {plan.key === "buffet" && <span className="popular">{t("pricing.unlimitedAccess")}</span>}
              <h2>{t(PLAN_LABELS[plan.key])}</h2>
              <p>{t(plan.description)}</p>
              <div className="price">
                ฿{plan.priceThb.toLocaleString("en-US")}
                <small>{t("pricing.perMonth")}</small>
              </div>
              <div className="country-access">
                <small>{t("pricing.countryAccess")}</small>
                <strong>{t(plan.countries)}</strong>
              </div>
              {current ? (
                <>
                  <button className="btn btn-outline" disabled>
                    {t("pricing.currentPlan")}
                  </button>
                  <button className="btn btn-quiet" onClick={() => void manage()} disabled={busy !== null}>
                    {busy === "portal" ? t("pricing.opening") : t("pricing.manage")}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => void choose(plan.key)}
                  disabled={busy !== null}
                  className={plan.key === "buffet" ? "btn btn-gold" : "btn btn-outline"}
                >
                  {busy === plan.key
                    ? t("pricing.redirecting")
                    : live
                      ? t("pricing.switchTo", { plan: t(PLAN_LABELS[plan.key]) })
                      : t("pricing.choose", { plan: t(PLAN_LABELS[plan.key]) })}
                </button>
              )}
              <ul>
                <li>
                  <Check />
                  {t("pricing.accessTo", { countries: t(plan.countries).toLowerCase() })}
                </li>
                <li>
                  <Check />
                  {t("pricing.unlimitedUni")}
                </li>
              </ul>
            </article>
          );
        })}
      </div>
      {live && entitlement.plan && (
        <section className="panel mt-6" aria-labelledby="country-picker-title">
          <h2 id="country-picker-title">{t("pricing.yourCountries")}</h2>
          {unlimited ? (
            <p>{t("pricing.buffetCovers")}</p>
          ) : (
            <>
              <p>
                {t("pricing.chooseUpTo", {
                  limit: entitlement.countryLimit ?? 0,
                  unit:
                    entitlement.countryLimit === 1 ? t("pricing.unitOne") : t("pricing.unitMany"),
                  count: entitlement.selectedCountries.length,
                })}
              </p>
              <div className="my-3 flex flex-wrap gap-2">
                {entitlement.selectedCountries.map((country) => (
                  <span
                    key={country}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#fae5ed] px-3 py-1 text-[13px] font-bold text-[#9d3f68]"
                  >
                    {country}
                    <button
                      aria-label={t("pricing.removeCountry", { country })}
                      disabled={busy !== null}
                      onClick={() =>
                        void persistCountries(entitlement.selectedCountries.filter((c) => c !== country))
                      }
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
              <form
                className="flex flex-wrap gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void addCountry();
                }}
              >
                <input
                  list="destination-options"
                  value={countryDraft}
                  maxLength={80}
                  onChange={(event) => setCountryDraft(event.target.value)}
                  placeholder={t("pricing.addCountry")}
                  aria-label={t("pricing.addCountry")}
                  className="min-w-[200px] rounded-lg border border-[#e4d9e6] px-3 py-2"
                />
                <datalist id="destination-options">
                  {destinationOptions.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                <button className="btn btn-primary" type="submit" disabled={busy !== null}>
                  {t("pricing.addCountryBtn")}
                </button>
              </form>
              {countryError && (
                <p role="alert" className="mt-2 text-[13px] text-[#b3261e]">
                  {countryError}
                </p>
              )}
            </>
          )}
        </section>
      )}
      {entitlement.status === "past_due" && (
        <p className="panel mt-6" role="alert">
          {t("pricing.pastDue")}{" "}
          <button className="text-action" onClick={() => void manage()}>
            {t("pricing.manage")}
          </button>
        </p>
      )}
    </main>
  );
}

type ProfileFormState = Omit<
  StudentProfileDTO,
  "gpa" | "graduationYear" | "englishScore" | "annualBudgetThb"
> & {
  gpa: string;
  graduationYear: string;
  englishScore: string;
  annualBudgetThb: string;
};

const numText = (value: number | null) => (value === null ? "" : String(value));
const parseNumber = (value: string): number | null => {
  const text = value.replace(/,/g, "").trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
};
const toForm = (profile: StudentProfileDTO): ProfileFormState => ({
  ...profile,
  gpa: numText(profile.gpa),
  graduationYear: numText(profile.graduationYear),
  englishScore: numText(profile.englishScore),
  annualBudgetThb: numText(profile.annualBudgetThb),
});

const countrySuggestions = [
  "United Kingdom",
  "Australia",
  "Japan",
  "United States",
  "Canada",
  "Germany",
  "Netherlands",
  "New Zealand",
  "Singapore",
  "South Korea",
];

export function Profile() {
  const { profile, settings } = useJourney();
  if (!profile || !settings) return null;
  return <ProfileEditor profile={profile} settings={settings} />;
}

function ProfileEditor({
  profile,
  settings,
}: {
  profile: StudentProfileDTO;
  settings: SettingsDTO;
}) {
  const { updateProfile, updateSettings, error, fieldErrors, clearError } = useJourney();
  const { t } = useT();
  const [profileParams] = useSearchParams();
  const profileLocation = useLocation();
  const [form, setForm] = useState<ProfileFormState>(() => toForm(profile));
  const [settingsForm, setSettingsForm] = useState<SettingsDTO>(settings);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<"personal" | "study" | "settings">("personal");
  useEffect(() => {
    clearError();
  }, [activeSection, clearError]);
  useEffect(() => {
    const showSettings =
      profileLocation.pathname === "/settings" || profileParams.get("section") === "settings";
    setActiveSection(showSettings ? "settings" : "personal");
  }, [profileLocation.pathname, profileParams]);
  const text = (name: keyof ProfileFormState) => ({
    value: form[name] as string,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [name]: event.target.value })),
  });
  const fieldError = (name: string) =>
    fieldErrors[name] ?? fieldErrors[`profile.${name}`] ?? fieldErrors[`settings.${name}`];
  const Err = ({ name }: { name: string }) =>
    fieldError(name) ? (
      <small role="alert" className="text-[11px] font-bold text-[#c2453b]">
        {fieldError(name)}
      </small>
    ) : null;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    let ok: boolean;
    if (activeSection === "settings") {
      ok = await updateSettings(settingsForm);
    } else {
      // email is read-only; everything else is sent as typed values.
      const { email: _email, ...rest } = form;
      void _email;
      ok = await updateProfile({
        ...rest,
        gpa: parseNumber(form.gpa),
        graduationYear: parseNumber(form.graduationYear),
        englishScore: parseNumber(form.englishScore),
        annualBudgetThb: parseNumber(form.annualBudgetThb),
      });
    }
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };
  return (
    <div className="app-page">
      <PageTitle
        kicker={t("profile.kicker")}
        title={t("profile.title")}
        text={t("profile.text")}
      />
      {activeSection !== "settings" && (
        <nav className="profile-menu" aria-label={t("profile.sections")}>
          <button
            type="button"
            className={activeSection === "personal" ? "active" : ""}
            onClick={() => setActiveSection("personal")}
          >
            {t("profile.personalTab")}
          </button>
          <button
            type="button"
            className={activeSection === "study" ? "active" : ""}
            onClick={() => setActiveSection("study")}
          >
            {t("profile.studyTab")}
          </button>
        </nav>
      )}
      {activeSection === "personal" && <ProfileAssets />}
      <form className="profile-form" onSubmit={submit}>
        {activeSection === "personal" && (
          <section className="panel profile-section-panel">
            <h2>{t("profile.personalTab")}</h2>
            <p>{t("profile.personalHint")}</p>
            <div className="form-grid">
              <label>
                {t("profile.fullName")}
                <input autoComplete="name" {...text("fullName")} />
                <Err name="fullName" />
              </label>
              <label>
                {t("profile.preferredName")}
                <input autoComplete="given-name" {...text("preferredName")} />
                <Err name="preferredName" />
              </label>
              <label>
                {t("profile.email")}
                <input type="email" autoComplete="email" value={form.email} readOnly />
              </label>
              <label>
                {t("profile.phone")}
                <input type="tel" autoComplete="tel" {...text("phone")} />
                <Err name="phone" />
              </label>
              <label>
                {t("profile.dob")}
                <input type="date" autoComplete="bday" {...text("dateOfBirth")} />
                <Err name="dateOfBirth" />
              </label>
              <label>
                {t("profile.nationality")}
                <input autoComplete="country-name" {...text("nationality")} />
                <Err name="nationality" />
              </label>
              <label>
                {t("profile.city")}
                <input autoComplete="address-level2" {...text("currentCity")} />
                <Err name="currentCity" />
              </label>
            </div>
          </section>
        )}
        {activeSection === "study" && (
          <>
            <section className="panel profile-section-panel">
              <h2>{t("profile.academic")}</h2>
              <div className="form-grid">
                <label>
                  {t("profile.eduLevel")}
                  <select {...text("educationLevel")}>
                    <option value="">{t("profile.notSet")}</option>
                    <option value="high-school">{t("profile.highSchool")}</option>
                    <option value="bachelor">{t("profile.bachelorsDeg")}</option>
                    <option value="master">{t("profile.mastersDeg")}</option>
                  </select>
                  <Err name="educationLevel" />
                </label>
                <label>
                  {t("profile.institution")}
                  <input {...text("institution")} />
                  <Err name="institution" />
                </label>
                <label>
                  {t("profile.gpa")}
                  <input inputMode="decimal" {...text("gpa")} />
                  <Err name="gpa" />
                </label>
                <label>
                  {t("profile.gradYear")}
                  <input inputMode="numeric" {...text("graduationYear")} />
                  <Err name="graduationYear" />
                </label>
                <label>
                  {t("profile.desiredDegree")}
                  <select {...text("desiredDegree")}>
                    <option value="">{t("profile.notSet")}</option>
                    <option value="bachelor">{t("card.degree.bachelor")}</option>
                    <option value="master">{t("card.degree.master")}</option>
                    <option value="phd">{t("card.degree.phd")}</option>
                  </select>
                  <Err name="desiredDegree" />
                </label>
                <label>
                  {t("profile.field")}
                  <input {...text("preferredField")} />
                  <Err name="preferredField" />
                </label>
                <label>
                  {t("profile.destination")}
                  <input list="pathora-countries" {...text("preferredDestination")} />
                  <datalist id="pathora-countries">
                    {countrySuggestions.map((country) => (
                      <option key={country} value={country} />
                    ))}
                  </datalist>
                  <Err name="preferredDestination" />
                </label>
              </div>
            </section>
            <section className="panel profile-section-panel">
              <h2>{t("profile.langBudget")}</h2>
              <div className="form-grid">
                <label>
                  {t("profile.englishTest")}
                  <select {...text("englishTest")}>
                    <option value="">{t("profile.notSet")}</option>
                    <option value="ielts">IELTS</option>
                    <option value="toefl">TOEFL</option>
                    <option value="duolingo">Duolingo</option>
                  </select>
                  <Err name="englishTest" />
                </label>
                <label>
                  {t("profile.score")}
                  <input inputMode="decimal" {...text("englishScore")} />
                  <Err name="englishScore" />
                </label>
                <label>
                  {t("profile.budget")}
                  <input inputMode="numeric" {...text("annualBudgetThb")} />
                  <Err name="annualBudgetThb" />
                </label>
                <label>
                  {t("profile.funding")}
                  <select {...text("fundingPreference")}>
                    <option value="">{t("profile.notSet")}</option>
                    <option value="full">{t("profile.fundFull")}</option>
                    <option value="partial">{t("profile.fundPartial")}</option>
                    <option value="self">{t("profile.fundSelf")}</option>
                  </select>
                  <Err name="fundingPreference" />
                </label>
              </div>
            </section>
          </>
        )}
        {activeSection === "settings" && (
          <section className="panel profile-section-panel">
            <h2>{t("profile.settings")}</h2>
            <p>{t("profile.settingsHint")}</p>
            <div className="form-grid">
              <label>
                {t("profile.language")}
                <select
                  value={settingsForm.language}
                  onChange={(e) =>
                    setSettingsForm((c) => ({ ...c, language: e.target.value as SettingsDTO["language"] }))
                  }
                >
                  <option value="en">English</option>
                  <option value="th">ไทย</option>
                </select>
                <Err name="language" />
              </label>
              <label>
                {t("profile.timezone")}
                <select
                  value={settingsForm.timezone}
                  onChange={(e) => setSettingsForm((c) => ({ ...c, timezone: e.target.value }))}
                >
                  {Array.from(
                    new Set([
                      "Asia/Bangkok",
                      "Australia/Sydney",
                      "Europe/London",
                      settingsForm.timezone,
                    ]),
                  ).map((zone) => (
                    <option key={zone}>{zone}</option>
                  ))}
                </select>
                <Err name="timezone" />
              </label>
              <label>
                {t("profile.emailUpdates")}
                <select
                  value={settingsForm.emailUpdates ? "on" : "off"}
                  onChange={(e) =>
                    setSettingsForm((c) => ({ ...c, emailUpdates: e.target.value === "on" }))
                  }
                >
                  <option value="on">{t("profile.enabled")}</option>
                  <option value="off">{t("profile.disabled")}</option>
                </select>
              </label>
              <label>
                {t("profile.reminders")}
                <select
                  value={settingsForm.deadlineReminders ? "on" : "off"}
                  onChange={(e) =>
                    setSettingsForm((c) => ({ ...c, deadlineReminders: e.target.value === "on" }))
                  }
                >
                  <option value="on">{t("profile.enabled")}</option>
                  <option value="off">{t("profile.disabled")}</option>
                </select>
              </label>
              <label>
                {t("profile.visibility")}
                <select
                  value={settingsForm.profileVisibility}
                  onChange={(e) =>
                    setSettingsForm((c) => ({
                      ...c,
                      profileVisibility: e.target.value as SettingsDTO["profileVisibility"],
                    }))
                  }
                >
                  <option value="private">{t("profile.private")}</option>
                  <option value="buddies">{t("profile.buddies")}</option>
                </select>
                <Err name="profileVisibility" />
              </label>
            </div>
          </section>
        )}
        {error && (
          <p role="alert" className="text-[12px] font-bold text-[#c2453b]">
            {error}
          </p>
        )}
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saved ? (
            <>
              <Check />
              {t("profile.saved")}
            </>
          ) : saving ? (
            t("profile.saving")
          ) : (
            t("profile.saveChanges")
          )}
        </button>
      </form>
    </div>
  );
}

const safeNext = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")
    ? value
    : "/app";

export function Login() {
  const { status, signIn, register, error, fieldErrors, clearError } = useJourney();
  const { t } = useT();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [mode, setMode] = useState<"login" | "register">(
    params.get("mode") === "register" ? "register" : "login",
  );
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    clearError();
  }, [mode, clearError]);
  const [googleOn, setGoogleOn] = useState(false);
  useEffect(() => {
    fetch("/pathora-api/auth/providers")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setGoogleOn(Boolean(d?.google)))
      .catch(() => {});
  }, []);
  const googleError = params.get("error") === "google" || params.get("error") === "google_unavailable";
  if (status === "ready") return <Navigate to={next} replace />;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    if (mode === "register") await register(form.name.trim(), form.email.trim(), form.password);
    else await signIn(form.email.trim(), form.password);
    setBusy(false);
  };
  const isRegister = mode === "register";
  return (
    <main className="simple-page">
      <span className="section-kicker">PATHORA</span>
      <h1>{isRegister ? t("auth.createTitle") : t("auth.welcome")}</h1>
      <p>{isRegister ? t("auth.createText") : t("auth.signInText")}</p>
      <div className="mx-auto w-full max-w-md">
        {googleError && (
          <p role="alert" className="mb-3 text-[12px] font-bold text-[#c2453b]">
            {t("auth.googleError")}
          </p>
        )}
        {googleOn && (
          <>
            <a
              className="btn btn-quiet flex w-full items-center justify-center"
              href={`/pathora-api/auth/google?next=${encodeURIComponent(next)}`}
            >
              {t("auth.google")}
            </a>
            <div className="my-4 text-center text-[12px] font-bold opacity-60">{t("auth.or")}</div>
          </>
        )}
      </div>
      <form className="profile-form auth-form mx-auto w-full max-w-md text-left" onSubmit={submit}>
        <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
          {isRegister && (
            <label>
              {t("auth.name")}
              <input
                required
                autoComplete="name"
                placeholder={t("auth.namePlaceholder")}
                value={form.name}
                onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
              />
              {fieldErrors.name && <small className="text-[11px] font-bold text-[#c2453b]">{fieldErrors.name}</small>}
            </label>
          )}
          <label>
            {t("auth.email")}
            <input
              required
              type="email"
              autoComplete="email"
              placeholder={t("auth.emailPlaceholder")}
              value={form.email}
              onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
            />
            {fieldErrors.email && <small className="text-[11px] font-bold text-[#c2453b]">{fieldErrors.email}</small>}
          </label>
          <label>
            {t("auth.password")}
            <input
              required
              type="password"
              minLength={8}
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder={t("auth.passwordPlaceholder")}
              value={form.password}
              onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
            />
            {fieldErrors.password && <small className="text-[11px] font-bold text-[#c2453b]">{fieldErrors.password}</small>}
          </label>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-[12px] font-bold text-[#c2453b]">
            {error}
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? t("auth.wait") : isRegister ? t("auth.createBtn") : t("auth.signIn")}
          </button>
          <button
            className="btn btn-quiet"
            type="button"
            onClick={() => setMode(isRegister ? "login" : "register")}
          >
            {isRegister ? t("auth.haveAccount") : t("auth.createLink")}
          </button>
        </div>
      </form>
    </main>
  );
}

export function SimplePage({ title }: { title: string }) {
  const { t } = useT();
  return (
    <main className="simple-page">
      <span className="section-kicker">PATHORA</span>
      <h1>{t(title)}</h1>
      <p>{t("errors.comingSoon")}</p>
      <Link to="/" className="btn btn-primary">
        {t("errors.returnHome")}
      </Link>
    </main>
  );
}
