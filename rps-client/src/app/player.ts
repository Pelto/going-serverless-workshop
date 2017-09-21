import { Move } from './move';

export class Player {
    playerId: string;
    move: Move;

    toString(): string {
        return this.playerId;
    }
}
