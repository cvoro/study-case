import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { AppService } from './app.service';
import { HttpModule } from '@angular/http';

import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';

const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, HttpModule, SocketIoModule.forRoot(config) 
  ],
  providers: [AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }
