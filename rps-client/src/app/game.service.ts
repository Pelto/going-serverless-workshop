import { environment } from '../environments/environment';

import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Game } from './game';
import { Player } from './game';

@Injectable()
export class GameService {

    private gameUrl = environment.apiUrl;
    private headers = new Headers({ 'Content-Type': 'application/json' });

    constructor(private http: Http) { }

    newGame(id: string): Promise<Game> {

        const body = JSON.stringify({
            gameId: id
        });

        return this.http
            .post(`${this.gameUrl}/games`, body, { headers: this.headers })
            .toPromise()
            .then(response => response.json() as Game);
    }

    makeMove(game: Game, player: Player): Promise<Game> {

        const url = `${this.gameUrl}/moves`;

        const payload = JSON.stringify({
            gameId: game.gameId,
            playerId: player.playerId,
            move: player.move
        });

        return this.http
            .post(url, payload, { headers: this.headers })
            .toPromise()
            .then(response => response.json() as Game);
    }

    getGame(gameId: string): Promise<Game> {
        return this.http
            .get(`${this.gameUrl}/games/${gameId}`)
            .toPromise()
            .then(response => response.json() as Game);
    }
}
