import { Injectable } from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class AppService {

  constructor(private http: Http) {}

    getToken(){
      return this.http.get('http://localhost:3000/server/api/token')
        .map(res => res.json());
    }
}