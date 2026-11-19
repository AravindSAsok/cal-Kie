import { authenticateRequest as authenticateMongoSession } from "./auth";

export async function authenticateRequest(request: Request) {
  return authenticateMongoSession(request);
}
