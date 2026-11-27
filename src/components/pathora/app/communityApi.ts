import { useCallback, useEffect, useState } from "react";

export type ApiResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  error: string;
  fieldErrors: Record<string, string>;
};

export async function call<T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method,
      cache: "no-store",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    let json: unknown = null;
    try {
      json = await response.json();
    } catch {
      json = null;
    }
    const obj = (json && typeof json === "object" ? json : {}) as Record<string, unknown>;
    return {
      ok: response.ok,
      status: response.status,
      data: response.ok ? (json as T) : null,
      error: response.ok
        ? ""
        : typeof obj.error === "string"
          ? obj.error
          : "Something went wrong. Please try again.",
      fieldErrors:
        obj.fieldErrors && typeof obj.fieldErrors === "object"
          ? (obj.fieldErrors as Record<string, string>)
          : {},
    };
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      error: "Network error. Check your connection and try again.",
      fieldErrors: {},
    };
  }
}

/** Small GET hook: loads `url` (or nothing when null) and exposes reload/setData. */
export function useResource<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setLoading(true);
    void call<T>(url).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setData(result.data);
        setError("");
      } else {
        setError(result.error);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [url, tick]);

  const reload = useCallback(() => setTick((value) => value + 1), []);
  return { data, setData, loading, error, reload };
}

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

export type CountryKey = "uk" | "au" | "us" | "ca" | "jp" | "nz" | "other";

export function countryKeyOf(text: string | null | undefined): CountryKey {
  const t = (text ?? "").toLowerCase();
  if (/(united kingdom|\buk\b|england|scotland|london|britain)/.test(t)) return "uk";
  if (/(australia|melbourne|sydney|brisbane|perth)/.test(t)) return "au";
  if (/(united states|\busa\b|\bus\b|america)/.test(t)) return "us";
  if (/(canada|toronto|vancouver|montreal)/.test(t)) return "ca";
  if (/(japan|tokyo|osaka|kyoto)/.test(t)) return "jp";
  if (/(new zealand|auckland|wellington)/.test(t)) return "nz";
  return "other";
}

export const COUNTRY_LABEL: Record<CountryKey, string> = {
  uk: "United Kingdom",
  au: "Australia",
  us: "United States",
  ca: "Canada",
  jp: "Japan",
  nz: "New Zealand",
  other: "Other destination",
};
