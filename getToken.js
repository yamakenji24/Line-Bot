const request = require('request')
require('dotenv').config();

function getToken(){
  return new Promise((resolve, reject) =>{
    let option = {
      "url": "https://api.line.me/v2/oauth/accessToken",
      "method": "POST",
      "headers": {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      "form": {
        "grant_type": "client_credentials",
        "client_id": process.env.channelId,
        "client_secret": process.env.channelSecret
      }
    };
    request(option, function(error, response, body){
      if (!error) {
        resolve(JSON.parse(body));
      } else {
        console.log('Error: ' + error);
        reject();
      }
    });
  });
}
module.exports = getToken;
