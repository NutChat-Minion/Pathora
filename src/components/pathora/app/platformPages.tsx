import {
  ArrowRight,
  BedDouble,
  Bookmark,
  CalendarDays,
  Check,
  CircleAlert,
  ExternalLink,
  FileCheck2,
  Flag,
  Heart,
  House,
  MapPin,
  MessageCircle,
  Plane,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Users,
  WalletCards,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  communityTopicValues,
  reportReasons,
  roomTypeValues,
  type BuddyDTO,
  type BuddyProfileDTO,
  type ConnectionDTO,
  type CreatePostResponse,
  type CreateReplyResponse,
  type FeedResponse,
  type HousingDTO,
  type PostDTO,
  type ReplyDTO,
  type TripDTO,
} from "../../../lib/community-contract";
import { localizedChecklist, type ChecklistId } from "../../../lib/checklists";
import { COUNTRY_LABEL, call, countryKeyOf, initialsOf, useResource, type CountryKey } from "./communityApi";
import { useT, type TFn } from "./i18n";
import { useJourney } from "./store";

/* ------------------------------------ shared ------------------------------------ */

function ModuleTitle({
  kicker,
  title,
  text,
  action,
}: {
  kicker: string;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <span className="section-kicker">{kicker}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {action}
    </div>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="module-notice">
      <CircleAlert />
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}

function ErrorText({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1 text-sm text-red-600">
      {children}
    </p>
  );
}

function Loading({ label }: { label?: string }) {
  const { t } = useT();
  return <p className="py-6 text-sm text-slate-500">{label ?? t("common.loading")}</p>;
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="panel p-6 text-center text-sm text-slate-600">{children}</div>;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500";

const topicLabel = (t: TFn, value: string) => t(`common.topic.${value}`);

/** Destination/heading derived from the user's active plan, falling back to their profile. */
function useDestination() {
  const { plans, roadmap, opportunities, profile } = useJourney();
  const { formatDate } = useT();
  return useMemo(() => {
    const plan = plans.find((item) => item.id === roadmap?.activePlanId) ?? plans[0];
    const opportunity = plan ? opportunities.find((item) => item.id === plan.opportunityId) : undefined;
    const country = opportunity?.country || profile?.preferredDestination || "";
    const city = opportunity?.city || "";
    const place = [city, country].filter(Boolean).join(", ");
    const deadline = plan?.targetDeadline
      ? formatDate(plan.targetDeadline, { month: "short", year: "numeric" })
      : "";
    return { country, city, place, deadline, planTitle: plan?.title ?? "" };
  }, [plans, roadmap, opportunities, profile, formatDate]);
}

/* ---------------------------------- community ---------------------------------- */

function timeAgo(iso: string, t: TFn) {
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff)) return "";
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t("common.justNow");
  if (minutes < 60) return t("common.minAgo", { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("common.hoursAgo", { n: hours });
  return t("common.daysAgo", { n: Math.floor(hours / 24) });
}

function PostCard({
  post,
  onChange,
  onDelete,
}: {
  post: PostDTO;
  onChange: (post: PostDTO) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [replies, setReplies] = useState<ReplyDTO[] | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState<string>("spam");
  const [reportNote, setReportNote] = useState("");

  const loadReplies = async () => {
    const result = await call<{ replies: ReplyDTO[] }>(`/pathora-api/community/${post.id}/replies`);
    if (result.ok && result.data) setReplies(result.data.replies);
    else setError(result.error);
  };

  const toggleReplies = () => {
    const next = !open;
    setOpen(next);
    if (next && replies === null) void loadReplies();
  };

  const like = async () => {
    const result = await call<{ liked: boolean; likeCount: number }>(
      `/pathora-api/community/${post.id}/like`,
      "POST",
    );
    if (result.ok && result.data) {
      onChange({ ...post, likedByMe: result.data.liked, likeCount: result.data.likeCount });
    } else setError(result.error);
  };

  const sendReply = async (event: FormEvent) => {
    event.preventDefault();
    if (!replyBody.trim() || busy) return;
    setBusy(true);
    setError("");
    const result = await call<CreateReplyResponse>(
      `/pathora-api/community/${post.id}/replies`,
      "POST",
      { body: replyBody },
    );
    setBusy(false);
    if (!result.ok || !result.data) {
      setError(result.fieldErrors.body || result.error);
      return;
    }
    setReplyBody("");
    setReplies((items) => [...(items ?? []), result.data!.reply]);
    if (result.data.held) setMessage(result.data.message ?? t("community.replyHeld"));
    else onChange({ ...post, replyCount: post.replyCount + 1 });
  };

  const sendReport = async () => {
    setBusy(true);
    const result = await call(`/pathora-api/community/${post.id}/report`, "POST", {
      reason,
      note: reportNote || undefined,
    });
    setBusy(false);
    if (result.ok) {
      setMessage(t("community.reportThanks"));
      setReporting(false);
      setReportNote("");
    } else setError(result.error);
  };

  const remove = async () => {
    if (!window.confirm(t("community.confirmDelete"))) return;
    const result = await call(`/pathora-api/community/${post.id}`, "DELETE");
    if (result.ok) onDelete(post.id);
    else setError(result.error);
  };

  return (
    <article className="panel post-card">
      <div className="avatar">{initialsOf(post.authorName)}</div>
      <div className="post-content">
        <div className="post-meta">
          <strong>{post.authorName}</strong>
          <span>{timeAgo(post.createdAt, t)}</span>
        </div>
        <div className="post-tags">
          <span>{topicLabel(t, post.topic)}</span>
          {post.destination && (
            <span>
              <MapPin size={11} /> {post.destination}
            </span>
          )}
          {post.status !== "visible" && (
            <span>{post.status === "flagged" ? t("common.heldForReview") : t("community.hidden")}</span>
          )}
        </div>
        <p>{post.body}</p>
        <div className="post-actions">
          <button onClick={like} aria-pressed={post.likedByMe} disabled={post.status !== "visible"}>
            <Heart size={16} fill={post.likedByMe ? "currentColor" : "none"} /> {post.likeCount}
          </button>
          <button onClick={toggleReplies} disabled={post.status !== "visible"}>
            <MessageCircle size={16} />{" "}
            {t("community.replyCount", {
              count: post.replyCount,
              unit: post.replyCount === 1 ? t("community.reply") : t("community.replies"),
            })}
          </button>
          {post.mine ? (
            <button onClick={remove}>
              <Trash2 size={16} /> {t("community.delete")}
            </button>
          ) : (
            <button onClick={() => setReporting((v) => !v)}>
              <Flag size={16} /> {t("community.report")}
            </button>
          )}
        </div>
        {reporting && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select className={`${inputClass} !w-auto`} value={reason} onChange={(e) => setReason(e.target.value)}>
              {reportReasons.map((item) => (
                <option key={item} value={item}>
                  {t(`common.reason.${item}`)}
                </option>
              ))}
            </select>
            <input
              className={`${inputClass} !w-56`}
              maxLength={500}
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
              placeholder={t("community.notePlaceholder")}
            />
            <button className="btn btn-outline" onClick={sendReport} disabled={busy}>
              {t("community.sendReport")}
            </button>
          </div>
        )}
        {message && <p className="mt-2 text-sm text-emerald-700">{message}</p>}
        <ErrorText>{error}</ErrorText>
        {open && (
          <div className="mt-4 space-y-3 border-t border-slate-200 pt-3">
            {replies === null ? (
              <Loading />
            ) : replies.length === 0 ? (
              <p className="text-sm text-slate-500">{t("community.noReplies")}</p>
            ) : (
              replies.map((reply) => (
                <div key={reply.id} className="text-sm">
                  <strong>{reply.authorName}</strong>{" "}
                  <span className="text-slate-500">{timeAgo(reply.createdAt, t)}</span>
                  {reply.status === "flagged" && (
                    <span className="ml-2 text-amber-700">{t("common.heldForReview")}</span>
                  )}
                  <p className="mt-0.5">{reply.body}</p>
                </div>
              ))
            )}
            <form className="flex gap-2" onSubmit={sendReply}>
              <input
                className={inputClass}
                value={replyBody}
                maxLength={1000}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder={t("community.writeReply")}
              />
              <button className="btn btn-primary" disabled={busy || !replyBody.trim()}>
                <Send size={15} /> {t("community.replyBtn")}
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
}

export function Community() {
  const { displayName } = useJourney();
  const { t } = useT();
  const dest = useDestination();
  const [composer, setComposer] = useState(false);
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState<string>("general");
  const [postDestination, setPostDestination] = useState("");
  const [filter, setFilter] = useState("all");
  const [destFilter, setDestFilter] = useState("");
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [posting, setPosting] = useState(false);
  const [held, setHeld] = useState("");

  const query = (nextPage: number) => {
    const params = new URLSearchParams({ page: String(nextPage) });
    if (filter !== "all") params.set("topic", filter);
    if (destFilter) params.set("destination", destFilter);
    return `/pathora-api/community?${params.toString()}`;
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void call<FeedResponse>(query(1)).then((result) => {
      if (cancelled) return;
      if (result.ok && result.data) {
        setPosts(result.data.posts);
        setPage(1);
        setHasMore(result.data.hasMore);
        setError("");
      } else setError(result.error);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, destFilter]);

  const loadMore = async () => {
    const result = await call<FeedResponse>(query(page + 1));
    if (result.ok && result.data) {
      setPosts((items) => [...items, ...result.data!.posts]);
      setPage(page + 1);
      setHasMore(result.data.hasMore);
    } else setError(result.error);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!body.trim() || posting) return;
    setPosting(true);
    setFormError("");
    setHeld("");
    const result = await call<CreatePostResponse>("/pathora-api/community", "POST", {
      body,
      topic,
      destination: postDestination || undefined,
    });
    setPosting(false);
    if (!result.ok || !result.data) {
      setFormError(Object.values(result.fieldErrors)[0] || result.error);
      return;
    }
    setBody("");
    setPostDestination("");
    setComposer(false);
    if (result.data.held) setHeld(result.data.message ?? t("community.postHeld"));
    const created = result.data.post;
    if (filter === "all" || filter === created.topic) setPosts((items) => [created, ...items]);
  };

  return (
    <div className="app-page module-page">
      <ModuleTitle
        kicker={t("community.kicker")}
        title={t("community.title")}
        text={t("community.text")}
        action={
          <button className="btn btn-primary" onClick={() => setComposer(!composer)}>
            <Plus size={17} /> {t("community.startPost")}
          </button>
        }
      />
      <Notice title={t("community.guidelines")}>{t("community.guidelinesText")}</Notice>
      {held && <Notice title={t("common.heldForReview")}>{held}</Notice>}
      {composer && (
        <form className="panel post-composer" onSubmit={submit}>
          <div className="avatar">{initialsOf(displayName)}</div>
          <div>
            <textarea
              autoFocus
              value={body}
              maxLength={2000}
              onChange={(event) => setBody(event.target.value)}
              placeholder={t("community.composerPlaceholder")}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <select className={`${inputClass} !w-auto`} value={topic} onChange={(e) => setTopic(e.target.value)}>
                {communityTopicValues.map((item) => (
                  <option key={item} value={item}>
                    {topicLabel(t, item)}
                  </option>
                ))}
              </select>
              <input
                className={`${inputClass} !w-56`}
                maxLength={80}
                value={postDestination}
                onChange={(e) => setPostDestination(e.target.value)}
                placeholder={
                  dest.place
                    ? t("community.destWithPlace", { place: dest.place })
                    : t("community.destOptional")
                }
              />
            </div>
            <ErrorText>{formError}</ErrorText>
            <div className="composer-actions">
              <button className="btn btn-primary" disabled={!body.trim() || posting}>
                <Send size={15} /> {posting ? t("community.checking") : t("community.publish")}
              </button>
            </div>
          </div>
        </form>
      )}
      <div className="community-layout">
        <section>
          <div className="module-tabs">
            {["all", ...communityTopicValues].map((item) => (
              <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
                {item === "all" ? t("community.all") : topicLabel(t, item)}
              </button>
            ))}
          </div>
          {destFilter && (
            <p className="my-2 text-sm text-slate-600">
              {t("community.showing", { dest: destFilter })}{" "}
              <button className="underline" onClick={() => setDestFilter("")}>
                {t("common.clear")}
              </button>
            </p>
          )}
          <ErrorText>{error}</ErrorText>
          <div className="feed">
            {loading ? (
              <Loading />
            ) : posts.length === 0 ? (
              <Empty>
                {filter === "all" && !destFilter
                  ? t("community.emptyFirst")
                  : t("community.emptyFilter")}
              </Empty>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onChange={(next) => setPosts((items) => items.map((p) => (p.id === next.id ? next : p)))}
                  onDelete={(id) => setPosts((items) => items.filter((p) => p.id !== id))}
                />
              ))
            )}
          </div>
          {hasMore && (
            <button className="btn btn-outline mt-4" onClick={loadMore}>
              {t("community.loadMore")}
            </button>
          )}
        </section>
        <aside className="panel community-side">
          <span className="panel-label">{t("community.circle")}</span>
          {dest.place ? (
            <>
              <h2>{dest.place}</h2>
              <p>{t("community.circleText")}</p>
              <button className="btn btn-outline" onClick={() => setDestFilter(dest.city || dest.country)}>
                {t("community.filterBy", { dest: dest.city || dest.country })}
              </button>
            </>
          ) : (
            <>
              <h2>{t("community.noDest")}</h2>
              <p>{t("community.noDestText")}</p>
            </>
          )}
          <Link to="/study-buddy" className="btn btn-outline mt-2">
            {t("community.findBuddy")} <ArrowRight size={15} />
          </Link>
        </aside>
      </div>
    </div>
  );
}

/* --------------------------------- study buddy --------------------------------- */

function BuddyProfileCard() {
  const { t } = useT();
  const { data, setData, loading, error } = useResource<{ profile: BuddyProfileDTO }>(
    "/pathora-api/buddy-profile",
  );
  const [form, setForm] = useState({ intake: "", destinationCity: "", university: "", interests: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const profile = data?.profile;

  useEffect(() => {
    if (!profile) return;
    setForm({
      intake: profile.intake,
      destinationCity: profile.destinationCity,
      university: profile.university,
      interests: profile.interests.join(", "),
      bio: profile.bio,
    });
  }, [profile]);

  const patch = async (body: Record<string, unknown>, success: string) => {
    setSaving(true);
    setSaveError("");
    setFieldErrors({});
    setMessage("");
    const result = await call<{ profile: BuddyProfileDTO }>("/pathora-api/buddy-profile", "PATCH", body);
    setSaving(false);
    if (result.ok && result.data) {
      setData(result.data);
      setMessage(success);
    } else {
      setSaveError(result.error);
      setFieldErrors(result.fieldErrors);
    }
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    void patch(
      {
        intake: form.intake,
        destinationCity: form.destinationCity,
        university: form.university,
        bio: form.bio,
        interests: form.interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      },
      t("buddy.saved"),
    );
  };

  const field = (key: keyof typeof form, label: string, placeholder: string, max: number) => (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <input
        className={inputClass}
        value={form[key]}
        maxLength={max}
        placeholder={placeholder}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
      <ErrorText>{fieldErrors[key]}</ErrorText>
    </label>
  );

  return (
    <section className="panel p-5">
      <span className="panel-label">{t("buddy.yourProfile")}</span>
      {loading ? (
        <Loading />
      ) : !profile ? (
        <ErrorText>{error}</ErrorText>
      ) : (
        <>
          <label className="mt-2 flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={profile.visible}
              disabled={saving}
              onChange={(e) =>
                void patch(
                  { visible: e.target.checked },
                  e.target.checked ? t("buddy.visibleNow") : t("buddy.privateNow"),
                )
              }
            />
            <span>
              <strong>{t("buddy.showMe")}</strong>
              <br />
              {t("buddy.showMeText")}
            </span>
          </label>
          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={save}>
            {field("intake", t("buddy.intake"), t("buddy.intakePh"), 40)}
            {field("destinationCity", t("buddy.city"), t("buddy.cityPh"), 80)}
            {field("university", t("buddy.university"), t("buddy.universityPh"), 160)}
            {field("interests", t("buddy.interests"), t("buddy.interestsPh"), 400)}
            <label className="block text-sm md:col-span-2">
              <span className="font-medium">{t("buddy.bio")}</span>
              <textarea
                className={inputClass}
                rows={3}
                maxLength={300}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
              <ErrorText>{fieldErrors.bio}</ErrorText>
            </label>
            <ErrorText>{fieldErrors.interests}</ErrorText>
            <div className="md:col-span-2">
              <button className="btn btn-primary" disabled={saving}>
                {t("buddy.saveProfile")}
              </button>
              {message && <span className="ml-3 text-sm text-emerald-700">{message}</span>}
              <ErrorText>{saveError}</ErrorText>
            </div>
          </form>
        </>
      )}
    </section>
  );
}

export function StudyBuddy() {
  const { t } = useT();
  const [query, setQuery] = useState("");
  const buddies = useResource<{ buddies: BuddyDTO[] }>("/pathora-api/buddies");
  const connections = useResource<{ connections: ConnectionDTO[] }>("/pathora-api/buddies/connections");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const refreshAll = () => {
    buddies.reload();
    connections.reload();
  };

  const act = async (id: string, run: () => Promise<{ ok: boolean; error: string }>) => {
    setBusyId(id);
    setError("");
    const result = await run();
    setBusyId("");
    if (!result.ok) setError(result.error);
    refreshAll();
  };

  const connect = (buddy: BuddyDTO) =>
    act(buddy.id, () => call("/pathora-api/buddies/connections", "POST", { toUserId: buddy.id }));
  const respond = (id: string, status: "accepted" | "declined") =>
    act(id, () => call(`/pathora-api/buddies/connections/${id}`, "PATCH", { status }));
  const cancel = (id: string) => act(id, () => call(`/pathora-api/buddies/connections/${id}`, "DELETE"));

  const list = (buddies.data?.buddies ?? []).filter((item) =>
    [item.name, item.destination, item.university, item.intake, ...item.interests]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const mine = connections.data?.connections ?? [];
  const incoming = mine.filter((c) => c.direction === "incoming" && c.status === "pending");
  const accepted = mine.filter((c) => c.status === "accepted");

  return (
    <div className="app-page module-page">
      <ModuleTitle
        kicker={t("buddy.kicker")}
        title={t("buddy.title")}
        text={t("buddy.text")}
      />
      <Notice title={t("buddy.privacy")}>{t("buddy.privacyText")}</Notice>
      <BuddyProfileCard />
      <ErrorText>{error}</ErrorText>
      {incoming.length > 0 && (
        <section className="panel p-5">
          <span className="panel-label">{t("buddy.requests")}</span>
          {incoming.map((c) => (
            <div key={c.id} className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span>
                <strong>{c.other.name}</strong>
                {c.other.destination && ` · ${c.other.destination}`}
                {t("buddy.wantsToConnect")}
              </span>
              <span className="flex gap-2">
                <button className="btn btn-primary" disabled={busyId === c.id} onClick={() => respond(c.id, "accepted")}>
                  {t("buddy.accept")}
                </button>
                <button className="btn btn-outline" disabled={busyId === c.id} onClick={() => respond(c.id, "declined")}>
                  {t("buddy.decline")}
                </button>
              </span>
            </div>
          ))}
        </section>
      )}
      {accepted.length > 0 && (
        <section className="panel p-5">
          <span className="panel-label">{t("buddy.yourBuddies")}</span>
          {accepted.map((c) => (
            <p key={c.id} className="mt-2 text-sm">
              <strong>{c.other.name}</strong>
              {c.other.destination && ` · ${c.other.destination}`}
              {c.other.university && ` · ${c.other.university}`}
            </p>
          ))}
        </section>
      )}
      <div className="buddy-toolbar panel">
        <div>
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("buddy.search")}
          />
        </div>
      </div>
      {buddies.loading ? (
        <Loading />
      ) : buddies.error ? (
        <ErrorText>{buddies.error}</ErrorText>
      ) : list.length === 0 ? (
        <Empty>
          {query
            ? t("buddy.noMatch")
            : t("buddy.noneYet")}
        </Empty>
      ) : (
        <div className="buddy-grid">
          {list.map((buddy, index) => (
            <article className="panel buddy-card" key={buddy.id}>
              <div className={`buddy-avatar tone-${(index % 4) + 1}`}>{initialsOf(buddy.name)}</div>
              <span className="match-chip">{t("buddy.matchChip", { match: buddy.match })}</span>
              <h2>{buddy.name}</h2>
              <p className="buddy-destination">
                <MapPin size={14} /> {buddy.destination || t("buddy.destNotSet")}
                {buddy.intake && ` · ${buddy.intake}`}
              </p>
              {buddy.university && <p className="buddy-school">{buddy.university}</p>}
              {buddy.bio && <p className="text-sm text-slate-600">{buddy.bio}</p>}
              <div className="interest-list">
                {buddy.interests.map((interest) => (
                  <span key={interest}>{interest}</span>
                ))}
              </div>
              {!buddy.connection ? (
                <button className="btn btn-primary" disabled={busyId === buddy.id} onClick={() => connect(buddy)}>
                  <Users size={16} /> {t("buddy.connect")}
                </button>
              ) : buddy.connection.status === "accepted" ? (
                <button className="btn btn-quiet" disabled>
                  <Check size={16} /> {t("buddy.connected")}
                </button>
              ) : buddy.connection.status === "declined" ? (
                <button className="btn btn-quiet" disabled>
                  {t("buddy.unavailable")}
                </button>
              ) : buddy.connection.direction === "outgoing" ? (
                <button
                  className="btn btn-quiet"
                  disabled={busyId === buddy.connection.id}
                  onClick={() => cancel(buddy.connection!.id)}
                  title={t("buddy.cancelReq")}
                >
                  <Check size={16} /> {t("buddy.pendingCancel")}
                </button>
              ) : (
                <span className="flex gap-2">
                  <button className="btn btn-primary" onClick={() => respond(buddy.connection!.id, "accepted")}>
                    {t("buddy.accept")}
                  </button>
                  <button className="btn btn-outline" onClick={() => respond(buddy.connection!.id, "declined")}>
                    {t("buddy.decline")}
                  </button>
                </span>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------- accommodation ----------------------------------- */

const SEARCH_SITES: Record<CountryKey, Array<[string, string]>> = {
  uk: [["SpareRoom", "https://www.spareroom.co.uk/"]],
  au: [["Flatmates.com.au", "https://flatmates.com.au/"]],
  us: [["Apartments.com", "https://www.apartments.com/"]],
  ca: [["PadMapper", "https://www.padmapper.com/"]],
  jp: [["Sakura House", "https://www.sakura-house.com/"]],
  nz: [["Trade Me Property", "https://www.trademe.co.nz/a/property/residential/rent"]],
  other: [],
};
const GENERIC_SITES: Array<[string, string]> = [
  ["Student.com", "https://www.student.com/"],
  ["Uniplaces", "https://www.uniplaces.com/"],
];

const roomLabel = (t: TFn, value: string) => t(`common.room.${value}`);

export function Accommodation() {
  const { t } = useT();
  const dest = useDestination();
  const { data, setData, loading, error } = useResource<{ items: HousingDTO[] }>("/pathora-api/housing");
  const [budget, setBudget] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    url: "",
    city: "",
    weeklyPrice: "",
    currency: "",
    roomType: "",
    notes: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const items = data?.items ?? [];
  const country = countryKeyOf(`${dest.country} ${dest.city}`);
  const maxPrice = Math.max(0, ...items.map((i) => i.weeklyPrice ?? 0));
  const effectiveBudget = budget ?? maxPrice;
  const visible = items.filter((i) => i.weeklyPrice === null || i.weeklyPrice <= effectiveBudget);

  const add = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setFieldErrors({});
    const result = await call<{ item: HousingDTO }>("/pathora-api/housing", "POST", {
      name: form.name,
      url: form.url,
      city: form.city || dest.city,
      weeklyPrice: form.weeklyPrice === "" ? null : Number(form.weeklyPrice),
      currency: form.currency,
      roomType: form.roomType || null,
      notes: form.notes,
    });
    setSaving(false);
    if (!result.ok || !result.data) {
      setFormError(result.error);
      setFieldErrors(result.fieldErrors);
      return;
    }
    setData({ items: [result.data.item, ...items] });
    setForm({ name: "", url: "", city: "", weeklyPrice: "", currency: "", roomType: "", notes: "" });
  };

  const remove = async (id: string) => {
    const result = await call(`/pathora-api/housing/${id}`, "DELETE");
    if (result.ok) setData({ items: items.filter((i) => i.id !== id) });
    else setFormError(result.error);
  };

  const input = (key: keyof typeof form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <input
        className={inputClass}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        {...props}
      />
      <ErrorText>{fieldErrors[key]}</ErrorText>
    </label>
  );

  return (
    <div className="app-page module-page">
      <ModuleTitle
        kicker={t("housing.kicker")}
        title={t("housing.title")}
        text={t("housing.text")}
      />
      <Notice title={t("housing.noBook")}>{t("housing.noBookText")}</Notice>
      <section className="panel p-5">
        <span className="panel-label">
          {t("housing.searchSites", {
            country: dest.country ? ` · ${t(`common.country.${country}`).toUpperCase()}` : "",
          })}
        </span>
        <p className="mt-1 text-sm text-slate-600">{t("housing.searchText")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[...SEARCH_SITES[country], ...GENERIC_SITES].map(([label, href]) => (
            <a key={href} className="btn btn-outline" href={href} target="_blank" rel="noopener noreferrer">
              {label} <ExternalLink size={14} />
            </a>
          ))}
        </div>
      </section>
      <form className="panel grid gap-3 p-5 md:grid-cols-3" onSubmit={add}>
        <span className="panel-label md:col-span-3">{t("housing.addTitle")}</span>
        {input("name", t("housing.name"), { required: true, maxLength: 160, placeholder: t("housing.namePh") })}
        {input("url", t("housing.link"), { type: "url", maxLength: 500, placeholder: "https://" })}
        {input("city", t("housing.city"), { maxLength: 80, placeholder: dest.city || t("housing.city") })}
        {input("weeklyPrice", t("housing.weekly"), { type: "number", min: 0, step: "any" })}
        {input("currency", t("housing.currency"), { maxLength: 8, placeholder: t("housing.currencyPh") })}
        <label className="block text-sm">
          <span className="font-medium">{t("housing.roomType")}</span>
          <select className={inputClass} value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })}>
            <option value="">{t("housing.notSure")}</option>
            {roomTypeValues.map((v) => (
              <option key={v} value={v}>
                {roomLabel(t, v)}
              </option>
            ))}
          </select>
          <ErrorText>{fieldErrors.roomType}</ErrorText>
        </label>
        <label className="block text-sm md:col-span-3">
          <span className="font-medium">{t("housing.notes")}</span>
          <textarea
            className={inputClass}
            rows={2}
            maxLength={1000}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <ErrorText>{fieldErrors.notes}</ErrorText>
        </label>
        <div className="md:col-span-3">
          <button className="btn btn-primary" disabled={saving || !form.name.trim()}>
            <Plus size={16} /> {t("housing.add")}
          </button>
          <ErrorText>{formError}</ErrorText>
        </div>
      </form>
      {items.length > 0 && maxPrice > 0 && (
        <div className="stay-filters panel">
          <label>
            {t("housing.maxBudget")}
            <input
              type="range"
              min="0"
              max={maxPrice}
              step="5"
              value={effectiveBudget}
              onChange={(event) => setBudget(Number(event.target.value))}
            />
            <strong>{t("housing.perWeekValue", { value: effectiveBudget })}</strong>
          </label>
          <div>
            <Bookmark size={17} />
            <strong>{t("housing.shortlisted", { count: items.length })}</strong>
            <span>{t("housing.savedAccount")}</span>
          </div>
        </div>
      )}
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorText>{error}</ErrorText>
      ) : items.length === 0 ? (
        <Empty>{t("housing.empty")}</Empty>
      ) : (
        <div className="stay-grid">
          {visible.map((item) => (
            <article className="stay-card" key={item.id}>
              <div className="stay-body">
                <p>{item.roomType ? roomLabel(t, item.roomType) : t("housing.roomNotSet")}</p>
                <h2>{item.name}</h2>
                <div className="stay-meta">
                  {item.city && (
                    <span>
                      <MapPin size={14} /> {item.city}
                    </span>
                  )}
                </div>
                {item.notes && <p className="text-sm text-slate-600">{item.notes}</p>}
                <div className="stay-footer">
                  <strong>
                    {item.weeklyPrice !== null
                      ? `${item.currency ?? ""} ${item.weeklyPrice}`
                      : t("housing.priceNotSet")}
                    {item.weeklyPrice !== null && <small>{t("housing.perWeek")}</small>}
                  </strong>
                  <span className="flex gap-2">
                    {item.url && (
                      <a className="btn btn-outline" href={item.url} target="_blank" rel="noopener noreferrer">
                        {t("housing.open")} <ExternalLink size={14} />
                      </a>
                    )}
                    <button className="btn btn-quiet" onClick={() => remove(item.id)} aria-label={t("housing.removeAria", { name: item.name })}>
                      <Trash2 size={15} />
                    </button>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------------- checklist hook --------------------------------- */

function useChecklist(id: ChecklistId) {
  const { lang } = useT();
  const { data, setData, loading, error } = useResource<{ completedItems: string[] }>(
    `/pathora-api/checklists/${id}`,
  );
  const [saveError, setSaveError] = useState("");
  const done = data?.completedItems ?? [];
  const toggle = async (key: string) => {
    const next = done.includes(key) ? done.filter((k) => k !== key) : [...done, key];
    const previous = data;
    setData({ completedItems: next });
    setSaveError("");
    const result = await call(`/pathora-api/checklists/${id}`, "PUT", { completedItems: next });
    if (!result.ok) {
      setData(previous);
      setSaveError(result.error);
    }
  };
  const items = useMemo(() => localizedChecklist(id, lang), [id, lang]);
  return { done, toggle, loading, error: error || saveError, items };
}

/* ------------------------------------- visa ------------------------------------- */

const VISA_LINKS: Record<CountryKey, Array<[string, string]>> = {
  uk: [["UK student visa (GOV.UK)", "https://www.gov.uk/student-visa"]],
  au: [
    [
      "Student visa (subclass 500), Department of Home Affairs",
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
    ],
  ],
  us: [
    [
      "Student visa, U.S. Department of State",
      "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
    ],
  ],
  ca: [
    [
      "Study permit, Government of Canada",
      "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html",
    ],
  ],
  jp: [["Visas, Ministry of Foreign Affairs of Japan", "https://www.mofa.go.jp/j_info/visit/visa/index.html"]],
  nz: [["Immigration New Zealand", "https://www.immigration.govt.nz/"]],
  other: [],
};

const VISA_COUNTRY_KEY = "pathora-visa-country";

export function Visa() {
  const { t } = useT();
  const dest = useDestination();
  const [country, setCountry] = useState<CountryKey | null>(() => {
    try {
      const stored = localStorage.getItem(VISA_COUNTRY_KEY);
      return stored && stored in COUNTRY_LABEL ? (stored as CountryKey) : null;
    } catch {
      return null;
    }
  });
  const selected = country ?? (dest.country ? countryKeyOf(dest.country) : "other");
  const choose = (value: CountryKey) => {
    setCountry(value);
    try {
      localStorage.setItem(VISA_COUNTRY_KEY, value);
    } catch {
      /* ignore */
    }
  };
  const { done, toggle, loading, error, items } = useChecklist("visa");
  const progress = Math.round((done.length / items.length) * 100);
  const links = VISA_LINKS[selected];

  return (
    <div className="app-page module-page">
      <ModuleTitle
        kicker={t("visa.kicker")}
        title={t("visa.title")}
        text={t("visa.text")}
      />
      <Notice title={t("visa.notAdviser")}>{t("visa.notAdviserText")}</Notice>
      <div className="visa-layout">
        <section className="panel visa-checklist">
          <div className="visa-head">
            <div>
              <span className="panel-label">{t("visa.studentVisa", { country: t(`common.country.${selected}`).toUpperCase() })}</span>
              <h2>{t("visa.checklist")}</h2>
            </div>
            <div className="visa-progress">
              <strong>{progress}%</strong>
              <span>
                <i style={{ width: `${progress}%` }} />
              </span>
            </div>
          </div>
          <ErrorText>{error}</ErrorText>
          <div className="visa-steps">
            {items.map((item, index) => (
              <button
                className={done.includes(item.key) ? "visa-step complete" : "visa-step"}
                onClick={() => void toggle(item.key)}
                disabled={loading}
                key={item.key}
              >
                <span>{done.includes(item.key) ? <Check /> : index + 1}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
                <small>{done.includes(item.key) ? t("visa.completed") : t("visa.next")}</small>
              </button>
            ))}
          </div>
        </section>
        <aside>
          <div className="panel visa-side-card">
            <ShieldCheck />
            <span className="panel-label">{t("visa.destination")}</span>
            <select
              className={inputClass}
              value={selected}
              onChange={(e) => choose(e.target.value as CountryKey)}
              aria-label={t("visa.destAria")}
            >
              {(Object.keys(COUNTRY_LABEL) as CountryKey[]).map((key) => (
                <option key={key} value={key}>
                  {t(`common.country.${key}`)}
                </option>
              ))}
            </select>
            <h2 className="mt-3">{t("visa.official")}</h2>
            {links.length ? (
              links.map(([label, href]) => (
                <a
                  key={href}
                  className="btn btn-outline mt-2"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {label} <ExternalLink size={14} />
                </a>
              ))
            ) : (
              <p>{t("visa.searchOfficial")}</p>
            )}
            <p className="mt-3">{t("visa.feesChange")}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------- travel together ------------------------------- */

function TripCard({
  trip,
  onChange,
  onDelete,
  onError,
}: {
  trip: TripDTO;
  onChange: (trip: TripDTO) => void;
  onDelete: (id: string) => void;
  onError: (message: string) => void;
}) {
  const { t } = useT();
  const interest = async () => {
    const result = await call<{ interested: boolean; interestCount: number }>(
      `/pathora-api/trips/${trip.id}/interest`,
      "POST",
    );
    if (result.ok && result.data) {
      onChange({ ...trip, interestedByMe: result.data.interested, interestCount: result.data.interestCount });
    } else onError(result.error);
  };
  const setStatus = async (status: "open" | "closed") => {
    const result = await call<{ trip: TripDTO }>(`/pathora-api/trips/${trip.id}`, "PATCH", { status });
    if (result.ok && result.data) onChange(result.data.trip);
    else onError(result.error);
  };
  const remove = async () => {
    if (!window.confirm(t("travel.confirmDelete"))) return;
    const result = await call(`/pathora-api/trips/${trip.id}`, "DELETE");
    if (result.ok) onDelete(trip.id);
    else onError(result.error);
  };

  return (
    <article className="panel trip-card">
      <div className="trip-owner">
        <div className="buddy-avatar tone-2">{initialsOf(trip.ownerName)}</div>
        <span>{t("travel.startedBy")}</span>
        <strong>{trip.mine ? t("travel.you") : trip.ownerName}</strong>
      </div>
      <div className="trip-main">
        {trip.status === "closed" && <span className="local-tag">{t("travel.closed")}</span>}
        <h2>
          {trip.origin} → {trip.destination}
        </h2>
        <p className="trip-date">
          <CalendarDays size={15} /> {trip.travelDate}
          {trip.flexible && t("travel.flexible")}
        </p>
        {trip.note && <p>{trip.note}</p>}
      </div>
      <div className="trip-action">
        <small>{t("travel.interested", { count: trip.interestCount })}</small>
        {trip.mine ? (
          <span className="flex gap-2">
            <button className="btn btn-outline" onClick={() => setStatus(trip.status === "open" ? "closed" : "open")}>
              {trip.status === "open" ? t("travel.close") : t("travel.reopen")}
            </button>
            <button className="btn btn-quiet" onClick={remove} aria-label={t("travel.deleteAria")}>
              <Trash2 size={15} />
            </button>
          </span>
        ) : (
          <button className={trip.interestedByMe ? "btn btn-quiet" : "btn btn-primary"} onClick={interest}>
            {trip.interestedByMe ? (
              <>
                <Check size={16} /> {t("travel.interestedState")}
              </>
            ) : (
              t("travel.imInterested")
            )}
          </button>
        )}
      </div>
    </article>
  );
}

export function TravelTogether() {
  const { t } = useT();
  const dest = useDestination();
  const { data, setData, loading, error } = useResource<{ trips: TripDTO[] }>("/pathora-api/trips");
  const [form, setForm] = useState({ origin: "Bangkok", destination: "", travelDate: "", flexible: false, note: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const trips = data?.trips ?? [];
  const mine = trips.filter((t) => t.mine);
  const others = trips.filter((t) => !t.mine && t.status === "open");

  const update = (next: TripDTO) => setData({ trips: trips.map((t) => (t.id === next.id ? next : t)) });

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setFieldErrors({});
    const result = await call<{ trip: TripDTO }>("/pathora-api/trips", "POST", {
      ...form,
      destination: form.destination || dest.city || dest.country,
    });
    setSaving(false);
    if (!result.ok || !result.data) {
      setFormError(result.error);
      setFieldErrors(result.fieldErrors);
      return;
    }
    setData({ trips: [...trips, result.data.trip].sort((a, b) => a.travelDate.localeCompare(b.travelDate)) });
    setForm({ ...form, destination: "", travelDate: "", flexible: false, note: "" });
  };

  return (
    <div className="app-page module-page">
      <ModuleTitle
        kicker={t("travel.kicker")}
        title={t("travel.title")}
        text={t("travel.text")}
      />
      <Notice title={t("travel.noBook")}>{t("travel.noBookText")}</Notice>
      <form className="panel grid gap-3 p-5 md:grid-cols-4" onSubmit={create}>
        <span className="panel-label md:col-span-4">
          <Plane size={14} className="inline" /> {t("travel.post")}
        </span>
        <label className="block text-sm">
          <span className="font-medium">{t("travel.from")}</span>
          <input className={inputClass} maxLength={80} value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
          <ErrorText>{fieldErrors.origin}</ErrorText>
        </label>
        <label className="block text-sm">
          <span className="font-medium">{t("travel.to")}</span>
          <input
            className={inputClass}
            maxLength={80}
            value={form.destination}
            placeholder={dest.city || dest.country || t("travel.destPh")}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
          />
          <ErrorText>{fieldErrors.destination}</ErrorText>
        </label>
        <label className="block text-sm">
          <span className="font-medium">{t("travel.date")}</span>
          <input type="date" className={inputClass} value={form.travelDate} onChange={(e) => setForm({ ...form, travelDate: e.target.value })} />
          <ErrorText>{fieldErrors.travelDate}</ErrorText>
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input type="checkbox" checked={form.flexible} onChange={(e) => setForm({ ...form, flexible: e.target.checked })} />
          {t("travel.flexibleCheck")}
        </label>
        <label className="block text-sm md:col-span-4">
          <span className="font-medium">{t("travel.note")}</span>
          <input className={inputClass} maxLength={500} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={t("travel.notePh")} />
          <ErrorText>{fieldErrors.note}</ErrorText>
        </label>
        <div className="md:col-span-4">
          <button className="btn btn-primary" disabled={saving || !form.travelDate}>
            <Plus size={16} /> {t("travel.postBtn")}
          </button>
          <ErrorText>{formError}</ErrorText>
        </div>
      </form>
      <ErrorText>{error}</ErrorText>
      {loading ? (
        <Loading />
      ) : (
        <>
          {mine.length > 0 && (
            <>
              <h2 className="text-lg font-semibold">{t("travel.yourTrips")}</h2>
              <div className="trip-list">
                {mine.map((t) => (
                  <TripCard
                    key={t.id}
                    trip={t}
                    onChange={update}
                    onDelete={(id) => setData({ trips: trips.filter((x) => x.id !== id) })}
                    onError={setFormError}
                  />
                ))}
              </div>
            </>
          )}
          <h2 className="text-lg font-semibold">{t("travel.others")}</h2>
          {others.length === 0 ? (
            <Empty>{t("travel.noOthers")}</Empty>
          ) : (
            <div className="trip-list">
              {others.map((t) => (
                <TripCard key={t.id} trip={t} onChange={update} onDelete={() => undefined} onError={setFormError} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ----------------------------------- pre-departure ----------------------------------- */

const DEPARTURE_ICONS: Record<string, typeof FileCheck2> = {
  documents: FileCheck2,
  "health-insurance": ShieldCheck,
  money: WalletCards,
  packing: BedDouble,
  "first-72": MapPin,
};

export function PreDeparture() {
  const { displayName } = useJourney();
  const { t } = useT();
  const dest = useDestination();
  const { done, toggle, loading, error, items } = useChecklist("pre-departure");
  const progress = Math.round((done.length / items.length) * 100);
  const ecosystem = useMemo(
    () =>
      [
        [ShieldCheck, t("departure.eco1"), "/visa"],
        [House, t("departure.eco2"), "/accommodation"],
        [Plane, t("departure.eco3"), "/travel-together"],
        [Users, t("departure.eco4"), "/study-buddy"],
      ] as const,
    [t],
  );
  const heading = [dest.deadline, dest.place].filter(Boolean).join(" · ");
  return (
    <div className="app-page module-page">
      <ModuleTitle
        kicker={t("departure.kicker")}
        title={t("departure.title")}
        text={t("departure.text")}
      />
      <div className="departure-summary">
        <div className="departure-copy">
          <span>{heading ? heading.toUpperCase() : t("departure.nextChapter")}</span>
          <h2>{t("departure.taking", { name: displayName })}</h2>
          <p>
            {dest.planTitle
              ? t("departure.basedOn", { plan: dest.planTitle })
              : t("departure.startPlan")}{" "}
            {t("departure.atPace")}
          </p>
          <div className="departure-progress">
            <div>
              <strong>{progress}%</strong>
              <span>{t("departure.ready")}</span>
            </div>
            <span>
              <i style={{ width: `${progress}%` }} />
            </span>
          </div>
        </div>
        <Plane className="departure-plane" />
      </div>
      <div className="ecosystem-grid">
        {ecosystem.map(([Icon, title, to]) => (
          <Link to={to} className="panel ecosystem-card" key={title}>
            <span>
              <Icon />
            </span>
            <div>
              <h3>{title}</h3>
              <p>{t("departure.openPlan")}</p>
            </div>
            <ArrowRight />
          </Link>
        ))}
      </div>
      <div className="departure-layout">
        <section className="panel departure-checklist">
          <div className="panel-head">
            <div>
              <span className="panel-label">{t("departure.essential")}</span>
              <h2>{t("departure.before")}</h2>
            </div>
            <strong>
              {t("departure.done", { done: done.length, total: items.length })}
            </strong>
          </div>
          <ErrorText>{error}</ErrorText>
          {items.map((item) => {
            const Icon = DEPARTURE_ICONS[item.key] ?? FileCheck2;
            return (
              <button
                className={done.includes(item.key) ? "departure-task done" : "departure-task"}
                onClick={() => void toggle(item.key)}
                disabled={loading}
                key={item.key}
              >
                <span>
                  <Icon />
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
                <i>{done.includes(item.key) && <Check />}</i>
              </button>
            );
          })}
        </section>
        <aside className="panel arrival-card">
          <span className="panel-label">{t("departure.firstWeek")}</span>
          <h2>{dest.place ? t("departure.landing", { place: dest.place }) : t("departure.landingDefault")}</h2>
          {[t("departure.l1"), t("departure.l2"), t("departure.l3")].map((item, index) => (
            <div key={item}>
              <strong>0{index + 1}</strong>
              <p>{item}</p>
            </div>
          ))}
          <Link to="/community" className="btn btn-outline">
            {t("departure.askCommunity")} <ArrowRight size={15} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
