/**
 * InputManager.ts
 * Handles mouse/pointer input and raycasting.
 * Emits actions based on user interaction - never mutates state directly.
 */

import * as THREE from 'three';
import type { Game } from '@/core/Game';
import type { Renderer } from '@/rendering/Renderer';
import { Actions } from '@/core/Actions';
import type { Piece, Tile } from '@/core/GameState';

export class InputManager {
  private game: Game;
  private renderer: Renderer;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private domElement: HTMLCanvasElement;

  constructor(game: Game, renderer: Renderer) {
    this.game = game;
    this.renderer = renderer;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.domElement = renderer.getDomElement();

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.domElement.addEventListener('click', this.onClick);
    this.domElement.addEventListener('contextmenu', this.onRightClick);
  }

  private onClick = (event: MouseEvent): void => {
    // Calculate normalized device coordinates
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Perform raycast
    this.raycaster.setFromCamera(this.mouse, this.renderer.getCamera());

    const state = this.game.getState();

    // First, check for piece clicks
    const pieceIntersects = this.raycaster.intersectObjects(
      this.renderer.piecesGroup.children,
      false
    );

    if (pieceIntersects.length > 0) {
      const hitObject = pieceIntersects[0].object;
      const piece = hitObject.userData.piece as Piece | undefined;

      if (piece) {
        // If clicking own piece, select it
        if (piece.playerId === state.currentPlayer) {
          if (state.selectedPieceId === piece.id) {
            // Clicking selected piece deselects it
            this.game.dispatch(Actions.deselectPiece());
          } else {
            this.game.dispatch(Actions.selectPiece(piece.id));
          }
          return;
        }
      }
    }

    // Then check for tile clicks (for moving)
    const tileIntersects = this.raycaster.intersectObjects(
      this.renderer.boardGroup.children,
      false
    );

    if (tileIntersects.length > 0) {
      const hitObject = tileIntersects[0].object;
      const tile = hitObject.userData.tile as Tile | undefined;

      if (tile && state.selectedPieceId) {
        // Move selected piece to clicked tile
        this.game.dispatch(
          Actions.movePiece(state.selectedPieceId, tile.position)
        );
      }
    }
  };

  private onRightClick = (event: MouseEvent): void => {
    event.preventDefault();
    // Right-click deselects
    this.game.dispatch(Actions.deselectPiece());
  };

  /**
   * Clean up event listeners.
   */
  dispose(): void {
    this.domElement.removeEventListener('click', this.onClick);
    this.domElement.removeEventListener('contextmenu', this.onRightClick);
  }
}

