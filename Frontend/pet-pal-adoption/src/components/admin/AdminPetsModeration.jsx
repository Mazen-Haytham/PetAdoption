import { useEffect, useState } from "react";
import useAdminStore from "../../store/useAdminStore";
import { PET_STATUS_FILTER_OPTIONS } from "../../admin/adminConstants";
import AdminAlertError from "./AdminAlertError";
import AdminPetsTable from "./AdminPetsTable";

/** Pets page body: filter + table. Data lives in Zustand (`useAdminStore`). */
export default function AdminPetsModeration() {
  const pets = useAdminStore((s) => s.pets);
  const loading = useAdminStore((s) => s.petsLoading);
  const error = useAdminStore((s) => s.petsError);
  const fetchPets = useAdminStore((s) => s.fetchPets);
  const approvePet = useAdminStore((s) => s.approvePet);
  const rejectPet = useAdminStore((s) => s.rejectPet);

  const [statusFilter, setStatusFilter] = useState("");
  const [busyApprovalId, setBusyApprovalId] = useState(null);

  useEffect(() => {
    fetchPets({ status: statusFilter });
  }, [fetchPets, statusFilter]);

  async function handleApprove(id) {
    setBusyApprovalId(id);
    await approvePet(id);
    setBusyApprovalId(null);
  }

  async function handleReject(id) {
    setBusyApprovalId(id);
    await rejectPet(id);
    setBusyApprovalId(null);
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Pet Posts</h1>
          <p className="mt-1 text-sm font-semibold text-black/45">
            Review and moderate pet listing requests from owners.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-black/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--pa-primary))/20]"
        >
          {PET_STATUS_FILTER_OPTIONS.map((s) => (
            <option key={s || "all"} value={s}>
              {s || "All Statuses"}
            </option>
          ))}
        </select>
      </div>

      <AdminAlertError message={error} />

      <AdminPetsTable
        rows={pets}
        loading={loading}
        busyApprovalId={busyApprovalId}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </>
  );
}
