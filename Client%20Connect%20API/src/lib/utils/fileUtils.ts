import {v4 as uuidv4} from 'uuid'

/**
 * 
 * @param file - pass the file who's extension you want to extract
 * @returns the file extenstion
 */
const getFileExtension = (file: any) => file.split(".").at(-1);

/**
 * 
 * @param file pass the file that you want to generate a name for
 * @returns 
 */
const createBlobFileName = (file:any) =>
  `${uuidv4()}.${getFileExtension(file)}`;

/**
 * 
 * @param data pass file data to get the byte length
 * @returns true if byte length is greater than 0 and false if it is 0 or less
 */
const checkDataLength = (data: any) => data.length > 0 ? true : false


const fileMimeTypeQualifier = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const checkMimeType = (mimeTypeQualifier: string[]) => (type: string) =>
  mimeTypeQualifier.includes(type);

const checkFileMimeType = checkMimeType(fileMimeTypeQualifier)

/**
 * Author - Wayne Brough
 * 
 * @param readableStream downloaded from the blob
 * @returns file data
 */

async function streamToString(readableStream: NodeJS.ReadableStream) {
  return new Promise((resolve, reject) => {
    let data = Buffer.from([]);
    readableStream.on("data", (dataBuffer) => {
      data = Buffer.concat([data, dataBuffer], data.length + dataBuffer.length);
    });
    readableStream.on("end", () => {
      resolve(data);
    });
    readableStream.on("error", reject);
  });
}

export {
  getFileExtension,
  createBlobFileName,
  checkDataLength,
  checkFileMimeType,
  streamToString
}