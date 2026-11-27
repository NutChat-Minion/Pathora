import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'th');
  CREATE TYPE "public"."enum_users_roadmap_completed_stages" AS ENUM('build', 'review', 'submit');
  CREATE TYPE "public"."enum_users_student_profile_education_level" AS ENUM('high-school', 'bachelor', 'master');
  CREATE TYPE "public"."enum_users_student_profile_desired_degree" AS ENUM('bachelor', 'master', 'phd');
  CREATE TYPE "public"."enum_users_student_profile_english_test" AS ENUM('ielts', 'toefl', 'duolingo');
  CREATE TYPE "public"."enum_users_student_profile_funding_preference" AS ENUM('full', 'partial', 'self');
  CREATE TYPE "public"."enum_users_settings_language" AS ENUM('en', 'th');
  CREATE TYPE "public"."enum_users_settings_profile_visibility" AS ENUM('private', 'buddies');
  CREATE TYPE "public"."enum_users_subscription_plan" AS ENUM('starter', 'plus', 'multi', 'buffet');
  CREATE TYPE "public"."enum_users_subscription_status" AS ENUM('none', 'active', 'trialing', 'past_due', 'canceled', 'incomplete');
  CREATE TYPE "public"."enum__users_v_version_roadmap_completed_stages" AS ENUM('build', 'review', 'submit');
  CREATE TYPE "public"."enum__users_v_version_student_profile_education_level" AS ENUM('high-school', 'bachelor', 'master');
  CREATE TYPE "public"."enum__users_v_version_student_profile_desired_degree" AS ENUM('bachelor', 'master', 'phd');
  CREATE TYPE "public"."enum__users_v_version_student_profile_english_test" AS ENUM('ielts', 'toefl', 'duolingo');
  CREATE TYPE "public"."enum__users_v_version_student_profile_funding_preference" AS ENUM('full', 'partial', 'self');
  CREATE TYPE "public"."enum__users_v_version_settings_language" AS ENUM('en', 'th');
  CREATE TYPE "public"."enum__users_v_version_settings_profile_visibility" AS ENUM('private', 'buddies');
  CREATE TYPE "public"."enum__users_v_version_subscription_plan" AS ENUM('starter', 'plus', 'multi', 'buffet');
  CREATE TYPE "public"."enum__users_v_version_subscription_status" AS ENUM('none', 'active', 'trialing', 'past_due', 'canceled', 'incomplete');
  CREATE TYPE "public"."enum_opportunities_degree_levels" AS ENUM('bachelor', 'master', 'phd');
  CREATE TYPE "public"."enum_opportunities_type" AS ENUM('scholarship', 'university', 'program');
  CREATE TYPE "public"."enum_opportunities_listing_status" AS ENUM('active', 'expired', 'hidden');
  CREATE TYPE "public"."enum_opportunities_funding_type" AS ENUM('full', 'partial', 'waiver', 'none');
  CREATE TYPE "public"."enum_opportunities_origin" AS ENUM('ai', 'manual');
  CREATE TYPE "public"."enum__opportunities_v_version_degree_levels" AS ENUM('bachelor', 'master', 'phd');
  CREATE TYPE "public"."enum__opportunities_v_version_type" AS ENUM('scholarship', 'university', 'program');
  CREATE TYPE "public"."enum__opportunities_v_version_listing_status" AS ENUM('active', 'expired', 'hidden');
  CREATE TYPE "public"."enum__opportunities_v_version_funding_type" AS ENUM('full', 'partial', 'waiver', 'none');
  CREATE TYPE "public"."enum__opportunities_v_version_origin" AS ENUM('ai', 'manual');
  CREATE TYPE "public"."enum_application_plans_status" AS ENUM('interested', 'preparing', 'ready', 'submitted', 'accepted', 'rejected');
  CREATE TYPE "public"."enum__application_plans_v_version_status" AS ENUM('interested', 'preparing', 'ready', 'submitted', 'accepted', 'rejected');
  CREATE TYPE "public"."enum_profile_files_category" AS ENUM('profile-photo', 'passport', 'visa', 'portfolio', 'language-certificate', 'other');
  CREATE TYPE "public"."enum__profile_files_v_version_category" AS ENUM('profile-photo', 'passport', 'visa', 'portfolio', 'language-certificate', 'other');
  CREATE TYPE "public"."enum_research_topics_type" AS ENUM('scholarship', 'university', 'program');
  CREATE TYPE "public"."enum__research_topics_v_version_type" AS ENUM('scholarship', 'university', 'program');
  CREATE TYPE "public"."enum_research_runs_status" AS ENUM('success', 'partial', 'failed');
  CREATE TYPE "public"."enum__research_runs_v_version_status" AS ENUM('success', 'partial', 'failed');
  CREATE TYPE "public"."enum_community_posts_topic" AS ENUM('general', 'applications', 'housing', 'arrival', 'visa', 'money');
  CREATE TYPE "public"."enum_community_posts_status" AS ENUM('visible', 'flagged', 'hidden');
  CREATE TYPE "public"."enum__community_posts_v_version_topic" AS ENUM('general', 'applications', 'housing', 'arrival', 'visa', 'money');
  CREATE TYPE "public"."enum__community_posts_v_version_status" AS ENUM('visible', 'flagged', 'hidden');
  CREATE TYPE "public"."enum_post_replies_status" AS ENUM('visible', 'flagged', 'hidden');
  CREATE TYPE "public"."enum__post_replies_v_version_status" AS ENUM('visible', 'flagged', 'hidden');
  CREATE TYPE "public"."enum_post_reports_reason" AS ENUM('spam', 'harassment', 'misinformation', 'other');
  CREATE TYPE "public"."enum__post_reports_v_version_reason" AS ENUM('spam', 'harassment', 'misinformation', 'other');
  CREATE TYPE "public"."enum_buddy_connections_status" AS ENUM('pending', 'accepted', 'declined');
  CREATE TYPE "public"."enum__buddy_connections_v_version_status" AS ENUM('pending', 'accepted', 'declined');
  CREATE TYPE "public"."enum_trips_status" AS ENUM('open', 'closed');
  CREATE TYPE "public"."enum__trips_v_version_status" AS ENUM('open', 'closed');
  CREATE TYPE "public"."enum_checklist_progress_checklist" AS ENUM('visa', 'pre-departure');
  CREATE TYPE "public"."enum__checklist_progress_v_version_checklist" AS ENUM('visa', 'pre-departure');
  CREATE TYPE "public"."enum_housing_shortlist_room_type" AS ENUM('private-room', 'studio', 'shared', 'homestay', 'dorm');
  CREATE TYPE "public"."enum__housing_shortlist_v_version_room_type" AS ENUM('private-room', 'studio', 'shared', 'homestay', 'dorm');
  CREATE TYPE "public"."enum_payload_llm_instructions_entity_type" AS ENUM('collection', 'global');
  CREATE TABLE "admins_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"refresh_count" numeric,
  	"refreshed_at" timestamp(3) with time zone,
  	"label" varchar,
  	"type" varchar,
  	"metadata" jsonb
  );
  
  CREATE TABLE "admins" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "admins_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "users_roadmap_completed_stages" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roadmap_completed_stages",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_additional_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"refresh_count" numeric,
  	"refreshed_at" timestamp(3) with time zone,
  	"label" varchar,
  	"type" varchar,
  	"metadata" jsonb
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"student_profile_preferred_name" varchar,
  	"student_profile_phone" varchar,
  	"student_profile_date_of_birth" timestamp(3) with time zone,
  	"student_profile_nationality" varchar,
  	"student_profile_current_city" varchar,
  	"student_profile_education_level" "enum_users_student_profile_education_level",
  	"student_profile_institution" varchar,
  	"student_profile_gpa" numeric,
  	"student_profile_graduation_year" numeric,
  	"student_profile_desired_degree" "enum_users_student_profile_desired_degree",
  	"student_profile_preferred_field" varchar,
  	"student_profile_preferred_destination" varchar,
  	"student_profile_english_test" "enum_users_student_profile_english_test",
  	"student_profile_english_score" numeric,
  	"student_profile_annual_budget_thb" numeric,
  	"student_profile_funding_preference" "enum_users_student_profile_funding_preference",
  	"settings_language" "enum_users_settings_language" DEFAULT 'en',
  	"settings_timezone" varchar DEFAULT 'Asia/Bangkok',
  	"settings_email_updates" boolean DEFAULT true,
  	"settings_deadline_reminders" boolean DEFAULT true,
  	"settings_profile_visibility" "enum_users_settings_profile_visibility" DEFAULT 'private',
  	"buddy_profile_intake" varchar,
  	"buddy_profile_destination_city" varchar,
  	"buddy_profile_university" varchar,
  	"buddy_profile_bio" varchar,
  	"roadmap_active_plan_id" integer,
  	"subscription_stripe_customer_id" varchar,
  	"subscription_stripe_subscription_id" varchar,
  	"subscription_plan" "enum_users_subscription_plan",
  	"subscription_status" "enum_users_subscription_status" DEFAULT 'none',
  	"subscription_current_period_end" timestamp(3) with time zone,
  	"subscription_country_limit" numeric,
  	"local_import_done" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "users_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "users_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_users_v_version_roadmap_completed_stages" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__users_v_version_roadmap_completed_stages",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_users_v_version_additional_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_users_v_version_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"refresh_count" numeric,
  	"refreshed_at" timestamp(3) with time zone,
  	"label" varchar,
  	"type" varchar,
  	"metadata" jsonb
  );
  
  CREATE TABLE "_users_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_student_profile_preferred_name" varchar,
  	"version_student_profile_phone" varchar,
  	"version_student_profile_date_of_birth" timestamp(3) with time zone,
  	"version_student_profile_nationality" varchar,
  	"version_student_profile_current_city" varchar,
  	"version_student_profile_education_level" "enum__users_v_version_student_profile_education_level",
  	"version_student_profile_institution" varchar,
  	"version_student_profile_gpa" numeric,
  	"version_student_profile_graduation_year" numeric,
  	"version_student_profile_desired_degree" "enum__users_v_version_student_profile_desired_degree",
  	"version_student_profile_preferred_field" varchar,
  	"version_student_profile_preferred_destination" varchar,
  	"version_student_profile_english_test" "enum__users_v_version_student_profile_english_test",
  	"version_student_profile_english_score" numeric,
  	"version_student_profile_annual_budget_thb" numeric,
  	"version_student_profile_funding_preference" "enum__users_v_version_student_profile_funding_preference",
  	"version_settings_language" "enum__users_v_version_settings_language" DEFAULT 'en',
  	"version_settings_timezone" varchar DEFAULT 'Asia/Bangkok',
  	"version_settings_email_updates" boolean DEFAULT true,
  	"version_settings_deadline_reminders" boolean DEFAULT true,
  	"version_settings_profile_visibility" "enum__users_v_version_settings_profile_visibility" DEFAULT 'private',
  	"version_buddy_profile_intake" varchar,
  	"version_buddy_profile_destination_city" varchar,
  	"version_buddy_profile_university" varchar,
  	"version_buddy_profile_bio" varchar,
  	"version_roadmap_active_plan_id" integer,
  	"version_subscription_stripe_customer_id" varchar,
  	"version_subscription_stripe_subscription_id" varchar,
  	"version_subscription_plan" "enum__users_v_version_subscription_plan",
  	"version_subscription_status" "enum__users_v_version_subscription_status" DEFAULT 'none',
  	"version_subscription_current_period_end" timestamp(3) with time zone,
  	"version_subscription_country_limit" numeric,
  	"version_local_import_done" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_email" varchar NOT NULL,
  	"version_reset_password_token" varchar,
  	"version_reset_password_expiration" timestamp(3) with time zone,
  	"version_salt" varchar,
  	"version_hash" varchar,
  	"version_reset_password_requested_at" timestamp(3) with time zone,
  	"version_login_attempts" numeric DEFAULT 0,
  	"version_lock_until" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_users_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_users_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "opportunities_degree_levels" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_opportunities_degree_levels",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "opportunities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_opportunities_type" NOT NULL,
  	"listing_status" "enum_opportunities_listing_status" DEFAULT 'active' NOT NULL,
  	"slug" varchar NOT NULL,
  	"institution" varchar NOT NULL,
  	"country" varchar NOT NULL,
  	"city" varchar,
  	"funding_type" "enum_opportunities_funding_type",
  	"deadline" timestamp(3) with time zone,
  	"requirements_minimum_gpa" numeric,
  	"requirements_minimum_ielts" numeric,
  	"image_id" integer,
  	"source_url" varchar NOT NULL,
  	"last_verified_at" timestamp(3) with time zone,
  	"origin" "enum_opportunities_origin" DEFAULT 'manual' NOT NULL,
  	"sponsored" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "opportunities_locales" (
  	"title" varchar NOT NULL,
  	"summary" varchar,
  	"funding_summary" varchar,
  	"deadline_note" varchar,
  	"requirements_notes" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "opportunities_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "opportunities_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_opportunities_v_version_degree_levels" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__opportunities_v_version_degree_levels",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_opportunities_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_type" "enum__opportunities_v_version_type" NOT NULL,
  	"version_listing_status" "enum__opportunities_v_version_listing_status" DEFAULT 'active' NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_institution" varchar NOT NULL,
  	"version_country" varchar NOT NULL,
  	"version_city" varchar,
  	"version_funding_type" "enum__opportunities_v_version_funding_type",
  	"version_deadline" timestamp(3) with time zone,
  	"version_requirements_minimum_gpa" numeric,
  	"version_requirements_minimum_ielts" numeric,
  	"version_image_id" integer,
  	"version_source_url" varchar NOT NULL,
  	"version_last_verified_at" timestamp(3) with time zone,
  	"version_origin" "enum__opportunities_v_version_origin" DEFAULT 'manual' NOT NULL,
  	"version_sponsored" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_opportunities_v_locales" (
  	"version_title" varchar NOT NULL,
  	"version_summary" varchar,
  	"version_funding_summary" varchar,
  	"version_deadline_note" varchar,
  	"version_requirements_notes" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_opportunities_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_opportunities_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "saved_opportunities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer NOT NULL,
  	"opportunity_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "saved_opportunities_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_saved_opportunities_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_owner_id" integer NOT NULL,
  	"version_opportunity_id" integer NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_saved_opportunities_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "application_plans_tasks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"done" boolean DEFAULT false,
  	"due_date" timestamp(3) with time zone
  );
  
  CREATE TABLE "application_plans" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer NOT NULL,
  	"opportunity_id" integer NOT NULL,
  	"title" varchar NOT NULL,
  	"status" "enum_application_plans_status" DEFAULT 'preparing' NOT NULL,
  	"target_deadline" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "application_plans_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_application_plans_v_version_tasks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"done" boolean DEFAULT false,
  	"due_date" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_application_plans_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_owner_id" integer NOT NULL,
  	"version_opportunity_id" integer NOT NULL,
  	"version_title" varchar NOT NULL,
  	"version_status" "enum__application_plans_v_version_status" DEFAULT 'preparing' NOT NULL,
  	"version_target_deadline" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_application_plans_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "profile_files" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"category" "enum_profile_files_category" NOT NULL,
  	"owner_id" integer NOT NULL,
  	"prefix" varchar DEFAULT 'private',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"_stored" boolean,
  	"_transforms" jsonb,
  	"original_filename" varchar,
  	"original_url" varchar,
  	"original_mime_type" varchar,
  	"original_filesize" numeric,
  	"original_width" numeric,
  	"original_height" numeric,
  	"original_prefix" varchar,
  	"original__objectkey" varchar,
  	"original__stored" boolean,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "profile_files_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_profile_files_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_category" "enum__profile_files_v_version_category" NOT NULL,
  	"version_owner_id" integer NOT NULL,
  	"version_prefix" varchar DEFAULT 'private',
  	"version__objectkey" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_url" varchar,
  	"version_thumbnail_u_r_l" varchar,
  	"version_filename" varchar,
  	"version_mime_type" varchar,
  	"version_filesize" numeric,
  	"version_width" numeric,
  	"version_height" numeric,
  	"version__stored" boolean,
  	"version__transforms" jsonb,
  	"version_original_filename" varchar,
  	"version_original_url" varchar,
  	"version_original_mime_type" varchar,
  	"version_original_filesize" numeric,
  	"version_original_width" numeric,
  	"version_original_height" numeric,
  	"version_original_prefix" varchar,
  	"version_original__objectkey" varchar,
  	"version_original__stored" boolean,
  	"version_focal_x" numeric,
  	"version_focal_y" numeric,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_profile_files_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"_h_folders_id" integer,
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"_stored" boolean,
  	"_transforms" jsonb,
  	"original_filename" varchar,
  	"original_url" varchar,
  	"original_mime_type" varchar,
  	"original_filesize" numeric,
  	"original_width" numeric,
  	"original_height" numeric,
  	"original_prefix" varchar,
  	"original__objectkey" varchar,
  	"original__stored" boolean,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "media_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_media_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_alt" varchar NOT NULL,
  	"version__h_folders_id" integer,
  	"version_prefix" varchar DEFAULT '',
  	"version__objectkey" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_url" varchar,
  	"version_thumbnail_u_r_l" varchar,
  	"version_filename" varchar,
  	"version_mime_type" varchar,
  	"version_filesize" numeric,
  	"version_width" numeric,
  	"version_height" numeric,
  	"version__stored" boolean,
  	"version__transforms" jsonb,
  	"version_original_filename" varchar,
  	"version_original_url" varchar,
  	"version_original_mime_type" varchar,
  	"version_original_filesize" numeric,
  	"version_original_width" numeric,
  	"version_original_height" numeric,
  	"version_original_prefix" varchar,
  	"version_original__objectkey" varchar,
  	"version_original__stored" boolean,
  	"version_focal_x" numeric,
  	"version_focal_y" numeric,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_media_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "folders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_h_folders_id" integer,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "folders_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_folders_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__h_folders_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_folders_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_h_tags_id" integer,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tags_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_tags_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__h_tags_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_tags_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "research_topics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"query" varchar NOT NULL,
  	"country" varchar,
  	"type" "enum_research_topics_type" DEFAULT 'scholarship' NOT NULL,
  	"active" boolean DEFAULT true,
  	"priority" numeric DEFAULT 0,
  	"last_run_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "research_topics_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_research_topics_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_query" varchar NOT NULL,
  	"version_country" varchar,
  	"version_type" "enum__research_topics_v_version_type" DEFAULT 'scholarship' NOT NULL,
  	"version_active" boolean DEFAULT true,
  	"version_priority" numeric DEFAULT 0,
  	"version_last_run_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_research_topics_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "research_runs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"topic_id" integer,
  	"started_at" timestamp(3) with time zone NOT NULL,
  	"finished_at" timestamp(3) with time zone,
  	"status" "enum_research_runs_status" NOT NULL,
  	"created_count" numeric DEFAULT 0,
  	"updated_count" numeric DEFAULT 0,
  	"expired_count" numeric DEFAULT 0,
  	"error" varchar,
  	"model" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "research_runs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_research_runs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_topic_id" integer,
  	"version_started_at" timestamp(3) with time zone NOT NULL,
  	"version_finished_at" timestamp(3) with time zone,
  	"version_status" "enum__research_runs_v_version_status" NOT NULL,
  	"version_created_count" numeric DEFAULT 0,
  	"version_updated_count" numeric DEFAULT 0,
  	"version_expired_count" numeric DEFAULT 0,
  	"version_error" varchar,
  	"version_model" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_research_runs_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "community_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"author_id" integer NOT NULL,
  	"body" varchar NOT NULL,
  	"topic" "enum_community_posts_topic" DEFAULT 'general' NOT NULL,
  	"destination" varchar,
  	"status" "enum_community_posts_status" DEFAULT 'visible' NOT NULL,
  	"moderation_reason" varchar,
  	"like_count" numeric DEFAULT 0,
  	"reply_count" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "community_posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_community_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_author_id" integer NOT NULL,
  	"version_body" varchar NOT NULL,
  	"version_topic" "enum__community_posts_v_version_topic" DEFAULT 'general' NOT NULL,
  	"version_destination" varchar,
  	"version_status" "enum__community_posts_v_version_status" DEFAULT 'visible' NOT NULL,
  	"version_moderation_reason" varchar,
  	"version_like_count" numeric DEFAULT 0,
  	"version_reply_count" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_community_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "post_replies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"post_id" integer NOT NULL,
  	"author_id" integer NOT NULL,
  	"body" varchar NOT NULL,
  	"status" "enum_post_replies_status" DEFAULT 'visible' NOT NULL,
  	"moderation_reason" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "post_replies_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_post_replies_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_post_id" integer NOT NULL,
  	"version_author_id" integer NOT NULL,
  	"version_body" varchar NOT NULL,
  	"version_status" "enum__post_replies_v_version_status" DEFAULT 'visible' NOT NULL,
  	"version_moderation_reason" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_post_replies_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "post_likes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer NOT NULL,
  	"post_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "post_likes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_post_likes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_owner_id" integer NOT NULL,
  	"version_post_id" integer NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_post_likes_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "post_reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"post_id" integer NOT NULL,
  	"reply_id" integer,
  	"reporter_id" integer NOT NULL,
  	"reason" "enum_post_reports_reason" NOT NULL,
  	"note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "post_reports_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_post_reports_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_post_id" integer NOT NULL,
  	"version_reply_id" integer,
  	"version_reporter_id" integer NOT NULL,
  	"version_reason" "enum__post_reports_v_version_reason" NOT NULL,
  	"version_note" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_post_reports_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "buddy_connections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from_id" integer NOT NULL,
  	"to_id" integer NOT NULL,
  	"status" "enum_buddy_connections_status" DEFAULT 'pending' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "buddy_connections_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_buddy_connections_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_from_id" integer NOT NULL,
  	"version_to_id" integer NOT NULL,
  	"version_status" "enum__buddy_connections_v_version_status" DEFAULT 'pending' NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_buddy_connections_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "trips" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer NOT NULL,
  	"origin" varchar NOT NULL,
  	"destination" varchar NOT NULL,
  	"travel_date" timestamp(3) with time zone NOT NULL,
  	"flexible" boolean DEFAULT false,
  	"note" varchar,
  	"status" "enum_trips_status" DEFAULT 'open' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "trips_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_trips_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_owner_id" integer NOT NULL,
  	"version_origin" varchar NOT NULL,
  	"version_destination" varchar NOT NULL,
  	"version_travel_date" timestamp(3) with time zone NOT NULL,
  	"version_flexible" boolean DEFAULT false,
  	"version_note" varchar,
  	"version_status" "enum__trips_v_version_status" DEFAULT 'open' NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_trips_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "trip_interests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer NOT NULL,
  	"trip_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "trip_interests_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_trip_interests_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_owner_id" integer NOT NULL,
  	"version_trip_id" integer NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_trip_interests_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "checklist_progress" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer NOT NULL,
  	"checklist" "enum_checklist_progress_checklist" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "checklist_progress_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "checklist_progress_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_checklist_progress_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_owner_id" integer NOT NULL,
  	"version_checklist" "enum__checklist_progress_v_version_checklist" NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_checklist_progress_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_checklist_progress_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "housing_shortlist" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"url" varchar,
  	"city" varchar,
  	"weekly_price" numeric,
  	"currency" varchar,
  	"room_type" "enum_housing_shortlist_room_type",
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "housing_shortlist_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_housing_shortlist_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_owner_id" integer NOT NULL,
  	"version_name" varchar NOT NULL,
  	"version_url" varchar,
  	"version_city" varchar,
  	"version_weekly_price" numeric,
  	"version_currency" varchar,
  	"version_room_type" "enum__housing_shortlist_v_version_room_type",
  	"version_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_housing_shortlist_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer,
  	"opportunities_id" integer,
  	"saved_opportunities_id" integer,
  	"application_plans_id" integer,
  	"profile_files_id" integer,
  	"media_id" integer,
  	"folders_id" integer,
  	"tags_id" integer,
  	"research_topics_id" integer,
  	"research_runs_id" integer,
  	"community_posts_id" integer,
  	"post_replies_id" integer,
  	"post_likes_id" integer,
  	"post_reports_id" integer,
  	"buddy_connections_id" integer,
  	"trips_id" integer,
  	"trip_interests_id" integer,
  	"checklist_progress_id" integer,
  	"housing_shortlist_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_llm_instructions" (
  	"id" varchar PRIMARY KEY NOT NULL,
  	"entity_slug" varchar NOT NULL,
  	"entity_type" "enum_payload_llm_instructions_entity_type" NOT NULL,
  	"additional_instructions" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_llm_instructions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" varchar NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  ALTER TABLE "admins_sessions" ADD CONSTRAINT "admins_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "admins_rels" ADD CONSTRAINT "admins_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "admins_rels" ADD CONSTRAINT "admins_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "admins_rels" ADD CONSTRAINT "admins_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_roadmap_completed_stages" ADD CONSTRAINT "users_roadmap_completed_stages_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_additional_info" ADD CONSTRAINT "users_additional_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_roadmap_active_plan_id_application_plans_id_fk" FOREIGN KEY ("roadmap_active_plan_id") REFERENCES "public"."application_plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_texts" ADD CONSTRAINT "users_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_users_v_version_roadmap_completed_stages" ADD CONSTRAINT "_users_v_version_roadmap_completed_stages_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_users_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_users_v_version_additional_info" ADD CONSTRAINT "_users_v_version_additional_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_users_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_users_v_version_sessions" ADD CONSTRAINT "_users_v_version_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_users_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_users_v" ADD CONSTRAINT "_users_v_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_users_v" ADD CONSTRAINT "_users_v_version_roadmap_active_plan_id_application_plans_id_fk" FOREIGN KEY ("version_roadmap_active_plan_id") REFERENCES "public"."application_plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_users_v_texts" ADD CONSTRAINT "_users_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_users_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_users_v_rels" ADD CONSTRAINT "_users_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_users_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_users_v_rels" ADD CONSTRAINT "_users_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_users_v_rels" ADD CONSTRAINT "_users_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_degree_levels" ADD CONSTRAINT "opportunities_degree_levels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "opportunities_locales" ADD CONSTRAINT "opportunities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_texts" ADD CONSTRAINT "opportunities_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_rels" ADD CONSTRAINT "opportunities_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_rels" ADD CONSTRAINT "opportunities_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_rels" ADD CONSTRAINT "opportunities_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_version_degree_levels" ADD CONSTRAINT "_opportunities_v_version_degree_levels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v" ADD CONSTRAINT "_opportunities_v_parent_id_opportunities_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."opportunities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_opportunities_v" ADD CONSTRAINT "_opportunities_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_opportunities_v_locales" ADD CONSTRAINT "_opportunities_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_texts" ADD CONSTRAINT "_opportunities_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_rels" ADD CONSTRAINT "_opportunities_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_rels" ADD CONSTRAINT "_opportunities_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_rels" ADD CONSTRAINT "_opportunities_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "saved_opportunities" ADD CONSTRAINT "saved_opportunities_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "saved_opportunities" ADD CONSTRAINT "saved_opportunities_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "saved_opportunities_rels" ADD CONSTRAINT "saved_opportunities_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."saved_opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "saved_opportunities_rels" ADD CONSTRAINT "saved_opportunities_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "saved_opportunities_rels" ADD CONSTRAINT "saved_opportunities_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_saved_opportunities_v" ADD CONSTRAINT "_saved_opportunities_v_parent_id_saved_opportunities_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."saved_opportunities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_saved_opportunities_v" ADD CONSTRAINT "_saved_opportunities_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_saved_opportunities_v" ADD CONSTRAINT "_saved_opportunities_v_version_opportunity_id_oppor_60e04f05_fk" FOREIGN KEY ("version_opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_saved_opportunities_v_rels" ADD CONSTRAINT "_saved_opportunities_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_saved_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_saved_opportunities_v_rels" ADD CONSTRAINT "_saved_opportunities_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_saved_opportunities_v_rels" ADD CONSTRAINT "_saved_opportunities_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "application_plans_tasks" ADD CONSTRAINT "application_plans_tasks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."application_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "application_plans" ADD CONSTRAINT "application_plans_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "application_plans" ADD CONSTRAINT "application_plans_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "application_plans_rels" ADD CONSTRAINT "application_plans_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."application_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "application_plans_rels" ADD CONSTRAINT "application_plans_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "application_plans_rels" ADD CONSTRAINT "application_plans_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_application_plans_v_version_tasks" ADD CONSTRAINT "_application_plans_v_version_tasks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_application_plans_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_application_plans_v" ADD CONSTRAINT "_application_plans_v_parent_id_application_plans_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."application_plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_application_plans_v" ADD CONSTRAINT "_application_plans_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_application_plans_v" ADD CONSTRAINT "_application_plans_v_version_opportunity_id_opportunities_id_fk" FOREIGN KEY ("version_opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_application_plans_v_rels" ADD CONSTRAINT "_application_plans_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_application_plans_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_application_plans_v_rels" ADD CONSTRAINT "_application_plans_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_application_plans_v_rels" ADD CONSTRAINT "_application_plans_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_files" ADD CONSTRAINT "profile_files_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "profile_files_rels" ADD CONSTRAINT "profile_files_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."profile_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_files_rels" ADD CONSTRAINT "profile_files_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_files_rels" ADD CONSTRAINT "profile_files_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_profile_files_v" ADD CONSTRAINT "_profile_files_v_parent_id_profile_files_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."profile_files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_profile_files_v" ADD CONSTRAINT "_profile_files_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_profile_files_v_rels" ADD CONSTRAINT "_profile_files_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_profile_files_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_profile_files_v_rels" ADD CONSTRAINT "_profile_files_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_profile_files_v_rels" ADD CONSTRAINT "_profile_files_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media__h_folders_id_folders_id_fk" FOREIGN KEY ("_h_folders_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v" ADD CONSTRAINT "_media_v_parent_id_media_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_media_v" ADD CONSTRAINT "_media_v_version__h_folders_id_folders_id_fk" FOREIGN KEY ("version__h_folders_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_media_v_rels" ADD CONSTRAINT "_media_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_media_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v_rels" ADD CONSTRAINT "_media_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v_rels" ADD CONSTRAINT "_media_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v_rels" ADD CONSTRAINT "_media_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "folders" ADD CONSTRAINT "folders__h_folders_id_folders_id_fk" FOREIGN KEY ("_h_folders_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "folders_rels" ADD CONSTRAINT "folders_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "folders_rels" ADD CONSTRAINT "folders_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "folders_rels" ADD CONSTRAINT "folders_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_folders_v" ADD CONSTRAINT "_folders_v_parent_id_folders_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_folders_v" ADD CONSTRAINT "_folders_v_version__h_folders_id_folders_id_fk" FOREIGN KEY ("version__h_folders_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_folders_v_rels" ADD CONSTRAINT "_folders_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_folders_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_folders_v_rels" ADD CONSTRAINT "_folders_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_folders_v_rels" ADD CONSTRAINT "_folders_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tags" ADD CONSTRAINT "tags__h_tags_id_tags_id_fk" FOREIGN KEY ("_h_tags_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tags_rels" ADD CONSTRAINT "tags_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tags_rels" ADD CONSTRAINT "tags_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tags_rels" ADD CONSTRAINT "tags_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tags_v" ADD CONSTRAINT "_tags_v_parent_id_tags_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tags_v" ADD CONSTRAINT "_tags_v_version__h_tags_id_tags_id_fk" FOREIGN KEY ("version__h_tags_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tags_v_rels" ADD CONSTRAINT "_tags_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_tags_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tags_v_rels" ADD CONSTRAINT "_tags_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tags_v_rels" ADD CONSTRAINT "_tags_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "research_topics_rels" ADD CONSTRAINT "research_topics_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."research_topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "research_topics_rels" ADD CONSTRAINT "research_topics_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "research_topics_rels" ADD CONSTRAINT "research_topics_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_research_topics_v" ADD CONSTRAINT "_research_topics_v_parent_id_research_topics_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."research_topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_research_topics_v_rels" ADD CONSTRAINT "_research_topics_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_research_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_research_topics_v_rels" ADD CONSTRAINT "_research_topics_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_research_topics_v_rels" ADD CONSTRAINT "_research_topics_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "research_runs" ADD CONSTRAINT "research_runs_topic_id_research_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."research_topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "research_runs_rels" ADD CONSTRAINT "research_runs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."research_runs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "research_runs_rels" ADD CONSTRAINT "research_runs_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "research_runs_rels" ADD CONSTRAINT "research_runs_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_research_runs_v" ADD CONSTRAINT "_research_runs_v_parent_id_research_runs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."research_runs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_research_runs_v" ADD CONSTRAINT "_research_runs_v_version_topic_id_research_topics_id_fk" FOREIGN KEY ("version_topic_id") REFERENCES "public"."research_topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_research_runs_v_rels" ADD CONSTRAINT "_research_runs_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_research_runs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_research_runs_v_rels" ADD CONSTRAINT "_research_runs_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_research_runs_v_rels" ADD CONSTRAINT "_research_runs_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "community_posts_rels" ADD CONSTRAINT "community_posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "community_posts_rels" ADD CONSTRAINT "community_posts_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "community_posts_rels" ADD CONSTRAINT "community_posts_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_community_posts_v" ADD CONSTRAINT "_community_posts_v_parent_id_community_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."community_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_community_posts_v" ADD CONSTRAINT "_community_posts_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_community_posts_v_rels" ADD CONSTRAINT "_community_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_community_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_community_posts_v_rels" ADD CONSTRAINT "_community_posts_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_community_posts_v_rels" ADD CONSTRAINT "_community_posts_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "post_replies" ADD CONSTRAINT "post_replies_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "post_replies" ADD CONSTRAINT "post_replies_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "post_replies_rels" ADD CONSTRAINT "post_replies_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."post_replies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "post_replies_rels" ADD CONSTRAINT "post_replies_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "post_replies_rels" ADD CONSTRAINT "post_replies_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_post_replies_v" ADD CONSTRAINT "_post_replies_v_parent_id_post_replies_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."post_replies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_post_replies_v" ADD CONSTRAINT "_post_replies_v_version_post_id_community_posts_id_fk" FOREIGN KEY ("version_post_id") REFERENCES "public"."community_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_post_replies_v" ADD CONSTRAINT "_post_replies_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_post_replies_v_rels" ADD CONSTRAINT "_post_replies_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_post_replies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_post_replies_v_rels" ADD CONSTRAINT "_post_replies_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_post_replies_v_rels" ADD CONSTRAINT "_post_replies_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "post_likes_rels" ADD CONSTRAINT "post_likes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."post_likes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "post_likes_rels" ADD CONSTRAINT "post_likes_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "post_likes_rels" ADD CONSTRAINT "post_likes_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_post_likes_v" ADD CONSTRAINT "_post_likes_v_parent_id_post_likes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."post_likes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_post_likes_v" ADD CONSTRAINT "_post_likes_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_post_likes_v" ADD CONSTRAINT "_post_likes_v_version_post_id_community_posts_id_fk" FOREIGN KEY ("version_post_id") REFERENCES "public"."community_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_post_likes_v_rels" ADD CONSTRAINT "_post_likes_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_post_likes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_post_likes_v_rels" ADD CONSTRAINT "_post_likes_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_post_likes_v_rels" ADD CONSTRAINT "_post_likes_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "post_reports" ADD CONSTRAINT "post_reports_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "post_reports" ADD CONSTRAINT "post_reports_reply_id_post_replies_id_fk" FOREIGN KEY ("reply_id") REFERENCES "public"."post_replies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "post_reports" ADD CONSTRAINT "post_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "post_reports_rels" ADD CONSTRAINT "post_reports_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."post_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "post_reports_rels" ADD CONSTRAINT "post_reports_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "post_reports_rels" ADD CONSTRAINT "post_reports_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_post_reports_v" ADD CONSTRAINT "_post_reports_v_parent_id_post_reports_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."post_reports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_post_reports_v" ADD CONSTRAINT "_post_reports_v_version_post_id_community_posts_id_fk" FOREIGN KEY ("version_post_id") REFERENCES "public"."community_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_post_reports_v" ADD CONSTRAINT "_post_reports_v_version_reply_id_post_replies_id_fk" FOREIGN KEY ("version_reply_id") REFERENCES "public"."post_replies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_post_reports_v" ADD CONSTRAINT "_post_reports_v_version_reporter_id_users_id_fk" FOREIGN KEY ("version_reporter_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_post_reports_v_rels" ADD CONSTRAINT "_post_reports_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_post_reports_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_post_reports_v_rels" ADD CONSTRAINT "_post_reports_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_post_reports_v_rels" ADD CONSTRAINT "_post_reports_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "buddy_connections" ADD CONSTRAINT "buddy_connections_from_id_users_id_fk" FOREIGN KEY ("from_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "buddy_connections" ADD CONSTRAINT "buddy_connections_to_id_users_id_fk" FOREIGN KEY ("to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "buddy_connections_rels" ADD CONSTRAINT "buddy_connections_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."buddy_connections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "buddy_connections_rels" ADD CONSTRAINT "buddy_connections_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "buddy_connections_rels" ADD CONSTRAINT "buddy_connections_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_buddy_connections_v" ADD CONSTRAINT "_buddy_connections_v_parent_id_buddy_connections_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."buddy_connections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_buddy_connections_v" ADD CONSTRAINT "_buddy_connections_v_version_from_id_users_id_fk" FOREIGN KEY ("version_from_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_buddy_connections_v" ADD CONSTRAINT "_buddy_connections_v_version_to_id_users_id_fk" FOREIGN KEY ("version_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_buddy_connections_v_rels" ADD CONSTRAINT "_buddy_connections_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_buddy_connections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_buddy_connections_v_rels" ADD CONSTRAINT "_buddy_connections_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_buddy_connections_v_rels" ADD CONSTRAINT "_buddy_connections_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips" ADD CONSTRAINT "trips_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trips_rels" ADD CONSTRAINT "trips_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips_rels" ADD CONSTRAINT "trips_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips_rels" ADD CONSTRAINT "trips_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_trips_v" ADD CONSTRAINT "_trips_v_parent_id_trips_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."trips"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_trips_v" ADD CONSTRAINT "_trips_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_trips_v_rels" ADD CONSTRAINT "_trips_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_trips_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_trips_v_rels" ADD CONSTRAINT "_trips_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_trips_v_rels" ADD CONSTRAINT "_trips_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trip_interests" ADD CONSTRAINT "trip_interests_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trip_interests" ADD CONSTRAINT "trip_interests_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trip_interests_rels" ADD CONSTRAINT "trip_interests_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."trip_interests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trip_interests_rels" ADD CONSTRAINT "trip_interests_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trip_interests_rels" ADD CONSTRAINT "trip_interests_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_trip_interests_v" ADD CONSTRAINT "_trip_interests_v_parent_id_trip_interests_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."trip_interests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_trip_interests_v" ADD CONSTRAINT "_trip_interests_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_trip_interests_v" ADD CONSTRAINT "_trip_interests_v_version_trip_id_trips_id_fk" FOREIGN KEY ("version_trip_id") REFERENCES "public"."trips"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_trip_interests_v_rels" ADD CONSTRAINT "_trip_interests_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_trip_interests_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_trip_interests_v_rels" ADD CONSTRAINT "_trip_interests_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_trip_interests_v_rels" ADD CONSTRAINT "_trip_interests_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "checklist_progress" ADD CONSTRAINT "checklist_progress_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "checklist_progress_texts" ADD CONSTRAINT "checklist_progress_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."checklist_progress"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "checklist_progress_rels" ADD CONSTRAINT "checklist_progress_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."checklist_progress"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "checklist_progress_rels" ADD CONSTRAINT "checklist_progress_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "checklist_progress_rels" ADD CONSTRAINT "checklist_progress_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_checklist_progress_v" ADD CONSTRAINT "_checklist_progress_v_parent_id_checklist_progress_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."checklist_progress"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_checklist_progress_v" ADD CONSTRAINT "_checklist_progress_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_checklist_progress_v_texts" ADD CONSTRAINT "_checklist_progress_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_checklist_progress_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_checklist_progress_v_rels" ADD CONSTRAINT "_checklist_progress_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_checklist_progress_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_checklist_progress_v_rels" ADD CONSTRAINT "_checklist_progress_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_checklist_progress_v_rels" ADD CONSTRAINT "_checklist_progress_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "housing_shortlist" ADD CONSTRAINT "housing_shortlist_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "housing_shortlist_rels" ADD CONSTRAINT "housing_shortlist_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."housing_shortlist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "housing_shortlist_rels" ADD CONSTRAINT "housing_shortlist_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "housing_shortlist_rels" ADD CONSTRAINT "housing_shortlist_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_housing_shortlist_v" ADD CONSTRAINT "_housing_shortlist_v_parent_id_housing_shortlist_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."housing_shortlist"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_housing_shortlist_v" ADD CONSTRAINT "_housing_shortlist_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_housing_shortlist_v_rels" ADD CONSTRAINT "_housing_shortlist_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_housing_shortlist_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_housing_shortlist_v_rels" ADD CONSTRAINT "_housing_shortlist_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_housing_shortlist_v_rels" ADD CONSTRAINT "_housing_shortlist_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_opportunities_fk" FOREIGN KEY ("opportunities_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_saved_opportunities_fk" FOREIGN KEY ("saved_opportunities_id") REFERENCES "public"."saved_opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_application_plans_fk" FOREIGN KEY ("application_plans_id") REFERENCES "public"."application_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_profile_files_fk" FOREIGN KEY ("profile_files_id") REFERENCES "public"."profile_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_folders_fk" FOREIGN KEY ("folders_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_research_topics_fk" FOREIGN KEY ("research_topics_id") REFERENCES "public"."research_topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_research_runs_fk" FOREIGN KEY ("research_runs_id") REFERENCES "public"."research_runs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_community_posts_fk" FOREIGN KEY ("community_posts_id") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_post_replies_fk" FOREIGN KEY ("post_replies_id") REFERENCES "public"."post_replies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_post_likes_fk" FOREIGN KEY ("post_likes_id") REFERENCES "public"."post_likes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_post_reports_fk" FOREIGN KEY ("post_reports_id") REFERENCES "public"."post_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_buddy_connections_fk" FOREIGN KEY ("buddy_connections_id") REFERENCES "public"."buddy_connections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_trips_fk" FOREIGN KEY ("trips_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_trip_interests_fk" FOREIGN KEY ("trip_interests_id") REFERENCES "public"."trip_interests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_checklist_progress_fk" FOREIGN KEY ("checklist_progress_id") REFERENCES "public"."checklist_progress"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_housing_shortlist_fk" FOREIGN KEY ("housing_shortlist_id") REFERENCES "public"."housing_shortlist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_llm_instructions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "admins_sessions_order_idx" ON "admins_sessions" USING btree ("_order");
  CREATE INDEX "admins_sessions_parent_id_idx" ON "admins_sessions" USING btree ("_parent_id");
  CREATE INDEX "admins_updated_at_idx" ON "admins" USING btree ("updated_at");
  CREATE INDEX "admins_created_at_idx" ON "admins" USING btree ("created_at");
  CREATE UNIQUE INDEX "admins_email_idx" ON "admins" USING btree ("email");
  CREATE INDEX "admins_rels_order_idx" ON "admins_rels" USING btree ("order");
  CREATE INDEX "admins_rels_parent_idx" ON "admins_rels" USING btree ("parent_id");
  CREATE INDEX "admins_rels_path_idx" ON "admins_rels" USING btree ("path");
  CREATE INDEX "admins_rels_admins_id_idx" ON "admins_rels" USING btree ("admins_id");
  CREATE INDEX "admins_rels_users_id_idx" ON "admins_rels" USING btree ("users_id");
  CREATE INDEX "users_roadmap_completed_stages_order_idx" ON "users_roadmap_completed_stages" USING btree ("order");
  CREATE INDEX "users_roadmap_completed_stages_parent_idx" ON "users_roadmap_completed_stages" USING btree ("parent_id");
  CREATE INDEX "users_additional_info_order_idx" ON "users_additional_info" USING btree ("_order");
  CREATE INDEX "users_additional_info_parent_id_idx" ON "users_additional_info" USING btree ("_parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_roadmap_roadmap_active_plan_idx" ON "users" USING btree ("roadmap_active_plan_id");
  CREATE INDEX "users_subscription_subscription_stripe_customer_id_idx" ON "users" USING btree ("subscription_stripe_customer_id");
  CREATE INDEX "users_subscription_subscription_stripe_subscription_id_idx" ON "users" USING btree ("subscription_stripe_subscription_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "users_texts_order_parent" ON "users_texts" USING btree ("order","parent_id");
  CREATE INDEX "users_rels_order_idx" ON "users_rels" USING btree ("order");
  CREATE INDEX "users_rels_parent_idx" ON "users_rels" USING btree ("parent_id");
  CREATE INDEX "users_rels_path_idx" ON "users_rels" USING btree ("path");
  CREATE INDEX "users_rels_admins_id_idx" ON "users_rels" USING btree ("admins_id");
  CREATE INDEX "users_rels_users_id_idx" ON "users_rels" USING btree ("users_id");
  CREATE INDEX "_users_v_version_roadmap_completed_stages_order_idx" ON "_users_v_version_roadmap_completed_stages" USING btree ("order");
  CREATE INDEX "_users_v_version_roadmap_completed_stages_parent_idx" ON "_users_v_version_roadmap_completed_stages" USING btree ("parent_id");
  CREATE INDEX "_users_v_version_additional_info_order_idx" ON "_users_v_version_additional_info" USING btree ("_order");
  CREATE INDEX "_users_v_version_additional_info_parent_id_idx" ON "_users_v_version_additional_info" USING btree ("_parent_id");
  CREATE INDEX "_users_v_version_sessions_order_idx" ON "_users_v_version_sessions" USING btree ("_order");
  CREATE INDEX "_users_v_version_sessions_parent_id_idx" ON "_users_v_version_sessions" USING btree ("_parent_id");
  CREATE INDEX "_users_v_parent_idx" ON "_users_v" USING btree ("parent_id");
  CREATE INDEX "_users_v_version_roadmap_version_roadmap_active_plan_idx" ON "_users_v" USING btree ("version_roadmap_active_plan_id");
  CREATE INDEX "_users_v_version_subscription_version_subscription_strip_idx" ON "_users_v" USING btree ("version_subscription_stripe_customer_id");
  CREATE INDEX "_users_v_version_subscription_version_subscription_str_1_idx" ON "_users_v" USING btree ("version_subscription_stripe_subscription_id");
  CREATE INDEX "_users_v_version_version_updated_at_idx" ON "_users_v" USING btree ("version_updated_at");
  CREATE INDEX "_users_v_version_version_created_at_idx" ON "_users_v" USING btree ("version_created_at");
  CREATE INDEX "_users_v_version_version_email_idx" ON "_users_v" USING btree ("version_email");
  CREATE INDEX "_users_v_created_at_idx" ON "_users_v" USING btree ("created_at");
  CREATE INDEX "_users_v_updated_at_idx" ON "_users_v" USING btree ("updated_at");
  CREATE INDEX "_users_v_texts_order_parent" ON "_users_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_users_v_rels_order_idx" ON "_users_v_rels" USING btree ("order");
  CREATE INDEX "_users_v_rels_parent_idx" ON "_users_v_rels" USING btree ("parent_id");
  CREATE INDEX "_users_v_rels_path_idx" ON "_users_v_rels" USING btree ("path");
  CREATE INDEX "_users_v_rels_admins_id_idx" ON "_users_v_rels" USING btree ("admins_id");
  CREATE INDEX "_users_v_rels_users_id_idx" ON "_users_v_rels" USING btree ("users_id");
  CREATE INDEX "opportunities_degree_levels_order_idx" ON "opportunities_degree_levels" USING btree ("order");
  CREATE INDEX "opportunities_degree_levels_parent_idx" ON "opportunities_degree_levels" USING btree ("parent_id");
  CREATE INDEX "opportunities_type_idx" ON "opportunities" USING btree ("type");
  CREATE INDEX "opportunities_listing_status_idx" ON "opportunities" USING btree ("listing_status");
  CREATE UNIQUE INDEX "opportunities_slug_idx" ON "opportunities" USING btree ("slug");
  CREATE INDEX "opportunities_country_idx" ON "opportunities" USING btree ("country");
  CREATE INDEX "opportunities_deadline_idx" ON "opportunities" USING btree ("deadline");
  CREATE INDEX "opportunities_image_idx" ON "opportunities" USING btree ("image_id");
  CREATE INDEX "opportunities_updated_at_idx" ON "opportunities" USING btree ("updated_at");
  CREATE INDEX "opportunities_created_at_idx" ON "opportunities" USING btree ("created_at");
  CREATE UNIQUE INDEX "opportunities_locales_parent_id_locale_unique" ON "opportunities_locales" USING btree ("_parent_id","_locale");
  CREATE INDEX "opportunities_texts_order_parent" ON "opportunities_texts" USING btree ("order","parent_id");
  CREATE INDEX "opportunities_rels_order_idx" ON "opportunities_rels" USING btree ("order");
  CREATE INDEX "opportunities_rels_parent_idx" ON "opportunities_rels" USING btree ("parent_id");
  CREATE INDEX "opportunities_rels_path_idx" ON "opportunities_rels" USING btree ("path");
  CREATE INDEX "opportunities_rels_admins_id_idx" ON "opportunities_rels" USING btree ("admins_id");
  CREATE INDEX "opportunities_rels_users_id_idx" ON "opportunities_rels" USING btree ("users_id");
  CREATE INDEX "_opportunities_v_version_degree_levels_order_idx" ON "_opportunities_v_version_degree_levels" USING btree ("order");
  CREATE INDEX "_opportunities_v_version_degree_levels_parent_idx" ON "_opportunities_v_version_degree_levels" USING btree ("parent_id");
  CREATE INDEX "_opportunities_v_parent_idx" ON "_opportunities_v" USING btree ("parent_id");
  CREATE INDEX "_opportunities_v_version_version_type_idx" ON "_opportunities_v" USING btree ("version_type");
  CREATE INDEX "_opportunities_v_version_version_listing_status_idx" ON "_opportunities_v" USING btree ("version_listing_status");
  CREATE INDEX "_opportunities_v_version_version_slug_idx" ON "_opportunities_v" USING btree ("version_slug");
  CREATE INDEX "_opportunities_v_version_version_country_idx" ON "_opportunities_v" USING btree ("version_country");
  CREATE INDEX "_opportunities_v_version_version_deadline_idx" ON "_opportunities_v" USING btree ("version_deadline");
  CREATE INDEX "_opportunities_v_version_version_image_idx" ON "_opportunities_v" USING btree ("version_image_id");
  CREATE INDEX "_opportunities_v_version_version_updated_at_idx" ON "_opportunities_v" USING btree ("version_updated_at");
  CREATE INDEX "_opportunities_v_version_version_created_at_idx" ON "_opportunities_v" USING btree ("version_created_at");
  CREATE INDEX "_opportunities_v_created_at_idx" ON "_opportunities_v" USING btree ("created_at");
  CREATE INDEX "_opportunities_v_updated_at_idx" ON "_opportunities_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_opportunities_v_locales_parent_id_locale_unique" ON "_opportunities_v_locales" USING btree ("_parent_id","_locale");
  CREATE INDEX "_opportunities_v_texts_order_parent" ON "_opportunities_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_opportunities_v_rels_order_idx" ON "_opportunities_v_rels" USING btree ("order");
  CREATE INDEX "_opportunities_v_rels_parent_idx" ON "_opportunities_v_rels" USING btree ("parent_id");
  CREATE INDEX "_opportunities_v_rels_path_idx" ON "_opportunities_v_rels" USING btree ("path");
  CREATE INDEX "_opportunities_v_rels_admins_id_idx" ON "_opportunities_v_rels" USING btree ("admins_id");
  CREATE INDEX "_opportunities_v_rels_users_id_idx" ON "_opportunities_v_rels" USING btree ("users_id");
  CREATE INDEX "saved_opportunities_owner_idx" ON "saved_opportunities" USING btree ("owner_id");
  CREATE INDEX "saved_opportunities_opportunity_idx" ON "saved_opportunities" USING btree ("opportunity_id");
  CREATE INDEX "saved_opportunities_updated_at_idx" ON "saved_opportunities" USING btree ("updated_at");
  CREATE INDEX "saved_opportunities_created_at_idx" ON "saved_opportunities" USING btree ("created_at");
  CREATE UNIQUE INDEX "owner_opportunity_idx" ON "saved_opportunities" USING btree ("owner_id","opportunity_id");
  CREATE INDEX "saved_opportunities_rels_order_idx" ON "saved_opportunities_rels" USING btree ("order");
  CREATE INDEX "saved_opportunities_rels_parent_idx" ON "saved_opportunities_rels" USING btree ("parent_id");
  CREATE INDEX "saved_opportunities_rels_path_idx" ON "saved_opportunities_rels" USING btree ("path");
  CREATE INDEX "saved_opportunities_rels_admins_id_idx" ON "saved_opportunities_rels" USING btree ("admins_id");
  CREATE INDEX "saved_opportunities_rels_users_id_idx" ON "saved_opportunities_rels" USING btree ("users_id");
  CREATE INDEX "_saved_opportunities_v_parent_idx" ON "_saved_opportunities_v" USING btree ("parent_id");
  CREATE INDEX "_saved_opportunities_v_version_version_owner_idx" ON "_saved_opportunities_v" USING btree ("version_owner_id");
  CREATE INDEX "_saved_opportunities_v_version_version_opportunity_idx" ON "_saved_opportunities_v" USING btree ("version_opportunity_id");
  CREATE INDEX "_saved_opportunities_v_version_version_updated_at_idx" ON "_saved_opportunities_v" USING btree ("version_updated_at");
  CREATE INDEX "_saved_opportunities_v_version_version_created_at_idx" ON "_saved_opportunities_v" USING btree ("version_created_at");
  CREATE INDEX "_saved_opportunities_v_created_at_idx" ON "_saved_opportunities_v" USING btree ("created_at");
  CREATE INDEX "_saved_opportunities_v_updated_at_idx" ON "_saved_opportunities_v" USING btree ("updated_at");
  CREATE INDEX "version_owner_version_opportunity_idx" ON "_saved_opportunities_v" USING btree ("version_owner_id","version_opportunity_id");
  CREATE INDEX "_saved_opportunities_v_rels_order_idx" ON "_saved_opportunities_v_rels" USING btree ("order");
  CREATE INDEX "_saved_opportunities_v_rels_parent_idx" ON "_saved_opportunities_v_rels" USING btree ("parent_id");
  CREATE INDEX "_saved_opportunities_v_rels_path_idx" ON "_saved_opportunities_v_rels" USING btree ("path");
  CREATE INDEX "_saved_opportunities_v_rels_admins_id_idx" ON "_saved_opportunities_v_rels" USING btree ("admins_id");
  CREATE INDEX "_saved_opportunities_v_rels_users_id_idx" ON "_saved_opportunities_v_rels" USING btree ("users_id");
  CREATE INDEX "application_plans_tasks_order_idx" ON "application_plans_tasks" USING btree ("_order");
  CREATE INDEX "application_plans_tasks_parent_id_idx" ON "application_plans_tasks" USING btree ("_parent_id");
  CREATE INDEX "application_plans_owner_idx" ON "application_plans" USING btree ("owner_id");
  CREATE INDEX "application_plans_opportunity_idx" ON "application_plans" USING btree ("opportunity_id");
  CREATE INDEX "application_plans_updated_at_idx" ON "application_plans" USING btree ("updated_at");
  CREATE INDEX "application_plans_created_at_idx" ON "application_plans" USING btree ("created_at");
  CREATE UNIQUE INDEX "owner_opportunity_1_idx" ON "application_plans" USING btree ("owner_id","opportunity_id");
  CREATE INDEX "application_plans_rels_order_idx" ON "application_plans_rels" USING btree ("order");
  CREATE INDEX "application_plans_rels_parent_idx" ON "application_plans_rels" USING btree ("parent_id");
  CREATE INDEX "application_plans_rels_path_idx" ON "application_plans_rels" USING btree ("path");
  CREATE INDEX "application_plans_rels_admins_id_idx" ON "application_plans_rels" USING btree ("admins_id");
  CREATE INDEX "application_plans_rels_users_id_idx" ON "application_plans_rels" USING btree ("users_id");
  CREATE INDEX "_application_plans_v_version_tasks_order_idx" ON "_application_plans_v_version_tasks" USING btree ("_order");
  CREATE INDEX "_application_plans_v_version_tasks_parent_id_idx" ON "_application_plans_v_version_tasks" USING btree ("_parent_id");
  CREATE INDEX "_application_plans_v_parent_idx" ON "_application_plans_v" USING btree ("parent_id");
  CREATE INDEX "_application_plans_v_version_version_owner_idx" ON "_application_plans_v" USING btree ("version_owner_id");
  CREATE INDEX "_application_plans_v_version_version_opportunity_idx" ON "_application_plans_v" USING btree ("version_opportunity_id");
  CREATE INDEX "_application_plans_v_version_version_updated_at_idx" ON "_application_plans_v" USING btree ("version_updated_at");
  CREATE INDEX "_application_plans_v_version_version_created_at_idx" ON "_application_plans_v" USING btree ("version_created_at");
  CREATE INDEX "_application_plans_v_created_at_idx" ON "_application_plans_v" USING btree ("created_at");
  CREATE INDEX "_application_plans_v_updated_at_idx" ON "_application_plans_v" USING btree ("updated_at");
  CREATE INDEX "version_owner_version_opportunity_1_idx" ON "_application_plans_v" USING btree ("version_owner_id","version_opportunity_id");
  CREATE INDEX "_application_plans_v_rels_order_idx" ON "_application_plans_v_rels" USING btree ("order");
  CREATE INDEX "_application_plans_v_rels_parent_idx" ON "_application_plans_v_rels" USING btree ("parent_id");
  CREATE INDEX "_application_plans_v_rels_path_idx" ON "_application_plans_v_rels" USING btree ("path");
  CREATE INDEX "_application_plans_v_rels_admins_id_idx" ON "_application_plans_v_rels" USING btree ("admins_id");
  CREATE INDEX "_application_plans_v_rels_users_id_idx" ON "_application_plans_v_rels" USING btree ("users_id");
  CREATE INDEX "profile_files_owner_idx" ON "profile_files" USING btree ("owner_id");
  CREATE INDEX "profile_files_updated_at_idx" ON "profile_files" USING btree ("updated_at");
  CREATE INDEX "profile_files_created_at_idx" ON "profile_files" USING btree ("created_at");
  CREATE UNIQUE INDEX "profile_files_filename_idx" ON "profile_files" USING btree ("filename");
  CREATE INDEX "profile_files_original_original_filename_idx" ON "profile_files" USING btree ("original_filename");
  CREATE INDEX "profile_files_rels_order_idx" ON "profile_files_rels" USING btree ("order");
  CREATE INDEX "profile_files_rels_parent_idx" ON "profile_files_rels" USING btree ("parent_id");
  CREATE INDEX "profile_files_rels_path_idx" ON "profile_files_rels" USING btree ("path");
  CREATE INDEX "profile_files_rels_admins_id_idx" ON "profile_files_rels" USING btree ("admins_id");
  CREATE INDEX "profile_files_rels_users_id_idx" ON "profile_files_rels" USING btree ("users_id");
  CREATE INDEX "_profile_files_v_parent_idx" ON "_profile_files_v" USING btree ("parent_id");
  CREATE INDEX "_profile_files_v_version_version_owner_idx" ON "_profile_files_v" USING btree ("version_owner_id");
  CREATE INDEX "_profile_files_v_version_version_updated_at_idx" ON "_profile_files_v" USING btree ("version_updated_at");
  CREATE INDEX "_profile_files_v_version_version_created_at_idx" ON "_profile_files_v" USING btree ("version_created_at");
  CREATE INDEX "_profile_files_v_version_version_filename_idx" ON "_profile_files_v" USING btree ("version_filename");
  CREATE INDEX "_profile_files_v_version_original_version_original_filen_idx" ON "_profile_files_v" USING btree ("version_original_filename");
  CREATE INDEX "_profile_files_v_created_at_idx" ON "_profile_files_v" USING btree ("created_at");
  CREATE INDEX "_profile_files_v_updated_at_idx" ON "_profile_files_v" USING btree ("updated_at");
  CREATE INDEX "_profile_files_v_rels_order_idx" ON "_profile_files_v_rels" USING btree ("order");
  CREATE INDEX "_profile_files_v_rels_parent_idx" ON "_profile_files_v_rels" USING btree ("parent_id");
  CREATE INDEX "_profile_files_v_rels_path_idx" ON "_profile_files_v_rels" USING btree ("path");
  CREATE INDEX "_profile_files_v_rels_admins_id_idx" ON "_profile_files_v_rels" USING btree ("admins_id");
  CREATE INDEX "_profile_files_v_rels_users_id_idx" ON "_profile_files_v_rels" USING btree ("users_id");
  CREATE INDEX "media__h_folders_idx" ON "media" USING btree ("_h_folders_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_original_original_filename_idx" ON "media" USING btree ("original_filename");
  CREATE INDEX "media_rels_order_idx" ON "media_rels" USING btree ("order");
  CREATE INDEX "media_rels_parent_idx" ON "media_rels" USING btree ("parent_id");
  CREATE INDEX "media_rels_path_idx" ON "media_rels" USING btree ("path");
  CREATE INDEX "media_rels_tags_id_idx" ON "media_rels" USING btree ("tags_id");
  CREATE INDEX "media_rels_admins_id_idx" ON "media_rels" USING btree ("admins_id");
  CREATE INDEX "media_rels_users_id_idx" ON "media_rels" USING btree ("users_id");
  CREATE INDEX "_media_v_parent_idx" ON "_media_v" USING btree ("parent_id");
  CREATE INDEX "_media_v_version_version__h_folders_idx" ON "_media_v" USING btree ("version__h_folders_id");
  CREATE INDEX "_media_v_version_version_updated_at_idx" ON "_media_v" USING btree ("version_updated_at");
  CREATE INDEX "_media_v_version_version_created_at_idx" ON "_media_v" USING btree ("version_created_at");
  CREATE INDEX "_media_v_version_version_filename_idx" ON "_media_v" USING btree ("version_filename");
  CREATE INDEX "_media_v_version_original_version_original_filename_idx" ON "_media_v" USING btree ("version_original_filename");
  CREATE INDEX "_media_v_created_at_idx" ON "_media_v" USING btree ("created_at");
  CREATE INDEX "_media_v_updated_at_idx" ON "_media_v" USING btree ("updated_at");
  CREATE INDEX "_media_v_rels_order_idx" ON "_media_v_rels" USING btree ("order");
  CREATE INDEX "_media_v_rels_parent_idx" ON "_media_v_rels" USING btree ("parent_id");
  CREATE INDEX "_media_v_rels_path_idx" ON "_media_v_rels" USING btree ("path");
  CREATE INDEX "_media_v_rels_tags_id_idx" ON "_media_v_rels" USING btree ("tags_id");
  CREATE INDEX "_media_v_rels_admins_id_idx" ON "_media_v_rels" USING btree ("admins_id");
  CREATE INDEX "_media_v_rels_users_id_idx" ON "_media_v_rels" USING btree ("users_id");
  CREATE INDEX "folders__h_folders_idx" ON "folders" USING btree ("_h_folders_id");
  CREATE INDEX "folders_updated_at_idx" ON "folders" USING btree ("updated_at");
  CREATE INDEX "folders_created_at_idx" ON "folders" USING btree ("created_at");
  CREATE INDEX "folders_rels_order_idx" ON "folders_rels" USING btree ("order");
  CREATE INDEX "folders_rels_parent_idx" ON "folders_rels" USING btree ("parent_id");
  CREATE INDEX "folders_rels_path_idx" ON "folders_rels" USING btree ("path");
  CREATE INDEX "folders_rels_admins_id_idx" ON "folders_rels" USING btree ("admins_id");
  CREATE INDEX "folders_rels_users_id_idx" ON "folders_rels" USING btree ("users_id");
  CREATE INDEX "_folders_v_parent_idx" ON "_folders_v" USING btree ("parent_id");
  CREATE INDEX "_folders_v_version_version__h_folders_idx" ON "_folders_v" USING btree ("version__h_folders_id");
  CREATE INDEX "_folders_v_version_version_updated_at_idx" ON "_folders_v" USING btree ("version_updated_at");
  CREATE INDEX "_folders_v_version_version_created_at_idx" ON "_folders_v" USING btree ("version_created_at");
  CREATE INDEX "_folders_v_created_at_idx" ON "_folders_v" USING btree ("created_at");
  CREATE INDEX "_folders_v_updated_at_idx" ON "_folders_v" USING btree ("updated_at");
  CREATE INDEX "_folders_v_rels_order_idx" ON "_folders_v_rels" USING btree ("order");
  CREATE INDEX "_folders_v_rels_parent_idx" ON "_folders_v_rels" USING btree ("parent_id");
  CREATE INDEX "_folders_v_rels_path_idx" ON "_folders_v_rels" USING btree ("path");
  CREATE INDEX "_folders_v_rels_admins_id_idx" ON "_folders_v_rels" USING btree ("admins_id");
  CREATE INDEX "_folders_v_rels_users_id_idx" ON "_folders_v_rels" USING btree ("users_id");
  CREATE INDEX "tags__h_tags_idx" ON "tags" USING btree ("_h_tags_id");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE INDEX "tags_rels_order_idx" ON "tags_rels" USING btree ("order");
  CREATE INDEX "tags_rels_parent_idx" ON "tags_rels" USING btree ("parent_id");
  CREATE INDEX "tags_rels_path_idx" ON "tags_rels" USING btree ("path");
  CREATE INDEX "tags_rels_admins_id_idx" ON "tags_rels" USING btree ("admins_id");
  CREATE INDEX "tags_rels_users_id_idx" ON "tags_rels" USING btree ("users_id");
  CREATE INDEX "_tags_v_parent_idx" ON "_tags_v" USING btree ("parent_id");
  CREATE INDEX "_tags_v_version_version__h_tags_idx" ON "_tags_v" USING btree ("version__h_tags_id");
  CREATE INDEX "_tags_v_version_version_updated_at_idx" ON "_tags_v" USING btree ("version_updated_at");
  CREATE INDEX "_tags_v_version_version_created_at_idx" ON "_tags_v" USING btree ("version_created_at");
  CREATE INDEX "_tags_v_created_at_idx" ON "_tags_v" USING btree ("created_at");
  CREATE INDEX "_tags_v_updated_at_idx" ON "_tags_v" USING btree ("updated_at");
  CREATE INDEX "_tags_v_rels_order_idx" ON "_tags_v_rels" USING btree ("order");
  CREATE INDEX "_tags_v_rels_parent_idx" ON "_tags_v_rels" USING btree ("parent_id");
  CREATE INDEX "_tags_v_rels_path_idx" ON "_tags_v_rels" USING btree ("path");
  CREATE INDEX "_tags_v_rels_admins_id_idx" ON "_tags_v_rels" USING btree ("admins_id");
  CREATE INDEX "_tags_v_rels_users_id_idx" ON "_tags_v_rels" USING btree ("users_id");
  CREATE INDEX "research_topics_active_idx" ON "research_topics" USING btree ("active");
  CREATE INDEX "research_topics_last_run_at_idx" ON "research_topics" USING btree ("last_run_at");
  CREATE INDEX "research_topics_updated_at_idx" ON "research_topics" USING btree ("updated_at");
  CREATE INDEX "research_topics_created_at_idx" ON "research_topics" USING btree ("created_at");
  CREATE INDEX "research_topics_rels_order_idx" ON "research_topics_rels" USING btree ("order");
  CREATE INDEX "research_topics_rels_parent_idx" ON "research_topics_rels" USING btree ("parent_id");
  CREATE INDEX "research_topics_rels_path_idx" ON "research_topics_rels" USING btree ("path");
  CREATE INDEX "research_topics_rels_admins_id_idx" ON "research_topics_rels" USING btree ("admins_id");
  CREATE INDEX "research_topics_rels_users_id_idx" ON "research_topics_rels" USING btree ("users_id");
  CREATE INDEX "_research_topics_v_parent_idx" ON "_research_topics_v" USING btree ("parent_id");
  CREATE INDEX "_research_topics_v_version_version_active_idx" ON "_research_topics_v" USING btree ("version_active");
  CREATE INDEX "_research_topics_v_version_version_last_run_at_idx" ON "_research_topics_v" USING btree ("version_last_run_at");
  CREATE INDEX "_research_topics_v_version_version_updated_at_idx" ON "_research_topics_v" USING btree ("version_updated_at");
  CREATE INDEX "_research_topics_v_version_version_created_at_idx" ON "_research_topics_v" USING btree ("version_created_at");
  CREATE INDEX "_research_topics_v_created_at_idx" ON "_research_topics_v" USING btree ("created_at");
  CREATE INDEX "_research_topics_v_updated_at_idx" ON "_research_topics_v" USING btree ("updated_at");
  CREATE INDEX "_research_topics_v_rels_order_idx" ON "_research_topics_v_rels" USING btree ("order");
  CREATE INDEX "_research_topics_v_rels_parent_idx" ON "_research_topics_v_rels" USING btree ("parent_id");
  CREATE INDEX "_research_topics_v_rels_path_idx" ON "_research_topics_v_rels" USING btree ("path");
  CREATE INDEX "_research_topics_v_rels_admins_id_idx" ON "_research_topics_v_rels" USING btree ("admins_id");
  CREATE INDEX "_research_topics_v_rels_users_id_idx" ON "_research_topics_v_rels" USING btree ("users_id");
  CREATE INDEX "research_runs_topic_idx" ON "research_runs" USING btree ("topic_id");
  CREATE INDEX "research_runs_started_at_idx" ON "research_runs" USING btree ("started_at");
  CREATE INDEX "research_runs_updated_at_idx" ON "research_runs" USING btree ("updated_at");
  CREATE INDEX "research_runs_created_at_idx" ON "research_runs" USING btree ("created_at");
  CREATE INDEX "research_runs_rels_order_idx" ON "research_runs_rels" USING btree ("order");
  CREATE INDEX "research_runs_rels_parent_idx" ON "research_runs_rels" USING btree ("parent_id");
  CREATE INDEX "research_runs_rels_path_idx" ON "research_runs_rels" USING btree ("path");
  CREATE INDEX "research_runs_rels_admins_id_idx" ON "research_runs_rels" USING btree ("admins_id");
  CREATE INDEX "research_runs_rels_users_id_idx" ON "research_runs_rels" USING btree ("users_id");
  CREATE INDEX "_research_runs_v_parent_idx" ON "_research_runs_v" USING btree ("parent_id");
  CREATE INDEX "_research_runs_v_version_version_topic_idx" ON "_research_runs_v" USING btree ("version_topic_id");
  CREATE INDEX "_research_runs_v_version_version_started_at_idx" ON "_research_runs_v" USING btree ("version_started_at");
  CREATE INDEX "_research_runs_v_version_version_updated_at_idx" ON "_research_runs_v" USING btree ("version_updated_at");
  CREATE INDEX "_research_runs_v_version_version_created_at_idx" ON "_research_runs_v" USING btree ("version_created_at");
  CREATE INDEX "_research_runs_v_created_at_idx" ON "_research_runs_v" USING btree ("created_at");
  CREATE INDEX "_research_runs_v_updated_at_idx" ON "_research_runs_v" USING btree ("updated_at");
  CREATE INDEX "_research_runs_v_rels_order_idx" ON "_research_runs_v_rels" USING btree ("order");
  CREATE INDEX "_research_runs_v_rels_parent_idx" ON "_research_runs_v_rels" USING btree ("parent_id");
  CREATE INDEX "_research_runs_v_rels_path_idx" ON "_research_runs_v_rels" USING btree ("path");
  CREATE INDEX "_research_runs_v_rels_admins_id_idx" ON "_research_runs_v_rels" USING btree ("admins_id");
  CREATE INDEX "_research_runs_v_rels_users_id_idx" ON "_research_runs_v_rels" USING btree ("users_id");
  CREATE INDEX "community_posts_author_idx" ON "community_posts" USING btree ("author_id");
  CREATE INDEX "community_posts_status_idx" ON "community_posts" USING btree ("status");
  CREATE INDEX "community_posts_updated_at_idx" ON "community_posts" USING btree ("updated_at");
  CREATE INDEX "community_posts_created_at_idx" ON "community_posts" USING btree ("created_at");
  CREATE INDEX "community_posts_rels_order_idx" ON "community_posts_rels" USING btree ("order");
  CREATE INDEX "community_posts_rels_parent_idx" ON "community_posts_rels" USING btree ("parent_id");
  CREATE INDEX "community_posts_rels_path_idx" ON "community_posts_rels" USING btree ("path");
  CREATE INDEX "community_posts_rels_admins_id_idx" ON "community_posts_rels" USING btree ("admins_id");
  CREATE INDEX "community_posts_rels_users_id_idx" ON "community_posts_rels" USING btree ("users_id");
  CREATE INDEX "_community_posts_v_parent_idx" ON "_community_posts_v" USING btree ("parent_id");
  CREATE INDEX "_community_posts_v_version_version_author_idx" ON "_community_posts_v" USING btree ("version_author_id");
  CREATE INDEX "_community_posts_v_version_version_status_idx" ON "_community_posts_v" USING btree ("version_status");
  CREATE INDEX "_community_posts_v_version_version_updated_at_idx" ON "_community_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_community_posts_v_version_version_created_at_idx" ON "_community_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_community_posts_v_created_at_idx" ON "_community_posts_v" USING btree ("created_at");
  CREATE INDEX "_community_posts_v_updated_at_idx" ON "_community_posts_v" USING btree ("updated_at");
  CREATE INDEX "_community_posts_v_rels_order_idx" ON "_community_posts_v_rels" USING btree ("order");
  CREATE INDEX "_community_posts_v_rels_parent_idx" ON "_community_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_community_posts_v_rels_path_idx" ON "_community_posts_v_rels" USING btree ("path");
  CREATE INDEX "_community_posts_v_rels_admins_id_idx" ON "_community_posts_v_rels" USING btree ("admins_id");
  CREATE INDEX "_community_posts_v_rels_users_id_idx" ON "_community_posts_v_rels" USING btree ("users_id");
  CREATE INDEX "post_replies_post_idx" ON "post_replies" USING btree ("post_id");
  CREATE INDEX "post_replies_author_idx" ON "post_replies" USING btree ("author_id");
  CREATE INDEX "post_replies_updated_at_idx" ON "post_replies" USING btree ("updated_at");
  CREATE INDEX "post_replies_created_at_idx" ON "post_replies" USING btree ("created_at");
  CREATE INDEX "post_createdAt_idx" ON "post_replies" USING btree ("post_id","created_at");
  CREATE INDEX "post_replies_rels_order_idx" ON "post_replies_rels" USING btree ("order");
  CREATE INDEX "post_replies_rels_parent_idx" ON "post_replies_rels" USING btree ("parent_id");
  CREATE INDEX "post_replies_rels_path_idx" ON "post_replies_rels" USING btree ("path");
  CREATE INDEX "post_replies_rels_admins_id_idx" ON "post_replies_rels" USING btree ("admins_id");
  CREATE INDEX "post_replies_rels_users_id_idx" ON "post_replies_rels" USING btree ("users_id");
  CREATE INDEX "_post_replies_v_parent_idx" ON "_post_replies_v" USING btree ("parent_id");
  CREATE INDEX "_post_replies_v_version_version_post_idx" ON "_post_replies_v" USING btree ("version_post_id");
  CREATE INDEX "_post_replies_v_version_version_author_idx" ON "_post_replies_v" USING btree ("version_author_id");
  CREATE INDEX "_post_replies_v_version_version_updated_at_idx" ON "_post_replies_v" USING btree ("version_updated_at");
  CREATE INDEX "_post_replies_v_version_version_created_at_idx" ON "_post_replies_v" USING btree ("version_created_at");
  CREATE INDEX "_post_replies_v_created_at_idx" ON "_post_replies_v" USING btree ("created_at");
  CREATE INDEX "_post_replies_v_updated_at_idx" ON "_post_replies_v" USING btree ("updated_at");
  CREATE INDEX "version_post_version_createdAt_idx" ON "_post_replies_v" USING btree ("version_post_id","version_created_at");
  CREATE INDEX "_post_replies_v_rels_order_idx" ON "_post_replies_v_rels" USING btree ("order");
  CREATE INDEX "_post_replies_v_rels_parent_idx" ON "_post_replies_v_rels" USING btree ("parent_id");
  CREATE INDEX "_post_replies_v_rels_path_idx" ON "_post_replies_v_rels" USING btree ("path");
  CREATE INDEX "_post_replies_v_rels_admins_id_idx" ON "_post_replies_v_rels" USING btree ("admins_id");
  CREATE INDEX "_post_replies_v_rels_users_id_idx" ON "_post_replies_v_rels" USING btree ("users_id");
  CREATE INDEX "post_likes_owner_idx" ON "post_likes" USING btree ("owner_id");
  CREATE INDEX "post_likes_post_idx" ON "post_likes" USING btree ("post_id");
  CREATE INDEX "post_likes_updated_at_idx" ON "post_likes" USING btree ("updated_at");
  CREATE INDEX "post_likes_created_at_idx" ON "post_likes" USING btree ("created_at");
  CREATE UNIQUE INDEX "owner_post_idx" ON "post_likes" USING btree ("owner_id","post_id");
  CREATE INDEX "post_likes_rels_order_idx" ON "post_likes_rels" USING btree ("order");
  CREATE INDEX "post_likes_rels_parent_idx" ON "post_likes_rels" USING btree ("parent_id");
  CREATE INDEX "post_likes_rels_path_idx" ON "post_likes_rels" USING btree ("path");
  CREATE INDEX "post_likes_rels_admins_id_idx" ON "post_likes_rels" USING btree ("admins_id");
  CREATE INDEX "post_likes_rels_users_id_idx" ON "post_likes_rels" USING btree ("users_id");
  CREATE INDEX "_post_likes_v_parent_idx" ON "_post_likes_v" USING btree ("parent_id");
  CREATE INDEX "_post_likes_v_version_version_owner_idx" ON "_post_likes_v" USING btree ("version_owner_id");
  CREATE INDEX "_post_likes_v_version_version_post_idx" ON "_post_likes_v" USING btree ("version_post_id");
  CREATE INDEX "_post_likes_v_version_version_updated_at_idx" ON "_post_likes_v" USING btree ("version_updated_at");
  CREATE INDEX "_post_likes_v_version_version_created_at_idx" ON "_post_likes_v" USING btree ("version_created_at");
  CREATE INDEX "_post_likes_v_created_at_idx" ON "_post_likes_v" USING btree ("created_at");
  CREATE INDEX "_post_likes_v_updated_at_idx" ON "_post_likes_v" USING btree ("updated_at");
  CREATE INDEX "version_owner_version_post_idx" ON "_post_likes_v" USING btree ("version_owner_id","version_post_id");
  CREATE INDEX "_post_likes_v_rels_order_idx" ON "_post_likes_v_rels" USING btree ("order");
  CREATE INDEX "_post_likes_v_rels_parent_idx" ON "_post_likes_v_rels" USING btree ("parent_id");
  CREATE INDEX "_post_likes_v_rels_path_idx" ON "_post_likes_v_rels" USING btree ("path");
  CREATE INDEX "_post_likes_v_rels_admins_id_idx" ON "_post_likes_v_rels" USING btree ("admins_id");
  CREATE INDEX "_post_likes_v_rels_users_id_idx" ON "_post_likes_v_rels" USING btree ("users_id");
  CREATE INDEX "post_reports_post_idx" ON "post_reports" USING btree ("post_id");
  CREATE INDEX "post_reports_reply_idx" ON "post_reports" USING btree ("reply_id");
  CREATE INDEX "post_reports_reporter_idx" ON "post_reports" USING btree ("reporter_id");
  CREATE INDEX "post_reports_updated_at_idx" ON "post_reports" USING btree ("updated_at");
  CREATE INDEX "post_reports_created_at_idx" ON "post_reports" USING btree ("created_at");
  CREATE UNIQUE INDEX "reporter_post_reply_idx" ON "post_reports" USING btree ("reporter_id","post_id","reply_id");
  CREATE INDEX "post_reports_rels_order_idx" ON "post_reports_rels" USING btree ("order");
  CREATE INDEX "post_reports_rels_parent_idx" ON "post_reports_rels" USING btree ("parent_id");
  CREATE INDEX "post_reports_rels_path_idx" ON "post_reports_rels" USING btree ("path");
  CREATE INDEX "post_reports_rels_admins_id_idx" ON "post_reports_rels" USING btree ("admins_id");
  CREATE INDEX "post_reports_rels_users_id_idx" ON "post_reports_rels" USING btree ("users_id");
  CREATE INDEX "_post_reports_v_parent_idx" ON "_post_reports_v" USING btree ("parent_id");
  CREATE INDEX "_post_reports_v_version_version_post_idx" ON "_post_reports_v" USING btree ("version_post_id");
  CREATE INDEX "_post_reports_v_version_version_reply_idx" ON "_post_reports_v" USING btree ("version_reply_id");
  CREATE INDEX "_post_reports_v_version_version_reporter_idx" ON "_post_reports_v" USING btree ("version_reporter_id");
  CREATE INDEX "_post_reports_v_version_version_updated_at_idx" ON "_post_reports_v" USING btree ("version_updated_at");
  CREATE INDEX "_post_reports_v_version_version_created_at_idx" ON "_post_reports_v" USING btree ("version_created_at");
  CREATE INDEX "_post_reports_v_created_at_idx" ON "_post_reports_v" USING btree ("created_at");
  CREATE INDEX "_post_reports_v_updated_at_idx" ON "_post_reports_v" USING btree ("updated_at");
  CREATE INDEX "version_reporter_version_post_version_reply_idx" ON "_post_reports_v" USING btree ("version_reporter_id","version_post_id","version_reply_id");
  CREATE INDEX "_post_reports_v_rels_order_idx" ON "_post_reports_v_rels" USING btree ("order");
  CREATE INDEX "_post_reports_v_rels_parent_idx" ON "_post_reports_v_rels" USING btree ("parent_id");
  CREATE INDEX "_post_reports_v_rels_path_idx" ON "_post_reports_v_rels" USING btree ("path");
  CREATE INDEX "_post_reports_v_rels_admins_id_idx" ON "_post_reports_v_rels" USING btree ("admins_id");
  CREATE INDEX "_post_reports_v_rels_users_id_idx" ON "_post_reports_v_rels" USING btree ("users_id");
  CREATE INDEX "buddy_connections_from_idx" ON "buddy_connections" USING btree ("from_id");
  CREATE INDEX "buddy_connections_to_idx" ON "buddy_connections" USING btree ("to_id");
  CREATE INDEX "buddy_connections_updated_at_idx" ON "buddy_connections" USING btree ("updated_at");
  CREATE INDEX "buddy_connections_created_at_idx" ON "buddy_connections" USING btree ("created_at");
  CREATE UNIQUE INDEX "from_to_idx" ON "buddy_connections" USING btree ("from_id","to_id");
  CREATE INDEX "buddy_connections_rels_order_idx" ON "buddy_connections_rels" USING btree ("order");
  CREATE INDEX "buddy_connections_rels_parent_idx" ON "buddy_connections_rels" USING btree ("parent_id");
  CREATE INDEX "buddy_connections_rels_path_idx" ON "buddy_connections_rels" USING btree ("path");
  CREATE INDEX "buddy_connections_rels_admins_id_idx" ON "buddy_connections_rels" USING btree ("admins_id");
  CREATE INDEX "buddy_connections_rels_users_id_idx" ON "buddy_connections_rels" USING btree ("users_id");
  CREATE INDEX "_buddy_connections_v_parent_idx" ON "_buddy_connections_v" USING btree ("parent_id");
  CREATE INDEX "_buddy_connections_v_version_version_from_idx" ON "_buddy_connections_v" USING btree ("version_from_id");
  CREATE INDEX "_buddy_connections_v_version_version_to_idx" ON "_buddy_connections_v" USING btree ("version_to_id");
  CREATE INDEX "_buddy_connections_v_version_version_updated_at_idx" ON "_buddy_connections_v" USING btree ("version_updated_at");
  CREATE INDEX "_buddy_connections_v_version_version_created_at_idx" ON "_buddy_connections_v" USING btree ("version_created_at");
  CREATE INDEX "_buddy_connections_v_created_at_idx" ON "_buddy_connections_v" USING btree ("created_at");
  CREATE INDEX "_buddy_connections_v_updated_at_idx" ON "_buddy_connections_v" USING btree ("updated_at");
  CREATE INDEX "version_from_version_to_idx" ON "_buddy_connections_v" USING btree ("version_from_id","version_to_id");
  CREATE INDEX "_buddy_connections_v_rels_order_idx" ON "_buddy_connections_v_rels" USING btree ("order");
  CREATE INDEX "_buddy_connections_v_rels_parent_idx" ON "_buddy_connections_v_rels" USING btree ("parent_id");
  CREATE INDEX "_buddy_connections_v_rels_path_idx" ON "_buddy_connections_v_rels" USING btree ("path");
  CREATE INDEX "_buddy_connections_v_rels_admins_id_idx" ON "_buddy_connections_v_rels" USING btree ("admins_id");
  CREATE INDEX "_buddy_connections_v_rels_users_id_idx" ON "_buddy_connections_v_rels" USING btree ("users_id");
  CREATE INDEX "trips_owner_idx" ON "trips" USING btree ("owner_id");
  CREATE INDEX "trips_travel_date_idx" ON "trips" USING btree ("travel_date");
  CREATE INDEX "trips_status_idx" ON "trips" USING btree ("status");
  CREATE INDEX "trips_updated_at_idx" ON "trips" USING btree ("updated_at");
  CREATE INDEX "trips_created_at_idx" ON "trips" USING btree ("created_at");
  CREATE INDEX "trips_rels_order_idx" ON "trips_rels" USING btree ("order");
  CREATE INDEX "trips_rels_parent_idx" ON "trips_rels" USING btree ("parent_id");
  CREATE INDEX "trips_rels_path_idx" ON "trips_rels" USING btree ("path");
  CREATE INDEX "trips_rels_admins_id_idx" ON "trips_rels" USING btree ("admins_id");
  CREATE INDEX "trips_rels_users_id_idx" ON "trips_rels" USING btree ("users_id");
  CREATE INDEX "_trips_v_parent_idx" ON "_trips_v" USING btree ("parent_id");
  CREATE INDEX "_trips_v_version_version_owner_idx" ON "_trips_v" USING btree ("version_owner_id");
  CREATE INDEX "_trips_v_version_version_travel_date_idx" ON "_trips_v" USING btree ("version_travel_date");
  CREATE INDEX "_trips_v_version_version_status_idx" ON "_trips_v" USING btree ("version_status");
  CREATE INDEX "_trips_v_version_version_updated_at_idx" ON "_trips_v" USING btree ("version_updated_at");
  CREATE INDEX "_trips_v_version_version_created_at_idx" ON "_trips_v" USING btree ("version_created_at");
  CREATE INDEX "_trips_v_created_at_idx" ON "_trips_v" USING btree ("created_at");
  CREATE INDEX "_trips_v_updated_at_idx" ON "_trips_v" USING btree ("updated_at");
  CREATE INDEX "_trips_v_rels_order_idx" ON "_trips_v_rels" USING btree ("order");
  CREATE INDEX "_trips_v_rels_parent_idx" ON "_trips_v_rels" USING btree ("parent_id");
  CREATE INDEX "_trips_v_rels_path_idx" ON "_trips_v_rels" USING btree ("path");
  CREATE INDEX "_trips_v_rels_admins_id_idx" ON "_trips_v_rels" USING btree ("admins_id");
  CREATE INDEX "_trips_v_rels_users_id_idx" ON "_trips_v_rels" USING btree ("users_id");
  CREATE INDEX "trip_interests_owner_idx" ON "trip_interests" USING btree ("owner_id");
  CREATE INDEX "trip_interests_trip_idx" ON "trip_interests" USING btree ("trip_id");
  CREATE INDEX "trip_interests_updated_at_idx" ON "trip_interests" USING btree ("updated_at");
  CREATE INDEX "trip_interests_created_at_idx" ON "trip_interests" USING btree ("created_at");
  CREATE UNIQUE INDEX "owner_trip_idx" ON "trip_interests" USING btree ("owner_id","trip_id");
  CREATE INDEX "trip_interests_rels_order_idx" ON "trip_interests_rels" USING btree ("order");
  CREATE INDEX "trip_interests_rels_parent_idx" ON "trip_interests_rels" USING btree ("parent_id");
  CREATE INDEX "trip_interests_rels_path_idx" ON "trip_interests_rels" USING btree ("path");
  CREATE INDEX "trip_interests_rels_admins_id_idx" ON "trip_interests_rels" USING btree ("admins_id");
  CREATE INDEX "trip_interests_rels_users_id_idx" ON "trip_interests_rels" USING btree ("users_id");
  CREATE INDEX "_trip_interests_v_parent_idx" ON "_trip_interests_v" USING btree ("parent_id");
  CREATE INDEX "_trip_interests_v_version_version_owner_idx" ON "_trip_interests_v" USING btree ("version_owner_id");
  CREATE INDEX "_trip_interests_v_version_version_trip_idx" ON "_trip_interests_v" USING btree ("version_trip_id");
  CREATE INDEX "_trip_interests_v_version_version_updated_at_idx" ON "_trip_interests_v" USING btree ("version_updated_at");
  CREATE INDEX "_trip_interests_v_version_version_created_at_idx" ON "_trip_interests_v" USING btree ("version_created_at");
  CREATE INDEX "_trip_interests_v_created_at_idx" ON "_trip_interests_v" USING btree ("created_at");
  CREATE INDEX "_trip_interests_v_updated_at_idx" ON "_trip_interests_v" USING btree ("updated_at");
  CREATE INDEX "version_owner_version_trip_idx" ON "_trip_interests_v" USING btree ("version_owner_id","version_trip_id");
  CREATE INDEX "_trip_interests_v_rels_order_idx" ON "_trip_interests_v_rels" USING btree ("order");
  CREATE INDEX "_trip_interests_v_rels_parent_idx" ON "_trip_interests_v_rels" USING btree ("parent_id");
  CREATE INDEX "_trip_interests_v_rels_path_idx" ON "_trip_interests_v_rels" USING btree ("path");
  CREATE INDEX "_trip_interests_v_rels_admins_id_idx" ON "_trip_interests_v_rels" USING btree ("admins_id");
  CREATE INDEX "_trip_interests_v_rels_users_id_idx" ON "_trip_interests_v_rels" USING btree ("users_id");
  CREATE INDEX "checklist_progress_owner_idx" ON "checklist_progress" USING btree ("owner_id");
  CREATE INDEX "checklist_progress_updated_at_idx" ON "checklist_progress" USING btree ("updated_at");
  CREATE INDEX "checklist_progress_created_at_idx" ON "checklist_progress" USING btree ("created_at");
  CREATE UNIQUE INDEX "owner_checklist_idx" ON "checklist_progress" USING btree ("owner_id","checklist");
  CREATE INDEX "checklist_progress_texts_order_parent" ON "checklist_progress_texts" USING btree ("order","parent_id");
  CREATE INDEX "checklist_progress_rels_order_idx" ON "checklist_progress_rels" USING btree ("order");
  CREATE INDEX "checklist_progress_rels_parent_idx" ON "checklist_progress_rels" USING btree ("parent_id");
  CREATE INDEX "checklist_progress_rels_path_idx" ON "checklist_progress_rels" USING btree ("path");
  CREATE INDEX "checklist_progress_rels_admins_id_idx" ON "checklist_progress_rels" USING btree ("admins_id");
  CREATE INDEX "checklist_progress_rels_users_id_idx" ON "checklist_progress_rels" USING btree ("users_id");
  CREATE INDEX "_checklist_progress_v_parent_idx" ON "_checklist_progress_v" USING btree ("parent_id");
  CREATE INDEX "_checklist_progress_v_version_version_owner_idx" ON "_checklist_progress_v" USING btree ("version_owner_id");
  CREATE INDEX "_checklist_progress_v_version_version_updated_at_idx" ON "_checklist_progress_v" USING btree ("version_updated_at");
  CREATE INDEX "_checklist_progress_v_version_version_created_at_idx" ON "_checklist_progress_v" USING btree ("version_created_at");
  CREATE INDEX "_checklist_progress_v_created_at_idx" ON "_checklist_progress_v" USING btree ("created_at");
  CREATE INDEX "_checklist_progress_v_updated_at_idx" ON "_checklist_progress_v" USING btree ("updated_at");
  CREATE INDEX "version_owner_version_checklist_idx" ON "_checklist_progress_v" USING btree ("version_owner_id","version_checklist");
  CREATE INDEX "_checklist_progress_v_texts_order_parent" ON "_checklist_progress_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_checklist_progress_v_rels_order_idx" ON "_checklist_progress_v_rels" USING btree ("order");
  CREATE INDEX "_checklist_progress_v_rels_parent_idx" ON "_checklist_progress_v_rels" USING btree ("parent_id");
  CREATE INDEX "_checklist_progress_v_rels_path_idx" ON "_checklist_progress_v_rels" USING btree ("path");
  CREATE INDEX "_checklist_progress_v_rels_admins_id_idx" ON "_checklist_progress_v_rels" USING btree ("admins_id");
  CREATE INDEX "_checklist_progress_v_rels_users_id_idx" ON "_checklist_progress_v_rels" USING btree ("users_id");
  CREATE INDEX "housing_shortlist_owner_idx" ON "housing_shortlist" USING btree ("owner_id");
  CREATE INDEX "housing_shortlist_updated_at_idx" ON "housing_shortlist" USING btree ("updated_at");
  CREATE INDEX "housing_shortlist_created_at_idx" ON "housing_shortlist" USING btree ("created_at");
  CREATE INDEX "housing_shortlist_rels_order_idx" ON "housing_shortlist_rels" USING btree ("order");
  CREATE INDEX "housing_shortlist_rels_parent_idx" ON "housing_shortlist_rels" USING btree ("parent_id");
  CREATE INDEX "housing_shortlist_rels_path_idx" ON "housing_shortlist_rels" USING btree ("path");
  CREATE INDEX "housing_shortlist_rels_admins_id_idx" ON "housing_shortlist_rels" USING btree ("admins_id");
  CREATE INDEX "housing_shortlist_rels_users_id_idx" ON "housing_shortlist_rels" USING btree ("users_id");
  CREATE INDEX "_housing_shortlist_v_parent_idx" ON "_housing_shortlist_v" USING btree ("parent_id");
  CREATE INDEX "_housing_shortlist_v_version_version_owner_idx" ON "_housing_shortlist_v" USING btree ("version_owner_id");
  CREATE INDEX "_housing_shortlist_v_version_version_updated_at_idx" ON "_housing_shortlist_v" USING btree ("version_updated_at");
  CREATE INDEX "_housing_shortlist_v_version_version_created_at_idx" ON "_housing_shortlist_v" USING btree ("version_created_at");
  CREATE INDEX "_housing_shortlist_v_created_at_idx" ON "_housing_shortlist_v" USING btree ("created_at");
  CREATE INDEX "_housing_shortlist_v_updated_at_idx" ON "_housing_shortlist_v" USING btree ("updated_at");
  CREATE INDEX "_housing_shortlist_v_rels_order_idx" ON "_housing_shortlist_v_rels" USING btree ("order");
  CREATE INDEX "_housing_shortlist_v_rels_parent_idx" ON "_housing_shortlist_v_rels" USING btree ("parent_id");
  CREATE INDEX "_housing_shortlist_v_rels_path_idx" ON "_housing_shortlist_v_rels" USING btree ("path");
  CREATE INDEX "_housing_shortlist_v_rels_admins_id_idx" ON "_housing_shortlist_v_rels" USING btree ("admins_id");
  CREATE INDEX "_housing_shortlist_v_rels_users_id_idx" ON "_housing_shortlist_v_rels" USING btree ("users_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_admins_id_idx" ON "payload_locked_documents_rels" USING btree ("admins_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_opportunities_id_idx" ON "payload_locked_documents_rels" USING btree ("opportunities_id");
  CREATE INDEX "payload_locked_documents_rels_saved_opportunities_id_idx" ON "payload_locked_documents_rels" USING btree ("saved_opportunities_id");
  CREATE INDEX "payload_locked_documents_rels_application_plans_id_idx" ON "payload_locked_documents_rels" USING btree ("application_plans_id");
  CREATE INDEX "payload_locked_documents_rels_profile_files_id_idx" ON "payload_locked_documents_rels" USING btree ("profile_files_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_folders_id_idx" ON "payload_locked_documents_rels" USING btree ("folders_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_research_topics_id_idx" ON "payload_locked_documents_rels" USING btree ("research_topics_id");
  CREATE INDEX "payload_locked_documents_rels_research_runs_id_idx" ON "payload_locked_documents_rels" USING btree ("research_runs_id");
  CREATE INDEX "payload_locked_documents_rels_community_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("community_posts_id");
  CREATE INDEX "payload_locked_documents_rels_post_replies_id_idx" ON "payload_locked_documents_rels" USING btree ("post_replies_id");
  CREATE INDEX "payload_locked_documents_rels_post_likes_id_idx" ON "payload_locked_documents_rels" USING btree ("post_likes_id");
  CREATE INDEX "payload_locked_documents_rels_post_reports_id_idx" ON "payload_locked_documents_rels" USING btree ("post_reports_id");
  CREATE INDEX "payload_locked_documents_rels_buddy_connections_id_idx" ON "payload_locked_documents_rels" USING btree ("buddy_connections_id");
  CREATE INDEX "payload_locked_documents_rels_trips_id_idx" ON "payload_locked_documents_rels" USING btree ("trips_id");
  CREATE INDEX "payload_locked_documents_rels_trip_interests_id_idx" ON "payload_locked_documents_rels" USING btree ("trip_interests_id");
  CREATE INDEX "payload_locked_documents_rels_checklist_progress_id_idx" ON "payload_locked_documents_rels" USING btree ("checklist_progress_id");
  CREATE INDEX "payload_locked_documents_rels_housing_shortlist_id_idx" ON "payload_locked_documents_rels" USING btree ("housing_shortlist_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_admins_id_idx" ON "payload_preferences_rels" USING btree ("admins_id");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "payload_llm_instructions_entity_slug_idx" ON "payload_llm_instructions" USING btree ("entity_slug");
  CREATE INDEX "payload_llm_instructions_updated_at_idx" ON "payload_llm_instructions" USING btree ("updated_at");
  CREATE INDEX "payload_llm_instructions_created_at_idx" ON "payload_llm_instructions" USING btree ("created_at");
  CREATE INDEX "payload_llm_instructions_rels_order_idx" ON "payload_llm_instructions_rels" USING btree ("order");
  CREATE INDEX "payload_llm_instructions_rels_parent_idx" ON "payload_llm_instructions_rels" USING btree ("parent_id");
  CREATE INDEX "payload_llm_instructions_rels_path_idx" ON "payload_llm_instructions_rels" USING btree ("path");
  CREATE INDEX "payload_llm_instructions_rels_admins_id_idx" ON "payload_llm_instructions_rels" USING btree ("admins_id");
  CREATE INDEX "payload_llm_instructions_rels_users_id_idx" ON "payload_llm_instructions_rels" USING btree ("users_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "admins_sessions" CASCADE;
  DROP TABLE "admins" CASCADE;
  DROP TABLE "admins_rels" CASCADE;
  DROP TABLE "users_roadmap_completed_stages" CASCADE;
  DROP TABLE "users_additional_info" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "users_texts" CASCADE;
  DROP TABLE "users_rels" CASCADE;
  DROP TABLE "_users_v_version_roadmap_completed_stages" CASCADE;
  DROP TABLE "_users_v_version_additional_info" CASCADE;
  DROP TABLE "_users_v_version_sessions" CASCADE;
  DROP TABLE "_users_v" CASCADE;
  DROP TABLE "_users_v_texts" CASCADE;
  DROP TABLE "_users_v_rels" CASCADE;
  DROP TABLE "opportunities_degree_levels" CASCADE;
  DROP TABLE "opportunities" CASCADE;
  DROP TABLE "opportunities_locales" CASCADE;
  DROP TABLE "opportunities_texts" CASCADE;
  DROP TABLE "opportunities_rels" CASCADE;
  DROP TABLE "_opportunities_v_version_degree_levels" CASCADE;
  DROP TABLE "_opportunities_v" CASCADE;
  DROP TABLE "_opportunities_v_locales" CASCADE;
  DROP TABLE "_opportunities_v_texts" CASCADE;
  DROP TABLE "_opportunities_v_rels" CASCADE;
  DROP TABLE "saved_opportunities" CASCADE;
  DROP TABLE "saved_opportunities_rels" CASCADE;
  DROP TABLE "_saved_opportunities_v" CASCADE;
  DROP TABLE "_saved_opportunities_v_rels" CASCADE;
  DROP TABLE "application_plans_tasks" CASCADE;
  DROP TABLE "application_plans" CASCADE;
  DROP TABLE "application_plans_rels" CASCADE;
  DROP TABLE "_application_plans_v_version_tasks" CASCADE;
  DROP TABLE "_application_plans_v" CASCADE;
  DROP TABLE "_application_plans_v_rels" CASCADE;
  DROP TABLE "profile_files" CASCADE;
  DROP TABLE "profile_files_rels" CASCADE;
  DROP TABLE "_profile_files_v" CASCADE;
  DROP TABLE "_profile_files_v_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_rels" CASCADE;
  DROP TABLE "_media_v" CASCADE;
  DROP TABLE "_media_v_rels" CASCADE;
  DROP TABLE "folders" CASCADE;
  DROP TABLE "folders_rels" CASCADE;
  DROP TABLE "_folders_v" CASCADE;
  DROP TABLE "_folders_v_rels" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "tags_rels" CASCADE;
  DROP TABLE "_tags_v" CASCADE;
  DROP TABLE "_tags_v_rels" CASCADE;
  DROP TABLE "research_topics" CASCADE;
  DROP TABLE "research_topics_rels" CASCADE;
  DROP TABLE "_research_topics_v" CASCADE;
  DROP TABLE "_research_topics_v_rels" CASCADE;
  DROP TABLE "research_runs" CASCADE;
  DROP TABLE "research_runs_rels" CASCADE;
  DROP TABLE "_research_runs_v" CASCADE;
  DROP TABLE "_research_runs_v_rels" CASCADE;
  DROP TABLE "community_posts" CASCADE;
  DROP TABLE "community_posts_rels" CASCADE;
  DROP TABLE "_community_posts_v" CASCADE;
  DROP TABLE "_community_posts_v_rels" CASCADE;
  DROP TABLE "post_replies" CASCADE;
  DROP TABLE "post_replies_rels" CASCADE;
  DROP TABLE "_post_replies_v" CASCADE;
  DROP TABLE "_post_replies_v_rels" CASCADE;
  DROP TABLE "post_likes" CASCADE;
  DROP TABLE "post_likes_rels" CASCADE;
  DROP TABLE "_post_likes_v" CASCADE;
  DROP TABLE "_post_likes_v_rels" CASCADE;
  DROP TABLE "post_reports" CASCADE;
  DROP TABLE "post_reports_rels" CASCADE;
  DROP TABLE "_post_reports_v" CASCADE;
  DROP TABLE "_post_reports_v_rels" CASCADE;
  DROP TABLE "buddy_connections" CASCADE;
  DROP TABLE "buddy_connections_rels" CASCADE;
  DROP TABLE "_buddy_connections_v" CASCADE;
  DROP TABLE "_buddy_connections_v_rels" CASCADE;
  DROP TABLE "trips" CASCADE;
  DROP TABLE "trips_rels" CASCADE;
  DROP TABLE "_trips_v" CASCADE;
  DROP TABLE "_trips_v_rels" CASCADE;
  DROP TABLE "trip_interests" CASCADE;
  DROP TABLE "trip_interests_rels" CASCADE;
  DROP TABLE "_trip_interests_v" CASCADE;
  DROP TABLE "_trip_interests_v_rels" CASCADE;
  DROP TABLE "checklist_progress" CASCADE;
  DROP TABLE "checklist_progress_texts" CASCADE;
  DROP TABLE "checklist_progress_rels" CASCADE;
  DROP TABLE "_checklist_progress_v" CASCADE;
  DROP TABLE "_checklist_progress_v_texts" CASCADE;
  DROP TABLE "_checklist_progress_v_rels" CASCADE;
  DROP TABLE "housing_shortlist" CASCADE;
  DROP TABLE "housing_shortlist_rels" CASCADE;
  DROP TABLE "_housing_shortlist_v" CASCADE;
  DROP TABLE "_housing_shortlist_v_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "payload_llm_instructions" CASCADE;
  DROP TABLE "payload_llm_instructions_rels" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_roadmap_completed_stages";
  DROP TYPE "public"."enum_users_student_profile_education_level";
  DROP TYPE "public"."enum_users_student_profile_desired_degree";
  DROP TYPE "public"."enum_users_student_profile_english_test";
  DROP TYPE "public"."enum_users_student_profile_funding_preference";
  DROP TYPE "public"."enum_users_settings_language";
  DROP TYPE "public"."enum_users_settings_profile_visibility";
  DROP TYPE "public"."enum_users_subscription_plan";
  DROP TYPE "public"."enum_users_subscription_status";
  DROP TYPE "public"."enum__users_v_version_roadmap_completed_stages";
  DROP TYPE "public"."enum__users_v_version_student_profile_education_level";
  DROP TYPE "public"."enum__users_v_version_student_profile_desired_degree";
  DROP TYPE "public"."enum__users_v_version_student_profile_english_test";
  DROP TYPE "public"."enum__users_v_version_student_profile_funding_preference";
  DROP TYPE "public"."enum__users_v_version_settings_language";
  DROP TYPE "public"."enum__users_v_version_settings_profile_visibility";
  DROP TYPE "public"."enum__users_v_version_subscription_plan";
  DROP TYPE "public"."enum__users_v_version_subscription_status";
  DROP TYPE "public"."enum_opportunities_degree_levels";
  DROP TYPE "public"."enum_opportunities_type";
  DROP TYPE "public"."enum_opportunities_listing_status";
  DROP TYPE "public"."enum_opportunities_funding_type";
  DROP TYPE "public"."enum_opportunities_origin";
  DROP TYPE "public"."enum__opportunities_v_version_degree_levels";
  DROP TYPE "public"."enum__opportunities_v_version_type";
  DROP TYPE "public"."enum__opportunities_v_version_listing_status";
  DROP TYPE "public"."enum__opportunities_v_version_funding_type";
  DROP TYPE "public"."enum__opportunities_v_version_origin";
  DROP TYPE "public"."enum_application_plans_status";
  DROP TYPE "public"."enum__application_plans_v_version_status";
  DROP TYPE "public"."enum_profile_files_category";
  DROP TYPE "public"."enum__profile_files_v_version_category";
  DROP TYPE "public"."enum_research_topics_type";
  DROP TYPE "public"."enum__research_topics_v_version_type";
  DROP TYPE "public"."enum_research_runs_status";
  DROP TYPE "public"."enum__research_runs_v_version_status";
  DROP TYPE "public"."enum_community_posts_topic";
  DROP TYPE "public"."enum_community_posts_status";
  DROP TYPE "public"."enum__community_posts_v_version_topic";
  DROP TYPE "public"."enum__community_posts_v_version_status";
  DROP TYPE "public"."enum_post_replies_status";
  DROP TYPE "public"."enum__post_replies_v_version_status";
  DROP TYPE "public"."enum_post_reports_reason";
  DROP TYPE "public"."enum__post_reports_v_version_reason";
  DROP TYPE "public"."enum_buddy_connections_status";
  DROP TYPE "public"."enum__buddy_connections_v_version_status";
  DROP TYPE "public"."enum_trips_status";
  DROP TYPE "public"."enum__trips_v_version_status";
  DROP TYPE "public"."enum_checklist_progress_checklist";
  DROP TYPE "public"."enum__checklist_progress_v_version_checklist";
  DROP TYPE "public"."enum_housing_shortlist_room_type";
  DROP TYPE "public"."enum__housing_shortlist_v_version_room_type";
  DROP TYPE "public"."enum_payload_llm_instructions_entity_type";`)
}
