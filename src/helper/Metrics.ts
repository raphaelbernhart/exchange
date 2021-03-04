import fs from 'fs'
import Logger from './logging'

const Metrics = {
        calls: {
            add: (id: string) => {
                return fs.readFile(__dirname + '/../storage/database.json', 'utf-8', (err: Error, buffer) => {
                    if(err) return Logger.error(err);

                    const data = buffer ? JSON.parse(buffer) : {};
                    data[id].analytics.calls = data[id].analytics.calls + 1;

                    return fs.writeFile(__dirname + '/../storage/database.json', JSON.stringify(data), (err) => {
                        if(err) return Logger.error(err)
                    })
                })
            }
        }
};

export default Metrics