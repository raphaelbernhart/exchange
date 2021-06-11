import { Request, Response } from "express"
import moment from 'moment'
import fs from 'fs'
import path from 'path'

// Helper
import Logger from '../helper/logging'

export default (req: Request|any, res: Response) => {
    try {
        const file = req.files.uploadFile;
        const id = generateID(6);
        const fData = req.files.uploadFile.data;
        const regex = /(?:\.([^.]+))?$/;
        const extension = regex.exec(file.name)[1];
        const maxFileSize = process.env.MAX_FILE_SIZE;

        if(file.size > maxFileSize) {
            throw {
                code: 403,
                msg: "FILE_SIZE_TO_BIG"
            }
        }

        // Write File to uploads directory
        fs.writeFile(path.join(__dirname+`/../storage/uploads/${id}.${extension}`), fData, (err)=>{
            if(err) {
                Logger.error(err)
                throw "FILE COULD NOT BE WRITTEN"
            }
        })

        // Write to database
        fs.readFile(path.join(__dirname+`/../storage/database.json`), 'utf8', async (err, readData) => {
            if(err) {
                Logger.error(err);
                throw "DATABASE ERROR"
            }
            else {
                let data = readData ? JSON.parse(readData) : {};
                let name = file.name.split('.').slice(0, -1).join('.');
                name = name ? name : "NO_NAME";
                const newData = {
                    name:  name,
                    created: moment().unix(),
                    size: file.size,
                    encoding: file.encoding,
                    extension: extension,
                    mimetype: file.mimetype,
                    analytics: {
                        calls: 0
                    }
                };
                data[id] = newData;
                const writeData = JSON.stringify(data);

                // Write new Information
                await fs.writeFile(path.join(__dirname+`/../storage/database.json`), writeData, (err) => {
                    if(err) throw "DATABASE ERROR"
                })

                res.status(201).send({msg: "FILE_UPLOADED", id: id})
            }
        })
    } catch(err: any) {
        const code = err.code ? err.code : 500;
        const msg = err.msg ? err.msg : "INTERNAL_ERROR";
        const log = err.msg ? err.msg : err;
        Logger.error(log);
        res.status(code).send(msg)
    }
}

function generateID(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}