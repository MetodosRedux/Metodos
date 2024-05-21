
import SuperLogger from "./superLogger.mjs";
import chalk from "chalk";
import { setupDatabase } from "./dbSetup.mjs";

export default async function printDeveloperStartupImportantInformationMSG() {

    drawLine("#", 20);

    SuperLogger.log(`Server environment ${process.env.ENVIRONMENT}`, SuperLogger.LOGGING_LEVELS.CRITICAL);

    if (process.argv.length > 2) {
        if (process.argv[2] == "--setup") {
            SuperLogger.log(chalk.red("Running setup for database"), SuperLogger.LOGGING_LEVELS.CRITICAL);
            await setupDatabase()
        }
    }

    drawLine("#", 20);
}

function drawLine(symbols, length) {
    SuperLogger.log(symbols.repeat(length), SuperLogger.LOGGING_LEVELS.CRITICAL);
}