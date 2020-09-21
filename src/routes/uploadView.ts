import { Request, Response } from "express"
import path from 'path'

export default async (req: Request|any, res: Response) => {
    const apiUrl: string = process.env.API_URL;
    res.render(path.join(__dirname+"/../views/upload.ejs"), {
        apiUrl: apiUrl,
        maxFileSize: process.env.MAX_FILE_SIZE
    });
}