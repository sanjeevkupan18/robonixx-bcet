const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const MAX_IMAGE_SIZE_MB = Number(process.env.MAX_IMAGE_SIZE_MB || 15);
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'];
const VIDEO_FORMATS = ['mp4'];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getFileExtension = (file) =>
  path.extname(file.originalname || '').slice(1).toLowerCase();

const getUploadType = (file, allowVideo = false) => {
  const ext = getFileExtension(file);
  const mime = (file.mimetype || '').toLowerCase();

  if (allowVideo && (mime === 'video/mp4' || VIDEO_FORMATS.includes(ext))) return 'video';
  if (mime.startsWith('image/') || IMAGE_FORMATS.includes(ext)) return 'image';
  return null;
};

const createImageStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `robonixx/${folder}`,
      resource_type: 'image',
      allowed_formats: IMAGE_FORMATS,
      transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
    },
  });

const createGalleryStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const uploadType = getUploadType(file, true);

      return {
        folder: `robonixx/${folder}`,
        resource_type: uploadType === 'video' ? 'video' : 'image',
        allowed_formats: uploadType === 'video' ? VIDEO_FORMATS : IMAGE_FORMATS,
      };
    },
  });

const createUploader = (folder, { allowVideo = false } = {}) =>
  multer({
    storage: allowVideo ? createGalleryStorage(folder) : createImageStorage(folder),
    limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
    fileFilter: (req, file, cb) => {
      const uploadType = getUploadType(file, allowVideo);

      if (!uploadType) {
        return cb(new Error(
          allowVideo
            ? 'Only image files, HEIC images, and MP4 videos are allowed'
            : 'Only image files are allowed'
        ), false);
      }
      cb(null, true);
    },
  });

const eventUploader = createUploader('events');
const memberUploader = createUploader('members');
const galleryUploader = createUploader('gallery', { allowVideo: true });
const contentUploader = createUploader('content');

module.exports = { cloudinary, eventUploader, memberUploader, galleryUploader, contentUploader, MAX_IMAGE_SIZE_MB };
