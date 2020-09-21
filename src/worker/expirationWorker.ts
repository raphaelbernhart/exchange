import fs from 'fs'
import path from 'path'
import moment from 'moment'

// Helper
import Logger from '../helper/logging'

export default async () => {
    const prefix: string = "ExpirationWorker: ";
    try {
        // Get all items in database
        let query: string = await fs.promises.readFile(path.join(__dirname+`/../storage/database.json`), 'utf-8');
        let items: Record<string, any> = {};
        let deletedItemsIndex: number = 0;

        if(!items) {
            throw prefix + "Finished with 0 deletions"
        } else {
            items = JSON.parse(query)
        }
        
        const itemIDs = Object.keys(items)
        for (let i = 0; i < itemIDs.length; i++) {
            const created = items[itemIDs[i]].created;
            const expirationDays = process.env.EXPIRATION_TIME;
            const expirationTime = moment().subtract(expirationDays, "day").unix();
            const extension = items[itemIDs[i]].extension;
            const id = itemIDs[i];

            // check if item has expired with unix timestamp
            if(created < expirationTime) {
                try {
                    // delete the file from storage
                    await fs.promises.unlink(path.join(__dirname+`/../storage/uploads/${id}.${extension}`));
                    deletedItemsIndex++;
                } catch(err) {
                    Logger.error(err)
                }
                try {
                    // delete the item from database
                    delete items[id]
                } catch(err) {
                    Logger.error(err)
                }
            }
        }

        // Save new record
        const writeData = JSON.stringify(items);
        await fs.promises.writeFile(path.join(__dirname+`/../storage/database.json`), writeData)

        Logger.info(prefix + deletedItemsIndex + " items where deleted")
    } catch(err) {
        if(err instanceof Error) Logger.error(prefix + err)
        else Logger.info(prefix + err)
    }
}