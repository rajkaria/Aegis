"use client";

import { useEffect, useState, useMemo } from "react";
import type { ServiceEntry } from "@aegis-ows/shared";
import { ServiceTable } from "@/components/service-table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        setServices(data.services || []);
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return services;
    const q = search.toLowerCase();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.protocol.toLowerCase().includes(q) ||
        s.chains.some((c) => c.toLowerCase().includes(q))
    );
  }, [services, search]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Services</h2>
          <p className="text-muted-foreground text-sm mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Services</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Registered services available for agent interactions.
        </p>
      </div>

      <div className="max-w-sm">
        <Input
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <ServiceTable services={filtered} />
        </CardContent>
      </Card>
    </div>
  );
}
