const ws = new WebSocket('ws://localhost:8080');

gameId = localStorage.getItem('gameId');
playerId = localStorage.getItem('playerId');

player1Score = 0;
player2Score = 0;
player3Score = 0;

function byteToBinaryStringHelper(s) {
    return s.toString(2).padStart(8, '0');
}
function byteToBinaryString(bytes) {
    return [...bytes].map(byteToBinaryStringHelper).join(" ")
}

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
        case 'gameData':
            gameId = data.gameId
            console.log('Game Id:', gameId);
            inputGameId.value = gameId;
            break;
        case 'userData':
            playerId = data.playerId
            console.log('Player Id:', playerId);
            localStorage.setItem('playerId', playerId);
            welcomeMessage.innerText = 'Welcome Player ' + playerId.split(';')[1];
            break;
        case 'round':
            console.log('Round:', data.bets);
            boxes[0].text = "Box score: " + data.bets[0];
            boxes[1].text = "Box score: " + data.bets[1];
            boxes[2].text = "Box score: " + data.bets[2];
            boxes[0].value = data.bets[0];
            boxes[1].value = data.bets[1];
            boxes[2].value = data.bets[2];
            boxes[0].color = 'grey';
            boxes[1].color = 'grey';
            boxes[2].color = 'grey';
            drawBoxes();
            bet = -1;
            break;
        case 'roundResult':
            console.log(data.players)
            console.log(data.scores)
            for (let i = 0; i < data.players.length; i++) {
                let tmpId = parseInt(data.players[i].split(';')[1]);
                console.log("Updating player: " + tmpId);
                if (tmpId === 1) {
                    scoreBox1.value = data.scores[i];
                    player1Score = data.scores[i];
                } else if (tmpId === 2) {
                    scoreBox2.value = data.scores[i];
                    player2Score = data.scores[i];
                } else {
                    scoreBox3.value = data.scores[i];
                    player3Score = data.scores[i];
                }
            }
            break;
        case 'gameOver':
            printResults();
            buttonCloseGame.style.display = 'flex';
            break;
        case 'error':
            alert(data.message);
            resetScreen();
            break;
    }
}

function joinGame() {
    ws.send(JSON.stringify({ type: 'join', gameId: gameId }));
}

function createGame() {
    ws.send(JSON.stringify({ type: 'create' }));
}

function sendBetToServer(bet) {
    ws.send(JSON.stringify({ type: 'bet', gameId: gameId, playerId: playerId, bet: bet}));
}

function resetScreen(){
    boxes[0].text = 'Waiting for players ...';
    boxes[1].text = 'Waiting for players ...';
    boxes[2].text = 'Waiting for players ...';
    boxes[0].color = 'grey';
    boxes[1].color = 'grey';
    boxes[2].color = 'grey';
    drawBoxes();
    scoreBox1.value = 0;
    scoreBox2.value = 0;
    scoreBox3.value = 0;
    welcomeMessage.innerText = 'Welcome to the game!';
    buttonCloseGame.style.display = 'none';

    gameMenu.style.display = 'flex';
    gameArea.style.display = 'none';
    gameId = null;
    playerId = null;
    localStorage.removeItem('gameId');
    localStorage.removeItem('playerId');
    inputGameId.value = '';
    inputGameId.placeholder = 'Type Game Id ...';
}

function printResults(){
    tmpId = parseInt(playerId.split(';')[1]);
    if(tmpId === 1){
        if(player1Score > player2Score && player1Score > player3Score){
            welcomeMessage.innerText = 'Player 1 you win!';
        } else {
            welcomeMessage.innerText = 'Player 1 you lose!';
        }
        if(player1Score === player2Score && player1Score === player3Score){
            welcomeMessage.innerText = 'Player 1 Draw!';
        }
    }
    if(tmpId === 2){
        if(player2Score > player1Score && player2Score > player3Score){
            welcomeMessage.innerText = 'Player 2 you win!';
        } else {
            welcomeMessage.innerText = 'Player 2 you lose!';
        }
        if(player2Score === player1Score && player2Score === player3Score){
            welcomeMessage.innerText = 'Player 2 Draw!';
        }
    }
    if(tmpId === 3){
        if(player3Score > player1Score && player3Score > player2Score){
            welcomeMessage.innerText = 'Player 3 you win!';
        } else {
            welcomeMessage.innerText = 'Player 3 you lose!';
        }
        if(player3Score === player1Score && player3Score === player2Score){
            welcomeMessage.innerText = 'Player 3 Draw!';
        }
    }
}