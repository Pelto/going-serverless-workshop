import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard.component';
import { PlayComponent } from './play.component';
import { LeaderboardComponent } from './leaderboard.component';

import { LeaderboardService } from './leaderboard.service';
import { GameService } from './game.service';

import { AppRoutingModule } from './app-routing.module';


@NgModule({
  declarations: [
    AppComponent,
    PlayComponent,
    LeaderboardComponent,
    DashboardComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [LeaderboardService, GameService],
  bootstrap: [AppComponent]
})
export class AppModule { }
