/**
 * Reducer.ts
 * Pure reducer function that applies actions to state for Chess.
 * Must never mutate state directly - always return new state.
 */

import type { Action } from './Actions';
import type { GameState, Tile } from './GameState';
import { createInitialState } from './GameState';
import { getValidMoves, isValidMove } from './ChessRules';

/**
 * Apply an action to the game state and return the new state.
 * This function must be pure - no side effects.
 */
export function applyAction(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SELECT_PIECE': {
      const piece = state.pieces.find((p) => p.id === action.pieceId);
      // Only allow selecting pieces that belong to the current player
      if (!piece || piece.playerId !== state.currentPlayer) {
        return state;
      }

      // Calculate valid moves for this piece
      const validMoves = getValidMoves(piece, state);

      // Update tiles to highlight valid moves
      const newTiles = state.board.tiles.map((tile): Tile => {
        const isValidMove = validMoves.some(
          (move) => move.x === tile.position.x && move.y === tile.position.y
        );
        return {
          ...tile,
          type: isValidMove ? 'valid-move' : 'normal',
        };
      });

      return {
        ...state,
        selectedPieceId: action.pieceId,
        validMoves,
        board: {
          ...state.board,
          tiles: newTiles,
        },
      };
    }

    case 'DESELECT_PIECE': {
      // Clear all tile highlights
      const newTiles = state.board.tiles.map((tile): Tile => ({
        ...tile,
        type: 'normal',
      }));

      return {
        ...state,
        selectedPieceId: null,
        validMoves: [],
        board: {
          ...state.board,
          tiles: newTiles,
        },
      };
    }

    case 'MOVE_PIECE': {
      const pieceIndex = state.pieces.findIndex((p) => p.id === action.pieceId);
      if (pieceIndex === -1) {
        return state;
      }

      const piece = state.pieces[pieceIndex];
      // Only allow moving pieces that belong to the current player
      if (piece.playerId !== state.currentPlayer) {
        return state;
      }

      // Validate the move using chess rules
      if (!isValidMove(piece, action.to, state)) {
        return state;
      }

      // Check if there's a piece to capture
      const capturedPieceIndex = state.pieces.findIndex(
        (p) => p.position.x === action.to.x && p.position.y === action.to.y
      );

      let newPieces = [...state.pieces];
      let newCapturedPieces = [...state.capturedPieces];

      // Remove captured piece if exists
      if (capturedPieceIndex !== -1) {
        const capturedPiece = newPieces[capturedPieceIndex];
        newCapturedPieces.push(capturedPiece);
        newPieces.splice(capturedPieceIndex, 1);
        
        // Adjust pieceIndex if needed
        const adjustedPieceIndex = capturedPieceIndex < pieceIndex ? pieceIndex - 1 : pieceIndex;
        
        // Update the moved piece
        newPieces[adjustedPieceIndex] = {
          ...newPieces[adjustedPieceIndex],
          position: action.to,
          hasMoved: true,
        };
      } else {
        // Just move the piece
        newPieces[pieceIndex] = {
          ...piece,
          position: action.to,
          hasMoved: true,
        };
      }

      // Clear tile highlights
      const newTiles = state.board.tiles.map((tile): Tile => ({
        ...tile,
        type: 'normal',
      }));

      // Switch players after successful move
      const nextPlayer = state.currentPlayer === 1 ? 2 : 1;

      return {
        ...state,
        pieces: newPieces,
        capturedPieces: newCapturedPieces,
        currentPlayer: nextPlayer,
        selectedPieceId: null,
        validMoves: [],
        turnNumber: state.currentPlayer === 2 ? state.turnNumber + 1 : state.turnNumber,
        board: {
          ...state.board,
          tiles: newTiles,
        },
      };
    }

    case 'END_TURN': {
      const nextPlayer = state.currentPlayer === 1 ? 2 : 1;
      
      // Clear tile highlights
      const newTiles = state.board.tiles.map((tile): Tile => ({
        ...tile,
        type: 'normal',
      }));

      return {
        ...state,
        currentPlayer: nextPlayer,
        selectedPieceId: null,
        validMoves: [],
        turnNumber: state.currentPlayer === 2 ? state.turnNumber + 1 : state.turnNumber,
        board: {
          ...state.board,
          tiles: newTiles,
        },
      };
    }

    case 'RESET_GAME': {
      return createInitialState();
    }

    default: {
      // Exhaustive check - if we get here, we missed an action type
      const _exhaustive: never = action;
      console.warn('Unknown action:', _exhaustive);
      return state;
    }
  }
}
