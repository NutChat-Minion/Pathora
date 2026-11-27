import type { BuddyProfileDTO } from "@/lib/community-contract";
import { cleanOptionalText } from "@/lib/community-server";
import {
  badBody,
  getPayloadServer,
  handleError,
  jsonError,
  loadUserDoc,
  readJsonObject,
  requireSession,
  type Doc,
} from "@/lib/journey-server";

export const dynamic = "force-dynamic";

function toDTO(user: Doc): BuddyProfileDTO {
  const b = user.buddyProfile ?? {};
  return {
    visible: user.settings?.profileVisibility === "buddies",
    intake: String(b.intake ?? ""),
    destinationCity: String(b.destinationCity ?? ""),
    university: String(b.university ?? ""),
    interests: Array.isArray(b.interests)
      ? b.interests.filter((v: unknown): v is string => typeof v === "string")
      : [],
    bio: String(b.bio ?? ""),
  };
}

export async function GET() {
  try {
    const session = await requireSession();
    if (session instanceof Response) return session;
    const payload = await getPayloadServer();
    return Response.json({ profile: toDTO(await loadUserDoc(payload, session)) });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession();
    if (session instanceof Response) return session;
    const body = await readJsonObject(request);
    if (!body) return badBody();

    const fieldErrors: Record<string, string> = {};
    const buddyProfile: Record<string, unknown> = {};
    const textFields: Array<[string, number]> = [
      ["intake", 40],
      ["destinationCity", 80],
      ["university", 160],
      ["bio", 300],
    ];
    for (const [key, max] of textFields) {
      if (!(key in body)) continue;
      const clean = cleanOptionalText(body[key], max);
      if (clean.ok) buddyProfile[key] = clean.value ?? "";
      else fieldErrors[key] = `Keep this under ${max} characters.`;
    }
    if ("interests" in body) {
      const raw = body.interests;
      if (
        Array.isArray(raw) &&
        raw.length <= 10 &&
        raw.every((v) => typeof v === "string" && v.trim().length > 0 && v.trim().length <= 40)
      ) {
        buddyProfile.interests = [...new Set((raw as string[]).map((v) => v.trim()))];
      } else {
        fieldErrors.interests = "Add up to 10 interests, each under 40 characters.";
      }
    }
    let visibility: "buddies" | "private" | undefined;
    if ("visible" in body) {
      if (typeof body.visible === "boolean") visibility = body.visible ? "buddies" : "private";
      else fieldErrors.visible = "Must be true or false.";
    }
    if (Object.keys(fieldErrors).length) {
      return jsonError(400, "Check the highlighted fields and try again.", fieldErrors);
    }

    const data: Record<string, unknown> = {};
    if (Object.keys(buddyProfile).length) data.buddyProfile = buddyProfile;
    if (visibility) data.settings = { profileVisibility: visibility };

    const payload = await getPayloadServer();
    if (Object.keys(data).length) {
      await payload.update({
        collection: "users",
        id: session.user.id,
        data,
        depth: 0,
        overrideAccess: false,
        user: session.user,
      });
    }
    return Response.json({ profile: toDTO(await loadUserDoc(payload, session)) });
  } catch (error) {
    return handleError(error);
  }
}
