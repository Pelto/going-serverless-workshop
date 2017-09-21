import { Move } from './move';

export const GAMES = [
    {
        id: 1,
        players: [
        ]
    },
    {
        id: 2,
        players: [
            {
                playerId: 'Alice',
                move: Move.Paper
            }
        ]
    },
    {
        id: 3,
        players: [
            {
                playerId: 'Bob',
                move: Move.Rock,
            },
            {
                playerId: 'Dan',
                move: Move.Scissor
            }
        ]
    }
];
