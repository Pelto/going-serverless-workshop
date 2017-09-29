
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

    makeMove(gameId: string, player: string, move: string): Promise<Game> {

        const url = `${this.gameUrl}/moves`;
        const payload = JSON.stringify({
            gameId,
            player,
            move
        });

        return this.http
            .post(url, payload, { headers: this.headers })
            .toPromise()
            .then(response => ({id: gameId}));
    }

    getGame(gameId: string): Promise<Game> {
        return this.http.get(`${this.gameUrl}/games/gameId`).toPromise().then(response => response.json() as Game);
    }
}
