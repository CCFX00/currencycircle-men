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
    // console.log(bufferStream._readableState.buffer)
    const { data } = await google.drive({ version: "v3", auth }).files.create({
        media: {
            mimeType: fileObject.mimeType,
            body: bufferStream,
        },
        requestBody: {
            name: fileObject.originalname,
            parents: ["169bsCyktT3S0PiM3faY1gSD828EEIw1R"],
        },
        fields: "id,name",
    });
    // console.log(`Uploaded file ${data.name} ${data.id}`);
};