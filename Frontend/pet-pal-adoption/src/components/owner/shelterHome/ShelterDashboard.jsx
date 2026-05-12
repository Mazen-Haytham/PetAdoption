import React, { useState } from "react";
import { ClipboardIcon, HandshakeIcon, PawIcon } from "./OwnerIcons";
import StatCard from "./StatCard";
import PetPostsTable from "./PetPostsTable";
import PetPostFormModal from "./PetPostFormModal";
import RequestsList from "./RequestsList";
import { useShelterOwnerOutlet } from "../../../hooks/useShelterOwnerOutlet";

function pickPetPostId(raw) {
  return raw?.petPostId ?? raw?.PetPostId ?? raw?.id;
}

export default function ShelterDashboard() {
  const {
    loading,
    loadError,
    petRows,
    recentRequestItems,
    openDetails,
    createPetListing,
    updatePetListing,
    deletePetListing,
  } = useShelterOwnerOutlet();

  const [petFormOpen, setPetFormOpen] = useState(false);
  const [petFormMode, setPetFormMode] = useState("create");
  const [petFormInitial, setPetFormInitial] = useState(null);
  const [deletingKey, setDeletingKey] = useState(null);

  const pendingRows = petRows.filter(
    (row) => String(row.status).toLowerCase() === "pending",
  );
  const availableOrAdopted = petRows.filter((row) => {
    const s = String(row.status).toLowerCase();
    return s === "available" || s === "adopted";
  });

  const stats = {
    available: petRows.filter(
      (row) => String(row.status).toLowerCase() === "available",
    ).length,
    pendingAdoptions: petRows.filter(
      (row) => String(row.status).toLowerCase() === "pending",
    ).length,
    adopted: petRows.filter(
      (row) => String(row.status).toLowerCase() === "adopted",
    ).length,
  };

  const openEdit = (row) => {
    setPetFormMode("edit");
    const raw = row.raw ? { ...row.raw } : {};
    const petPostId = row.petPostId ?? raw.petPostId ?? raw.PetPostId;
    setPetFormInitial(
      petPostId != null && petPostId !== ""
        ? { ...raw, petPostId, PetPostId: petPostId }
        : Object.keys(raw).length ? raw : null,
    );
    setPetFormOpen(true);
  };

  const closePetForm = () => {
    setPetFormOpen(false);
    setPetFormInitial(null);
  };

  const handleDelete = async (row) => {
    const id = pickPetPostId(row.raw);
    if (!id) return;
    const ok = window.confirm(
      `Delete the listing for “${row.name}”? This cannot be undone.`,
    );
    if (!ok) return;
    setDeletingKey(row.key);
    try {
      await deletePetListing(id);
    } catch (e) {
      const msg =
        typeof e === "string"
          ? e
          : e?.message ?? "Could not delete this listing.";
      window.alert(msg);
    } finally {
      setDeletingKey(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Shelter Dashboard
          </h1>
          <p className="mt-1 text-sm font-semibold text-black/45">
            Manage your shelter&apos;s activity and pet listings efficiently.
          </p>
        </div>
      </div>

      {loadError ? (
        <div className="pa-card mt-6 border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {loadError}
        </div>
      ) : null}

      <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<PawIcon />}
          label="Available Pets"
          value={loading ? "…" : String(stats.available)}
        />
        <StatCard
          icon={<ClipboardIcon />}
          label="Pending Adoptions"
          value={loading ? "…" : String(stats.pendingAdoptions)}
        />
        <StatCard
          icon={<HandshakeIcon />}
          label="Total Adopted"
          value={loading ? "…" : String(stats.adopted)}
        />
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PetPostsTable
            title="Active Pet Posts"
            rows={availableOrAdopted}
            loading={loading}
            emptyMessage="No pet posts yet."
            showRowActions
            onEdit={openEdit}
            onDelete={handleDelete}
            deletingKey={deletingKey}
          />
        </div>

        <RequestsList
          title="New Requests"
          items={recentRequestItems}
          loading={loading}
          onOpenDetails={openDetails}
          emptyMessage="No adoption requests yet."
        />

        <div className="col-span-full">
          <PetPostsTable
            title="Pending Pet Posts"
            rows={pendingRows}
            loading={loading}
            emptyMessage="No pending pet posts."
            showRowActions
            onEdit={openEdit}
            onDelete={handleDelete}
            deletingKey={deletingKey}
          />
        </div>
      </section>

      <PetPostFormModal
        open={petFormOpen}
        mode={petFormMode}
        initialPet={petFormInitial}
        onClose={closePetForm}
        onCreate={createPetListing}
        onUpdate={updatePetListing}
      />
    </div>
  );
}
