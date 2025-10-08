// src/utils/urlResolvers.js

// Normalize Windows backslashes and handle absolute/data URLs
const normalizePath = (val) => {
  if (!val) return "";
  const raw = typeof val === "object" && val !== null ? (val.url || val.path || val.filename || "") : String(val);
  if (!raw) return "";
  return String(raw).replace(/\\+/g, "/");
};

const getStaticBase = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "";
  // strip trailing slash and trailing /api
  return String(apiBase).replace(/\/$/, "").replace(/\/api\/?$/, "");
};

export const resolveImageUrl = (url) => {
  let safe = normalizePath(url);
  if (!safe) return "";
  if (/^(https?:)?\/\//i.test(safe) || safe.startsWith("data:")) return safe;

  // If path contains '/uploads/' anywhere (e.g., 'C:/.../uploads/products/x.jpg'), slice from there
  const idx = safe.toLowerCase().indexOf("/uploads/");
  if (idx >= 0) {
    const fromUploads = safe.slice(idx); // starts with /uploads/
    const base = getStaticBase();
    return base ? `${base}${fromUploads}` : fromUploads;
  }

  // If already /uploads path
  if (safe.startsWith("uploads/")) safe = `/${safe}`;
  if (safe.startsWith("/uploads/")) {
    const base = getStaticBase();
    return base ? `${base}${safe}` : safe;
  }

  // If includes products/ subfolder, mount under /uploads
  if (/^products\//i.test(safe)) {
    const path = `/uploads/${safe}`;
    const base = getStaticBase();
    return base ? `${base}${path}` : path;
  }

  // Fallback: treat as filename under /uploads/products
  const relative = `/uploads/products/${safe}`;
  const base = getStaticBase();
  return base ? `${base}${relative}` : relative;
};

export const resolveProfileUrl = (val) => {
  let safe = normalizePath(val);
  if (!safe) return "";
  if (/^(https?:)?\/\//i.test(safe) || safe.startsWith("data:")) return safe;

  // If already contains /uploads segment, slice from there
  const idx = safe.toLowerCase().indexOf("/uploads/");
  if (idx >= 0) {
    const fromUploads = safe.slice(idx);
    const base = getStaticBase();
    return base ? `${base}${fromUploads}` : fromUploads;
  }

  // Otherwise, mount basename under /uploads/profile
  const parts = safe.split("/");
  const file = parts[parts.length - 1];
  const relative = `/uploads/profile/${file}`;
  const base = getStaticBase();
  return base ? `${base}${relative}` : relative;
};
