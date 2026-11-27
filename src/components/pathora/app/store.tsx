import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  EntitlementDTO,
  JourneyDTO,
  LocalImportPayload,
  OpportunityDTO,
  PlanDTO,
  PlanKey,
  PlanStatus,
  RoadmapDTO,
  SessionUserDTO,
  SettingsDTO,
  StudentProfileDTO,
  TaskDTO,
} from "../../../lib/journey-contract";

type Status = "loading" | "anonymous" | "ready";

type ApiResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  error: string;
  fieldErrors: Record<string, string>;
};

/** UI language, kept in sync by the i18n provider (see setLocale). */
let currentLocale: "en" | "th" = "en";

async function api<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      ...init,
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...(init?.headers ?? {}),
      },
    });
    let json: unknown = null;
    try {
      json = await response.json();
    } catch {
      json = null;
    }
    const body = (json && typeof json === "object" ? json : {}) as Record<string, unknown>;
    return {
      ok: response.ok,
      status: response.status,
      data: response.ok ? (json as T) : null,
      error: response.ok
        ? ""
        : typeof body.error === "string"
          ? body.error
          : currentLocale === "th"
            ? "เกิดข้อผิดพลาด โปรดลองอีกครั้ง"
            : "Something went wrong. Please try again.",
      fieldErrors:
        body.fieldErrors && typeof body.fieldErrors === "object"
          ? (body.fieldErrors as Record<string, string>)
          : {},
    };
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      error:
        currentLocale === "th"
          ? "เชื่อมต่อไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง"
          : "Network error. Check your connection and try again.",
      fieldErrors: {},
    };
  }
}

export async function fetchOpportunityBySlug(slug: string): Promise<OpportunityDTO | null> {
  const result = await api<{ opportunity: OpportunityDTO }>(
    `/pathora-api/opportunities/${encodeURIComponent(slug)}?locale=${currentLocale}`,
  );
  return result.data?.opportunity ?? null;
}

const json = (value: unknown): RequestInit => ({ body: JSON.stringify(value) });

const legacyKeys = [
  "pathora-profile",
  "pathora-saved",
  "pathora-prepare-stages",
  "pathora-plans",
  "pathora-prepare-target",
];

function readLegacy(): LocalImportPayload {
  const payload: LocalImportPayload = {};
  try {
    const profile = JSON.parse(localStorage.getItem("pathora-profile") || "null");
    if (profile && typeof profile === "object" && !Array.isArray(profile)) {
      const flat: Record<string, string> = {};
      for (const [key, value] of Object.entries(profile as Record<string, unknown>)) {
        if (value !== null && value !== undefined) flat[key] = String(value);
      }
      payload.profile = flat;
    }
  } catch {
    /* ignore */
  }
  try {
    const saved = JSON.parse(localStorage.getItem("pathora-saved") || "null");
    if (Array.isArray(saved)) payload.saved = saved.filter((id) => typeof id === "string");
  } catch {
    /* ignore */
  }
  try {
    const stages = JSON.parse(localStorage.getItem("pathora-prepare-stages") || "null");
    if (Array.isArray(stages))
      payload.completedStages = stages.filter((id) => typeof id === "string");
  } catch {
    /* ignore */
  }
  return payload;
}

function clearLegacy() {
  try {
    legacyKeys.forEach((key) => localStorage.removeItem(key));
  } catch {
    /* ignore */
  }
}

type JourneyState = {
  status: Status;
  journey: JourneyDTO | null;
  opportunities: OpportunityDTO[];
  opportunitiesLoaded: boolean;
  /** Sets the listing language; opportunities refetch when it changes. */
  setLocale: (locale: "en" | "th") => void;
  error: string;
  fieldErrors: Record<string, string>;
  clearError: () => void;

  user: SessionUserDTO | null;
  saved: string[];
  plans: PlanDTO[];
  profile: StudentProfileDTO | null;
  settings: SettingsDTO | null;
  roadmap: RoadmapDTO | null;
  profileCompletion: number;
  displayName: string;

  signIn: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (patch: Partial<StudentProfileDTO>) => Promise<boolean>;
  updateSettings: (patch: Partial<SettingsDTO>) => Promise<boolean>;
  updateRoadmap: (patch: Partial<RoadmapDTO>) => Promise<boolean>;
  toggleSaved: (opportunityId: string) => Promise<boolean>;
  addPlan: (opportunityId: string) => Promise<boolean>;
  updatePlan: (
    id: string,
    patch: { status?: PlanStatus; targetDeadline?: string | null },
  ) => Promise<boolean>;
  deletePlan: (id: string) => Promise<boolean>;
  addTask: (planId: string, title: string, dueDate?: string | null) => Promise<boolean>;
  updateTask: (
    planId: string,
    taskId: string,
    patch: { done?: boolean; title?: string; dueDate?: string | null },
  ) => Promise<boolean>;
  deleteTask: (planId: string, taskId: string) => Promise<boolean>;

  entitlement: EntitlementDTO;
  /** Starts Stripe Checkout; resolves with a redirect url, or a message to show. */
  startCheckout: (plan: PlanKey) => Promise<{ url?: string; error?: string; usePortal?: boolean }>;
  openPortal: () => Promise<{ url?: string; error?: string }>;
  saveCountries: (countries: string[]) => Promise<{ ok: boolean; error?: string }>;
};

