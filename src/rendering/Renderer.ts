/**
 * Renderer.ts
 * Three.js setup - scene, camera, lights, and render loop.
 * This is the view layer that consumes game state.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { GameState } from '@/core/GameState';
import { BoardView } from './BoardView';
import { PieceView } from './PieceView';

export class Renderer {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;

  private boardView: BoardView;
  private pieceView: PieceView;

  // For raycasting - expose these for input manager
  readonly boardGroup: THREE.Group;
  readonly piecesGroup: THREE.Group;

  constructor(container: HTMLElement) {
    this.container = container;

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    // Create camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    this.camera.position.set(4, 8, 10);
    this.camera.lookAt(4, 0, 4);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Orbit controls for camera
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(3.5, 0, 3.5);
    this.controls.maxPolarAngle = Math.PI / 2.2;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 25;

    // Create groups for organization
    this.boardGroup = new THREE.Group();
    this.piecesGroup = new THREE.Group();
    this.scene.add(this.boardGroup);
    this.scene.add(this.piecesGroup);

    // Create views
    this.boardView = new BoardView(this.boardGroup);
    this.pieceView = new PieceView(this.piecesGroup);

    // Setup lighting
    this.setupLights();

    // Handle resize
    window.addEventListener('resize', this.onResize);
  }

  private setupLights(): void {
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    // Main directional light with shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.bottom = -15;
    this.scene.add(directionalLight);

    // Fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight.position.set(-5, 5, -5);
    this.scene.add(fillLight);
  }

  /**
   * Render the current game state.
   * This is called from the game loop.
   */
  render(state: GameState): void {
    // Update views from state
    this.boardView.update(state);
    this.pieceView.update(state);

    // Update controls
    this.controls.update();

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Get the camera for raycasting.
   */
  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  /**
   * Get the renderer's DOM element.
   */
  getDomElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  private onResize = (): void => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  };

  /**
   * Clean up resources.
   */
  dispose(): void {
    window.removeEventListener('resize', this.onResize);
    this.controls.dispose();
    this.renderer.dispose();
    this.boardView.dispose();
    this.pieceView.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}

