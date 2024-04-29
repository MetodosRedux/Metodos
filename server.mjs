import  express from 'express' // Express is installed using npm
import USER_API from './routes/userRoute.mjs'; // This is where we have defined the API for working with users.
import SuperLogger from './modules/superLogger.mjs';
import  dotenv from 'dotenv'
import printDeveloperStartupImportantInformationMSG from "./modules/developerHelpers.mjs";

printDeveloperStartupImportantInformationMSG();
dotenv.config()
// Creating an instance of the server
const server = express();

// Selecting a port for the server to use.
const port = (process.env.PORT || 8081);

server.set('port', port);

// Enable logging for server
 const logger = new SuperLogger();
server.use(logger.createAutoHTTPRequestLogger()); // Will log all http method requests 

// Defining a folder that will contain static files.
server.use(express.static('public'));


server.use(express.json());

// Telling the server to use the USER_API 
server.use("/user",  USER_API);



// Start the server 
server.listen(server.get('port'), function () {
    console.log('server running', server.get('port'));
});