const noEntitlement: EntitlementDTO = {
  plan: null,
  status: "none",
  countryLimit: 0,
  selectedCountries: [],
  currentPeriodEnd: null,
};

const JourneyContext = createContext<JourneyState | null>(null);

const emptyList: never[] = [];

export function JourneyProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [journey, setJourney] = useState<JourneyDTO | null>(null);
  const [opportunities, setOpportunities] = useState<OpportunityDTO[]>([]);
  const [opportunitiesLoaded, setOpportunitiesLoaded] = useState(false);
  const [locale, setLocaleState] = useState<"en" | "th" | null>(null);
  const opportunitySeq = useRef(0);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const journeyRef = useRef<JourneyDTO | null>(null);

  const commit = useCallback((next: JourneyDTO | null) => {
    journeyRef.current = next;
    setJourney(next);
  }, []);

  const fail = useCallback((result: ApiResult<unknown>) => {
    setError(result.error);
    setFieldErrors(result.fieldErrors);
    return false;
  }, []);

  const clearError = useCallback(() => {
    setError("");
    setFieldErrors({});
  }, []);

  const loadOpportunities = useCallback(async () => {
    const seq = ++opportunitySeq.current;
    const result = await api<{ opportunities: OpportunityDTO[] }>(
      `/pathora-api/opportunities?locale=${currentLocale}`,
    );
    if (seq !== opportunitySeq.current) return;
    if (result.data) setOpportunities(result.data.opportunities ?? []);
    setOpportunitiesLoaded(true);
  }, []);

  const setLocale = useCallback((next: "en" | "th") => {
    currentLocale = next;
    setLocaleState(next);
  }, []);

  /** Loads the signed-in journey, importing legacy local data once. */
  const loadJourney = useCallback(async (): Promise<boolean> => {
    const result = await api<JourneyDTO>("/pathora-api/journey");
    if (!result.data) {
      commit(null);
      setStatus("anonymous");
      return false;
    }
    let next = result.data;
    if (next.localImportDone === false) {
      const imported = await api<JourneyDTO>("/pathora-api/journey/import", {
        method: "POST",
        ...json(readLegacy()),
      });
      if (imported.data) {
        next = imported.data;
        clearLegacy();
      }
    }
    commit(next);
    setStatus("ready");
    return true;
  }, [commit]);

  useEffect(() => {
    void loadJourney();
  }, [loadJourney]);

  // Listings are localized: fetch once the language is known, and again whenever it changes.
  useEffect(() => {
    if (locale) void loadOpportunities();
  }, [locale, loadOpportunities]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      clearError();
      const result = await api<{ user: SessionUserDTO }>("/pathora-api/auth", {
        method: "POST",
        ...json({ mode: "login", email, password }),
      });
      if (!result.ok) return fail(result);
      return loadJourney();
    },
    [clearError, fail, loadJourney],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      clearError();
      const result = await api<{ user: SessionUserDTO }>("/pathora-api/auth", {
        method: "POST",
        ...json({ mode: "register", name, email, password }),
      });
      if (!result.ok) return fail(result);
      return loadJourney();
    },
    [clearError, fail, loadJourney],
  );

  const signOut = useCallback(async () => {
    await api("/pathora-api/auth", { method: "DELETE" });
    clearError();
    commit(null);
    setStatus("anonymous");
  }, [clearError, commit]);

  const refresh = useCallback(async () => {
    await Promise.all([loadJourney(), loadOpportunities()]);
  }, [loadJourney, loadOpportunities]);

  /** Optimistically applies `apply`, runs `request`, reverts on failure. */
  const optimistic = useCallback(
    async <T,>(
      apply: ((current: JourneyDTO) => JourneyDTO) | null,
      request: () => Promise<ApiResult<T>>,
      onSuccess: (data: T, current: JourneyDTO) => JourneyDTO,
    ): Promise<boolean> => {
      const before = journeyRef.current;
      if (!before) return false;
      clearError();
      if (apply) commit(apply(before));
      const result = await request();
      if (!result.ok || !result.data) {
        if (apply) commit(journeyRef.current === null ? null : before);
        if (result.status === 401) {
          commit(null);
          setStatus("anonymous");
        }
        return fail(result);
      }
      const latest = journeyRef.current ?? before;
      commit(onSuccess(result.data, latest));
      return true;
    },
    [clearError, commit, fail],
  );

  const replacePlan = (current: JourneyDTO, plan: PlanDTO): JourneyDTO => ({
    ...current,
    plans: current.plans.some((item) => item.id === plan.id)
      ? current.plans.map((item) => (item.id === plan.id ? plan : item))
      : [...current.plans, plan],
  });
  const mapPlan = (current: JourneyDTO, id: string, fn: (plan: PlanDTO) => PlanDTO): JourneyDTO => ({
    ...current,
    plans: current.plans.map((plan) => (plan.id === id ? fn(plan) : plan)),
  });

  const patchJourney = useCallback(
    (body: {
      profile?: Partial<StudentProfileDTO>;
      settings?: Partial<SettingsDTO>;
      roadmap?: Partial<RoadmapDTO>;
    }) =>
      optimistic<JourneyDTO>(
        (current) => ({
          ...current,
          profile: { ...current.profile, ...body.profile },
          settings: { ...current.settings, ...body.settings },
          roadmap: { ...current.roadmap, ...body.roadmap },
        }),
        () => api<JourneyDTO>("/pathora-api/journey", { method: "PATCH", ...json(body) }),
        (data) => data,
      ),
    [optimistic],
  );

  const updateProfile = useCallback(
    (patch: Partial<StudentProfileDTO>) => patchJourney({ profile: patch }),
    [patchJourney],
  );
  const updateSettings = useCallback(
    (patch: Partial<SettingsDTO>) => patchJourney({ settings: patch }),
    [patchJourney],
  );
  const updateRoadmap = useCallback(
    (patch: Partial<RoadmapDTO>) => patchJourney({ roadmap: patch }),
    [patchJourney],
  );

  const toggleSaved = useCallback(
    (opportunityId: string) => {
      const isSaved = journeyRef.current?.saved.includes(opportunityId) ?? false;
      return optimistic<{ saved: string[] }>(
        (current) => ({
          ...current,
          saved: isSaved
            ? current.saved.filter((id) => id !== opportunityId)
            : [...current.saved, opportunityId],
        }),
        () =>
          isSaved
            ? api<{ saved: string[] }>(
                `/pathora-api/saved/${encodeURIComponent(opportunityId)}`,
                { method: "DELETE" },
              )
            : api<{ saved: string[] }>("/pathora-api/saved", {
                method: "POST",
                ...json({ opportunityId }),
              }),
        (data, current) => ({ ...current, saved: data.saved }),
      );
    },
    [optimistic],
  );

  const addPlan = useCallback(
    async (opportunityId: string) => {
      const ok = await optimistic<{ plan: PlanDTO }>(
        null,
        () =>
          api<{ plan: PlanDTO }>("/pathora-api/plans", {
            method: "POST",
            ...json({ opportunityId }),
          }),
        (data, current) => replacePlan(current, data.plan),
      );
      return ok;
    },
    [optimistic],
  );

  const updatePlan = useCallback(
    (id: string, patch: { status?: PlanStatus; targetDeadline?: string | null }) =>
      optimistic<{ plan: PlanDTO }>(
        (current) => mapPlan(current, id, (plan) => ({ ...plan, ...patch })),
        () =>
          api<{ plan: PlanDTO }>(`/pathora-api/plans/${encodeURIComponent(id)}`, {
            method: "PATCH",
            ...json(patch),
          }),
        (data, current) => replacePlan(current, data.plan),
      ),
    [optimistic],
  );

  const deletePlan = useCallback(
    (id: string) =>
      optimistic<{ ok: true }>(
        (current) => ({
          ...current,
          plans: current.plans.filter((plan) => plan.id !== id),
          roadmap:
            current.roadmap.activePlanId === id
              ? { ...current.roadmap, activePlanId: null }
              : current.roadmap,
        }),
        () => api<{ ok: true }>(`/pathora-api/plans/${encodeURIComponent(id)}`, { method: "DELETE" }),
        (_data, current) => current,
      ),
    [optimistic],
  );

  const addTask = useCallback(
    (planId: string, title: string, dueDate?: string | null) =>
      optimistic<{ plan: PlanDTO }>(
        null,
        () =>
          api<{ plan: PlanDTO }>(`/pathora-api/plans/${encodeURIComponent(planId)}/tasks`, {
            method: "POST",
            ...json({ title, ...(dueDate ? { dueDate } : {}) }),
          }),
        (data, current) => replacePlan(current, data.plan),
      ),
    [optimistic],
  );

  const updateTask = useCallback(
    (
      planId: string,
      taskId: string,
      patch: { done?: boolean; title?: string; dueDate?: string | null },
    ) =>
      optimistic<{ plan: PlanDTO }>(
        (current) =>
          mapPlan(current, planId, (plan) => ({
            ...plan,
            tasks: plan.tasks.map((task: TaskDTO) =>
              task.id === taskId ? { ...task, ...patch } : task,
            ),
          })),
        () =>
          api<{ plan: PlanDTO }>(
            `/pathora-api/plans/${encodeURIComponent(planId)}/tasks/${encodeURIComponent(taskId)}`,
            { method: "PATCH", ...json(patch) },
          ),
        (data, current) => replacePlan(current, data.plan),
      ),
    [optimistic],
  );

  const deleteTask = useCallback(
    (planId: string, taskId: string) =>
      optimistic<{ plan: PlanDTO }>(
        (current) =>
          mapPlan(current, planId, (plan) => ({
            ...plan,
            tasks: plan.tasks.filter((task) => task.id !== taskId),
          })),
        () =>
          api<{ plan: PlanDTO }>(
            `/pathora-api/plans/${encodeURIComponent(planId)}/tasks/${encodeURIComponent(taskId)}`,
            { method: "DELETE" },
          ),
        (data, current) => replacePlan(current, data.plan),
      ),
    [optimistic],
  );

  const startCheckout = useCallback(async (plan: PlanKey) => {
    const result = await api<{ url: string }>("/pathora-api/billing/checkout", {
      method: "POST",
      ...json({ plan }),
    });
    if (result.data?.url) return { url: result.data.url };
    return { error: result.error, usePortal: result.status === 409 };
  }, []);

  const openPortal = useCallback(async () => {
    const result = await api<{ url: string }>("/pathora-api/billing/portal", { method: "POST" });
    return result.data?.url ? { url: result.data.url } : { error: result.error };
  }, []);

  const saveCountries = useCallback(
    async (countries: string[]) => {
      const result = await api<{ entitlement: EntitlementDTO }>("/pathora-api/billing/countries", {
        method: "PUT",
        ...json({ countries }),
      });
      if (!result.data) return { ok: false, error: result.fieldErrors.countries || result.error };
      const current = journeyRef.current;
      if (current) commit({ ...current, entitlement: result.data.entitlement });
      // Country access changes which listings are locked.
      void loadOpportunities();
      return { ok: true };
    },
    [commit, loadOpportunities],
  );

  const value = useMemo<JourneyState>(() => {
    const profile = journey?.profile ?? null;
    const user = journey?.user ?? null;
    const displayName =
      profile?.preferredName.trim() ||
      user?.name.trim() ||
      user?.email.split("@")[0] ||
      "";
    return {
      status,
      journey,
      opportunities,
      opportunitiesLoaded,
      setLocale,
      error,
      fieldErrors,
      clearError,
      user,
      saved: journey?.saved ?? emptyList,
      plans: journey?.plans ?? emptyList,
      profile,
      settings: journey?.settings ?? null,
      roadmap: journey?.roadmap ?? null,
      profileCompletion: journey?.profileCompletion ?? 0,
      displayName,
      signIn,
      register,
      signOut,
      refresh,
      updateProfile,
      updateSettings,
      updateRoadmap,
      toggleSaved,
      addPlan,
      updatePlan,
      deletePlan,
      addTask,
      updateTask,
      deleteTask,
      entitlement: journey?.entitlement ?? noEntitlement,
      startCheckout,
      openPortal,
      saveCountries,
    };
  }, [
    status,
    journey,
    opportunities,
    opportunitiesLoaded,
    setLocale,
    error,
    fieldErrors,
    clearError,
    signIn,
    register,
    signOut,
    refresh,
    updateProfile,
    updateSettings,
    updateRoadmap,
    toggleSaved,
    addPlan,
    updatePlan,
    deletePlan,
    addTask,
    updateTask,
    deleteTask,
    startCheckout,
    openPortal,
    saveCountries,
  ]);

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourney() {
  const value = useContext(JourneyContext);
  if (!value) throw new Error("useJourney must be used inside JourneyProvider");
  return value;
}
