/*
 * Speakit.io plugin for reveal.js
 * Add voice to your presentation.
 *
 * http://Speakit.io
 */

var STATE_WIDGET = false;
var STATE_BTN_START = false;
var STATE_CONNECTED = false;
var STATE_MIC = false;
var STATE_SPK = false;
var ROOMNAME;
var APIKEY;
var HOST = 'speakit.io';
var room;
var voice;

(function(){
  // add widget to the dom
  var div = document.getElementById('speakitWidget');
  div = document.createElement('div');
  div.id = 'speakitWidget';
  div.innerHTML = ' <style> @import url(http://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css); #listener { height: 0; width: 0; } #speakitWidget { bottom: 30px; left: 30px; min-width: 200px; min-height: 50px; background-color: #dddddd; font-family: "Lato", sans-serif;; position: absolute; visibility: hidden; z-index: 5000; } #voice-topbar { min-height: 30px; font-family: "Lato", sans-serif; letter-spacing: 0.02em; text-transform: uppercase; background-color: #cccccc; border: solid 1px #cccccc; } .voice-top-text { padding: 10px; } #voice-close { min-width: 15px; float: right; } .voice-text { padding: 10px; color: #aaaaaa; } .voice-text-enabled { padding: 10px; color: #3276b1; } .voice-icon { color: black; } .voice-row { min-height: 30px; border-bottom: solid 1px #cccccc; } .voice-row:hover { background-color: #eeeeee; } .voice-row:hover .voice-text { color: black; } .voice-hover { cursor: pointer; cursor: hand; } </style> <div id="voice-topbar"> <div class="voice-top-text"> Speakit Settings <i id="voice-close" class="fa fa-times voice-hover voice-icon" onclick="openSpeakitWidget()"></i> </div> </div> <div class="voice-row voice-hover" onclick="connect()"> <div id="voice-connect" class="voice-text"> <i class="fa fa-power-off voice-icon"></i> Connect </div> </div> <div class="voice-row voice-hover" onclick="setMicrophoneEnable()"> <div id="voice-microphone" class="voice-text"> <i class="fa fa-microphone voice-icon"></i> Microphone </div> </div> <div class="voice-row voice-hover" onclick="setSpeakerEnable()"> <div id="voice-speaker" class="voice-text"> <i class="fa fa-volume-up voice-icon"></i> Speaker </div> </div>';
  document.body.appendChild(div);

  // open the speakit.io widget when the 'v' key is hit
  document.addEventListener('keydown', function(event) {
    if(event.keyCode === 86) {
      event.preventDefault();
      openSpeakitWidget(STATE_WIDGET);
    }
  }, false);

  // grab the lastest speakit.io library
  loadScript('http://'+HOST+'/static/js/SpeakItClient.js', function() {
    // grab html config
    ROOMNAME = Reveal.getConfig().voiceRoom;
    APIKEY = Reveal.getConfig().voiceAPIKey;

    // initialize speakit.io library
    var SpeakIt = require('SpeakItClient');
    voice = new SpeakIt();

    voice.on('connected', function() {
      STATE_CONNECTED = true;
    });

    // speakit.io library ready
    voice.on('ready', function() {
      voice.connect();
    });

    // user settings have changed
    voice.on('thisUserChanged', function(user) {
      if(user && user.rooms && user.rooms[ROOMNAME]) {
        var userRoom = user.rooms[ROOMNAME];
        if(userRoom.microphoneEnabled === true) {
          STATE_MIC = true;
        }
        else {
          STATE_MIC = false;
        }

        if(userRoom.speakerEnabled === true) {
          STATE_SPK = true;
        }
        else {
          STATE_SPK = false;
        }
      }
    });
  });
})();

var openSpeakitWidget = function() {
  if(STATE_WIDGET === false) {
    document.getElementById('speakitWidget').style.visibility = "visible";
    STATE_WIDGET = true;
  }
  else if(STATE_WIDGET === true) {
    document.getElementById('speakitWidget').style.visibility = "hidden";
    STATE_WIDGET = false;
  }
};

var connect = function() {
  if(STATE_BTN_START === false) {
    STATE_BTN_START = true;
    joinRoom();
  }
  else if(STATE_BTN_START === true) {
    STATE_BTN_START = false;
    leaveRoom();
  }
};

var joinRoom = function() {
  if(!STATE_CONNECTED) {
    return setTimeout(function() {
      joinRoom(ROOMNAME);
    }, 500);
  }
  var roomData = {
    room: ROOMNAME,
    keycode: APIKEY
  };

  room = voice.joinRoom(roomData);

  room.on('joinedRoom', function(roomName) {
    // toggle css class
    document.getElementById('voice-connect').className = document.getElementById('voice-connect').className.replace( /(?:^|\s)voice-text(?!\S)/g , '' );
    document.getElementById('voice-connect').className += " voice-text-enabled";
    document.getElementById('voice-connect').innerHTML = ' <i class="fa fa-power-off voice-icon"></i> Connected';
  });

  room.on('leftRoom', function() {
    // toggle css class
    document.getElementById('voice-connect').className = document.getElementById('voice-connect').className.replace( /(?:^|\s)voice-text-enabled(?!\S)/g , '' );
    document.getElementById('voice-connect').className += " voice-text";
    document.getElementById('voice-connect').innerHTML = ' <i class="fa fa-power-off voice-icon"></i> Connect';
  });

  room.on('setMicrophoneEnabled', function(data) {
    //toggle css class
    if(STATE_MIC === true) {
      document.getElementById('voice-microphone').className = document.getElementById('voice-microphone').className.replace( /(?:^|\s)voice-text(?!\S)/g , '' );
      document.getElementById('voice-microphone').className += " voice-text-enabled";
    }
    else {
      document.getElementById('voice-microphone').className = document.getElementById('voice-microphone').className.replace( /(?:^|\s)voice-text-enabled(?!\S)/g , '' );
      document.getElementById('voice-microphone').className += " voice-text";
    }
  });

  room.on('setSpeakerEnabled', function(data) {
    // toggle css class
    if(STATE_SPK === true) {
      document.getElementById('voice-speaker').className = document.getElementById('voice-speaker').className.replace( /(?:^|\s)voice-text(?!\S)/g , '' );
      document.getElementById('voice-speaker').className += " voice-text-enabled";
    }
    else {
      document.getElementById('voice-speaker').className = document.getElementById('voice-speaker').className.replace( /(?:^|\s)voice-text-enabled(?!\S)/g , '' );
      document.getElementById('voice-speaker').className += " voice-text";
    }
  });
};

var leaveRoom = function() {
  voice.leaveRoom(ROOMNAME);
};

var setMicrophoneEnable = function() {
  if(STATE_MIC === false) {
    STATE_MIC = true;
    room.setMicrophoneEnable(STATE_MIC);
  }
  else if(STATE_MIC === true) {
    STATE_MIC = false;
    room.setMicrophoneEnable(STATE_MIC);
  }
};

var setSpeakerEnable = function() {
  if(STATE_SPK === false) {
    STATE_SPK = true;
    room.setSpeakerEnable(STATE_SPK);
  }
  else if(STATE_SPK === true) {
    STATE_SPK = false;
    room.setSpeakerEnable(STATE_SPK);
  }
};

function loadScript(url, callback) {
  var head = document.querySelector('head');
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;

  var finish = function() {
    if(typeof callback === 'function') {
      callback.call();
      callback = null;
    }
  };
  script.onload = finish;

  script.onreadystatechange = function() {
    if(this.readyState === 'loaded') {
      finish();
    }
  };

  head.appendChild(script);
}
