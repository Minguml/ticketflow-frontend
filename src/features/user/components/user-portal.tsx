"use client";

import { useAuth } from "@/features/auth/auth-context";
import { UserLogin } from "@/features/auth/components/portal-login";
import { UserHome } from "@/features/user/components/user-home";

export function UserPortal() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 text-sm text-muted-foreground">
        Checking your session…
      </div>
    );
  }
  return user ? <UserHome /> : <UserLogin />;
}
