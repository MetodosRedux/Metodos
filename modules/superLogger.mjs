
import Chalk from "chalk";
import { HTTPMethods } from "./httpConstants.mjs"
import fs from "fs/promises"



let COLORS = {}; // Creating a lookup tbl to avoid having to use if/else if or switch. 
COLORS[HTTPMethods.POST] = Chalk.yellow;
COLORS[HTTPMethods.PATCH] = Chalk.yellow;
COLORS[HTTPMethods.PUT] = Chalk.yellow;
COLORS[HTTPMethods.GET] = Chalk.green;
COLORS[HTTPMethods.DELETE] = Chalk.red;
COLORS.Default = Chalk.gray;


const colorize = (method) => {
    if (method in COLORS) {
        return COLORS[method](method);
    }
    return COLORS.Default(method);
};




class SuperLogger {


    static LOGGING_LEVELS = {
        ALL: 0,         // We output everything, no limits
        VERBOSE: 5,     // We output a lott, but not 
        NORMAL: 10,     // We output a moderate amount of messages
        IMPORTANT: 100, // We output just significant messages
        CRITICAL: 999    // We output only errors. 
    };


    #globalThreshold = SuperLogger.LOGGING_LEVELS.ALL;


    #loggers;

 
    static instance = null;

    constructor() {
        // This constructor will always return a reference to the first instance created. 
        if (SuperLogger.instance == null) {
            SuperLogger.instance = this;
            this.#loggers = [];
            this.#globalThreshold = SuperLogger.LOGGING_LEVELS.NORMAL;
        }
        return SuperLogger.instance;
    }
    //#endregion

    static log(msg, logLevl = SuperLogger.LOGGING_LEVELS.NORMAL) {

        let logger = new SuperLogger();
        if (logger.#globalThreshold > logLevl) {
            return;
        }

        logger.#writeToLog(msg);
    }


    // This is our automatic logger, it outputs at a "normal" level
    // It is just a convenient wrapper around the more generic createLimitedRequestLogger function
    createAutoHTTPRequestLogger() {
        return this.createLimitedHTTPRequestLogger({ threshold: SuperLogger.LOGGING_LEVELS.NORMAL });
    }

    createLimitedHTTPRequestLogger(options) {

        const threshold = options.threshold || SuperLogger.LOGGING_LEVELS.NORMAL;

        // Returning an anonymous function that binds local scope.
        return (req, res, next) => {

            // If the threshold provided is less then the global threshold, we do not log
            if (this.#globalThreshold > threshold ) {
                return;
            }
            
            // Finally we parse our request on to the method that is going to write the log msg.
            this.#LogHTTPRequest(req, res, next);
            
        }

    }



    #LogHTTPRequest(req, res, next) {
     
        let type = req.method;
        const path = req.originalUrl;
        const when = new Date().toLocaleTimeString();

        if (!path.startsWith('/mediaAvatar')) {
           
            type = colorize(type);
            this.#writeToLog([when, type, path].join(" "));
        }

        // On to the next handler function
        next();
    }
    

    #writeToLog(msg) {

        msg += "\n";
        console.log(msg);
        const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '');
        const fileName = `./log_${currentDate}.txt`;


        fs.appendFile(fileName,msg, { encoding: "utf8" }, (err) => {
            if (err) {
                console.error("Error writing to log file:", err);
            }
        });
}
}


export default SuperLogger