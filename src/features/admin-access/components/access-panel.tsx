"use client";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminAccessApi } from "@/features/admin-access/api/admin-access-api";
export function AccessPanel() {
  const [userId, setUserId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function change(action: "grant" | "revoke") {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const result =
        action === "grant"
          ? await adminAccessApi.grantOperator(userId)
          : await adminAccessApi.revokeOperator(userId);
      setMessage(
        `${action === "grant" ? "Operator access granted" : "Operator access revoked"} for ${result.user_id}.`,
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to update access",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card className="max-w-xl border-amber-300 bg-amber-50/50">
      <CardHeader>
        <CardTitle>Admin access management</CardTitle>
        <CardDescription>
          Grant or revoke operator capability for an existing account by user
          UUID.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="User UUID"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => void change("grant")}
              disabled={busy || !userId}
            >
              Grant operator
            </Button>
            <Button
              variant="outline"
              onClick={() => void change("revoke")}
              disabled={busy || !userId}
            >
              Revoke operator
            </Button>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {message && <p className="text-sm text-emerald-700">{message}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
