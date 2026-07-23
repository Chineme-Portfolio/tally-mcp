# Switch

On/off toggle for a setting that takes effect immediately (no save step). Thumb slides with a spring; the track fills green when on.

```jsx
<Switch label="Notify on completion" defaultChecked />
<Switch checked={dark} onChange={(e) => setDark(e.target.checked)} label="Dark preview" />
```
