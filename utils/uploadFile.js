const stream = require("stream");
const path = require("path");
const { google } = require("googleapis");
const userImg = require("../models/userImgModel");

const KEYFILEPATH = path.join(__dirname, "../config/cred.json");
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});

exports.uploadFile = async (email, fileObject) => {
    // Serialize the file content using Base64 encoding
    const serializedContent = fileObject.buffer.toString("base64");

    // Create a readable stream from the serialized content
    const serializedStream = new stream.PassThrough();
    serializedStream.end(Buffer.from(serializedContent, "base64"));

    // Destructure fileObject and extract originalname
    const { originalname } = fileObject;

    // Remove file extension from originalname
    const fileNameWithBinExtension = `${originalname.split(".").slice(0, -1).join(".")}.bin`;

    try {
       const { data } =  await google.drive({ version: "v3", auth }).files.create({
            media: {
                mimeType: "application/octet-binary",
                body: serializedStream,
            },
            requestBody: {
                name: fileNameWithBinExtension,
                parents: [process.env._GOOGLE_DRIVE_FOLDER_ID], 
            },
            fields: "id,name"
        });
        
        // Create user image document without check
        await userImg.create({ 
            email: email, 
            imagePath: originalname,
            imageId: data.id,
            savedName: data.name 
        });
    } catch (error) {
        return{
            message: `Error uploading file to Google Drive: ${error.message}`
        }
    }
}


/**
 * when the user uploads a file,
 * save in the Google Drive - use the slice method to split the file name and remove the extension bit before saving to Google Drive
 * store the path in mongodb
 * to display the file, grab the path from mongodb
 * 
 * 
 * 
 *   // Check if the user image already exists in the database
     const existingImage = await userImg.findOne({ uid: _id });

     if (existingImage) {
         // Update the existing user image
         await userImg.findOneAndUpdate({ uid: _id }, { imagePath: originalname });
     } else {
         // Create a new user image record
         await userImg.create({ uid: _id, imagePath: originalname });
     }
 */



// Profile Picture Logic

