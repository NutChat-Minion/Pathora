import "server-only";

import type { CommunityTopic, PostDTO, PostStatus, ReplyDTO, TripDTO, HousingDTO } from "@/lib/community-contract";
import { idOf, type Doc, type LoosePayload, type Session } from "@/lib/journey-server";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type SessionUser = Session["user"];

export const MODERATION_HELD_MESSAGE = "Your post is held for review.";

export function displayNameOf(user: Doc | null | undefined): string {
  if (!user) return "Student";
  const preferred = user.studentProfile?.preferredName;
  if (typeof preferred === "string" && preferred.trim()) return preferred.trim();
  const first = typeof user.name === "string" ? user.name.trim().split(/\s+/)[0] : "";
  return first || "Student";
}

/**
 * Display names for other users. Users are readable only by their owner, so this reads with
 * overrideAccess:true but selects ONLY name + preferredName: nothing else can leak.
 */
export async function loadDisplayNames(
  payload: LoosePayload,
  ids: string[],
): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter(Boolean))];
  const map = new Map<string, string>();
  if (!unique.length) return map;
  const result = await payload.find({
    collection: "users",
    where: { id: { in: unique } },
    select: { name: true, studentProfile: { preferredName: true } },
    limit: unique.length,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  });
  for (const doc of result.docs) map.set(String(doc.id), displayNameOf(doc));
  return map;
}

/** Trimmed string within [min,max] or null. */
export function cleanText(value: unknown, min: number, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length >= min && text.length <= max ? text : null;
}

/** Optional text: '' / null / undefined -> {ok, value:null}; too long / wrong type -> {ok:false}. */
export function cleanOptionalText(
  value: unknown,
  max: number,
): { ok: true; value: string | null } | { ok: false } {
  if (value === undefined || value === null || value === "") return { ok: true, value: null };
  if (typeof value !== "string") return { ok: false };
  const text = value.trim();
  if (text.length > max) return { ok: false };
  return { ok: true, value: text || null };
}

