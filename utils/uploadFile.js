const stream = require("stream");
const path = require("path");
const { google } = require("googleapis");


const KEYFILEPATH = path.join(__dirname, "../config/cred.json");
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});

exports.uploadFile = async (fileObject) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileObject.buffer);
    try{
        const { data } = await google.drive({ version: "v3", auth }).files.create({
            media: {
                mimeType: 'application/octet-binary', // Setting the MIME type (application/octet-stream, application/octet-binary, application/x-binary)
                body: bufferStream,
            },
            requestBody: {
                name: `${fileObject.originalname}`,
                parents: ["169bsCyktT3S0PiM3faY1gSD828EEIw1R"],
            },
            fields: "id,name",
        });
    }catch(error){
        return{
            message: `Error uploading file to Google Drive: ${error.message}`
        }
    }
};
