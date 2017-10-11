export class Player {
    playerId: string;
    move: string;
}

export class Game {
    gameId: string;
    players: Player[];
    state: string;
    winner: string;
}
