/**
 * Client-safe DTOs for the community, buddy, trips, checklist and housing endpoints under
 * /pathora-api. Errors: `{ error: string, fieldErrors?: Record<string,string> }`.
 */

export const communityTopicValues = ["general", "applications", "housing", "arrival", "visa", "money"] as const;
export type CommunityTopic = (typeof communityTopicValues)[number];

export type PostStatus = "visible" | "flagged" | "hidden";

export type PostDTO = {
  id: string;
  authorName: string;
  mine: boolean;
  body: string;
  topic: CommunityTopic;
  destination: string | null;
  /** Only your own posts can be anything but "visible". */
  status: PostStatus;
  likeCount: number;
  replyCount: number;
  likedByMe: boolean;
  createdAt: string;
};

export type ReplyDTO = {
  id: string;
  postId: string;
  authorName: string;
  mine: boolean;
  body: string;
  status: PostStatus;
  createdAt: string;
};

export const reportReasons = ["spam", "harassment", "misinformation", "other"] as const;
export type ReportReason = (typeof reportReasons)[number];

/** GET /pathora-api/community?topic=&destination=&page= */
export type FeedResponse = { posts: PostDTO[]; page: number; hasMore: boolean };
/** POST responses: `held` is true when moderation flagged the content. */
export type CreatePostResponse = { post: PostDTO; held: boolean; message?: string };
export type CreateReplyResponse = { reply: ReplyDTO; held: boolean; message?: string };

export type BuddyProfileDTO = {
  visible: boolean;
  intake: string;
  destinationCity: string;
  university: string;
  interests: string[];
  bio: string;
};

export type ConnectionStatus = "pending" | "accepted" | "declined";

export type BuddyDTO = {
  id: string;
  name: string;
  destination: string;
  intake: string;
  university: string;
  interests: string[];
  bio: string;
  /** 0-99 */
  match: number;
  /** null when no connection exists yet */
  connection: { id: string; status: ConnectionStatus; direction: "outgoing" | "incoming" } | null;
};

export type ConnectionDTO = {
  id: string;
  status: ConnectionStatus;
  direction: "outgoing" | "incoming";
  other: { id: string; name: string; destination: string; university: string };
  createdAt: string;
};

export type TripDTO = {
  id: string;
  ownerName: string;
  mine: boolean;
  origin: string;
  destination: string;
  /** YYYY-MM-DD */
  travelDate: string;
  flexible: boolean;
  note: string | null;
  status: "open" | "closed";
  interestCount: number;
  interestedByMe: boolean;
};

export type ChecklistDTO = { checklist: string; completedItems: string[] };

export const roomTypeValues = ["private-room", "studio", "shared", "homestay", "dorm"] as const;
export type RoomType = (typeof roomTypeValues)[number];

export type HousingDTO = {
  id: string;
  name: string;
  url: string | null;
  city: string | null;
  weeklyPrice: number | null;
  currency: string | null;
  roomType: RoomType | null;
  notes: string | null;
};

/*
 * Endpoints (all require sign-in; JSON):
 *  GET/POST   /pathora-api/community              feed / create {body, topic, destination?}
 *  DELETE     /pathora-api/community/[id]         delete own post
 *  POST       /pathora-api/community/[id]/like    toggle -> { liked, likeCount }
 *  GET/POST   /pathora-api/community/[id]/replies
 *  POST       /pathora-api/community/[id]/report  {reason, note?, replyId?}
 *  GET        /pathora-api/buddies                -> { buddies: BuddyDTO[] }
 *  GET/POST   /pathora-api/buddies/connections    -> { connections } / {toUserId}
 *  PATCH/DELETE /pathora-api/buddies/connections/[id]
 *  GET/PATCH  /pathora-api/buddy-profile          -> { profile: BuddyProfileDTO }
 *  GET/POST   /pathora-api/trips ; PATCH/DELETE /trips/[id] ; POST /trips/[id]/interest
 *  GET/PUT    /pathora-api/checklists/[checklist] {completedItems}
 *  GET/POST   /pathora-api/housing ; PATCH/DELETE /housing/[id]
 */
