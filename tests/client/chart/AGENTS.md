# tests/client/chart/

Tests for the chart models and scales in `client/ui/chart/`.

## Rules
- Test the models and the scales, which are pure. Build runs with `runBridge` from the registry, not by hand.
- The SVG drawing is checked in a real browser walk, not here.
