import jwt from "jsonwebtoken";

interface StudentPayload {
  studentId: string;
  classId: string;
  displayName: string;
}

/**
 * Verify a student session from the request cookie.
 * Returns the decoded JWT payload or null if invalid/missing.
 */
export function verifyStudentSession(request: Request): StudentPayload | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const match = cookieHeader.match(/student_session=([^;]+)/);
  if (!match) return null;

  const token = match[1];
  const secret = process.env.STUDENT_JWT_SECRET;
  if (!secret) return null;

  try {
    const decoded = jwt.verify(token, secret) as StudentPayload & { iat: number; exp: number };
    return {
      studentId: decoded.studentId,
      classId: decoded.classId,
      displayName: decoded.displayName,
    };
  } catch {
    return null;
  }
}
