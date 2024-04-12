const stream = require("stream");
const path = require("path");
const { google } = require("googleapis");
const fs = require("fs");


const KEYFILEPATH = path.join(__dirname, "../config/cred.json");
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});

exports.uploadFile = async ({email}, fileObject) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileObject.buffer);
    // console.log(bufferStream._readableState.buffer)
    const { data } = await google.drive({ version: "v3", auth }).files.create({
        media: {
            mimeType: fileObject.mimeType,
            body: bufferStream,
        },
        requestBody: {
            name: `${email} ${fileObject.originalname}`,
            parents: ["169bsCyktT3S0PiM3faY1gSD828EEIw1R"],
        },
        fields: "id,name",
    });
    // console.log(`Uploaded file ${data.name} ${data.id}`);
};


exports.uploadFile = async (fileObject) => {
    // Serialize the file content using Base64 encoding
    const serializedContent = fileObject.buffer.toString('base64');

    // Create a readable stream from the serialized content
    const serializedStream = new stream.PassThrough();
    serializedStream.end(Buffer.from(serializedContent, 'base64'));

    try {
        const { data } = await google.drive({ version: "v3", auth }).files.create({
            media: {
                mimeType: 'application/octet-binary', // Setting the MIME type (application/octet-stream, application/octet-binary, application/x-binary)
                body: serializedStream,
            },
            requestBody: {
                name: `${fileObject.originalname}.bin`, // Add a ".bin" extension to indicate a binary file
                parents: ["169bsCyktT3S0PiM3faY1gSD828EEIw1R"], // Parent folder ID
            },
            // fields: "id,name"
        });
        console.log(data);
    } catch (error) {
        return{
            message: `Error uploading file to Google Drive: ${error.message}`
        }
    }
}