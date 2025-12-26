/**
 * GameState.ts
 * Defines the game state types and initial state for Chess.
 * All state must be plain data and JSON-serializable.
 */

export type Position = {
  x: number;
  y: number;
};

export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';

export type Tile = {
  id: string;
  position: Position;
  type: 'normal' | 'highlighted' | 'valid-move';
};

export type Piece = {
  id: string;
  position: Position;
  playerId: number;
  type: PieceType;
  hasMoved: boolean; // For castling and pawn first move
};

export type GameState = {
  board: {
    width: number;
    height: number;
    tiles: Tile[];
  };
  pieces: Piece[];
  currentPlayer: number;
  selectedPieceId: string | null;
  validMoves: Position[]; // Valid moves for selected piece
  turnNumber: number;
  capturedPieces: Piece[];
};

/**
 * Creates the initial chess game state with standard setup.
 */
export function createInitialState(): GameState {
  const width = 8;
  const height = 8;
  const tiles: Tile[] = [];

  // Create tiles
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles.push({
        id: `tile-${x}-${y}`,
        position: { x, y },
        type: 'normal',
      });
    }
  }

  // Create pieces in standard chess starting position
  const pieces: Piece[] = [
    // White pieces (Player 1) - bottom rows (0-1)
    // Back row (y=0)
    { id: 'w-rook-1', position: { x: 0, y: 0 }, playerId: 1, type: 'rook', hasMoved: false },
    { id: 'w-knight-1', position: { x: 1, y: 0 }, playerId: 1, type: 'knight', hasMoved: false },
    { id: 'w-bishop-1', position: { x: 2, y: 0 }, playerId: 1, type: 'bishop', hasMoved: false },
    { id: 'w-queen', position: { x: 3, y: 0 }, playerId: 1, type: 'queen', hasMoved: false },
    { id: 'w-king', position: { x: 4, y: 0 }, playerId: 1, type: 'king', hasMoved: false },
    { id: 'w-bishop-2', position: { x: 5, y: 0 }, playerId: 1, type: 'bishop', hasMoved: false },
    { id: 'w-knight-2', position: { x: 6, y: 0 }, playerId: 1, type: 'knight', hasMoved: false },
    { id: 'w-rook-2', position: { x: 7, y: 0 }, playerId: 1, type: 'rook', hasMoved: false },
    // Pawns (y=1)
    { id: 'w-pawn-1', position: { x: 0, y: 1 }, playerId: 1, type: 'pawn', hasMoved: false },
    { id: 'w-pawn-2', position: { x: 1, y: 1 }, playerId: 1, type: 'pawn', hasMoved: false },
    { id: 'w-pawn-3', position: { x: 2, y: 1 }, playerId: 1, type: 'pawn', hasMoved: false },
    { id: 'w-pawn-4', position: { x: 3, y: 1 }, playerId: 1, type: 'pawn', hasMoved: false },
    { id: 'w-pawn-5', position: { x: 4, y: 1 }, playerId: 1, type: 'pawn', hasMoved: false },
    { id: 'w-pawn-6', position: { x: 5, y: 1 }, playerId: 1, type: 'pawn', hasMoved: false },
    { id: 'w-pawn-7', position: { x: 6, y: 1 }, playerId: 1, type: 'pawn', hasMoved: false },
    { id: 'w-pawn-8', position: { x: 7, y: 1 }, playerId: 1, type: 'pawn', hasMoved: false },

    // Black pieces (Player 2) - top rows (6-7)
    // Pawns (y=6)
    { id: 'b-pawn-1', position: { x: 0, y: 6 }, playerId: 2, type: 'pawn', hasMoved: false },
    { id: 'b-pawn-2', position: { x: 1, y: 6 }, playerId: 2, type: 'pawn', hasMoved: false },
    { id: 'b-pawn-3', position: { x: 2, y: 6 }, playerId: 2, type: 'pawn', hasMoved: false },
    { id: 'b-pawn-4', position: { x: 3, y: 6 }, playerId: 2, type: 'pawn', hasMoved: false },
    { id: 'b-pawn-5', position: { x: 4, y: 6 }, playerId: 2, type: 'pawn', hasMoved: false },
    { id: 'b-pawn-6', position: { x: 5, y: 6 }, playerId: 2, type: 'pawn', hasMoved: false },
    { id: 'b-pawn-7', position: { x: 6, y: 6 }, playerId: 2, type: 'pawn', hasMoved: false },
    { id: 'b-pawn-8', position: { x: 7, y: 6 }, playerId: 2, type: 'pawn', hasMoved: false },
    // Back row (y=7)
    { id: 'b-rook-1', position: { x: 0, y: 7 }, playerId: 2, type: 'rook', hasMoved: false },
    { id: 'b-knight-1', position: { x: 1, y: 7 }, playerId: 2, type: 'knight', hasMoved: false },
    { id: 'b-bishop-1', position: { x: 2, y: 7 }, playerId: 2, type: 'bishop', hasMoved: false },
    { id: 'b-queen', position: { x: 3, y: 7 }, playerId: 2, type: 'queen', hasMoved: false },
    { id: 'b-king', position: { x: 4, y: 7 }, playerId: 2, type: 'king', hasMoved: false },
    { id: 'b-bishop-2', position: { x: 5, y: 7 }, playerId: 2, type: 'bishop', hasMoved: false },
    { id: 'b-knight-2', position: { x: 6, y: 7 }, playerId: 2, type: 'knight', hasMoved: false },
    { id: 'b-rook-2', position: { x: 7, y: 7 }, playerId: 2, type: 'rook', hasMoved: false },
  ];

  return {
    board: { width, height, tiles },
    pieces,
    currentPlayer: 1, // White starts
    selectedPieceId: null,
    validMoves: [],
    turnNumber: 1,
    capturedPieces: [],
  };
}

/**
 * Serialize state to JSON string for saving/network transfer.
 */
export function serializeState(state: GameState): string {
  return JSON.stringify(state);
}

/**
 * Deserialize state from JSON string.
 */
export function deserializeState(json: string): GameState {
  return JSON.parse(json) as GameState;
}
