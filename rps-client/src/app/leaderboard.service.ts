import { Http } from '@angular/http';
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';

import { LeaderboardEntry } from './leaderboard-entry';

@Injectable()
export class LeaderboardService {

    private url = 'https://vsydwusjt0.execute-api.eu-west-1.amazonaws.com/Prod';

    constructor(private http: Http) {}

    getAll(): Promise<LeaderboardEntry[]> {

        return this.http.get(`${this.url}/leaderboard`)
            .toPromise()
            .then(response => response.json() as LeaderboardEntry[]);
    }
}
