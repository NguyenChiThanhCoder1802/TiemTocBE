import multer from "multer";
import { CloudinaryService } from "../services/cloudinary.service.js";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

/* Avatar */
export const uploadAvatarMiddleware = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const { url } = await CloudinaryService.uploadAvatar(req.file);
    req.body.avatar = url;

    next();
  } catch (err) {
    next(err);
  }
};

/* Review images */
export const uploadReviewImagesMiddleware = async (req, res, next) => {
  try {
    if (!req.files?.length) return next();

    const uploaded = await CloudinaryService.uploadReviewImages(req.files);
    req.body.images = uploaded.map(i => i.url);

    next();
  } catch (err) {
    next(err);
  }
};
/* Hair service images */
export const uploadServiceImagesMiddleware = async (req, res, next) => {
  try {
    if (!req.files?.length) return next();

    const uploaded = await CloudinaryService.uploadServiceImages(req.files);
    req.body.images = uploaded.map(i => i.url);

    next();
  } catch (err) {
    next(err);
  }
};

/* Combo images */
export const uploadComboImagesMiddleware = async (req, res, next) => {
  try {
    if (!req.files?.length) return next();

    const uploaded = await CloudinaryService.uploadServiceImages(req.files);
    req.body.images = uploaded.map(i => i.url);

    next();
  } catch (err) {
    next(err);
  }
};