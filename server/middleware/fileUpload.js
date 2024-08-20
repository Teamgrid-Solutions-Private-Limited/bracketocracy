const multer = require("multer");

var maxSize = 1 * 1000 * 1000;
const storage = multer.diskStorage({
  destination: "my-upload/images",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + ".jpg");
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || "image/jpg" || "image/jpeg") {
      return cb(null, true);
    } else {
      cb(null, false);
      return cb(newError("Only .jpg,.jpeg,.png thoose format are allowed!!!"));
    }
  },
  limits: maxSize,
});

module.exports = upload;
