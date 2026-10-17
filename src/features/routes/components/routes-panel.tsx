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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { routesApi, type Route } from "@/features/routes/api/routes-api";
import { stationsApi, type Station } from "@/features/stations/api/stations-api";

function ErrorText({ message }: { message: string }) {
  return message ? (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  ) : null;
}
export function RouteForm({
  route,
  stations,
  canEdit,
  onSaved,
}: {
  route?: Route;
  stations: Station[];
  canEdit: boolean;
  onSaved: () => void;
}) {
  const [name, setName] = useState(route?.name || "");
  const [origin, setOrigin] = useState(route?.origin_id || "");
  const [destination, setDestination] = useState(route?.destination_id || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(patch = false) {
    if (!canEdit) return;
    setBusy(true);
    setError("");
    try {
      if (route) {
        if (patch) await routesApi.patch(route.id, { name });
        else
          await routesApi.update(route.id, {
            name,
            origin_id: origin,
            destination_id: destination,
          });
      } else
        await routesApi.create({
          name,
          origin_id: origin,
          destination_id: destination,
        });
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save route");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="route-name">Name</Label>
        <Input
          id="route-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={!canEdit || busy}
          placeholder="Central to North"
        />
      </div>
      <div className="space-y-2">
        <Label>Origin</Label>
        <Select
          value={origin}
          onValueChange={(value) => setOrigin(value ?? "")}
          disabled={!canEdit || busy}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select origin" />
          </SelectTrigger>
          <SelectContent>
            {stations.map((station) => (
              <SelectItem key={station.id} value={station.id}>
                {station.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Destination</Label>
        <Select
          value={destination}
          onValueChange={(value) => setDestination(value ?? "")}
          disabled={!canEdit || busy}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select destination" />
          </SelectTrigger>
          <SelectContent>
            {stations.map((station) => (
              <SelectItem key={station.id} value={station.id}>
                {station.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ErrorText message={error} />
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => void save()}
          disabled={!canEdit || busy || !name || !origin || !destination}
        >
          {route ? "Save changes" : "Add route"}
        </Button>
        {route && (
          <Button
            variant="outline"
            onClick={() => void save(true)}
            disabled={!canEdit || busy || !name}
          >
            Patch name
          </Button>
        )}
      </div>
    </div>
  );
}
export function RoutesPanel({ canEdit }: { canEdit: boolean }) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [selected, setSelected] = useState<Route>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    setLoading(true);
    try {
      const [routeItems, stationItems] = await Promise.all([
        routesApi.list(),
        stationsApi.list(),
      ]);
      setRoutes(routeItems);
      setStations(stationItems);
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to load routes",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const stationName = (id: string) =>
    stations.find((station) => station.id === id)?.name || id.slice(0, 8);
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Routes</CardTitle>
              <CardDescription>
                Connect origin and destination stations.
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => void load()}>
              Refresh
            </Button>
            {canEdit && (
              <Button render={<Link href="/routes/new" />} nativeButton={false}>Add route</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ErrorText message={error} />
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading routes…</p>
          ) : routes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No routes yet.</p>
          ) : (
            <div className="divide-y">
              {routes.map((item) => (
                <button
                  key={item.id}
                  className={`block w-full py-3 text-left ${selected?.id === item.id ? "rounded-md bg-muted px-3" : ""}`}
                  onClick={() => setSelected(item)}
                >
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {stationName(item.origin_id)} →{" "}
                    {stationName(item.destination_id)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{selected ? "Edit route" : "Select a route"}</CardTitle>
          <CardDescription>
            {canEdit
              ? "Full edits use PUT; the quick action uses PATCH."
              : "Your account can view routes but cannot edit them."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selected ? (
            <RouteForm
              key={selected.id}
              route={selected}
              stations={stations}
              canEdit={canEdit}
              onSaved={() => {
                setSelected(undefined);
                void load();
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Choose a route to edit it, or use “Add route” to create one.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function RouteCreatePage({ canEdit }: { canEdit: boolean }) {
  const router = useRouter();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    void stationsApi
      .list()
      .then(setStations)
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Unable to load stations"),
      )
      .finally(() => setLoading(false));
  }, []);
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Add route</CardTitle>
        <CardDescription>Connect two stations into a route.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading stations…</p>
        ) : error ? (
          <ErrorText message={error} />
        ) : canEdit ? (
          <RouteForm
            stations={stations}
            canEdit={canEdit}
            onSaved={() => router.push("/routes")}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Your account can view routes but cannot create them.
          </p>
        )}
        <Button className="mt-4" variant="ghost" render={<Link href="/routes" />} nativeButton={false}>
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}
