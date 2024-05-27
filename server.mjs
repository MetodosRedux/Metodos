
import express from 'express' // Express is installed using npm
import USER_API from './routes/userRoute.mjs'; // This is where we have defined the API for working with users.
import SuperLogger from './modules/superLogger.mjs';
import printDeveloperStartupImportantInformationMSG from "./modules/developerHelpers.mjs";

printDeveloperStartupImportantInformationMSG();
const server = express();

const port = (process.env.PORT || 8082);

server.set('port', port);

const logger = new SuperLogger();
server.use(logger.createAutoHTTPRequestLogger());

server.get('/', (req, res) => {
    res.sendFile('login.html', { root: './public' });
  });
 
server.use(express.static('public',));

server.use('/userProfilePictures', express.static('userProfilePictures'));

server.use(express.json());

server.use("/user",  USER_API);

server.listen(server.get('port'), function () {
    console.log('server running', server.get('port'));
});
