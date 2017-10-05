import { Component } from '@angular/core';

import { Game, Player } from './game';
import { GameService } from './game.service';

@Component({
    selector: 'play-component',
    templateUrl: './play.component.html',
    providers: [GameService]
})
export class PlayComponent {

    game: Game;

    error: Error;

    constructor(private gameService: GameService) {}

    createNewGame(gameId: string): void {

        this.error = null;

        if (!gameId) {
            this.error = new Error('No game id specified');
            return;
        }

        this.gameService.newGame(gameId)
            .then(game => this.game = game)
            .catch(error => this.error = error);
    }

    getGame(gameId: string): void {

        this.error = null;

        this.gameService.getGame(gameId)
            .then(game => this.game = game)
            .catch(error => this.error = error);
    }

    makeMove(move: string, playerId: string): void {
        this.error = null;

        this.gameService.makeMove(this.game, {playerId, move})
            .then(game => this.game = game)
            .catch(error => this.error = error);
    }
}
