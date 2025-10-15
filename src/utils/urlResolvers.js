// src/utils/urlResolvers.js

const normalizePath = (val) => {
  if (!val) return "";
  const raw =
    typeof val === "object" && val !== null
      ? val.url || val.path || val.filename || ""
      : String(val);
  if (!raw) return "";
  return String(raw).replace(/\\+/g, "/");
};

const getStaticBase = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  return String(apiBase).replace(/\/$/, "").replace(/\/api\/?$/, "");
};

export const resolveImageUrl = (url) => {
  let safe = normalizePath(url);
  if (!safe) return "";

  // Already full URL
  if (/^(https?:|data:)/i.test(safe)) return safe;

  // Handle Windows paths from DB
  safe = safe.replace(/^[A-Z]:/, "").replace(/\\/g, "/");
  safe = safe.replace(/^\/+/, ""); // strip leading slashes

  const base = getStaticBase();

  // If already points to /uploads/
  if (safe.startsWith("uploads/")) {
    return `${base}/${safe}`;
  }

  // ✅ Case 1: UUID filenames
  if (
    safe.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-.*\.(jpg|jpeg|png|gif|webp)$/i
    )
  ) {
    return `${base}/uploads/products/${safe}`;
  }

  // ✅ Case 2: Long timestamp (10+ digits) + name
  if (safe.match(/^\d{10,}-.*\.(jpg|jpeg|png|gif|webp)$/i)) {
    return `${base}/uploads/products/${safe}`;
  }

  // ✅ Case 3: Short numeric suffix (like 122338-sample-backpack.jpg)
  if (safe.match(/^\d{4,6}-.*\.(jpg|jpeg|png|gif|webp)$/i)) {
    return `${base}/uploads/products/${safe}`;
  }

  // Default fallback
  return `${base}/uploads/products/${safe}`;
};

export const resolveProfileUrl = (val) => {
  let safe = normalizePath(val);
  if (!safe) return "";
  // New streamed profile image endpoint returned by backend
  if (/^(https?:)?\/\//i.test(safe) || safe.startsWith("data:") || safe.startsWith("/api/user/profile/image/")) return safe;

  const idx = safe.toLowerCase().indexOf("/uploads/");
  if (idx >= 0) {
    const fromUploads = safe.slice(idx);
    const base = getStaticBase();
    return base ? `${base}${fromUploads}` : fromUploads;
  }

  const parts = safe.split("/");
  const file = parts[parts.length - 1];
  const relative = `/uploads/profile/${file}`;
  const base = getStaticBase();
  return base ? `${base}${relative}` : relative;
};
