# client/drawings/models/

One drawing model per instrument.

## Rules
- A model is pure: it builds parts and returns them with a camera.
- Part builders take a spec interface (`BlockSpec`, `TurnedSpec`), not positional lists.
- Add a bridge tap and port through `portAndTap` so every drawing shows the retrofit the same way.
- Keep each model file under one screen of functions. Split parts into named functions.
