export const IMAGE_ACCEPT = '.heic,.heif,image/*';
export const GALLERY_ACCEPT = `${IMAGE_ACCEPT},video/mp4,.mp4`;

export const isVideoMedia = (media) =>
  media?.mediaType === 'video' || /\.mp4(?:$|\?)/i.test(media?.url || '');

export const getDisplayMediaUrl = (media) => {
  const rawUrl = typeof media === 'string' ? media : media?.url;

  if (!rawUrl || isVideoMedia(media)) return rawUrl || '';
  if (!rawUrl.includes('/upload/')) return rawUrl;
  if (!rawUrl.includes('res.cloudinary.com')) return rawUrl;
  if (/\/upload\/[^/]+,/.test(rawUrl)) return rawUrl;

  return rawUrl.replace('/upload/', '/upload/f_auto,q_auto/');
};

export const isMp4File = (file) =>
  file?.type === 'video/mp4' || /\.mp4$/i.test(file?.name || '');

export const isHeicFile = (file) =>
  /\.(heic|heif)$/i.test(file?.name || '');
