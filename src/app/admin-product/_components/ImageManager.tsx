"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_IMAGE_BUCKET } from "@/lib/supabase/config";
import type { ImageEntry } from "@/lib/catalog/types";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Multi-photo manager: upload, reorder, delete.
 *
 * Uploads go browser-direct to Supabase Storage, never through a Server Action — actions
 * have a 1MB request body limit by default, which real product photography exceeds
 * immediately. Only the resulting paths travel through the save action.
 */
export default function ImageManager({
  images,
  onChange,
  slug,
}: {
  images: ImageEntry[];
  onChange: (images: ImageEntry[]) => void;
  slug: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    setBusy(true);
    setError("");
    const supabase = createClient();
    const added: ImageEntry[] = [];

    for (const file of list) {
      if (file.size > MAX_BYTES) {
        setError(`${file.name} is larger than 10 MB.`);
        continue;
      }

      // A fresh object path every time, never a stable one: next/image caches optimized
      // output for 4 hours by default, so overwriting a path would keep serving the old
      // photo. A new path makes the change visible immediately.
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${slug || "untitled"}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(PRODUCT_IMAGE_BUCKET)
        .upload(path, file, { cacheControl: "31536000", upsert: false });

      if (uploadError) {
        setError(uploadError.message);
        continue;
      }

      // getPublicUrl is synchronous and has no error channel — do not await it.
      const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
      added.push({ url: data.publicUrl, path, alt: "" });
    }

    if (added.length > 0) onChange([...images, ...added]);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = async (index: number) => {
    const target = images[index];
    onChange(images.filter((_, i) => i !== index));
    // Only delete from the bucket if we own the object. Seeded /images/... entries have
    // no path and live in public/ — removing those would break the repo.
    if (target?.path) {
      const supabase = createClient();
      await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([target.path]);
    }
  };

  const move = (index: number, delta: number) => {
    const next = [...images];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          void upload(event.dataTransfer.files);
        }}
        className={`rounded-xl border border-dashed p-4 text-center transition-colors ${
          dragOver ? "border-[#C5A880] bg-[#C5A880]/10" : "border-white/20"
        }`}
      >
        <p className="text-sm text-white/60">Drop photos here, or</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="mt-2 rounded-lg border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white/80 transition-colors hover:border-white/50 disabled:opacity-50"
        >
          {busy ? "Uploading…" : "Choose files"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          onChange={(event) => event.target.files && void upload(event.target.files)}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-[#E8B4A0]">
          {error}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {images.map((image, index) => (
          <li
            key={image.path ?? image.url}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage or
                /public URLs at thumbnail size; next/image buys nothing here. */}
            <img src={image.url} alt="" className="h-14 w-14 shrink-0 rounded bg-black/40 object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-white/70">
                {index === 0 ? "Main photo" : `Photo ${index + 1}`}
              </p>
              <input
                type="text"
                value={image.alt ?? ""}
                placeholder="Alt text (for screen readers)"
                onChange={(event) => {
                  const next = [...images];
                  next[index] = { ...image, alt: event.target.value };
                  onChange(next);
                }}
                className="mt-1 w-full rounded border border-white/10 bg-transparent px-2 py-1 text-xs text-white/80 outline-none focus:border-[#C5A880]"
              />
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Move earlier"
                className="rounded border border-white/15 px-2 text-xs text-white/70 disabled:opacity-25"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === images.length - 1}
                aria-label="Move later"
                className="rounded border border-white/15 px-2 text-xs text-white/70 disabled:opacity-25"
              >
                ↓
              </button>
            </div>
            <button
              type="button"
              onClick={() => void remove(index)}
              aria-label="Remove photo"
              className="shrink-0 rounded border border-white/15 px-2 py-1 text-xs text-[#E8B4A0] transition-colors hover:border-[#E8B4A0]"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {images.length === 0 && (
        <p className="text-xs text-[#E8B4A0]">At least one photo is required.</p>
      )}
    </div>
  );
}
