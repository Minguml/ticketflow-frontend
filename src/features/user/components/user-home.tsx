"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/auth-context";
export function UserHome() {
  const { user, loading, signOut } = useAuth();
  if (loading) return <Loading />;
  if (!user) return null;
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Welcome, {user.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The passenger portal is coming next.
          </p>
          <Button variant="outline" className="mt-6" onClick={signOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
export function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 text-sm text-muted-foreground">
      Checking your session…
    </div>
  );
}
