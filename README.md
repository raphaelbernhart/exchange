# Exchange
A NodeJS file upload server to share files via url.

![exchange-ui.png](https://assets.raphaelbernhart.at/images/exchange/exchange-1.png)

## Installation
### Docker
You can just use the docker image:</br>
`docker run raphy02/exchange:latest --env--file ./.env -p 80:80`</br>

### Build yourself
Or build the server yourself:
1. `git clone https://github.com/raphaelbernhart/exchange.git`
2. Rename the `.env.default` to `.env` and configure it with your wishes
3. `npm run build`
4. `npm run start`

## Env Variables
- `PORT` The port on which the app is listening
- `MAX_FILE_SIZE` The max file size to get accepted for upload
- `EXPIRATION_TIME` The time (in days) after which the files get deleted and are not available anymore
- `EXPIRATION_WORKER_INTERVAL` How often the files are checked for deletion (in hours)
- `API_URL` The URL on which the app is listening for uploads
