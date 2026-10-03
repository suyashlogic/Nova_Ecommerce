import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import multer from 'multer';
import env from './env.js';
import AppError from '../utils/AppError.js';
import { PRODUCT_UPLOAD_DIR, deleteFileAtPath } from '../utils/files.js';

// SVG is deliberately NOT allowed for uploads: an SVG can contain scripts.
const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PRODUCT_UPLOAD_DIR),
  // Random name + extension we choose. The user's original filename is never
  // used, which prevents path-traversal tricks and name collisions.
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${EXTENSIONS[file.mimetype]}`),
});

const upload = multer({
  storage,
  limits: { fileSize: env.maxUploadMb * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (EXTENSIONS[file.mimetype]) return cb(null, true);
    cb(new AppError('Only JPG, PNG or WebP images are allowed', 400));
  },
});

// Expects the form field to be named "image"
export const uploadProductImage = upload.single('image');

// The mimetype comes from the client and can be faked. Checking the file's first
// bytes ("magic numbers") confirms it really is a JPEG, PNG or WebP.
export async function verifyImageSignature(req, res, next) {
  if (!req.file) return next();

  let valid = false;
  let handle;
  try {
    handle = await fs.open(req.file.path, 'r');
    const buf = Buffer.alloc(12);
    await handle.read(buf, 0, 12, 0);

    const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    const isPng = buf
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isWebp =
      buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP';
    valid = isJpeg || isPng || isWebp;
  } catch {
    valid = false;
  } finally {
    await handle?.close();
  }

  if (valid) return next();
  await deleteFileAtPath(req.file.path);
  next(new AppError('File is not a valid JPG, PNG or WebP image', 400));
}
