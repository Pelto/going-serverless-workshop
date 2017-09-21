import { Injectable } from '@angular/core';

import { LeaderboardEntry } from './leaderboard-entry';

@Injectable()
export class LeaderboardService {

    getAll(): Promise<LeaderboardEntry[]> {
        return Promise.resolve([
            {position: '#1', playerId: 'alice@example.com', score: 42 }
        ]);
    }
}
