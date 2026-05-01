// Anonymous user identity.
// No login screen — every visitor gets a UUID cookie on first request.
// The cookie value is the FK that ties them to their favorites + chat history.

import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { execute, query } from "./db";

const COOKIE_NAME = "pnd_uid";
// 1 year — long enough that "their" favorites stay across visits.
const ONE_YEAR_SEC = 60 * 60 * 24 * 365;

export async function getOrCreateUserId(): Promise<string> {
  const jar = await cookies();
  const dev = process.env.DEV_USER_ID;
  const existing = jar.get(COOKIE_NAME)?.value || dev;

  if (existing) {
    return existing;
  }

  const id = randomUUID();
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
