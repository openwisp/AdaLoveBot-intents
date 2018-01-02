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
    for(; a >= data.length-6; a--) {
      var isUnread = ( data[a].unread==true );
      var sentBy = data[a].fromUser.username;
      if(sentBy !== "spideythebot" && data[a].text.includes('@spideythebot') && isUnread) {
        var request = app.textRequest(data[a].text, {
          sessionId: 'Session'
        });
        request.on('response', function(response) {
          reply('@' + data[a].fromUser.username + ' ' + response.result.fulfillment.speech);
        });
        request.end();
        markAsRead(data[a].id);
      } else {
        console.log(a)
      }
    }
  })
}

setInterval(function(){ fun(); }, 5000);
