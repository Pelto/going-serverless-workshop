import { Http } from '@angular/http';
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';

import { environment } from './../environments/environment';

import { LeaderboardEntry } from './leaderboard-entry';

@Injectable()
export class LeaderboardService {

    private url = environment.apiUrl;

    constructor(private http: Http) {}

    getAll(): Promise<LeaderboardEntry[]> {

        return this.http.get(`${this.url}/leaderboard`)
            .toPromise()
            .then(response => response.json() as LeaderboardEntry[]);
    }
}
