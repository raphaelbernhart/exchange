import { Request, Response } from "express"
import path from 'path'

export default async (req: Request|any, res: Response) => {
    res.sendFile(path.join(__dirname+"/../views/upload.html"));
}