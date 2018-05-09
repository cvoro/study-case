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
      });
  }

 attachTracks(tracks, container) {
    tracks.forEach(function(track) {
      container.appendChild(track.attach());
    });
  }

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
  
      Video.connect(this.data.token, connectOptions).then(
        this.roomJoined(this.activeRoom), function(error) {
      });
  }

 roomJoined(room) {
    this.activeRoom = room;
  
    document.getElementById('button-join').style.display = 'none';
    document.getElementById('button-leave').style.display = 'inline';
  
    // Attach LocalParticipant's Tracks, if not already attached.
    var previewContainer = document.getElementById('local-media');
    if (!previewContainer.querySelector('video')) {
      this.attachParticipantTracks(room.localParticipant, previewContainer);
    }
  
    // Attach the Tracks of the Room's Participants.
    room.participants.forEach(function(participant) {
      var previewContainer = document.getElementById('remote-media');
      this.attachParticipantTracks(participant, previewContainer);
    });
  
    // When a Participant joins the Room, log the event.
    room.on('participantConnected', function(participant) {
      console.log("Joining: '" + participant.identity + "'");
    });
  
    // When a Participant adds a Track, attach it to the DOM.
    room.on('trackAdded', function(track, participant) {
      // log(participant.identity + " added track: " + track.kind);
      var previewContainer = document.getElementById('remote-media');
      this.attachTracks([track], previewContainer);
    });
  
    // When a Participant removes a Track, detach it from the DOM.
    room.on('trackRemoved', function(track, participant) {
      this.detachTracks([track]);
    });
  
    // When a Participant leaves the Room, detach its Tracks.
    room.on('participantDisconnected', function(participant) {
      this.detachParticipantTracks(participant);
    });
  
    room.on('disconnected', function() {
      if (this.previewTracks) {
        this.previewTracks.forEach(function(track) {
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
}
