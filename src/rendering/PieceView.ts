/**
 * PieceView.ts
 * Creates and updates piece meshes from game state.
 * Pieces are rendered as simple geometric shapes (cylinders).
 */

import * as THREE from 'three';
import type { GameState, Piece } from '@/core/GameState';

export class PieceView {
  private group: THREE.Group;
  private pieceMeshes: Map<string, THREE.Mesh> = new Map();
  private initialized = false;

  // Materials (created once, reused)
  private player1Material: THREE.MeshStandardMaterial;
  private player2Material: THREE.MeshStandardMaterial;
  private selectedMaterial: THREE.MeshStandardMaterial;
  private pieceGeometry: THREE.CylinderGeometry;

  constructor(group: THREE.Group) {
    this.group = group;

    // Player 1 - warm coral color
    this.player1Material = new THREE.MeshStandardMaterial({
      color: 0xff6b6b,
      roughness: 0.4,
      metalness: 0.3,
    });

    // Player 2 - cool teal color
    this.player2Material = new THREE.MeshStandardMaterial({
      color: 0x4ecdc4,
      roughness: 0.4,
      metalness: 0.3,
    });

    // Selected piece glow
    this.selectedMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd93d,
      roughness: 0.3,
      metalness: 0.5,
      emissive: 0xffd93d,
      emissiveIntensity: 0.4,
    });

    // Pawn-like cylinder geometry
    this.pieceGeometry = new THREE.CylinderGeometry(0.35, 0.4, 0.6, 24);
  }

  /**
   * Initialize piece meshes.
   */
  private initializePieces(state: GameState): void {
    for (const piece of state.pieces) {
      const mesh = this.createPieceMesh(piece);
      this.pieceMeshes.set(piece.id, mesh);
      this.group.add(mesh);
    }
    this.initialized = true;
  }

  private createPieceMesh(piece: Piece): THREE.Mesh {
    const material = piece.playerId === 1 ? this.player1Material : this.player2Material;
    const mesh = new THREE.Mesh(this.pieceGeometry, material);
    
    mesh.position.set(piece.position.x, 0.35, piece.position.y);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { type: 'piece', piece };

    return mesh;
  }

  /**
   * Update piece positions and selection state from game state.
   */
  update(state: GameState): void {
    if (!this.initialized) {
      this.initializePieces(state);
      return;
    }

    // Update existing pieces
    for (const piece of state.pieces) {
      const mesh = this.pieceMeshes.get(piece.id);
      if (!mesh) continue;

      // Update position with smooth interpolation potential
      mesh.position.x = piece.position.x;
      mesh.position.z = piece.position.y;

      // Update material based on selection
      if (piece.id === state.selectedPieceId) {
        mesh.material = this.selectedMaterial;
        mesh.position.y = 0.45; // Lift selected piece
      } else {
        mesh.material = piece.playerId === 1 ? this.player1Material : this.player2Material;
        mesh.position.y = 0.35;
      }

      // Update user data for raycasting
      mesh.userData.piece = piece;
    }
  }

  /**
   * Get piece mesh by ID.
   */
  getPieceMesh(pieceId: string): THREE.Mesh | undefined {
    return this.pieceMeshes.get(pieceId);
  }

  /**
   * Clean up resources.
   */
  dispose(): void {
    this.pieceGeometry.dispose();
    this.player1Material.dispose();
    this.player2Material.dispose();
    this.selectedMaterial.dispose();

    for (const mesh of this.pieceMeshes.values()) {
      this.group.remove(mesh);
    }
    this.pieceMeshes.clear();
  }
}

