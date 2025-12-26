# PRD — Browser-Based 3D Board Game Boilerplate

## 1. Goal
Create a **minimal, extensible boilerplate** for a browser-based **3D board game** using low-level tools (no game engine, no heavy frameworks).

The boilerplate must:
- Separate **game logic** from **rendering**
- Keep the option open to add a **backend (multiplayer, persistence)** later
- Stay close to the metal and avoid high-level abstractions

---

## 2. Non-Goals
- No gameplay depth or polished visuals
- No multiplayer or backend implementation yet
- No high-level game engines (Unity, Babylon, Phaser, PlayCanvas)
- No mandatory physics engine
- No React or UI framework dependency

---

## 3. Tech Stack (Required)
- **TypeScript**
- **Vite**
- **Three.js**
- **HTML / CSS** for UI overlay
- **ES Modules only**

Optional (feature-flagged):
- `cannon-es` (physics)
- `bitecs` (ECS)

---

## 4. Architecture Principles
1. **Pure game state**
   - Game logic must be independent of rendering
   - All game state must be JSON-serializable
2. **Deterministic updates**
   - State changes only via actions
3. **Renderer as a view**
   - Three.js consumes state, never mutates it
4. **Backend-ready**
   - State + actions transferable over network

---

## 5. Project Structure

/src
/core
Game.ts              // main game loop
GameState.ts         // state types + initial state
Actions.ts           // action definitions
Reducer.ts           // applyAction(state, action)
/rendering
Renderer.ts          // Three.js setup (scene, camera, lights)
BoardView.ts         // board mesh creation + updates
PieceView.ts         // piece mesh creation + updates
/input
InputManager.ts      // pointer events + raycasting
/assets
board.glb            // placeholder
piece.glb            // placeholder
main.ts
index.html

---

## 6. Game Loop
- Single loop driven by `requestAnimationFrame`
- Fixed structure:

```ts
update(dt)
render(state)


⸻

7. Game State
	•	Must be plain data
	•	Fully JSON-serializable

Example:

type GameState = {
  board: Tile[];
  pieces: Piece[];
  currentPlayer: number;
};


⸻

8. Actions
	•	Plain objects only
	•	Reducer must be pure

Example:

type Action =
  | { type: "MOVE_PIECE"; pieceId: string; to: Position }
  | { type: "END_TURN" };


⸻

9. Rendering Requirements
	•	Three.js scene with:
	•	Perspective camera
	•	Basic lighting
	•	Board rendered as grid or mesh
	•	Pieces rendered as cloned or instanced meshes
	•	Meshes created once
	•	Transforms updated from state
	•	No game logic inside rendering

⸻

10. Input Handling
	•	Mouse / pointer support
	•	Raycasting against board and pieces
	•	Input layer emits Actions
	•	Input layer never mutates state directly

Flow example:

Click piece → SELECT_PIECE
Click tile → MOVE_PIECE


⸻

11. UI
	•	Minimal HTML overlay
	•	Show:
	•	Current player
	•	“End Turn” button
	•	No UI framework required

⸻

12. Assets
	•	.glb format
	•	Placeholder board + piece included
	•	Async loading
	•	Asset loading isolated from game logic

⸻

13. Extensibility

Boilerplate must support:
	•	WebSocket syncing (state + actions)
	•	Save / load game state
	•	Turn-based or realtime multiplayer
	•	Optional physics

⸻

14. Deliverables
	•	npm run dev starts the project
	•	One example board with movable pieces
	•	README explaining:
	•	Architecture overview
	•	How to add actions
	•	Where backend sync fits

⸻

15. Success Criteria
	•	New action can be added in <5 minutes
	•	Board layout can change without touching renderer internals
	•	Full game state can be serialized and restored

