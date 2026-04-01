import { AppShell } from "@/components/shell/AppShell";
import { auth0 } from "@/lib/auth/auth0";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();
  
  if (session?.user) {
    // Ensure the Auth0 user and their Hackathon AI preferences exist in the Convex database
    await convex.mutation(api.users.syncAuth0User, {
      auth0Id: session.user.sub,
      name: session.user.name || "Actify User",
      email: session.user.email || "",
      avatar: session.user.picture,
    });
  }

  return <AppShell>{children}</AppShell>;
}
