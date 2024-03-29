import * as sentry from "@sentry/node";

const prefix = "\x1b[36m[Exchange]\x1b[0m";
const reset = "\x1b[0m";

export default class Logger {
    static info(InfoMessage: string): void {
        console.error(prefix + "\x1b[37m Info:    " + InfoMessage + reset);
    }

    static success(SuccessMessage: string): void {
        console.error(prefix + "\x1b[32m Success: " + SuccessMessage + reset);
    }

    static error(ErrorMessage: string | Error): string | Error {
        const error = prefix + "\x1b[31m Error:   " + ErrorMessage + reset;
        console.error(error);

        if (process.env.SENTRY_ENABLED) {
            sentry.captureMessage(error);
        }

        return ErrorMessage;
    }
}
