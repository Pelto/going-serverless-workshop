import { Component } from '@angular/core';

export class Game {
  id: number;
  player1: string;
  player2: string
}

const GAMES: Game[] = [
  { id: 1, player1: 'Alice', player2: 'Bob' },
  { id: 2, player1: 'Carol', player2: 'Dan' }
]

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Rock Paper Scissor';
  games = GAMES
}
