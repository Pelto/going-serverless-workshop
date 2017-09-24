
import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Game } from './game';

@Injectable()
export class GameService {

    private gameUrl = 'https://eian6whjpb.execute-api.eu-west-1.amazonaws.com/Prod';
    private headers = new Headers({ 'Content-Type': 'application/json' });

    constructor(private http: Http) { }

    newGame(id: string): Promise<Game> {
        return this.http
            .post(`${this.gameUrl}/games`, JSON.stringify({ gameId: id }), { headers: this.headers })
            .toPromise()
            .then(response => ({ id: id }));
    }
}
