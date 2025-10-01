import { NextFunction, Request, Response } from "express";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

export type Role = "COLLECTOR" | "PROCESSOR" | "LAB" | "MANUFACTURER" | "REGULATOR" | "ADMIN";

export function requireRole(roles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.header("authorization") || "";
      const [bearer, token] = authHeader.split(" ");

      if (!token || bearer !== "Bearer") {
        return res.status(401).json({ error: "Unauthorized - No token provided" });
      }

      const { payload } = await jwtVerify(token, secret);
      const role = (payload as any).role as Role;

      if (!roles.includes(role)) {
        return res.status(403).json({ 
          error: "Forbidden - Insufficient permissions",
          required: roles,
          current: role 
        });
      }

      // Attach user to request
      (req as any).user = {
        id: payload.sub,
        role,
        email: payload.email,
      };

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }
  };
}

// Optional auth - doesn't block if no token, but attaches user if present
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.header("authorization") || "";
    const [bearer, token] = authHeader.split(" ");

    if (token && bearer === "Bearer") {
      const { payload } = await jwtVerify(token, secret);
      (req as any).user = {
        id: payload.sub,
        role: (payload as any).role,
        email: payload.email,
      };
    }
  } catch (error) {
    // Silently fail for optional auth
  }
  next();
}