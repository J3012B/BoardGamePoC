/**
 * BoardView.ts
 * Creates and updates the board mesh from game state.
 * The board is rendered as a grid of tiles.
 */

import * as THREE from 'three';
import type { GameState, Tile } from '@/core/GameState';

export class BoardView {
  private group: THREE.Group;
  private tileMeshes: Map<string, THREE.Mesh> = new Map();
  private initialized = false;

  // Materials (created once, reused)
  private lightTileMaterial: THREE.MeshStandardMaterial;
  private darkTileMaterial: THREE.MeshStandardMaterial;
  private highlightedMaterial: THREE.MeshStandardMaterial;
  private tileGeometry: THREE.BoxGeometry;
  private borderMaterial: THREE.MeshStandardMaterial;

  constructor(group: THREE.Group) {
    this.group = group;

    // Create materials with a chess-like aesthetic
    this.lightTileMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8d5b7,
      roughness: 0.8,
      metalness: 0.1,
    });

    this.darkTileMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b6914,
      roughness: 0.8,
      metalness: 0.1,
    });

    this.highlightedMaterial = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      roughness: 0.6,
      metalness: 0.2,
      emissive: 0x22c55e,
      emissiveIntensity: 0.3,
    });

    this.borderMaterial = new THREE.MeshStandardMaterial({
      color: 0x5c4033,
      roughness: 0.9,
      metalness: 0.05,
    });

    // Shared geometry for all tiles
    this.tileGeometry = new THREE.BoxGeometry(1, 0.1, 1);
  }

  /**
   * Initialize the board mesh structure.
   */
  private initializeBoard(state: GameState): void {
    const { width, height, tiles } = state.board;

    // Create tiles
    for (const tile of tiles) {
      const mesh = this.createTileMesh(tile);
      this.tileMeshes.set(tile.id, mesh);
      this.group.add(mesh);
    }

    // Create border
    this.createBorder(width, height);

    this.initialized = true;
  }

  private createTileMesh(tile: Tile): THREE.Mesh {
    const { x, y } = tile.position;
    const isLight = (x + y) % 2 === 0;
    const material = isLight ? this.lightTileMaterial : this.darkTileMaterial;

    const mesh = new THREE.Mesh(this.tileGeometry, material);
    mesh.position.set(x, 0, y);
    mesh.receiveShadow = true;
    mesh.userData = { type: 'tile', tile };

    return mesh;
  }

  private createBorder(width: number, height: number): void {
    const borderWidth = 0.3;
    const borderHeight = 0.15;

    // Create border segments
    const segments = [
      // Left
      { width: borderWidth, depth: height + borderWidth * 2, x: -borderWidth / 2 - 0.5, z: height / 2 - 0.5 },
      // Right
      { width: borderWidth, depth: height + borderWidth * 2, x: width - 0.5 + borderWidth / 2, z: height / 2 - 0.5 },
      // Top
      { width: width, depth: borderWidth, x: width / 2 - 0.5, z: height - 0.5 + borderWidth / 2 },
      // Bottom
      { width: width, depth: borderWidth, x: width / 2 - 0.5, z: -borderWidth / 2 - 0.5 },
    ];

    for (const seg of segments) {
      const geometry = new THREE.BoxGeometry(seg.width, borderHeight, seg.depth);
      const mesh = new THREE.Mesh(geometry, this.borderMaterial);
      mesh.position.set(seg.x, borderHeight / 2 - 0.05, seg.z);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      this.group.add(mesh);
    }
  }

  /**
   * Update board visuals from game state.
   */
  update(state: GameState): void {
    if (!this.initialized) {
      this.initializeBoard(state);
      return;
    }

    // Update tile highlighting based on state
    for (const tile of state.board.tiles) {
      const mesh = this.tileMeshes.get(tile.id);
      if (!mesh) continue;

      if (tile.type === 'highlighted') {
        mesh.material = this.highlightedMaterial;
      } else {
        const { x, y } = tile.position;
        const isLight = (x + y) % 2 === 0;
        mesh.material = isLight ? this.lightTileMaterial : this.darkTileMaterial;
      }
    }
  }

  /**
   * Get tile at position for raycasting.
   */
  getTileAtPosition(x: number, y: number): THREE.Mesh | undefined {
    return this.tileMeshes.get(`tile-${x}-${y}`);
  }

  /**
   * Clean up resources.
   */
  dispose(): void {
    this.tileGeometry.dispose();
    this.lightTileMaterial.dispose();
    this.darkTileMaterial.dispose();
    this.highlightedMaterial.dispose();
    this.borderMaterial.dispose();

    for (const mesh of this.tileMeshes.values()) {
      this.group.remove(mesh);
    }
    this.tileMeshes.clear();
  }
}