export function cleanHttpUrl(value: unknown): { ok: true; value: string | null } | { ok: false } {
  const text = cleanOptionalText(value, 500);
  if (!text.ok) return text;
  if (!text.value) return text;
  try {
    const url = new URL(text.value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return { ok: false };
    return { ok: true, value: url.toString() };
  } catch {
    return { ok: false };
  }
}

const isoOrEmpty = (value: unknown): string => {
  if (typeof value !== "string" && !(value instanceof Date)) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

const statusOf = (value: unknown): PostStatus =>
  value === "flagged" || value === "hidden" ? value : "visible";

export function toPostDTO(
  doc: Doc,
  viewerId: string,
  names: Map<string, string>,
  likedIds: Set<string>,
): PostDTO {
  const authorId = idOf(doc.author) ?? "";
  return {
    id: String(doc.id),
    authorName: names.get(authorId) ?? "Student",
    mine: authorId === viewerId,
    body: String(doc.body ?? ""),
    topic: (doc.topic ?? "general") as CommunityTopic,
    destination: typeof doc.destination === "string" && doc.destination ? doc.destination : null,
    status: statusOf(doc.status),
    likeCount: typeof doc.likeCount === "number" ? doc.likeCount : 0,
    replyCount: typeof doc.replyCount === "number" ? doc.replyCount : 0,
    likedByMe: likedIds.has(String(doc.id)),
    createdAt: isoOrEmpty(doc.createdAt),
  };
}

export function toReplyDTO(doc: Doc, viewerId: string, names: Map<string, string>): ReplyDTO {
  const authorId = idOf(doc.author) ?? "";
  return {
    id: String(doc.id),
    postId: idOf(doc.post) ?? "",
    authorName: names.get(authorId) ?? "Student",
    mine: authorId === viewerId,
    body: String(doc.body ?? ""),
    status: statusOf(doc.status),
    createdAt: isoOrEmpty(doc.createdAt),
  };
}

export function toTripDTO(
  doc: Doc,
  viewerId: string,
  names: Map<string, string>,
  interestCount: number,
  interestedByMe: boolean,
): TripDTO {
  const ownerId = idOf(doc.owner) ?? "";
  return {
    id: String(doc.id),
    ownerName: names.get(ownerId) ?? "Student",
    mine: ownerId === viewerId,
    origin: String(doc.origin ?? ""),
    destination: String(doc.destination ?? ""),
    travelDate: isoOrEmpty(doc.travelDate).slice(0, 10),
    flexible: Boolean(doc.flexible),
    note: typeof doc.note === "string" && doc.note ? doc.note : null,
    status: doc.status === "closed" ? "closed" : "open",
    interestCount,
    interestedByMe,
  };
}

export function toHousingDTO(doc: Doc): HousingDTO {
  return {
    id: String(doc.id),
    name: String(doc.name ?? ""),
    url: typeof doc.url === "string" && doc.url ? doc.url : null,
    city: typeof doc.city === "string" && doc.city ? doc.city : null,
    weeklyPrice: typeof doc.weeklyPrice === "number" ? doc.weeklyPrice : null,
    currency: typeof doc.currency === "string" && doc.currency ? doc.currency : null,
    roomType: doc.roomType ?? null,
    notes: typeof doc.notes === "string" && doc.notes ? doc.notes : null,
  };
}

/** Ids (as strings) of posts the viewer has liked among `postIds`. */
export async function likedPostIds(
  payload: LoosePayload,
  user: SessionUser,
  postIds: string[],
): Promise<Set<string>> {
  if (!postIds.length) return new Set();
  const likes = await payload.find({
    collection: "post-likes",
    where: { and: [{ owner: { equals: user.id } }, { post: { in: postIds } }] },
    limit: postIds.length,
    pagination: false,
    depth: 0,
    overrideAccess: false,
    user,
  });
  return new Set(likes.docs.map((like) => idOf(like.post) ?? ""));
}

/** A post the viewer may read (visible, or their own). Null when missing/not visible. */
export async function getReadablePost(
  payload: LoosePayload,
  id: string,
  user: SessionUser,
): Promise<Doc | null> {
  try {
    return await payload.findByID({
      collection: "community-posts",
      id,
      depth: 0,
      overrideAccess: false,
      user,
    });
  } catch {
    return null;
  }
}

export const unsafeCastUser = (user: SessionUser) => user as unknown as Doc;

/** Counters are server-owned, so they are recomputed from source rows and written with
 *  overrideAccess:true (the callers have already authorised the action). */
export async function recountPostLikes(payload: LoosePayload, postId: string): Promise<number> {
  const likes = await payload.find({
    collection: "post-likes",
    where: { post: { equals: postId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  await payload.update({
    collection: "community-posts",
    id: postId,
    data: { likeCount: likes.totalDocs },
    depth: 0,
    overrideAccess: true,
  });
  return likes.totalDocs;
}

export async function recountPostReplies(payload: LoosePayload, postId: string): Promise<number> {
  const replies = await payload.find({
    collection: "post-replies",
    where: { and: [{ post: { equals: postId } }, { status: { equals: "visible" } }] },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  await payload.update({
    collection: "community-posts",
    id: postId,
    data: { replyCount: replies.totalDocs },
    depth: 0,
    overrideAccess: true,
  });
  return replies.totalDocs;
}

/* --------------------------------- study buddies --------------------------------- */

/** The ONLY user fields buddy discovery ever reads. No email, phone or date of birth. */
export const BUDDY_SELECT = {
  name: true,
  studentProfile: { preferredName: true, preferredDestination: true, preferredField: true },
  buddyProfile: true,
  settings: { profileVisibility: true },
} as const;

const norm = (value: unknown): string => (typeof value === "string" ? value.trim().toLowerCase() : "");
const strList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && v.trim() !== "") : [];

export function destinationLabel(doc: Doc): string {
  const parts = [doc.buddyProfile?.destinationCity, doc.studentProfile?.preferredDestination]
    .filter((v): v is string => typeof v === "string" && v.trim() !== "")
    .map((v) => v.trim());
  return [...new Set(parts)].join(", ");
}

/** Simple, explainable match: shared country/city/intake/university/field + interest overlap. */
export function matchScore(me: Doc, other: Doc): number {
  let score = 10;
  const mp = me.studentProfile ?? {};
  const op = other.studentProfile ?? {};
  const mb = me.buddyProfile ?? {};
  const ob = other.buddyProfile ?? {};
  if (norm(mp.preferredDestination) && norm(mp.preferredDestination) === norm(op.preferredDestination)) score += 30;
  if (norm(mb.destinationCity) && norm(mb.destinationCity) === norm(ob.destinationCity)) score += 20;
  if (norm(mb.intake) && norm(mb.intake) === norm(ob.intake)) score += 15;
  if (norm(mb.university) && norm(mb.university) === norm(ob.university)) score += 10;
  if (norm(mp.preferredField) && norm(mp.preferredField) === norm(op.preferredField)) score += 5;
  const mine = new Set(strList(mb.interests).map(norm));
  const shared = strList(ob.interests).filter((i) => mine.has(norm(i))).length;
  score += Math.min(10, shared * 5);
  return Math.min(99, score);
}

export function toPublicBuddy(doc: Doc) {
  const b = doc.buddyProfile ?? {};
  return {
    id: String(doc.id),
    name: displayNameOf(doc),
    destination: destinationLabel(doc),
    intake: typeof b.intake === "string" ? b.intake : "",
    university: typeof b.university === "string" ? b.university : "",
    interests: strList(b.interests),
    bio: typeof b.bio === "string" ? b.bio : "",
  };
}

/* ------------------------------------- trips ------------------------------------- */

/** YYYY-MM-DD, real calendar date, from yesterday (timezone slack) to three years ahead. */
export function cleanTravelDate(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  const now = Date.now();
  if (date.getTime() < now - 2 * 86400000) return null;
  if (date.getTime() > now + 3 * 365 * 86400000) return null;
  return value;
}

export async function tripInterestInfo(
  payload: LoosePayload,
  tripIds: string[],
  viewerId: string,
): Promise<{ counts: Map<string, number>; mine: Set<string> }> {
  const counts = new Map<string, number>();
  const mine = new Set<string>();
  if (!tripIds.length) return { counts, mine };
  // Interest rows are owner-readable only; counts need all rows, hence overrideAccess:true
  // with a select that exposes just (trip, owner) and only aggregates are returned to clients.
  const rows = await payload.find({
    collection: "trip-interests",
    where: { trip: { in: tripIds } },
    select: { trip: true, owner: true },
    limit: 5000,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  });
  for (const row of rows.docs) {
    const trip = idOf(row.trip) ?? "";
    counts.set(trip, (counts.get(trip) ?? 0) + 1);
    if (idOf(row.owner) === viewerId) mine.add(trip);
  }
  return { counts, mine };
}
