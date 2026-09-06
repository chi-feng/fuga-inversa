# Browser checks

These scripts exercise the running edition in Chrome and inspect its actual decoded audio buffers. Playback is muted for the checks. Use a separate test tab; reloading the page restores normal listening.

Serve the repository in one terminal:

```sh
uv run --no-project python -m http.server 8768
```

From the repository root in another terminal, initialize a named agent-browser session:

```sh
FUGUE_REVIEW_SESSION=$(agent-browser session id --scope worktree --prefix fuga-review)
agent-browser --session "$FUGUE_REVIEW_SESSION" open http://127.0.0.1:8768/
agent-browser --session "$FUGUE_REVIEW_SESSION" wait --fn 'window.fugueEdition?.ready === true'
agent-browser --session "$FUGUE_REVIEW_SESSION" eval --stdin < reviews/checks/browser-muted-setup.js
agent-browser --session "$FUGUE_REVIEW_SESSION" click '#play'
agent-browser --session "$FUGUE_REVIEW_SESSION" eval --stdin < reviews/checks/browser-functional.js
agent-browser --session "$FUGUE_REVIEW_SESSION" eval --stdin < reviews/checks/browser-stress.js
agent-browser --session "$FUGUE_REVIEW_SESSION" eval --stdin < reviews/checks/comparison-interruption.js
```

Run `browser-layout.js` through the same `eval --stdin` command at 1440 × 1000 and 390 × 844 viewports. Each script returns its checked assertions or throws on failure. The saved results and their limits are in [the evidence directory](../evidence/).

The interruption check delays stem loading and dispatches a `pagehide` event. It tests the application's event handler. Physical-device suspension, Safari decoding, browser memory peaks, and subjective sound quality require separate evaluation.
