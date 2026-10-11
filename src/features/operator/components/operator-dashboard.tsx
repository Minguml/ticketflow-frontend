"use client";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/features/auth/auth-context";
import { AccessPanel } from "@/features/admin-access/components/access-panel";
import { RoutesPanel } from "@/features/routes/components/routes-panel";
import { StationsPanel } from "@/features/stations/components/stations-panel";
import { Loading } from "@/features/user/components/user-home";

type Tab = "overview" | "stations" | "routes" | "access";
export function OperatorDashboard() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const canEdit = Boolean(user?.is_admin || user?.roles.includes("operator"));
  const nav = useMemo(
    () => [
      { id: "overview" as const, label: "Overview" },
      { id: "stations" as const, label: "Stations" },
      { id: "routes" as const, label: "Routes" },
      ...(user?.is_admin
        ? [
            {
              id: "access" as const,
              label: "Admin access",
            },
          ]
        : []),
    ],
    [user?.is_admin],
  );
  if (!user) return <Loading />;
  return (
    <div className="min-h-screen bg-muted/50">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              TicketFlow operations
            </p>
            <h1 className="text-lg font-bold">Control center</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground">
                {user.is_admin ? "Administrator" : "Operator"}
              </p>
            </div>
            <Badge variant={user.is_admin ? "default" : "secondary"}>
              {user.is_admin ? "Admin" : "Operator"}
            </Badge>
            <Button variant="outline" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <aside className="lg:w-56">
          <nav className="flex gap-2 overflow-auto lg:flex-col">
            {nav.map((item) => (
              <Button
                key={item.id}
                variant={tab === item.id ? "default" : "ghost"}
                className="justify-start"
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          {tab === "overview" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardDescription>
                    {user.is_admin
                      ? "Administrator workspace"
                      : "Operator workspace"}
                  </CardDescription>
                  <CardTitle className="text-2xl">
                    Keep the network moving.
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    Manage the station directory and routes from one place.
                    Public reads are available to everyone; changes require
                    operator capability.{" "}
                    {user.is_admin &&
                      "As an administrator, you can also manage operator access."}
                  </p>
                </CardContent>
              </Card>
              <div className="grid gap-4 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-auto justify-start p-5"
                  onClick={() => setTab("stations")}
                >
                  <span>
                    <strong className="block">Manage stations</strong>
                    <span className="mt-1 block text-sm font-normal text-muted-foreground">
                      Create and update stops.
                    </span>
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto justify-start p-5"
                  onClick={() => setTab("routes")}
                >
                  <span>
                    <strong className="block">Manage routes</strong>
                    <span className="mt-1 block text-sm font-normal text-muted-foreground">
                      Connect stations into routes.
                    </span>
                  </span>
                </Button>
              </div>
            </div>
          )}
          {tab === "stations" && <StationsPanel canEdit={canEdit} />}
          {tab === "routes" && <RoutesPanel canEdit={canEdit} />}
          {tab === "access" && user.is_admin && <AccessPanel />}
        </main>
      </div>
    </div>
  );
}
