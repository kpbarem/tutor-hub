"use client";

import { useState } from "react";
import { deleteAvailabilityBlock } from "@/app/dashboard/availability/actions";

export function DeleteBlockButton({ blockId }: { blockId: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={async () => {
        setLoading(true);
        await deleteAvailabilityBlock(blockId);
      }}
      disabled={loading}
      className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {loading ? "Removing…" : "Remove"}
    </button>
  );
}