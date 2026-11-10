import { redirect, notFound } from "next/navigation";
import { requireUser } from "../../lib/auth/guard.js";
import { readEvent } from "./service.js";
export async function pageUser() {
  try {
    return await requireUser();
  } catch (error) {
    if (error.status === 401) redirect("/login");
    throw error;
  }
}
export async function pageEvent(user, id) {
  try {
    return await readEvent(user, id);
  } catch (error) {
    if (error.status === 404) notFound();
    throw error;
  }
}
