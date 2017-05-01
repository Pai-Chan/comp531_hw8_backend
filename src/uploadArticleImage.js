const multer = require('multer')
const stream = require('stream')
const cloudinary = require('cloudinary')

// a doUpload function similar to the provided code,
// the only difference is that because article's form-data has text and image (two part)
// thus we should take care of which part is the image, and do partial filed upload
const doUpload = (publicId, req, res, next) => {

    const uploadStream = cloudinary.uploader.upload_stream(result => {      
         // capture the url and public_id and add to the request
         req.fileurl = result.url
         req.fileid = result.public_id
         next()
    }, { public_id: req.body[publicId]})

    // multer can save the file locally if we want
    // instead of saving locally, we keep the file in memory
    // multer provides req.file and within that is the byte buffer

    // we create a passthrough stream to pipe the buffer
    // to the uploadStream function for cloudinary.
    const s = new stream.PassThrough()
    s.end(req.files.image[0].buffer)
    s.pipe(uploadStream)
    s.on('end', uploadStream.end)
    // and the end of the buffer we tell cloudinary to end the upload.
}

const extractFormTextAndImage = (req, res, next) => {
        multer().fields([{name: 'text'}, {name: 'image'}])(req, res, next)
}

const uploadArticleImage = (publicId) => (req, res, next) => {
    // if req.body.text is not null, meaning that the article is posted by json and contains text only,
    // in this case we don't need to use multer to parse the form data, we can pass it to next.
    if (!req.body.text) {
        extractFormTextAndImage(req, res, () => {
            if (req.files && req.files.image) {
                doUpload(publicId, req, res, next)
            } else {
                console.log('No image to upload.')
                next()
            }
        })
    } else {
        console.log('This is the json case, no need to use multer')
        next()
    }

}

module.exports = uploadArticleImage