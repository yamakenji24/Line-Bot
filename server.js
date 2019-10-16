'use strict';

const express = require('express');
const line = require('@line/bot-sdk');
require('dotenv').config();
const getToken = require('./getToken')
const axios = require('axios');
const PORT = process.env.PORT || 3000;
var token = ''
let result = getToken();

const config = {
  channelSecret: process.env.channelSecret,
  channelAccessToken: process.env.channelAccessToken
};

Promise.all([result])
  .then((tmp) => mergeToken(tmp[0].access_token)) 

const app = express()

app.get('/', (req, res) => res.send('Hello LINE BOT!(GET)'));
app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);
    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});

const client = new line.Client(config);
var artist_flag = false

function mergeToken(token) {
  config.channelAccessToken = token;
}

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  let mes = ''
  if(artist_flag) {
    getArtistData(event.source.userId, event.message.text)
    artist_flag = false
  } else {
    if (event.message.text === 'アーティスト' || event.message.text === 'artist') {
      mes ='どのアーティストを検索する？'
      artist_flag = true
    } else if (event.message.text === 'アルバム' || event.message.text === 'album') {
      mes = 'どのアルバムを検索する？'
    } else {
      mes = event.message.text;
    }
  }
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: mes
  });
}

const getArtistData = async(userId, artist) => {
  const res = await axios.get('http://localhost:3001/artists/search/'+artist)
        .catch(error=> {
          console.log(error)
        })
  if(res.data == 'nothing') {
    await client.pushMessage(userId, [
      {type: 'text', text: 'まだなにも借りてないよ'}
    ])
      .catch(error => {
        console.log(error)
      })
  } else {
    const item = res.data
    let albums = [];
    for(let data in item) {
      if(data >= 5) {
        await client.pushMessage(userId, albums);
        albums = []
      }
      albums.push({type: 'text', text: item[data]["album"]});
    }
    albums.push({type: 'text', text: 'がレンタル済みです'})
    await client.pushMessage(userId, albums)
      .catch(error => {
        console.log(error)
      })
  }
}
app.listen(PORT);
console.log(`Server running at ${PORT}`);
