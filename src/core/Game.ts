/**
 * Game.ts
 * Main game class that manages the game loop, state, and coordinates
 * between rendering and input systems.
 */

import type { Action } from './Actions';
import type { GameState } from './GameState';
import { createInitialState } from './GameState';
import { applyAction } from './Reducer';

export type GameListener = (state: GameState) => void;

export class Game {
  private state: GameState;
  private listeners: Set<GameListener> = new Set();
  private lastTime: number = 0;
  private animationFrameId: number | null = null;

  constructor(initialState?: GameState) {
    this.state = initialState ?? createInitialState();
  }

  /**
   * Get the current game state (read-only).
   */
  getState(): Readonly<GameState> {
    return this.state;
  }

  /**
   * Dispatch an action to update the game state.
   */
  dispatch(action: Action): void {
    const newState = applyAction(this.state, action);
    if (newState !== this.state) {
      this.state = newState;
      this.notifyListeners();
    }
  }

  /**
   * Subscribe to state changes.
   * Returns an unsubscribe function.
   */
  subscribe(listener: GameListener): () => void {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  /**
   * Start the game loop.
   */
  start(): void {
    if (this.animationFrameId !== null) return;
    this.lastTime = performance.now();
    this.loop();
  }

  /**
   * Stop the game loop.
   */
  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * The main game loop.
   */
  private loop = (): void => {
    const currentTime = performance.now();
    const dt = (currentTime - this.lastTime) / 1000; // Delta time in seconds
    this.lastTime = currentTime;

    // Update phase - for animations, AI, etc.
    this.update(dt);

    // Request next frame
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Update game logic. Override or extend for game-specific updates.
   * @param _dt - Delta time in seconds
   */
  protected update(_dt: number): void {
    // Base implementation does nothing
    // Subclasses can override for animations, AI, etc.
  }

  /**
   * Notify all listeners of state change.
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  /**
   * Load a saved game state.
   */
  loadState(state: GameState): void {
    this.state = state;
    this.notifyListeners();
  }

  /**
   * Reset the game to initial state.
   */
  reset(): void {
    this.state = createInitialState();
    this.notifyListeners();
  }
}

