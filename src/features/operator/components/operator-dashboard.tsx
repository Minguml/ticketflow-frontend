"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/auth-context";
import { AccessPanel } from "@/features/admin-access/components/access-panel";
import { RoutesPanel } from "@/features/routes/components/routes-panel";
import { StationsPanel } from "@/features/stations/components/stations-panel";
import { DriversPanel } from "@/features/drivers/components/drivers-panel";
import { DriverCreatePage } from "@/features/drivers/components/drivers-panel";
import { StationCreatePage } from "@/features/stations/components/stations-panel";
import { RouteCreatePage } from "@/features/routes/components/routes-panel";
import { Loading } from "@/features/user/components/user-home";
import type { OperatorPage } from "@/features/operator/components/operator-portal";

type Tab = Exclude<OperatorPage, "stations-new" | "routes-new" | "drivers-new">;

function tabForPage(page: OperatorPage): Tab {
	switch (page) {
		case "stations-new":
			return "stations";
		case "routes-new":
			return "routes";
		case "drivers-new":
			return "drivers";
		default:
			return page;
	}
}

export function OperatorDashboard({ page }: { page?: OperatorPage }) {
	const { user, signOut } = useAuth();
	const pathname = usePathname();
	const currentPage = page ?? pageFromPath(pathname);
	const tab = tabForPage(currentPage);
	const canEdit = Boolean(user?.is_admin || user?.roles.includes("operator"));
	const nav = useMemo(
		() => [
			{ id: "overview" as const, label: "Overview" },
			{ id: "stations" as const, label: "Stations" },
			{ id: "routes" as const, label: "Routes" },
			{ id: "drivers" as const, label: "Drivers" },
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
						<p className="text-xs font-semibold uppercase tracking-widest text-primary">TicketFlow operations</p>
						<h1 className="text-lg font-bold">Control center</h1>
					</div>
					<div className="flex items-center gap-3">
						<div className="hidden text-right sm:block">
							<p className="text-sm font-semibold">{user.name}</p>
							<p className="text-xs text-muted-foreground">{user.is_admin ? "Administrator" : "Operator"}</p>
						</div>
						<Badge variant={user.is_admin ? "default" : "secondary"}>{user.is_admin ? "Admin" : "Operator"}</Badge>
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
								render={<Link href={item.id === "overview" ? "/" : `/${item.id}`} />}
								nativeButton={false}
								key={item.id}
								variant={tab === item.id ? "default" : "ghost"}
								className="justify-start">
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
										{user.is_admin ? "Administrator workspace" : "Operator workspace"}
									</CardDescription>
									<CardTitle className="text-2xl">Keep the network moving.</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="max-w-2xl text-sm leading-6 text-muted-foreground">
										Manage the station directory and routes from one place. Public reads are
										available to everyone; changes require operator capability.{" "}
										{user.is_admin && "As an administrator, you can also manage operator access."}
									</p>
								</CardContent>
							</Card>
							<div className="grid gap-4 sm:grid-cols-2">
								<Button
									variant="outline"
									className="h-auto justify-start p-5"
									render={<Link href="/stations" />}
									nativeButton={false}>
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
									render={<Link href="/drivers" />}
									nativeButton={false}>
									<span>
										<strong className="block">Manage drivers</strong>
										<span className="mt-1 block text-sm font-normal text-muted-foreground">
											Maintain driver identity and profile pictures.
										</span>
									</span>
								</Button>
								<Button
									variant="outline"
									className="h-auto justify-start p-5"
									render={<Link href="/routes" />}
									nativeButton={false}>
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
					{currentPage === "stations" && <StationsPanel canEdit={canEdit} />}
					{currentPage === "stations-new" && <StationCreatePage canEdit={canEdit} />}
					{currentPage === "routes" && <RoutesPanel canEdit={canEdit} />}
					{currentPage === "routes-new" && <RouteCreatePage canEdit={canEdit} />}
					{currentPage === "drivers" && <DriversPanel canEdit={canEdit} />}
					{currentPage === "drivers-new" && <DriverCreatePage canEdit={canEdit} />}
					{tab === "access" && user.is_admin && <AccessPanel />}
					{tab === "access" && !user.is_admin && (
						<Card>
							<CardHeader>
								<CardTitle>Administrator access required</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">Only administrators can manage operator access.</p>
							</CardContent>
						</Card>
					)}
				</main>
			</div>
		</div>
	);
}

function pageFromPath(pathname: string): OperatorPage {
	const path = pathname.replace(/^\/operator/, "") || "/";
	if (path === "/") return "overview";
	if (path === "/stations/new") return "stations-new";
	if (path === "/routes/new") return "routes-new";
	if (path === "/drivers/new") return "drivers-new";
	if (path === "/stations") return "stations";
	if (path === "/routes") return "routes";
	if (path === "/drivers") return "drivers";
	if (path === "/access") return "access";
	return "overview";
}
