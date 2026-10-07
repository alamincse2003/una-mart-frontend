"use client";

import { useState, type FormEvent } from "react";
import { Truck } from "lucide-react";
import { adminApi, ApiError, type AdminZone } from "@/lib/admin-api-client";
import { toPoisha, toTaka } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/Field";
import { AdminPageHeader } from "./AdminPageHeader";
import { useAdminQuery } from "./useAdminQuery";

export function SettingsView() {
  const zones = useAdminQuery(() => adminApi.listZones());

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Settings" description="Delivery areas and fees. Checkout uses these immediately." />
      <Card className="p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-neutral-800">
          <Truck aria-hidden width={18} height={18} className="text-navy-600" />
          Delivery zones
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          The fee is waived automatically when every item in the order has free delivery.
        </p>
        {zones.error && (
          <p role="alert" className="mt-4 text-sm font-medium text-danger">
            {zones.error}
          </p>
        )}
        <ul className="mt-4 flex flex-col gap-4">
          {(zones.data ?? []).map((zone) => (
            <li key={zone.id}>
              <ZoneRow zone={zone} onSaved={() => zones.reload()} />
            </li>
          ))}
          {zones.loading && !zones.data && <li className="h-24 animate-pulse rounded-lg bg-neutral-100" />}
        </ul>
      </Card>
    </div>
  );
}

function ZoneRow({ zone, onSaved }: { zone: AdminZone; onSaved: () => void }) {
  const toast = useToast();
  const [name, setName] = useState(zone.name);
  const [fee, setFee] = useState(String(toTaka(zone.fee)));
  const [eta, setEta] = useState(zone.etaText);
  const [busy, setBusy] = useState(false);

  const dirty = name !== zone.name || toPoisha(Number(fee)) !== zone.fee || eta !== zone.etaText;

  async function save(patch: Parameters<typeof adminApi.updateZone>[1]) {
    setBusy(true);
    try {
      await adminApi.updateZone(zone.code, patch);
      toast(`${zone.name} saved`);
      onSaved();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't save.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        void save({ name: name.trim(), fee: toPoisha(Number(fee)), etaText: eta.trim() });
      }}
      className={`grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_140px_1fr] ${zone.isActive ? "border-neutral-200" : "border-dashed border-neutral-300 bg-neutral-50"}`}
    >
      <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} hint={`Code: ${zone.code}`} />
      <TextField label="Fee (৳)" type="number" inputMode="decimal" min={0} value={fee} onChange={(e) => setFee(e.target.value)} />
      <TextField label="Delivery time" value={eta} onChange={(e) => setEta(e.target.value)} />
      <div className="flex flex-wrap gap-2 sm:col-span-3">
        <Button type="submit" size="sm" disabled={!dirty || busy}>
          {busy ? "Saving…" : "Save"}
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => save({ isActive: !zone.isActive })}>
          {zone.isActive ? "Turn off this zone" : "Turn on this zone"}
        </Button>
      </div>
    </form>
  );
}
