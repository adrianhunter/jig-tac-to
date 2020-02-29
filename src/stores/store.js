import { writable } from "svelte/store";

export const PLAYER_1 = "X";
export const PLAYER_2 = "O";
export const DRAW = "draw";

const STARTING_GAME_STATE = {
  history: [],
  squares: Array(9).fill(null),
  stepNumber: 0,
  currentPlayer: PLAYER_1,
  winningPlayer: null
};

function createGameState() {
  const { subscribe, set, update } = writable(
    JSON.parse(JSON.stringify(STARTING_GAME_STATE))
  );

  return {
    subscribe,
    giveSquareToCurrentPlayer: index =>
      update(state => {
        const history = state.history.slice(0, state.stepNumber);
        const squares = state.squares.slice();

        if (squares[index] || state.winningPlayer) {
          return state;
        }

        squares[index] = state.currentPlayer;

        const allSquaresFilled = !squares.filter(square => !square).length;
        const winningPlayer =
          calculateWinner(squares) || (allSquaresFilled && DRAW);

        return {
          history: history.concat([{ squares: state.squares }]),
          squares,
          stepNumber: history.length,
          currentPlayer: state.currentPlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1,
          winningPlayer
        };
      }),
    reset: () => set(JSON.parse(JSON.stringify(STARTING_GAME_STATE)))
  };
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];

    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }

  return null;
}

export const gameState = createGameState();
