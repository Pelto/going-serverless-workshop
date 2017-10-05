
import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Game } from './game';

@Injectable()
export class GameService {

    private gameUrl = 'https://64slyd54w0.execute-api.eu-west-1.amazonaws.com/Prod';
    private headers = new Headers({ 'Content-Type': 'application/json' });

    constructor(private http: Http) { }

    newGame(id: string): Promise<Game> {

        const body = JSON.stringify({
            gameId: id
        });

        return this.http
            .post(`${this.gameUrl}/games`, body, { headers: this.headers })
            .toPromise()
            .then(result => this.getGame(id))
            .then(response => ({ id: id }));
    }

    makeMove(gameId: string, playerId: string, move: string): Promise<Game> {

        const url = `${this.gameUrl}/moves`;
        const payload = JSON.stringify({
            gameId,
            playerId,
            move
        });

        return this.http
            .post(url, payload, { headers: this.headers })
            .toPromise()
            .then(response => ({id: gameId}));
    }

    getGame(gameId: string): Promise<Game> {
        return this.http
            .get(`${this.gameUrl}/games/${gameId}`)
            .toPromise()
            .then(response => response.json() as Game);
    }
}
