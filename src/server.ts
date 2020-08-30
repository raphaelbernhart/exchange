import express from 'express'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

// Helpers
import Logger from './helper/logging'

// Express App
const app = express();

// Middleware
app.use(
    helmet()
);

// Router
const router = express.Router();

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