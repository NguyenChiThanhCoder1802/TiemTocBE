import slugify from "slugify";

export const makeSlug = (text) => {
  if (!text) return "";

  return slugify(text, {
    lower: true,
    strict: true, // bỏ ký tự đặc biệt
    locale: "vi",
    trim: true,
  });
};
