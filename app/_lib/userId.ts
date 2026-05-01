// Anonymous user identity.
// No login screen — every visitor gets a UUID cookie on first request.
// The cookie value is the FK that ties them to their favorites + chat history.

import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { execute, query } from "./db";

const COOKIE_NAME = "pnd_uid";
// 1 year — long enough that "their" favorites stay across visits.
const ONE_YEAR_SEC = 60 * 60 * 24 * 365;

interface UserRow {
  user_id: string;
}

/**
 * Returns the current user's id, creating one (cookie + DB row) if missing.
 * Must be called from a Server Component, Route Handler, or Server Action —
 * `cookies()` is async in Next 16.
 */
export async function getOrCreateUserId(): Promise<string> {
  const jar = await cookies();
  const dev = process.env.DEV_USER_ID;
  const existing = jar.get(COOKIE_NAME)?.value || dev;

  if (existing) {
    await execute(
      "INSERT INTO `users` (`user_id`) VALUES (:id) " +
        "ON DUPLICATE KEY UPDATE `last_seen` = CURRENT_TIMESTAMP",
      { id: existing },
    );
    return existing;
  }

  const id = randomUUID();
  await execute("INSERT INTO `users` (`user_id`) VALUES (:id)", { id });
  jar.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SEC,
  });
  return id;
}

/**
 * Read-only variant: returns null if the visitor has no cookie yet
 * (used by GET endpoints where we don't want to mutate state).
 */
export async function readUserId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value || process.env.DEV_USER_ID || null;
}

export async function userExists(id: string): Promise<boolean> {
  const rows = await query<(UserRow & import("mysql2").RowDataPacket)[]>(
    "SELECT `user_id` FROM `users` WHERE `user_id` = :id LIMIT 1",
    { id },
  );
  return rows.length > 0;
}
