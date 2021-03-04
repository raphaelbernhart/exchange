import { Request, Response } from "express"
import fs from 'fs'
import path from 'path'

// Helper
import Logger from "../helper/logging";
import Metrics from '../helper/Metrics'

export default async (req: Request|any, res: Response) => {
    const id = req.params.id;

    // Read database
    fs.readFile(path.join(__dirname+`/../storage/database.json`), 'utf8', (err, readData) => {
        if(err) Logger.error(err)
        else {
            const data = readData ? JSON.parse(readData) : {};
            if(data[id]) {
                const file = data[id];
                const fName = `${file.name}.${file.extension}`;

                fs.copyFile(path.join(__dirname+`/../storage/uploads/${id}.${file.extension}`), path.join(__dirname+`/../storage/uploads/${file.name}.${file.extension}`), (err) => {
                    if(err) Logger.error(err);

                    const allowedExtensions = [
                        "jpeg",
                        "jpg",
                        "png",
                        "mp4",
                        "mov"
                    ];

                    if(allowedExtensions.includes(file.extension)) {
                        res.status(200).sendFile(path.join(__dirname+`/../storage/uploads/${file.name}.${file.extension}`), (err) => {
                            if(err) Logger.error(err);

                            Metrics.calls.add(id)
    
                            fs.unlink(path.join(__dirname+`/../storage/uploads/${file.name}.${file.extension}`), (err) => {
                                if(err) Logger.error(err);
                            });
                        });
                    } else {
                        res.status(200).download(path.join(__dirname+`/../storage/uploads/${file.name}.${file.extension}`), (err) => {
                            if(err) Logger.error(err);

                            Metrics.calls.add(id)
    
                            fs.unlink(path.join(__dirname+`/../storage/uploads/${file.name}.${file.extension}`), (err) => {
                                if(err) Logger.error(err);
                            });
                        });
                    }
                });

            } else {
                res.status(400).sendFile(path.join(__dirname+"/../views/error.html"))
            }
        }
    })
}