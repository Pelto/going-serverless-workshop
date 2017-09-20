import { Injectable } from '@angular/core'
import { Game } from './game'

const GAMES: Game[] = [
    { id: 1, player1: 'Alice', player2: 'Bob' },
    { id: 2, player1: 'Carol', player2: 'Dan' }
]

@Injectable()
export class GameService {
    getGames(): Promise<Game[]> {
        return Promise.resolve(GAMES);
    }
}
