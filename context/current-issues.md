# Drag-and-drop shape fidelity + drag feedback

**Repro steps**
1. Open the editor canvas (`/editor/[projectId]`).
2. From the bottom shape panel, pick a non-rectangular shape (e.g. circle, diamond).
3. Drag it onto the canvas and watch the rendered appearance + any feedback during the drag.
4. Drop it and observe the final rendering.

**Expected**
- Shape fidelity: the dragged shape keeps its real geometry both while dragging and after drop (a circle stays a circle, a diamond stays a diamond).
- Drag feedback: dragging shows a clear affordance — smooth animation and/or cursor change, subtle scale/opacity/shadow — while the pointer is down.

**Actual**
- Non-rectangular shapes render as plain rectangles during drag and after drop.
- There is no visual indication or animation while dragging.

**Acceptance criteria**
1. Any shape from the shape panel renders with correct geometry in-drag and after drop (no forced rectangular masking).
2. Dragging triggers a smooth animation and a clear visual affordance present while the pointer is down.
3. No regressions to existing drag behavior (drag start / hover / drop events and final placement still work).
