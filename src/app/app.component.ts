declare var require: any;
import { Component } from '@angular/core';
import { AppService } from './app.service';
var Video = require('twilio-video');
import { Socket } from 'ng-socket-io';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  previewTracks;
  activeRoom;
  identity;
  roomName;
  data;


  constructor(private appService: AppService,
              private socket: Socket
            ){
    this.socket.on('token_received', (data)=> {
      this.data = data;
      console.log(data)
      this.joinRoom()
    })
  }

  getToken(){
    this.socket.emit('token')
  }

 leaveRoomIfJoined() {
    if (this.activeRoom) {
      this.activeRoom.disconnect();
    }
  }

  cameraPreview(){
      var localTracksPromise = this.previewTracks
        ? Promise.resolve(this.previewTracks)
        : Video.createLocalTracks();
    
      localTracksPromise.then((tracks) => {
        var previewContainer = document.getElementById('local-media');
        if (!previewContainer.querySelector('video')) {
          this.attachTracks(tracks, previewContainer);
        }
      }, function(error) {
        console.error('Unable to access local media', error);
        this.log('Unable to access Camera and Microphone');
      });
  }

 attachTracks(tracks, container) {
    tracks.forEach(function(track) {
      container.appendChild(track.attach());
      // window.alert(track)
    });
  }

  // Activity log.
log(message) {
  var logDiv = document.getElementById('log');
  logDiv.innerHTML += '<p>&gt;&nbsp;' + message + '</p>';
  logDiv.scrollTop = logDiv.scrollHeight;
}



//  attach(el) {
//   if (typeof el === 'string') {
//     el = document.getElementById('remote-media').c(el);
//   } else if (!el) {
//     el = this._createElement();
//   }
//   this._log.debug('Attempting to attach to element:', el);
//   el = this._attach(el);

//   return el;
// };


  joinRoom(){
      this.roomName = document.getElementById('room-name')['value'];
      if (!this.roomName) {
        alert('Please enter a room name.');
        return;
      }
  
      var connectOptions = {
        name: this.roomName,
        logLevel: 'debug'
      };
  
      if (this.previewTracks) {
        connectOptions['tracks'] = this.previewTracks;
      }
  
      Video.connect(this.data.token, {name:this.roomName}).then(
        (room)=>{this.roomJoined(room)}
        , function(error) {
          this.log('Could not connect to Twilio: ' + error.message);
      });
      // Video.connect(this.data.token, {name:this.roomName}).then(function(room) {
      //   console.log('Successfully joined a Room: ', room);
      //   room.on('participantConnected', function(participant) {
      //     console.log('A remote Participant connected: ', participant);
      //   })
      // }, function(error) {
      //     console.error('Unable to connect to Room: ' +  error.message);
      // });
  }
  // this.roomJoined(this.activeRoom)

 roomJoined(room) {
    this.activeRoom = room
  
  this.log("Joined as '" + this.identity + "'");
    document.getElementById('button-join').style.display = 'none';
    document.getElementById('button-leave').style.display = 'inline';
  
    // Attach LocalParticipant's Tracks, if not already attached.
    var previewContainer = document.getElementById('local-media');
    if (!previewContainer.querySelector('video')) {
      this.attachParticipantTracks(room.localParticipant, previewContainer);
    }
  
    // Attach the Tracks of the Room's Participants.
    room.participants.forEach((participant)=> {
      this.log("Already in Room: '" + participant.identity + "'");
      var previewContainer = document.getElementById('remote-media');
      this.attachParticipantTracks(participant, previewContainer);
    });
  
    // When a Participant joins the Room, log the event.
    room.on('participantConnected', (participant) => {
      this.log("Joining: '" + participant.identity + "'");
    });
  
    // When a Participant adds a Track, attach it to the DOM.
    room.on('trackAdded', (track, participant) => {
      this.log(participant.identity + " added track: " + track.kind);
      var previewContainer = document.getElementById('remote-media');
      this.attachTracks([track], previewContainer);
    });
  
    // When a Participant removes a Track, detach it from the DOM.
    room.on('trackRemoved', (track, participant)  => {
      this.log(participant.identity + " removed track: " + track.kind);
      this.detachTracks([track]);
    });
  
    // When a Participant leaves the Room, detach its Tracks.
    room.on('participantDisconnected', (participant) => {
      this.log("Participant '" + participant.identity + "' left the room");
      this.detachParticipantTracks(participant);
    });
  
    room.on('disconnected', () => {
      this.log('Left')
      if (this.previewTracks) {
        this.previewTracks.forEach((track) => {
          track.stop();
        });
      }
      this.detachParticipantTracks(room.localParticipant);
      room.participants.forEach(this.detachParticipantTracks);
      this.activeRoom = null;
      document.getElementById('button-join').style.display = 'inline';
      document.getElementById('button-leave').style.display = 'none';
    });
  }

attachParticipantTracks(participant, container) {
    var tracks = Array.from(participant.tracks.values());
    this.attachTracks(tracks, container);
  }

  detachParticipantTracks(participant) {
    var tracks = Array.from(participant.tracks.values());
    this.detachTracks(tracks);
  }
  detachTracks(tracks) {
    tracks.forEach(function(track) {
      track.detach().forEach(function(detachedElement) {
        detachedElement.remove();
      });
    });
  }
}
