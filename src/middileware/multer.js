import multer from "multer";

// Store files in memory instead of disk
const storage = multer.memoryStorage();

// Only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) cb(null, true);
  else cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)!"), false);
};

// Set limits for file size (optional)
const limits = {
  fileSize: 25 * 1024 * 1024, // 25MB per file
};

export const upload = multer({ storage, fileFilter, limits });



// ✅ Multiple images upload (min: 4, max: 6)
export const uploadMultiple = (req, res, next) => {
  const handler = upload.array("file", 6); // allow up to 6 files

  handler(req, res, (err) => {
    if (err) return next(err);

    // Validate minimum count
    if (!req.files || req.files.length < 4) {
      return next(new Error("You must upload at least 4 images (max 6 allowed)."));
    }

    next();
  });
};

export const uploadReview = (req, res, next) => {
  const handler = upload.array("file", 6); // allow 0–6 files

  handler(req, res, (err) => {
    if (err) return next(err); // multer error
    next();
  });
};
