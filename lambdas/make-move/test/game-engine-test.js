'use strict';

const gameEngine = require('../game-engine');
const chai = require('chai');
const { expect } = chai;


describe('Game Engine', () => {

    it('can make first move', () => {
        const gameState = {
            gameId: '42',
            state: 'CREATED'
        };

        const newGameState = gameEngine.makeMove(gameState, 'abc', 'ROCK');
        expect(newGameState).to.eql({
            gameId: '42',
            players: [{playerId: 'abc', move: 'ROCK'}],
            state: 'FIRST_MOVE'
        })
    });


    it('can make second move and decide ROCK winner', () => {
        const gameState = {
            gameId: '42',
            players: [{playerId: 'abc', move: 'ROCK'}],
            state: 'FIRST_MOVE'
        };

        const newGameState = gameEngine.makeMove(gameState, 'xyz', 'SCISSORS');
        expect(newGameState).to.eql({
            gameId: '42',
            players: [
                {playerId: 'abc', move: 'ROCK'},
                {playerId: 'xyz', move: 'SCISSORS'}
            ],
            state: 'WINNER',
            winner: 'abc'
        })
    });


    it('can make second move and decide PAPER winner', () => {
        const gameState = {
            gameId: '42',
            players: [{playerId: 'abc', move: 'ROCK'}],
            state: 'FIRST_MOVE'
        };

        const newGameState = gameEngine.makeMove(gameState, 'xyz', 'PAPER');
        expect(newGameState).to.eql({
            gameId: '42',
            players: [
                {playerId: 'abc', move: 'ROCK'},
                {playerId: 'xyz', move: 'PAPER'}
            ],
            state: 'WINNER',
            winner: 'xyz'
        })
    });


    it('can make second move and decide SCISSORS winner', () => {
        const gameState = {
            gameId: '42',
            players: [{playerId: 'abc', move: 'ROCK'}],
            state: 'FIRST_MOVE'
        };

        const newGameState = gameEngine.makeMove(gameState, 'xyz', 'PAPER');
        expect(newGameState).to.eql({
            gameId: '42',
            players: [
                {playerId: 'abc', move: 'ROCK'},
                {playerId: 'xyz', move: 'PAPER'}
            ],
            state: 'WINNER',
            winner: 'xyz'
        })
    });


    it('can make second move and decide draw', () => {
        const gameState = {
            gameId: '42',
            players: [{playerId: 'abc', move: 'ROCK'}],
            state: 'FIRST_MOVE'
        };

        const newGameState = gameEngine.makeMove(gameState, 'xyz', 'ROCK');
        expect(newGameState).to.eql({
            gameId: '42',
            players: [
                {playerId: 'abc', move: 'ROCK'},
                {playerId: 'xyz', move: 'ROCK'}
            ],
            state: 'DRAW'
        })
    });


    it('throws error after second move', () => {
        const gameState = {
            gameId: '42',
            players: [
                {playerId: 'abc', move: 'ROCK'},
                {playerId: 'xyz', move: 'SCISSORS'}
            ],
            state: 'WINNER',
            winner: 'abc'
        };

        expect(() => gameEngine.makeMove(gameState, 'xyz', 'ROCK')).to.throw('illegal state WINNER');
    });
});