import fileUpload from "express-fileupload"

export {}

declare global {
    namespace Express {
        interface Request {
            files?: fileUpload.FileArray | null | undefined,
            user: any,
            cookie: string
        }
    }

}

declare namespace fileUpload {
    interface FileArray {
        name: string,
        data: any,
        [formField: string]: UploadFile | UploadedFile[]
    }
}