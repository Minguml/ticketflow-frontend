"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { driversApi, type Driver } from "@/features/drivers/api/drivers-api";

function ErrorText({ message }: { message: string }) {
  return message ? (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  ) : null;
}

export function DriverForm({
  driver,
  canEdit,
  onSaved,
}: {
  driver?: Driver;
  canEdit: boolean;
  onSaved: () => void;
}) {
  const [name, setName] = useState(driver?.name || "");
  const [phone, setPhone] = useState(driver?.phone_number || "");
  const [personalId, setPersonalId] = useState(driver?.personal_id || "");
  const [status, setStatus] = useState<Driver["status"]>(driver?.status || "active");
  const [photo, setPhoto] = useState<File>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!canEdit) return;
    if (!name.trim() || !phone.trim() || !/^\d{12}$/.test(personalId.trim())) {
      setError("Enter a full name, phone number, and exactly 12 digits for the personal ID.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const saved = driver
        ? await driversApi.patch(driver.id, {
            name: name.trim(),
            phone_number: phone.trim(),
            personal_id: personalId.trim(),
            status,
          })
        : await driversApi.create({
            name: name.trim(),
            phone_number: phone.trim(),
            personal_id: personalId.trim(),
          });
      if (photo) await driversApi.uploadProfile(saved.id, photo);
      setPhoto(undefined);
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save driver");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="driver-name">Full legal name</Label>
        <Input id="driver-name" value={name} onChange={(event) => setName(event.target.value)} disabled={!canEdit || busy} placeholder="Nguyen Van An" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="driver-phone">Phone number</Label>
        <Input id="driver-phone" value={phone} onChange={(event) => setPhone(event.target.value)} disabled={!canEdit || busy} placeholder="0901234567" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="driver-personal-id">Personal ID / passport number</Label>
        <Input id="driver-personal-id" value={personalId} maxLength={12} onChange={(event) => setPersonalId(event.target.value.replace(/\D/g, ""))} disabled={!canEdit || busy} placeholder="12 digits" />
      </div>
      {driver && (
        <div className="space-y-2">
          <Label htmlFor="driver-status">Status</Label>
          <select id="driver-status" className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value as Driver["status"])} disabled={!canEdit || busy}>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="retired">Retired</option>
          </select>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="driver-photo">Profile picture</Label>
        <Input id="driver-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPhoto(event.target.files?.[0])} disabled={!canEdit || busy} />
        <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP. Maximum 5 MiB.</p>
      </div>
      <ErrorText message={error} />
      <Button onClick={() => void save()} disabled={!canEdit || busy}>
        {busy ? "Saving…" : driver ? "Save driver" : "Add driver"}
      </Button>
    </div>
  );
}

export function DriversPanel({ canEdit }: { canEdit: boolean }) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selected, setSelected] = useState<Driver>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setDrivers(await driversApi.list());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load drivers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Driver roster</CardTitle>
          <CardDescription>Drivers managed by the currently signed-in operator.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => void load()} disabled={loading}>{loading ? "Loading…" : "Refresh drivers"}</Button>
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div><CardTitle>Drivers</CardTitle><CardDescription>Identity and profile pictures are stored through the backend.</CardDescription></div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void load()} disabled={loading}>Refresh</Button>
            {canEdit && <Button render={<Link href="/drivers/new" />} nativeButton={false}>Add driver</Button>}
          </div>
            </div>
          </CardHeader>
          <CardContent>
            <ErrorText message={error} />
            {loading ? <p className="text-sm text-muted-foreground">Loading drivers…</p> : drivers.length === 0 ? <p className="text-sm text-muted-foreground">No drivers loaded.</p> : <div className="divide-y">{drivers.map((item) => <button key={item.id} className={`block w-full py-3 text-left ${selected?.id === item.id ? "rounded-md bg-muted px-3" : ""}`} onClick={() => setSelected(item)}><div className="flex items-center justify-between gap-3"><p className="font-medium">{item.name}</p><Badge variant={item.status === "active" ? "default" : "secondary"}>{item.status}</Badge></div><p className="text-sm text-muted-foreground">{item.phone_number} · ID {item.personal_id}</p></button>)}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{selected ? "Edit driver" : "Select a driver"}</CardTitle><CardDescription>{canEdit ? "Profile pictures upload directly to private S3 after the driver is saved." : "Your account can view drivers but cannot edit them."}</CardDescription></CardHeader>
          <CardContent>{selected ? <DriverForm key={selected.id} driver={selected} canEdit={canEdit} onSaved={() => { setSelected(undefined); void load(); }} /> : <p className="text-sm text-muted-foreground">Choose a driver to edit it, or use “Add driver” to create one.</p>}</CardContent>
        </Card>
      </div>
    </div>
  );
}

export function DriverCreatePage({ canEdit }: { canEdit: boolean }) {
  const router = useRouter();
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Add driver</CardTitle>
        <CardDescription>
          The driver will be assigned to the operator associated with your signed-in account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {canEdit ? (
          <DriverForm canEdit={canEdit} onSaved={() => router.push("/drivers")} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Your account can view drivers but cannot create them.
          </p>
        )}
        <Button className="mt-4" variant="ghost" render={<Link href="/drivers" />} nativeButton={false}>
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}
