import express from 'express' // Express is installed using npm
import USER_API from './routes/userRoute.mjs'; // This is where we have defined the API for working with users.
import SuperLogger from './modules/superLogger.mjs';
import dotenv from 'dotenv'
import printDeveloperStartupImportantInformationMSG from "./modules/developerHelpers.mjs";
/* import cors from 'cors';

const supertokens = require("supertokens-node");
const Session = require( "supertokens-node/recipe/session");
const ThirdPartyEmailPassword = require ("supertokens-node/recipe/thirdpartyemailpassword");




const apiDomain = process.env.PORT || 8081
const appName = "Metodos";
const websitePort = process.env.WEBSITE_PORT || 8081
const websiteDomain = process.env.WEBSITE_URL || 'http://localhost:'+ websitePort; */

printDeveloperStartupImportantInformationMSG();
dotenv.config()
// Creating an instance of the server
const server = express();

// Selecting a port for the server to use.
const port = (process.env.PORT || 8081);

server.set('port', port);

/* server.use(cors({
    origin: apiDomain,
    allowedHeaders: ["content-type", ...Supertokens.getAllCORSHeaders()],
    credentials: true,
}))
//server.use(middleware());

supertokens.init({
    framework: "express",
    supertokens: {
        // https://try.supertokens.com is for demo purposes. Replace this with the address of your core instance (sign up on supertokens.com), or self host a core.
        connectionURI: "https://try.supertokens.com",
        // apiKey: <API_KEY(if configured)>,
    },
    appInfo: {
        // learn more about this on https://supertokens.com/docs/thirdpartyemailpassword/appinfo
        appName,
        apiDomain,
        websiteDomain,
        apiBasePath: "/auth",
        websiteBasePath: "/auth"
        
    },
    recipeList:[
        ThirdPartyEmailPassword.init({
            providers: [{
                config: {
                    thirdPartyId: "google",
                    clients: [{
                        clientId: "467101b197249757c71f",
                        clientSecret: "e97051221f4b6426e8fe8d51486396703012f5bd"
                    }]
                }
            }, {
                config: {
                    thirdPartyId: "github",
                    clients: [{
                        clientId: "YOUR_GITHUB_CLIENT_ID",
                        clientSecret: "YOUR_GITHUB_CLIENT_SECRET"
                    }]
                }
            }, {
                config: {
                    thirdPartyId: "apple",
                    clients: [{
                        clientId: "4398792-io.supertokens.example.service",
                        additionalConfig: {
                            keyId: "7M48Y4RYDL",
                            privateKey:
                                "-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgu8gXs+XYkqXD6Ala9Sf/iJXzhbwcoG5dMh1OonpdJUmgCgYIKoZIzj0DAQehRANCAASfrvlFbFCYqn3I2zeknYXLwtH30JuOKestDbSfZYxZNMqhF/OzdZFTV0zc5u5s3eN+oCWbnvl0hM+9IW0UlkdA\n-----END PRIVATE KEY-----",
                            teamId: "YWQCXGJRJL",
                        }
                    }]
                }
            }],
        }),
        Session.init()
    ]
});




SuperTokensWeb.init({
    appInfo: {
        apiDomain,
        apiBasePath: "/auth",
        appName,
    },
    recipeList: [
        SessionWeb.init(),
        ThirdPartyEmailPasswordWeb.init(),
    ],
});




//server.use(errorHandler())

 */
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
