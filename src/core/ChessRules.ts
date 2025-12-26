/**
 * ChessRules.ts
 * Chess movement rules and validation logic.
 */

import type { GameState, Piece, Position } from './GameState';

/**
 * Get all valid moves for a piece at the given position.
 */
export function getValidMoves(
  piece: Piece,
  state: GameState
): Position[] {
  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(piece, state);
    case 'rook':
      return getRookMoves(piece, state);
    case 'knight':
      return getKnightMoves(piece, state);
    case 'bishop':
      return getBishopMoves(piece, state);
    case 'queen':
      return getQueenMoves(piece, state);
    case 'king':
      return getKingMoves(piece, state);
    default:
      return [];
  }
}

/**
 * Check if a position is within the board.
 */
function isValidPosition(pos: Position, state: GameState): boolean {
  return (
    pos.x >= 0 &&
    pos.x < state.board.width &&
    pos.y >= 0 &&
    pos.y < state.board.height
  );
}

/**
 * Get piece at a position, or null if empty.
 */
function getPieceAt(pos: Position, state: GameState): Piece | null {
  return (
    state.pieces.find((p) => p.position.x === pos.x && p.position.y === pos.y) ||
    null
  );
}

/**
 * Check if a position is occupied by an enemy piece.
 */
function isEnemyAt(pos: Position, playerId: number, state: GameState): boolean {
  const piece = getPieceAt(pos, state);
  return piece !== null && piece.playerId !== playerId;
}

/**
 * Check if a position is empty.
 */
function isEmpty(pos: Position, state: GameState): boolean {
  return getPieceAt(pos, state) === null;
}

/**
 * Pawn movement rules.
 */
function getPawnMoves(piece: Piece, state: GameState): Position[] {
  const moves: Position[] = [];
  const direction = piece.playerId === 1 ? 1 : -1; // White moves up, black moves down
  const { x, y } = piece.position;

  // Forward one square
  const forward1 = { x, y: y + direction };
  if (isValidPosition(forward1, state) && isEmpty(forward1, state)) {
    moves.push(forward1);

    // Forward two squares (first move only)
    if (!piece.hasMoved) {
      const forward2 = { x, y: y + 2 * direction };
      if (isValidPosition(forward2, state) && isEmpty(forward2, state)) {
        moves.push(forward2);
      }
    }
  }

  // Diagonal captures
  const diagLeft = { x: x - 1, y: y + direction };
  if (isValidPosition(diagLeft, state) && isEnemyAt(diagLeft, piece.playerId, state)) {
    moves.push(diagLeft);
  }

  const diagRight = { x: x + 1, y: y + direction };
  if (isValidPosition(diagRight, state) && isEnemyAt(diagRight, piece.playerId, state)) {
    moves.push(diagRight);
  }

  return moves;
}

/**
 * Rook movement rules (horizontal and vertical).
 */
function getRookMoves(piece: Piece, state: GameState): Position[] {
  const moves: Position[] = [];
  const directions = [
    { dx: 0, dy: 1 },  // Up
    { dx: 0, dy: -1 }, // Down
    { dx: 1, dy: 0 },  // Right
    { dx: -1, dy: 0 }, // Left
  ];

  for (const dir of directions) {
    let dist = 1;
    while (true) {
      const pos = {
        x: piece.position.x + dir.dx * dist,
        y: piece.position.y + dir.dy * dist,
      };

      if (!isValidPosition(pos, state)) break;

      const targetPiece = getPieceAt(pos, state);
      if (targetPiece === null) {
        moves.push(pos);
      } else {
        if (targetPiece.playerId !== piece.playerId) {
          moves.push(pos); // Can capture
        }
        break; // Can't move past any piece
      }

      dist++;
    }
  }

  return moves;
}

/**
 * Knight movement rules (L-shape).
 */
function getKnightMoves(piece: Piece, state: GameState): Position[] {
  const moves: Position[] = [];
  const offsets = [
    { dx: 2, dy: 1 },
    { dx: 2, dy: -1 },
    { dx: -2, dy: 1 },
    { dx: -2, dy: -1 },
    { dx: 1, dy: 2 },
    { dx: 1, dy: -2 },
    { dx: -1, dy: 2 },
    { dx: -1, dy: -2 },
  ];

  for (const offset of offsets) {
    const pos = {
      x: piece.position.x + offset.dx,
      y: piece.position.y + offset.dy,
    };

    if (!isValidPosition(pos, state)) continue;

    const targetPiece = getPieceAt(pos, state);
    if (targetPiece === null || targetPiece.playerId !== piece.playerId) {
      moves.push(pos);
    }
  }

  return moves;
}

/**
 * Bishop movement rules (diagonals).
 */
function getBishopMoves(piece: Piece, state: GameState): Position[] {
  const moves: Position[] = [];
  const directions = [
    { dx: 1, dy: 1 },   // Up-right
    { dx: 1, dy: -1 },  // Down-right
    { dx: -1, dy: 1 },  // Up-left
    { dx: -1, dy: -1 }, // Down-left
  ];

  for (const dir of directions) {
    let dist = 1;
    while (true) {
      const pos = {
        x: piece.position.x + dir.dx * dist,
        y: piece.position.y + dir.dy * dist,
      };

      if (!isValidPosition(pos, state)) break;

      const targetPiece = getPieceAt(pos, state);
      if (targetPiece === null) {
        moves.push(pos);
      } else {
        if (targetPiece.playerId !== piece.playerId) {
          moves.push(pos); // Can capture
        }
        break; // Can't move past any piece
      }

      dist++;
    }
  }

  return moves;
}

/**
 * Queen movement rules (rook + bishop).
 */
function getQueenMoves(piece: Piece, state: GameState): Position[] {
  return [...getRookMoves(piece, state), ...getBishopMoves(piece, state)];
}

/**
 * King movement rules (one square in any direction).
 */
function getKingMoves(piece: Piece, state: GameState): Position[] {
  const moves: Position[] = [];
  const offsets = [
    { dx: 0, dy: 1 },   // Up
    { dx: 0, dy: -1 },  // Down
    { dx: 1, dy: 0 },   // Right
    { dx: -1, dy: 0 },  // Left
    { dx: 1, dy: 1 },   // Up-right
    { dx: 1, dy: -1 },  // Down-right
    { dx: -1, dy: 1 },  // Up-left
    { dx: -1, dy: -1 }, // Down-left
  ];

  for (const offset of offsets) {
    const pos = {
      x: piece.position.x + offset.dx,
      y: piece.position.y + offset.dy,
    };

    if (!isValidPosition(pos, state)) continue;

    const targetPiece = getPieceAt(pos, state);
    if (targetPiece === null || targetPiece.playerId !== piece.playerId) {
      moves.push(pos);
    }
  }

  return moves;
}

/**
 * Check if a move is valid for a piece.
 */
export function isValidMove(
  piece: Piece,
  to: Position,
  state: GameState
): boolean {
  const validMoves = getValidMoves(piece, state);
  return validMoves.some((move) => move.x === to.x && move.y === to.y);
}

