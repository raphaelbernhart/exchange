import { Request, Response } from "express"
import fs from 'fs'
import path from 'path'

// Helper
import Logger from "../helper/logging";

export default async (req: Request|any, res: Response) => {
    const id = req.params.id;

    // Read database
    fs.readFile(path.join(__dirname+`/../storage/database.json`), 'utf8', (err, readData) => {
        if(err) Logger.error(err)
        else {
            const data = readData ? JSON.parse(readData) : {};
            if(data[id]) {
                const fName = `${id}.${data[id].extension}`;

                res.status(200).sendFile(path.join(__dirname+`/../storage/uploads/${fName}`));
            } else {
                res.status(400).sendFile(path.join(__dirname+"/../views/error.html"))
            }
        }
    })
}