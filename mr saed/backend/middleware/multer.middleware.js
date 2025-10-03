import path from "path";

import multer from "multer";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 mb in size max limit
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      console.log('=== Multer Debug ===');
      console.log('File being processed:', file);
      console.log('Original filename:', file.originalname);
      // Sanitize and timestamp the filename to avoid collisions and track upload time
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      const safeBase = baseName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      // Use ISO-like timestamp without characters invalid for filenames
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const finalName = `${safeBase || 'file'}-${timestamp}${ext}`;
      cb(null, finalName);
    },
  }),
  fileFilter: (req, file, cb) => {
    console.log('=== File Filter Debug ===');
    console.log('Checking file:', file.originalname);
    let ext = path.extname(file.originalname);
    console.log('File extension:', ext);
    if (
      ext !== ".jpg" &&
      ext !== ".jpeg" &&
      ext !== ".webp" &&
      ext !== ".png" &&
      ext !== ".mp4" &&
      ext !== ".pdf"
    ) {
      console.log('File type rejected:', ext);
      cb(new Error(`Unsupported file type! ${ext}`), false);
      return;
    }
    console.log('File type accepted:', ext);
    cb(null, true);
  },
});

export default upload;
