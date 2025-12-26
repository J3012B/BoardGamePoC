# 3D Chess Game

A browser-based 3D chess game built with TypeScript, Vite, and Three.js. Features standard chess rules with all piece types and move validation.

## Features

- ✅ **Full chess implementation** - All 6 piece types with proper movement rules
- ✅ **Valid move highlighting** - Green tiles show where selected piece can move
- ✅ **Clean architecture** - Game logic is independent of rendering
- ✅ **3D visualization** - Different geometries for each chess piece type
- ✅ **Smooth camera controls** - Right-drag to rotate, middle-drag to pan, scroll to zoom
- ✅ **Backend-ready** - State + actions are JSON-serializable for multiplayer
- ✅ **Pure TypeScript** - No heavy frameworks, just Vite and Three.js

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (opens at http://localhost:3000 or 3001)
npm run dev

# Build for production
npm run build
```

## How to Play

1. **Select a piece** - Left-click on your piece (White moves first)
2. **View valid moves** - Green tiles show where the piece can move
3. **Make a move** - Click a green tile to move your piece there
4. **Capture pieces** - Move to a tile with an opponent's piece to capture it
5. **Switch turns** - Turns automatically alternate after each move

### Controls

- **Left-click** - Select pieces and make moves
- **Right-drag** - Rotate camera around the board
- **Middle-drag** - Pan the camera
- **Scroll** - Zoom in/out
- **ESC** - Deselect current piece

## Chess Pieces Implemented

All standard chess pieces with proper movement rules:

- **♙ Pawn** - Moves forward one square (two on first move), captures diagonally
- **♜ Rook** - Moves horizontally or vertically any number of squares
- **♞ Knight** - Moves in an L-shape (2+1 squares)
- **♝ Bishop** - Moves diagonally any number of squares
- **♛ Queen** - Combines rook and bishop movement
- **♚ King** - Moves one square in any direction

## Architecture Overview

```
/src
├── /core               # Pure game logic (no rendering dependencies)
│   ├── Game.ts         # Main game loop and state management
│   ├── GameState.ts    # Chess state types and initial board setup
│   ├── Actions.ts      # Action type definitions
│   ├── Reducer.ts      # Pure reducer with chess logic
│   └── ChessRules.ts   # Movement rules for each piece type
├── /rendering          # Three.js rendering layer
│   ├── Renderer.ts     # Scene, camera, lights setup
│   ├── BoardView.ts    # Chess board with valid move highlighting
│   └── PieceView.ts    # 3D chess pieces (different geometry per type)
├── /input              # User input handling
│   └── InputManager.ts # Piece selection and move input via raycasting
└── main.ts             # Application entry point
```

### Data Flow

```
User Input → Action → Reducer → New State → Render
     ↑                              │
     └──────────────────────────────┘
```

1. **Input** captures user interactions (clicks, drags)
2. **Actions** are plain objects describing what happened
3. **Reducer** is a pure function that computes new state
4. **Renderer** visualizes the current state

## Adding New Actions

Actions are the only way to modify game state. Here's how to add a new action:

### 1. Define the Action Type

In `src/core/Actions.ts`:

```typescript
export type Action =
  | { type: 'SELECT_PIECE'; pieceId: string }
  | { type: 'MOVE_PIECE'; pieceId: string; to: Position }
  | { type: 'END_TURN' }
  | { type: 'CAPTURE_PIECE'; pieceId: string }  // ← New action
```

### 2. Add Action Creator

```typescript
export const Actions = {
  // ... existing actions
  
  capturePiece: (pieceId: string): Action => ({
    type: 'CAPTURE_PIECE',
    pieceId,
  }),
};
```

### 3. Handle in Reducer

In `src/core/Reducer.ts`:

```typescript
case 'CAPTURE_PIECE': {
  return {
    ...state,
    pieces: state.pieces.filter(p => p.id !== action.pieceId),
  };
}
```

### 4. Dispatch from Input or UI

```typescript
game.dispatch(Actions.capturePiece('piece-1'));
```

## Backend Integration

The architecture is designed for easy multiplayer integration:

### Serialization

```typescript
import { serializeState, deserializeState } from '@/core/GameState';

// Save game
const json = serializeState(game.getState());
localStorage.setItem('savedGame', json);

// Load game
const state = deserializeState(localStorage.getItem('savedGame'));
game.loadState(state);
```

### WebSocket Sync (Example)

```typescript
// Client sends actions to server
game.subscribe((state, action) => {
  if (action) {
    socket.emit('action', action);
  }
});

// Client receives state updates from server
socket.on('state', (state) => {
  game.loadState(state);
});
```

### Server-Side State

The core game logic (`/src/core`) has no browser dependencies and can run in Node.js:

```typescript
// On server
import { Game } from './core/Game';
import { applyAction } from './core/Reducer';

const game = new Game();

socket.on('action', (action) => {
  game.dispatch(action);
  broadcast('state', game.getState());
});
```

## Modifying the Board

Board configuration is in `src/core/GameState.ts`:

```typescript
export function createInitialState(): GameState {
  const width = 8;  // Change board dimensions
  const height = 8;
  
  // Add custom tile types
  const tiles: Tile[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles.push({
        id: `tile-${x}-${y}`,
        position: { x, y },
        type: x === 3 && y === 3 ? 'special' : 'normal',
      });
    }
  }
  
  // Configure initial pieces
  const pieces: Piece[] = [
    { id: 'king', position: { x: 4, y: 0 }, playerId: 1, type: 'king' },
    // ...
  ];
  
  return { board: { width, height, tiles }, pieces, /* ... */ };
}
```

## Extending Rendering

### Custom Piece Types

In `src/rendering/PieceView.ts`:

```typescript
private createPieceMesh(piece: Piece): THREE.Mesh {
  let geometry: THREE.BufferGeometry;
  
  switch (piece.type) {
    case 'king':
      geometry = new THREE.ConeGeometry(0.3, 0.8, 6);
      break;
    case 'pawn':
    default:
      geometry = this.pieceGeometry;
  }
  
  // ...
}
```

### Loading GLB Assets

```typescript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

async function loadPieceModel(url: string): Promise<THREE.Group> {
  const gltf = await loader.loadAsync(url);
  return gltf.scene;
}
```

## Optional Features

### Physics (cannon-es)

```bash
npm install cannon-es @types/cannon
```

```typescript
import * as CANNON from 'cannon-es';

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
```

### ECS (bitecs)

```bash
npm install bitecs
```

```typescript
import { createWorld, defineComponent, defineQuery } from 'bitecs';

const Position = defineComponent({ x: 'f32', y: 'f32' });
const world = createWorld();
```

## Project Structure Best Practices

- **Core** should never import from **Rendering** or **Input**
- **Rendering** reads state but never mutates it
- **Input** emits actions but never mutates state directly
- All state changes go through the **Reducer**

## License

MIT

