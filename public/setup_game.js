const buttonCreateGame = document.getElementById('createGame');
const buttonJoinGame = document.getElementById('joinGame');
const inputGameId = document.getElementById('gameId');
const gameMenu = document.getElementById('gameMenu');
const gameArea = document.getElementById('gameArea');
const welcomeMessage = document.getElementById('welcomeMessage');
const scoreBox1 = document.getElementById('scoreBox1');
const scoreBox2 = document.getElementById('scoreBox2');
const scoreBox3 = document.getElementById('scoreBox3');
const buttonCloseGame = document.getElementById('closeGame');

if (gameId) {
   inputGameId.value = localStorage.getItem('gameId');
}

buttonJoinGame.addEventListener('click', () => {
    console.log('Joining game...');
    drawBoxes();
    gameId = inputGameId.value;
    localStorage.setItem('gameId', inputGameId.value);
    if (playerId !== null) {
        let playerIdMatchgame = playerId.split(';')
            .map((gameId, playerId) => {
                if (gameId === gameId) {
                    return true;
                }
            })
        console.log("Rejoin " + playerIdMatchgame);
        if (playerIdMatchgame){
            gameMenu.style.display = 'none';
            gameArea.style.display = 'block';
            ws.send(JSON.stringify({ type: 'rejoin', gameId: gameId, playerId: playerId}));
        }
        return;
    }
    gameMenu.style.display = 'none';
    gameArea.style.display = 'block';
    joinGame();
});

buttonCreateGame.addEventListener('click', () => {
    console.log('Creating game...');
    createGame();
});

buttonCloseGame.addEventListener('click', () => {
    resetScreen();
});