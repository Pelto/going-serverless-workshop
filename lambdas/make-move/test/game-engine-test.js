'use strict';

const gameEngine = require('../game-engine');
const chai = require('chai');
const { expect } = chai;


describe('Game Engine', () => {

    it('can make first move', () => {
        const gameState = {
            GameId: '42',
            State: 'CREATED'
        };

        const newGameState = gameEngine.makeMove(gameState, 'abc', 'ROCK');
        expect(newGameState).to.eql({
            GameId: '42',
            Players: [{playerId: 'abc', move: 'ROCK'}],
            State: 'FIRST_MOVE'
        })
    });


    it('can make second move and decide ROCK winner', () => {
        const gameState = {
            GameId: '42',
            Players: [{playerId: 'abc', move: 'ROCK'}],
            State: 'FIRST_MOVE'
        };

        const newGameState = gameEngine.makeMove(gameState, 'xyz', 'SCISSORS');
        expect(newGameState).to.eql({
            GameId: '42',
            Players: [
                {playerId: 'abc', move: 'ROCK'},
                {playerId: 'xyz', move: 'SCISSORS'}
            ],
            State: 'WINNER',
            Winner: 'abc'
        })
    });


    it('can make second move and decide PAPER winner', () => {
        const gameState = {
            GameId: '42',
            Players: [{playerId: 'abc', move: 'ROCK'}],
            State: 'FIRST_MOVE'
        };

        const newGameState = gameEngine.makeMove(gameState, 'xyz', 'PAPER');
        expect(newGameState).to.eql({
            GameId: '42',
            Players: [
                {playerId: 'abc', move: 'ROCK'},
                {playerId: 'xyz', move: 'PAPER'}
            ],
            State: 'WINNER',
            Winner: 'xyz'
        })
    });


    it('can make second move and decide SCISSORS winner', () => {
        const gameState = {
            GameId: '42',
            Players: [{playerId: 'abc', move: 'ROCK'}],
            State: 'FIRST_MOVE'
        };

        const newGameState = gameEngine.makeMove(gameState, 'xyz', 'PAPER');
        expect(newGameState).to.eql({
            GameId: '42',
            Players: [
                {playerId: 'abc', move: 'ROCK'},
                {playerId: 'xyz', move: 'PAPER'}
            ],
            State: 'WINNER',
            Winner: 'xyz'
        })
    });


    it('can make second move and decide draw', () => {
        const gameState = {
            GameId: '42',
            Players: [{playerId: 'abc', move: 'ROCK'}],
            State: 'FIRST_MOVE'
        };

        const newGameState = gameEngine.makeMove(gameState, 'xyz', 'ROCK');
        expect(newGameState).to.eql({
            GameId: '42',
            Players: [
                {playerId: 'abc', move: 'ROCK'},
                {playerId: 'xyz', move: 'ROCK'}
            ],
            State: 'DRAW'
        })
    });


    it('throws error after second move', () => {
        const gameState = {
            GameId: '42',
            Players: [
                {playerId: 'abc', move: 'ROCK'},
                {playerId: 'xyz', move: 'SCISSORS'}
            ],
            State: 'WINNER',
            Winner: 'abc'
        };

        expect(() => gameEngine.makeMove(gameState, 'xyz', 'ROCK')).to.throw('illegal state WINNER');
    });
});