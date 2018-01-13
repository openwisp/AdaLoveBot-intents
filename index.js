var axios = require('axios');
var moment = require('moment');
var apiai = require('apiai');
require('dotenv').config()

var app       = apiai(process.env.APIAI_TOKEN);
var roomId    = process.env.ROOM;
var token     = process.env.GITTER_TOKEN;
var userId    = process.env.USER_ID;

var options = {
  baseURL:  'https://api.gitter.im/',
  url:      '/v1/rooms/' + roomId + '/chatMessages',
  method:   'get',
  headers:  {'Authorization': 'Bearer ' + token}
};

var markAsRead = (messageId) => {
  axios({
    baseURL:  'https://api.gitter.im/',
    url:      '/v1/user/' + userId + '/rooms/' + roomId + '/unreadItems',
    method:   'post',
    headers:  {'Authorization': 'Bearer ' + token},
    data:     { chat: [messageId] }
  }).then(res => {
    if(res.status==200) {
      console.log('message read');
    } else {
      console.log('failed');
    }
  })
}

var reply = (response) => {
  axios({
    baseURL:  'https://api.gitter.im/',
    url:      '/v1/rooms/' + roomId + '/chatMessages',
    method:   'post',
    headers:  {'Authorization': 'Bearer ' + token},
    data:     {text: response}
  }).then(res => {
    if(res.status==200) {
      console.log('success');
    } else {
      console.log('failed');
    }
  })
}

function fun() {
  axios(options).then(msg => {
    var data = msg.data;
    var a = data.length-1;
    if(moment().diff(data[a].sent, 'minutes')>=1 && (data[a].fromUser.username !== "AdaLoveBot" && data[a].fromUser.username !== "openwisp-irc-bot")){
      reply('@' + data[a].fromUser.username + ' Hi there! It seems like nobody has replied to you. You can say hi to me by mentioning @AdaLoveBot.')
    }
    for(; a >= data.length-6; a--) {
      var isUnread = ( data[a].unread==true );
      var sentBy = data[a].fromUser.username;
      if((sentBy !== "adalovebot" || sentBy !== "AdaLoveBot") && (data[a].text.includes('@AdaLoveBot') || data[a].text.includes('@adalovebot')) && isUnread) {
        var request = app.textRequest(data[a].text, {
          sessionId: 'Session'
        });
        request.on('response', function(response) {
          reply(response.result.fulfillment.speech);
        });
        request.end();
        markAsRead(data[a].id);
      }
    }
  })
}

setInterval(function(){ fun(); }, 5000);
