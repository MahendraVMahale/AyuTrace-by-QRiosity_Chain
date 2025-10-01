import { auth } from "./auth";
import { redirect } from "next/navigation";

type Role = "COLLECTOR" | "PROCESSOR" | "LAB" | "MANUFACTURER" | "REGULATOR" | "ADMIN";

export async function requireRole(roles: Role[]) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  const userRole = (session.user as any).role as Role;
  
  if (!roles.includes(userRole)) {
    redirect("/login");
  }
  
  return { ok: true, role: userRole, session };
}

export async function getSession() {
  return await auth();
}