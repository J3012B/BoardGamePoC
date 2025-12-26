/**
 * Actions.ts
 * Defines all possible game actions as plain objects.
 * Actions are the only way to mutate game state.
 */

import type { Position } from './GameState';

export type Action =
  | { type: 'SELECT_PIECE'; pieceId: string }
  | { type: 'DESELECT_PIECE' }
  | { type: 'MOVE_PIECE'; pieceId: string; to: Position }
  | { type: 'END_TURN' }
  | { type: 'RESET_GAME' };

/**
 * Action creators for convenience.
 * These ensure type safety when dispatching actions.
 */
export const Actions = {
  selectPiece: (pieceId: string): Action => ({
    type: 'SELECT_PIECE',
    pieceId,
  }),

  deselectPiece: (): Action => ({
    type: 'DESELECT_PIECE',
  }),

  movePiece: (pieceId: string, to: Position): Action => ({
    type: 'MOVE_PIECE',
    pieceId,
    to,
  }),

  endTurn: (): Action => ({
    type: 'END_TURN',
  }),

  resetGame: (): Action => ({
    type: 'RESET_GAME',
  }),
};

