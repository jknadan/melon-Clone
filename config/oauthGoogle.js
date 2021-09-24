var express = require('express');
var app = express();
const user = require("./userController");



const {google, oauth2_v2} = require('googleapis');
var googleClient = require('./google.json');

const googleConfig = {
    clientId: googleClient.web.client_id,
    clientSecret: googleClient.web.client_secret,
    redirect: googleClient.web.redirect_uris[0]
};

const scopes = [
    'https://www.googleapis.com/auth/plus.me'
];

const oauth2Client = new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect
);

const url = oauth2Client.generateAuthUrl({
    access_type : 'offline',
    scope: scopes
});

function getGooglePlusApi(auth){
    return google.plus({version: 'v1',auth});
}

async function googleLogin(code) {
    const {tokens} = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    oauth2Client.on('tokens',(tokens) => {
        if(tokens.refresh_token){
            console.log("리프레시 토큰:",tokens.refresh_token);
        }
        console.log("액세스 토큰: ",tokens.access_token);
    });
    const plus = getGooglePlusApi(oauth2Client);
    const res = await plus.people.get({userId:'me'});
    console.log('Hello' + res.data.displayName + res.data.id);
    return res.data.displayName;
}


