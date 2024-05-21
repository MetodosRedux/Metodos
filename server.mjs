
import express from 'express' // Express is installed using npm
import USER_API from './routes/userRoute.mjs'; // This is where we have defined the API for working with users.
import SuperLogger from './modules/superLogger.mjs';
import printDeveloperStartupImportantInformationMSG from "./modules/developerHelpers.mjs";

printDeveloperStartupImportantInformationMSG();
// Creating an instance of the server
const server = express();

const port = (process.env.PORT || 8082);

server.set('port', port);


// Enable logging for server
 const logger = new SuperLogger();
server.use(logger.createAutoHTTPRequestLogger()); // Will log all http method requests 

server.get('/', (req, res) => {
    res.sendFile('login.html', { root: './public' });
  });
 
// Defining a folder that will contain static files.
server.use(express.static('public',));

server.use('/userProfilePictures', express.static('userProfilePictures'));

server.use(express.json());

server.use("/user",  USER_API);

// Start the server 
server.listen(server.get('port'), function () {
    console.log('server running', server.get('port'));
});
