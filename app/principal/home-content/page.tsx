"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";

type SlotKey =
  | "hero"
  | "principalProfile"
  | "campus"
  | "gallery1"
  | "gallery2"
  | "gallery3"
  | "gallery4";

type HomeImagesResponse = {
  hero: string;
  principalProfile: string;
  campus: string;
  gallery: string[];
};

type SlotConfig = {
  key: SlotKey;
  label: string;
};

const FALLBACK_IMAGES: HomeImagesResponse = {
  hero: "",
  principalProfile: "",
  campus: "",
  gallery: ["", "", "", ""],
};

const SLOT_CONFIGS: SlotConfig[] = [
  { key: "hero", label: "Hero" },
  { key: "principalProfile", label: "Principal Profile" },
  { key: "campus", label: "Campus" },
  { key: "gallery1", label: "Gallery 1" },
  { key: "gallery2", label: "Gallery 2" },
  { key: "gallery3", label: "Gallery 3" },
  { key: "gallery4", label: "Gallery 4" },
];

function mapImagesBySlot(images: HomeImagesResponse) {
  return {
    hero: images.hero,
    principalProfile: images.principalProfile,
    campus: images.campus,
    gallery1: images.gallery[0] || "",
    gallery2: images.gallery[1] || "",
    gallery3: images.gallery[2] || "",
    gallery4: images.gallery[3] || "",
  } satisfies Record<SlotKey, string>;
}

export default function PrincipalHomeContentPage() {
  const [homeImages, setHomeImages] = useState<Record<SlotKey, string>>(
    mapImagesBySlot(FALLBACK_IMAGES)
  );
  const [busySlots, setBusySlots] = useState<Partial<Record<SlotKey, boolean>>>(
    {}
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const anyBusy = useMemo(
    () => Object.values(busySlots).some(Boolean),
    [busySlots]
  );

  useEffect(() => {
    void loadImages();
  }, []);

  async function loadImages() {
    setError("");
    try {
      const res = await fetch("/api/home-images", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch images.");
      }
      const images = (data?.images || FALLBACK_IMAGES) as HomeImagesResponse;
      setHomeImages(mapImagesBySlot(images));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch images.";
      setError(msg);
    }
  }

  function setSlotBusy(slot: SlotKey, busy: boolean) {
    setBusySlots((prev) => ({ ...prev, [slot]: busy }));
  }

  async function handleUpload(slot: SlotKey, file: File | null) {
    if (!file) return;

    setSlotBusy(slot, true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("slot", slot);
      formData.append("file", file);

      const res = await fetch("/api/upload/home-content", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Upload failed.");
      }

      const uploadedPath = String(data?.path || "");
      if (uploadedPath) {
        setHomeImages((prev) => ({ ...prev, [slot]: uploadedPath }));
      }

      setMessage(`${SLOT_CONFIGS.find((item) => item.key === slot)?.label} updated.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setError(msg);
    } finally {
      setSlotBusy(slot, false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Home Content Management</h1>
        <p className="text-muted-foreground">
          Select an image and upload to update the homepage content.
        </p>
      </div>

      {message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {SLOT_CONFIGS.map(({ key, label }) => {
          const busy = Boolean(busySlots[key]);
          const imageSrc = homeImages[key];

          return (
            <div key={key} className="space-y-3 rounded-lg border p-4">
              <h2 className="font-medium">{label}</h2>

              <div className="relative h-64 w-full overflow-hidden rounded-md bg-muted/30">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={label}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No image
                  </div>
                )}
              </div>

              <input
                id={`file-${key}`}
                type="file"
                accept="image/*"
                onChange={(event) => handleUpload(key, event.target.files?.[0] || null)}
                disabled={busy || anyBusy}
                className="hidden"
              />

              <div className="flex gap-2">
                <label
                  htmlFor={`file-${key}`}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm text-primary-foreground ${
                    busy || anyBusy
                      ? "bg-primary/60 pointer-events-none"
                      : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  <Upload size={16} />
                  {busy ? "Uploading..." : "Upload New Image"}
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
