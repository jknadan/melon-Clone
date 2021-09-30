const {OAuth2Client} = require('google-auth-library');

const client = new OAuth2Client('116458880126-80o82hgtui057190cod3mvu5514u4ef4.apps.googleusercontent.com');

module.exports = {
    client : client
}