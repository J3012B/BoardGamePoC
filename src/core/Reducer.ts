/**
 * Reducer.ts
 * Pure reducer function that applies actions to state.
 * Must never mutate state directly - always return new state.
 */

import type { Action } from './Actions';
import type { GameState } from './GameState';
import { createInitialState } from './GameState';

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
      return {
        ...state,
        selectedPieceId: action.pieceId,
      };
    }

    case 'DESELECT_PIECE': {
      return {
        ...state,
        selectedPieceId: null,
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

      // Validate move is within board bounds
      const { to } = action;
      if (
        to.x < 0 ||
        to.x >= state.board.width ||
        to.y < 0 ||
        to.y >= state.board.height
      ) {
        return state;
      }

      // Check if destination is occupied
      const isOccupied = state.pieces.some(
        (p) => p.position.x === to.x && p.position.y === to.y
      );
      if (isOccupied) {
        return state;
      }

      // Create new pieces array with updated piece
      const newPieces = [...state.pieces];
      newPieces[pieceIndex] = {
        ...piece,
        position: to,
      };

      return {
        ...state,
        pieces: newPieces,
        selectedPieceId: null,
      };
    }

    case 'END_TURN': {
      const nextPlayer = state.currentPlayer === 1 ? 2 : 1;
      return {
        ...state,
        currentPlayer: nextPlayer,
        selectedPieceId: null,
        turnNumber: state.turnNumber + 1,
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

