/**
 * PieceView.ts
 * Creates and updates chess piece meshes from game state.
 * Different geometries for different piece types.
 */

import * as THREE from 'three';
import type { GameState, Piece, PieceType } from '@/core/GameState';

export class PieceView {
  private group: THREE.Group;
  private pieceMeshes: Map<string, THREE.Mesh> = new Map();
  private initialized = false;

  // Materials (created once, reused)
  private whiteMaterial: THREE.MeshStandardMaterial;
  private blackMaterial: THREE.MeshStandardMaterial;
  private selectedMaterial: THREE.MeshStandardMaterial;
  
  // Geometries for different piece types
  private geometries: Map<PieceType, THREE.BufferGeometry> = new Map();

  constructor(group: THREE.Group) {
    this.group = group;

    // White pieces - light beige/cream color
    this.whiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0e6d2,
      roughness: 0.4,
      metalness: 0.1,
    });

    // Black pieces - dark brown
    this.blackMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a3728,
      roughness: 0.4,
      metalness: 0.1,
    });

    // Selected piece highlight
    this.selectedMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd93d,
      roughness: 0.3,
      metalness: 0.5,
      emissive: 0xffd93d,
      emissiveIntensity: 0.4,
    });

    // Create geometries for each piece type
    this.createGeometries();
  }

  private createGeometries(): void {
    // Pawn - Simple cylinder with sphere on top
    const pawnGeometry = new THREE.Group();
    const pawnBase = new THREE.CylinderGeometry(0.25, 0.3, 0.3, 16);
    const pawnBody = new THREE.CylinderGeometry(0.2, 0.25, 0.35, 16);
    const pawnHead = new THREE.SphereGeometry(0.15, 16, 16);
    const pawnBaseMesh = new THREE.Mesh(pawnBase);
    const pawnBodyMesh = new THREE.Mesh(pawnBody);
    const pawnHeadMesh = new THREE.Mesh(pawnHead);
    pawnBodyMesh.position.y = 0.325;
    pawnHeadMesh.position.y = 0.6;
    pawnGeometry.add(pawnBaseMesh, pawnBodyMesh, pawnHeadMesh);
    
    // Rook - Castle tower
    const rookGeometry = new THREE.Group();
    const rookBase = new THREE.CylinderGeometry(0.28, 0.32, 0.2, 8);
    const rookBody = new THREE.CylinderGeometry(0.25, 0.25, 0.5, 8);
    const rookTop = new THREE.BoxGeometry(0.55, 0.15, 0.55);
    const rookBaseMesh = new THREE.Mesh(rookBase);
    const rookBodyMesh = new THREE.Mesh(rookBody);
    const rookTopMesh = new THREE.Mesh(rookTop);
    rookBodyMesh.position.y = 0.35;
    rookTopMesh.position.y = 0.675;
    rookGeometry.add(rookBaseMesh, rookBodyMesh, rookTopMesh);

    // Knight - Horse head shape (simplified)
    const knightGeometry = new THREE.Group();
    const knightBase = new THREE.CylinderGeometry(0.28, 0.32, 0.2, 16);
    const knightNeck = new THREE.CylinderGeometry(0.18, 0.22, 0.4, 12);
    const knightHead = new THREE.BoxGeometry(0.3, 0.35, 0.25);
    const knightBaseMesh = new THREE.Mesh(knightBase);
    const knightNeckMesh = new THREE.Mesh(knightNeck);
    const knightHeadMesh = new THREE.Mesh(knightHead);
    knightNeckMesh.position.y = 0.3;
    knightNeckMesh.rotation.z = 0.3;
    knightHeadMesh.position.set(0.1, 0.55, 0);
    knightHeadMesh.rotation.z = 0.3;
    knightGeometry.add(knightBaseMesh, knightNeckMesh, knightHeadMesh);

    // Bishop - Pointed top
    const bishopGeometry = new THREE.Group();
    const bishopBase = new THREE.CylinderGeometry(0.28, 0.32, 0.2, 16);
    const bishopBody = new THREE.CylinderGeometry(0.22, 0.26, 0.45, 16);
    const bishopTop = new THREE.ConeGeometry(0.2, 0.35, 16);
    const bishopTip = new THREE.SphereGeometry(0.1, 16, 16);
    const bishopBaseMesh = new THREE.Mesh(bishopBase);
    const bishopBodyMesh = new THREE.Mesh(bishopBody);
    const bishopTopMesh = new THREE.Mesh(bishopTop);
    const bishopTipMesh = new THREE.Mesh(bishopTip);
    bishopBodyMesh.position.y = 0.325;
    bishopTopMesh.position.y = 0.675;
    bishopTipMesh.position.y = 0.95;
    bishopGeometry.add(bishopBaseMesh, bishopBodyMesh, bishopTopMesh, bishopTipMesh);

    // Queen - Crown with multiple points
    const queenGeometry = new THREE.Group();
    const queenBase = new THREE.CylinderGeometry(0.3, 0.34, 0.2, 16);
    const queenBody = new THREE.CylinderGeometry(0.24, 0.28, 0.5, 16);
    const queenCrown = new THREE.CylinderGeometry(0.28, 0.22, 0.25, 8);
    const queenTop = new THREE.SphereGeometry(0.12, 16, 16);
    const queenBaseMesh = new THREE.Mesh(queenBase);
    const queenBodyMesh = new THREE.Mesh(queenBody);
    const queenCrownMesh = new THREE.Mesh(queenCrown);
    const queenTopMesh = new THREE.Mesh(queenTop);
    queenBodyMesh.position.y = 0.35;
    queenCrownMesh.position.y = 0.725;
    queenTopMesh.position.y = 0.975;
    queenGeometry.add(queenBaseMesh, queenBodyMesh, queenCrownMesh, queenTopMesh);

    // King - Crown with cross on top
    const kingGeometry = new THREE.Group();
    const kingBase = new THREE.CylinderGeometry(0.3, 0.34, 0.2, 16);
    const kingBody = new THREE.CylinderGeometry(0.24, 0.28, 0.5, 16);
    const kingCrown = new THREE.CylinderGeometry(0.26, 0.22, 0.2, 8);
    const kingCross1 = new THREE.BoxGeometry(0.08, 0.3, 0.08);
    const kingCross2 = new THREE.BoxGeometry(0.2, 0.08, 0.08);
    const kingBaseMesh = new THREE.Mesh(kingBase);
    const kingBodyMesh = new THREE.Mesh(kingBody);
    const kingCrownMesh = new THREE.Mesh(kingCrown);
    const kingCross1Mesh = new THREE.Mesh(kingCross1);
    const kingCross2Mesh = new THREE.Mesh(kingCross2);
    kingBodyMesh.position.y = 0.35;
    kingCrownMesh.position.y = 0.7;
    kingCross1Mesh.position.y = 0.95;
    kingCross2Mesh.position.y = 0.95;
    kingGeometry.add(kingBaseMesh, kingBodyMesh, kingCrownMesh, kingCross1Mesh, kingCross2Mesh);

    // Store geometries (we'll clone them when creating meshes)
    this.geometries.set('pawn', pawnGeometry as any);
    this.geometries.set('rook', rookGeometry as any);
    this.geometries.set('knight', knightGeometry as any);
    this.geometries.set('bishop', bishopGeometry as any);
    this.geometries.set('queen', queenGeometry as any);
    this.geometries.set('king', kingGeometry as any);
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
    const material = piece.playerId === 1 ? this.whiteMaterial : this.blackMaterial;
    const geometryGroup = this.geometries.get(piece.type);
    
    if (!geometryGroup) {
      // Fallback to simple cylinder
      const geometry = new THREE.CylinderGeometry(0.3, 0.35, 0.6, 24);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(piece.position.x, 0.35, piece.position.y);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { type: 'piece', piece };
      return mesh;
    }

    // Clone the geometry group
    const clonedGroup = (geometryGroup as any as THREE.Group).clone();
    
    // Create a mesh from the group
    const containerMesh = new THREE.Mesh();
    containerMesh.add(clonedGroup);
    
    // Apply material to all children
    clonedGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = material;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    containerMesh.position.set(piece.position.x, 0.0, piece.position.y);
    containerMesh.castShadow = true;
    containerMesh.receiveShadow = true;
    containerMesh.userData = { type: 'piece', piece };

    return containerMesh;
  }

  /**
   * Update piece positions and selection state from game state.
   */
  update(state: GameState): void {
    if (!this.initialized) {
      this.initializePieces(state);
      return;
    }

    // Remove pieces that no longer exist (captured)
    const currentPieceIds = new Set(state.pieces.map(p => p.id));
    for (const [id, mesh] of this.pieceMeshes.entries()) {
      if (!currentPieceIds.has(id)) {
        this.group.remove(mesh);
        this.pieceMeshes.delete(id);
      }
    }

    // Update existing pieces
    for (const piece of state.pieces) {
      const mesh = this.pieceMeshes.get(piece.id);
      if (!mesh) continue;

      // Update position
      mesh.position.x = piece.position.x;
      mesh.position.z = piece.position.y;

      // Update material based on selection
      const isSelected = piece.id === state.selectedPieceId;
      const baseMaterial = piece.playerId === 1 ? this.whiteMaterial : this.blackMaterial;
      const targetMaterial = isSelected ? this.selectedMaterial : baseMaterial;
      
      // Apply material to all children in the group
      mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = targetMaterial;
        }
      });

      // Lift selected piece slightly
      mesh.position.y = isSelected ? 0.1 : 0.0;

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
    for (const geometry of this.geometries.values()) {
      if (geometry && 'dispose' in geometry) {
        geometry.dispose();
      }
    }
    
    this.whiteMaterial.dispose();
    this.blackMaterial.dispose();
    this.selectedMaterial.dispose();

    for (const mesh of this.pieceMeshes.values()) {
      this.group.remove(mesh);
    }
    this.pieceMeshes.clear();
  }
}
