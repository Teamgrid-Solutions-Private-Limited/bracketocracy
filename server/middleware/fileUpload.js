const multer = require("multer");
const path = require("path");
 
const maxSize = 2 * 1024 * 1024;
 
const storage = multer.diskStorage({
  destination: "my-upload/images",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + file.originalname);
  },
});
 
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Log file mimetype and extension
    console.log("File mimetype:", file.mimetype);
    console.log("File extension:", path.extname(file.originalname));
 
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/svg+xml"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(
        new Error("Only .jpg, .jpeg, .png and .svg formats are allowed!")
      );
    }
  },
  limits: { fileSize: maxSize },
});
 
module.exports = upload;