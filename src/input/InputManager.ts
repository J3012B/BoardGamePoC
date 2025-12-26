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
    // Use click event since left mouse is now exclusive to game interactions
    this.domElement.addEventListener('click', this.onClick);
    
    // Listen for Escape key to deselect
    window.addEventListener('keydown', this.onKeyDown);
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
      true // Recursive to check child meshes
    );

    if (pieceIntersects.length > 0) {
      const hitObject = pieceIntersects[0].object;
      
      // Traverse up to find piece data (might be on parent)
      let piece: Piece | undefined;
      let current: THREE.Object3D | null = hitObject;
      while (current && !piece) {
        piece = current.userData.piece as Piece | undefined;
        current = current.parent;
      }

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
      true // Recursive for consistency
    );

    if (tileIntersects.length > 0) {
      const hitObject = tileIntersects[0].object;
      
      // Traverse up to find tile data (might be on parent)
      let tile: Tile | undefined;
      let current: THREE.Object3D | null = hitObject;
      while (current && !tile) {
        tile = current.userData.tile as Tile | undefined;
        current = current.parent;
      }

      if (tile && state.selectedPieceId) {
        // Move selected piece to clicked tile
        this.game.dispatch(
          Actions.movePiece(state.selectedPieceId, tile.position)
        );
      } else if (tile && !state.selectedPieceId) {
        // Clicking empty tile when nothing selected does nothing
        // (Could add tile highlight here if desired)
      }
    }

    // If clicked on nothing, deselect
    if (pieceIntersects.length === 0 && tileIntersects.length === 0) {
      this.game.dispatch(Actions.deselectPiece());
    }
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.game.dispatch(Actions.deselectPiece());
    }
  };

  /**
   * Clean up event listeners.
   */
  dispose(): void {
    this.domElement.removeEventListener('click', this.onClick);
    window.removeEventListener('keydown', this.onKeyDown);
  }
}
