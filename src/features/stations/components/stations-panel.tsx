"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import { stationsApi, type Station } from "@/features/stations/api/stations-api";

function ErrorText({ message }: { message: string }) {
  return message ? (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  ) : null;
}

export function StationForm({
  station,
  canEdit,
  onSaved,
}: {
  station?: Station;
  canEdit: boolean;
  onSaved: () => void;
}) {
  const [name, setName] = useState(station?.name || "");
  const [address, setAddress] = useState(station?.address || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(patch = false) {
    if (!canEdit) return;
    setBusy(true);
    setError("");
    try {
      if (station) {
        if (patch) await stationsApi.patch(station.id, { address });
        else await stationsApi.update(station.id, { name, address });
      } else await stationsApi.create({ name, address });
      onSaved();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to save station",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="station-name">Name</Label>
        <Input
          id="station-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={!canEdit || busy}
          placeholder="Central station"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="station-address">Address</Label>
        <Input
          id="station-address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          disabled={!canEdit || busy}
          placeholder="123 Main Street"
        />
      </div>
      <ErrorText message={error} />
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => void save()}
          disabled={!canEdit || busy || !name || !address}
        >
          {station ? "Save changes" : "Add station"}
        </Button>
        {station && (
          <Button
            variant="outline"
            onClick={() => void save(true)}
            disabled={!canEdit || busy || !address}
          >
            Patch address
          </Button>
        )}
      </div>
    </div>
  );
}

export function StationsPanel({ canEdit }: { canEdit: boolean }) {
  const [stations, setStations] = useState<Station[]>([]);
  const [selected, setSelected] = useState<Station>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    setLoading(true);
    try {
      setStations(await stationsApi.list());
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to load stations",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Stations</CardTitle>
              <CardDescription>
                Public station directory and operator edits.
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => void load()}>
              Refresh
            </Button>
            {canEdit && (
              <Button render={<Link href="/stations/new" />} nativeButton={false}>Add station</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ErrorText message={error} />
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading stations…</p>
          ) : stations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No stations yet.</p>
          ) : (
            <div className="divide-y">
              {stations.map((item) => (
                <button
                  key={item.id}
                  className={`block w-full py-3 text-left ${selected?.id === item.id ? "rounded-md bg-muted px-3" : ""}`}
                  onClick={() => setSelected(item)}
                >
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.address}
                  </p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{selected ? "Edit station" : "Select a station"}</CardTitle>
          <CardDescription>
            {canEdit
              ? "Full edits use PUT; the quick action uses PATCH."
              : "Your account can view stations but cannot edit them."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selected ? (
            <StationForm
              key={selected.id}
              station={selected}
              canEdit={canEdit}
              onSaved={() => {
                setSelected(undefined);
                void load();
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Choose a station to edit it, or use “Add station” to create one.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function StationCreatePage({ canEdit }: { canEdit: boolean }) {
  const router = useRouter();
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Add station</CardTitle>
        <CardDescription>Create a station in the public directory.</CardDescription>
      </CardHeader>
      <CardContent>
        {canEdit ? (
          <StationForm
            canEdit={canEdit}
            onSaved={() => router.push("/stations")}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Your account can view stations but cannot create them.
          </p>
        )}
        <Button className="mt-4" variant="ghost" render={<Link href="/stations" />} nativeButton={false}>
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}
