/**
 * GameState.ts
 * Defines the game state types and initial state.
 * All state must be plain data and JSON-serializable.
 */

export type Position = {
  x: number;
  y: number;
};

export type Tile = {
  id: string;
  position: Position;
  type: 'normal' | 'highlighted';
};

export type Piece = {
  id: string;
  position: Position;
  playerId: number;
  type: 'pawn';
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
  turnNumber: number;
};

/**
 * Creates the initial game state with an 8x8 board and some pieces.
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

  // Create pieces for two players
  const pieces: Piece[] = [
    // Player 1 pieces (bottom row)
    { id: 'p1-1', position: { x: 1, y: 0 }, playerId: 1, type: 'pawn' },
    { id: 'p1-2', position: { x: 3, y: 0 }, playerId: 1, type: 'pawn' },
    { id: 'p1-3', position: { x: 5, y: 0 }, playerId: 1, type: 'pawn' },
    { id: 'p1-4', position: { x: 7, y: 0 }, playerId: 1, type: 'pawn' },
    // Player 2 pieces (top row)
    { id: 'p2-1', position: { x: 0, y: 7 }, playerId: 2, type: 'pawn' },
    { id: 'p2-2', position: { x: 2, y: 7 }, playerId: 2, type: 'pawn' },
    { id: 'p2-3', position: { x: 4, y: 7 }, playerId: 2, type: 'pawn' },
    { id: 'p2-4', position: { x: 6, y: 7 }, playerId: 2, type: 'pawn' },
  ];

  return {
    board: { width, height, tiles },
    pieces,
    currentPlayer: 1,
    selectedPieceId: null,
    turnNumber: 1,
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

