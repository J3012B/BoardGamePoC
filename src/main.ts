/**
 * main.ts
 * Application entry point.
 * Bootstraps the game, renderer, and input systems.
 */

import { Game } from '@/core/Game';
import { Renderer } from '@/rendering/Renderer';
import { InputManager } from '@/input/InputManager';
import { Actions } from '@/core/Actions';
import './styles.css';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-container');
  if (!container) {
    throw new Error('Game container not found');
  }

  // Create game instance
  const game = new Game();

  // Create renderer
  const renderer = new Renderer(container);

  // Create input manager
  const inputManager = new InputManager(game, renderer);

  // Subscribe to state changes and render
  game.subscribe((state) => {
    renderer.render(state);
    updateUI(state);
  });

  // Setup UI event handlers
  setupUI(game);

  // Start game loop
  game.start();

  // Expose game instance for debugging
  if (import.meta.env.DEV) {
    (window as unknown as { game: Game }).game = game;
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    game.stop();
    inputManager.dispose();
    renderer.dispose();
  });
});

/**
 * Setup UI button handlers.
 */
function setupUI(game: Game): void {
  const resetBtn = document.getElementById('reset-btn');

  resetBtn?.addEventListener('click', () => {
    game.dispatch(Actions.resetGame());
  });
}

/**
 * Update UI overlay from game state.
 */
function updateUI(state: { currentPlayer: number; turnNumber: number }): void {
  const playerDisplay = document.getElementById('current-player');
  const turnDisplay = document.getElementById('turn-number');

  if (playerDisplay) {
    const playerName = state.currentPlayer === 1 ? 'White' : 'Black';
    playerDisplay.textContent = playerName;
    playerDisplay.className = `player-${state.currentPlayer}`;
  }

  if (turnDisplay) {
    turnDisplay.textContent = `Turn ${state.turnNumber}`;
  }
}

