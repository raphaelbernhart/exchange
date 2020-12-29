import express, { Request, Response } from 'express'
import fileUpload from 'express-fileupload'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

// Helpers
import Logger from './helper/logging'

// Express App
const app = express();

// Middleware
app.use(
    // Static files
    express.static(__dirname+'/public'),
    cors({
        origin: [
            "localhost",
            "ec.raphaelbernhart.at"
        ]
    }),
    fileUpload(),
    helmet({
        contentSecurityPolicy: false,
      })
);

// Controller
import fileController from './controller/fileController'
import BackendController from './controller/BackendController'

// Worker
import ExpirationWorker from './worker/expirationWorker'

// Expiration Worker
setInterval(() => {
    ExpirationWorker()
}, parseInt(process.env.EXPIRATION_WORKER_INTERVAL) * 3600000)

app.set('view engine', 'ejs');

// Routes
app.use("/admin", BackendController)

app.use("/", fileController)

// No file found
app.get("*", (req: Request, res: Response) => {
    res.status(400).sendFile(__dirname+"/views/error.html");
})

// Disconnect db on application close
process.on("SIGINT", () => {
    try {
        // DISCONNECT DB HERE
    } catch {}
        process.exit(0);
})

// Application Listening
const port = process.env.PORT;

app.listen(port, () => {
    Logger.success(`Server(${process.env.npm_package_version}) succesfully started on port ${port}`);
})