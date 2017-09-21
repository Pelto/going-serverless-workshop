import { LeaderboardEntry } from './leaderboard-entry';
import { Component, OnInit } from '@angular/core';

import { LeaderboardService } from './leaderboard.service';

@Component({
    selector: 'leaderboard-component',
    templateUrl: './leaderboard.component.html',
    providers: [LeaderboardService]
})
export class LeaderboardComponent implements OnInit {

    constructor(private leaderboardService: LeaderboardService) {}

    entries: LeaderboardEntry[];

    ngOnInit(): void {
        this.leaderboardService.getAll().then(entries => this.entries = entries);
    }
}
