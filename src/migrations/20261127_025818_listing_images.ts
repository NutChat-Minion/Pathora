import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN "google_sub" varchar;
  ALTER TABLE "_users_v" ADD COLUMN "version_google_sub" varchar;
  ALTER TABLE "media" ADD COLUMN "credit" varchar;
  ALTER TABLE "media" ADD COLUMN "source_url" varchar;
  ALTER TABLE "_media_v" ADD COLUMN "version_credit" varchar;
  ALTER TABLE "_media_v" ADD COLUMN "version_source_url" varchar;
  CREATE UNIQUE INDEX "users_google_sub_idx" ON "users" USING btree ("google_sub");
  CREATE INDEX "_users_v_version_version_google_sub_idx" ON "_users_v" USING btree ("version_google_sub");
  CREATE INDEX "media_source_url_idx" ON "media" USING btree ("source_url");
  CREATE INDEX "_media_v_version_version_source_url_idx" ON "_media_v" USING btree ("version_source_url");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "users_google_sub_idx";
  DROP INDEX "_users_v_version_version_google_sub_idx";
  DROP INDEX "media_source_url_idx";
  DROP INDEX "_media_v_version_version_source_url_idx";
  ALTER TABLE "users" DROP COLUMN "google_sub";
  ALTER TABLE "_users_v" DROP COLUMN "version_google_sub";
  ALTER TABLE "media" DROP COLUMN "credit";
  ALTER TABLE "media" DROP COLUMN "source_url";
  ALTER TABLE "_media_v" DROP COLUMN "version_credit";
  ALTER TABLE "_media_v" DROP COLUMN "version_source_url";`)
}
