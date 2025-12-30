import slugify from "slugify";

export const normalizeTags = (tags) => {
  if (!tags) return [];

  // ✅ FE gửi string: "Hot, trend"
  if (typeof tags === "string") {
    tags = tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);
  }

  if (!Array.isArray(tags)) return [];

  return [...new Set(
    tags.map(tag =>
      slugify(tag, {
        lower: true,
        strict: true,
        locale: "vi"
      })
    )
  )];
};
