# Checkbox

The signature control — this is where the brand's "making progress feels satisfying" lives. Checking it springs the box (scale pop) and draws the checkmark in. Controlled or uncontrolled.

```jsx
<Checkbox label="Wire up Postgres schema" defaultChecked />
<Checkbox label="Ship staging deploy" checked={done} onChange={(e) => setDone(e.target.checked)} />
<Checkbox label="Locked task" disabled />
```

Keep the label action-phrased. Motion is automatically disabled under `prefers-reduced-motion` (the box still fills green; it just doesn't bounce).
