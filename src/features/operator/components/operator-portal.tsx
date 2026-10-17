"use client";
import { OperatorDashboard } from "@/features/operator/components/operator-dashboard";
import { OperatorLogin } from "@/features/auth/components/portal-login";
import { Loading } from "@/features/user/components/user-home";
import { useAuth } from "@/features/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export type OperatorPage =
  | "overview"
  | "stations"
  | "stations-new"
  | "routes"
  | "routes-new"
  | "drivers"
  | "drivers-new"
  | "access";

export function OperatorPortal({ page }: { page?: OperatorPage } = {}) {
  const { user, loading, signOut } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <OperatorLogin />;
  if (!user.is_admin && !user.roles.includes("operator"))
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Operator access required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This account is a passenger account. Ask an administrator to grant
              operator access.
            </p>
            <Button variant="outline" className="mt-6" onClick={signOut}>
              Sign out
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  return <OperatorDashboard page={page} />;
}
