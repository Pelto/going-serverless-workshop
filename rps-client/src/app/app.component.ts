import { Component, OnInit } from '@angular/core';
import { Game } from './game';

import { GameService } from './game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [GameService]
})
export class AppComponent implements OnInit {

  title = 'Rock Paper Scissor';

  games: Game[];
  selectedGame: Game;

  constructor(private gameService: GameService) {}

  getGames(): void {
    this.gameService.getGames().then(games => {
      this.games = games;
    });
  }

  ngOnInit(): void {
    this.getGames();
  }

  onSelect(game: Game) {
    this.selectedGame = game;
  }
}
