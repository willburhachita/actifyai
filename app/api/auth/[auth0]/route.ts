// Auth0 v4 handles auth routes via middleware.
// This route file is kept as a placeholder. 
// See middleware.ts and lib/auth/auth0.ts for the actual auth implementation.
export function GET() {
  return new Response("Auth is handled via middleware", { status: 200 });
}
