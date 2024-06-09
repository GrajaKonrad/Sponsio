const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { Console } = require('console');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const games = {}; // Przechowywanie gier

function padBinary(num, length) {
    // Convert the number to its binary representation
    let binaryString = num.toString(2);

    // Add leading zeros to reach the desired length
    while (binaryString.length < length) {
        binaryString = '0' + binaryString;
    }

    return binaryString;
}

function byteToBinaryStringHelper(s) {
    return s.toString(2).padStart(8, '0');
}
function byteToBinaryString(bytes) {
    return [...bytes].map(byteToBinaryStringHelper).join(" ")
}

class Game {
    constructor() {
        this.id = this.generateGameId();
        this.players = [];
        this.players_ids = [];
        this.rounds = 3;
        this.currentRound = 0;
        this.bets = [];
        this.playerBets = {};
        this.playerScores = {};
        this.hasStarted = false;
    }

    generateGameId() {
        let id = Object.keys(games).length;
        let isIdPresent = true;
        while (isIdPresent) {
            id++;
            isIdPresent = Object.values(games).find(game => {   if(game !== null) 
                                                                    (game.id === id)});
            if (id > 65536){
                id = 1;
                isIdPresent = true;
            }
        }
        return id;
    }

    addPlayer(ws) {
        this.players.push(ws);
        let playerId = this.players_ids.length + 1;
        let playerInGameID = this.id.toString() + ";" + playerId.toString();
        this.players_ids.push(playerInGameID);
        this.playerScores[playerInGameID] = 0;
        return playerInGameID;
    }

    rejoinPlayer(ws) {
        this.players.push(ws);
    }

    removePlayer(ws) {
        // this.players = this.players.filter(player => player !== ws);
        // delete this.scores[ws._socket.remoteAddress];
    }

    isReady() {
        return this.players.length === 3;
    }

    generateRound()
    {
        this.bets = [];
        for (let i = 0; i < 3; i++) {
            let random = Math.floor(Math.random() * 10 + 1);
            if (this.bets.includes(random)){
                i--;
                continue;
            } else {
                this.bets.push(random);
            }
        }
    }

    processRound() {
        const counts = {};
        for (const choice of Object.values(this.playerBets)) {
            counts[choice] = (counts[choice] || 0) + 1;
        }
        console.log(counts);
        for (const [player, choice] of Object.entries(this.playerBets)) {
            if (counts[choice] === 1) {
                this.playerScores[player] += choice;
            }
        }
        this.playerBets = {};
    }

    isGameOver() {
        return this.currentRound >= this.rounds;
    }
}

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        switch (data.type) {
            case "create":
                console.log('Creating game...');
                game = new Game();
                gameId = game.id;
                games[gameId] = game;
                console.log("Game Id: " + gameId);
                ws.send(JSON.stringify({ type: 'gameData', gameId: gameId}));
                break;
            case "join":
                console.log('Joining game...');
                gameId = data.gameId;
                game = games[gameId];
                if (!game) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Game not found'}));
                    break;
                }
                if(game.hasStarted){
                    ws.send(JSON.stringify({ type: 'error', message: 'Game has already started'}));
                    break;
                }
                console.log("Game Id: " + gameId);
                if (game) {
                    playerId = game.addPlayer(ws);
                    ws.send(JSON.stringify({ type: 'userData', playerId: playerId}));
                    console.log("Player Id: " + playerId);
                }
                if (game.isReady()) {
                    console.log('Game is ready');
                    game.hasStarted = true;
                    game.generateRound();
                    game.players.forEach(player => player.send(JSON.stringify({ type: 'round', bets: game.bets})));
                }
                break;
            case "rejoin":
                console.log('Rejoining game...');
                gameId = data.gameId;
                playerId = data.playerId;
                game = games[gameId];
                if (!game) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Game not found'}));
                    break;
                }
                if (game) {
                    ws.send(JSON.stringify({ type: 'round', bets: game.bets}));
                    ws.send(JSON.stringify({ type: 'roundResult', players: Object.keys(game.playerScores), scores: Object.values(game.playerScores)}));
                    game.rejoinPlayer(ws);
                }
                break;
            case "bet":
                console.log('Bet:', data.bet);
                gameId = data.gameId;
                playerId = data.playerId;
                game = games[gameId];
                if (game) {
                    if(game.bets.includes(data.bet)){
                        game.playerBets[playerId] = data.bet;
                    } else {
                        console.log('Cheater detected!');
                        game.playerBets[playerId] = 0;
                    }
                    if (Object.keys(game.playerBets).length === 3) {
                        game.processRound();
                        game.currentRound++;
                        game.players.forEach(player => player.send(JSON.stringify({ type: 'roundResult', players: Object.keys(game.playerScores), scores: Object.values(game.playerScores)})));
                        if (game.isGameOver()) {
                            game.players.forEach(player => player.send(JSON.stringify({ type: 'gameOver'})));
                            games[gameId] = null;
                        } else {
                            game.generateRound();
                            game.players.forEach(player => player.send(JSON.stringify({ type: 'round', bets: game.bets})));
                        }
                    }
                }
                break;
        }
    });

    ws.on('close', () => {

    });
});

// Serwowanie plików statycznych
app.use(express.static(path.join(__dirname, 'public')));

server.listen(8080, () => {
    console.log('Server started on port 8080');
});
