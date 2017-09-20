import { Injectable } from '@angular/core'
import { Game } from './game'

const GAMES: Game[] = [
    { id: 1, player1: 'Alice', player2: 'Bob', player1Move: null, player2Move: null },
    { id: 2, player1: 'Carol', player2: 'Dan', player1Move: null, player2Move: null }
]

@Injectable()
export class GameService {
    getGames(): Promise<Game[]> {
        return Promise.resolve(GAMES);
    }
}
