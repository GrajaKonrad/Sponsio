# Card Game for 3 Players

This project is a simple card game for 3 players implemented using Node.js and WebSockets. Each player chooses one of three cards in each round. Points are awarded based on the uniqueness of the chosen cards. The game lasts for 3 rounds. If only one player chooses a particular card, they receive the points associated with that card. If two or more players choose the same card, no points are awarded for that card.

## Features

- Real-time multiplayer game for 3 players
- Synchronization of game state using WebSockets
- Support for multiple concurrent games
- Resilient to page refreshes (game state is preserved)
- Uses `<canvas>` for game display
- Optimized for performance and minimal communication overhead

## Requirements

- Node.js
- npm (Node Package Manager)

### Example Interactions

When the server is running and three players are connected:

1. Each player receives a message to start the game.
2. Players choose a card (A, B, or C) each round.
3. The server processes the choices and updates the scores.
4. After 3 rounds, the game ends and the final scores are displayed.

### Notes

- Ensure that you open the `index.html` file in three separate browser tabs or windows to simulate three players.
- The server handles multiple games concurrently, so you can have multiple groups of three players playing simultaneously.