const multer = require('multer');
const { v4: uuidv4 } = require('uuid');


const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const fileUpload = multer({
    limits: 5000000, //5 MB size limit
    storage: multer.diskStorage({
        destination: (req, file, cb) => {//cb = callback
            cb(null, 'uploads/images');
        },
        filename: (req, file, cb) => {
            const ext = MIME_TYPE_MAP[file.mimetype]
            cb(null, uuidv4() + '.' + ext);
        }
    }),
    fileFilter: (req, file, cb) => {
        const isValid = !!MIME_TYPE_MAP[file.mimetype];// !! = either true or false
        let error = isValid ? null : new Error('Invalid file type');
        cb(error, isValid);
    }
});

module.exports = fileUpload;