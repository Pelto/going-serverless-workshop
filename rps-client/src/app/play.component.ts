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

    nextMove: string;

    constructor(private gameService: GameService) { }

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

    makeMove(playerId: string): void {
        this.error = null;

        if (!playerId) {
            return;
        }

        const player = new Player();

        player.playerId = playerId;
        player.move = this.nextMove;

        this.gameService.makeMove(this.game, player)
            .then(game => this.game = game)
            .catch(error => this.error = error);
    }

    setNextMove(next: string): void {
        this.nextMove = next;
    }

    canMakeMove(): boolean {
        if (!this.game) {
            return false;
        }

        return this.game.state === 'CREATED' || this.game.state === 'FIRST_MOVE';
    }
}
