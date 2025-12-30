import crypto from "crypto";
import cloudinary from "../config/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/environment.js";

/* =====================
   HELPERS
===================== */
const generateSecurePublicId = (prefix = "file") => {
  const secret =
    env.CLOUDINARY_PUBLIC_ID_SECRET ||
    crypto.randomBytes(16).toString("hex");

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(prefix + Date.now() + crypto.randomBytes(8).toString("hex"));

  return hmac.digest("hex");
};

const bufferToDataUri = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

/* =====================
   CORE UPLOAD
===================== */
const uploadBuffer = async (
  file,
  { folder, resource_type = "image", transform } = {}
) => {
  try {
    const public_id = generateSecurePublicId(folder);

    const result = await cloudinary.uploader.upload(
      bufferToDataUri(file),
      {
        folder,
        public_id,
        resource_type,
        overwrite: false,
        transformation: transform
      }
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
      type: result.resource_type
    };
  } catch (err) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Upload to Cloudinary failed"
    );
  }
};

/* =====================
   EXPORT APIS
===================== */
export const CloudinaryService = {
  uploadAvatar(file) {
    return uploadBuffer(file, {
      folder: "Avatar",
      transform: [
        { width: 400, height: 400, crop: "fill", gravity: "face" }
      ]
    });
  },

  uploadReviewImages(files) {
    return Promise.all(
      files.map(file =>
        uploadBuffer(file, { folder: "reviews" })
      )
    );
  },

  uploadServiceImages(files) {
    return Promise.all(
      files.map(file =>
        uploadBuffer(file, { folder: "hair_services" })
      )
    );
  }
};
