import fs from 'fs/promises'

export default async function StorageInit() {
    fs.access(__dirname + '/../storage/uploads')
    .catch(err => {
        if(err) {
            fs.mkdir(__dirname + '/../storage/uploads')

            return
        }
    })

    fs.access(__dirname + '/../storage/database.json')
    .catch(err => {
        if(err) {
            fs.writeFile(__dirname + '/../storage/database.json', '{}')

            return
        }
    })
}