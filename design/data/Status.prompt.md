# Status & ProgressBar

`Status` is the board's fixed four-state task vocabulary — `todo`, `active`, `blocked`, `done` — with a consistent color + dot (done shows a check). Don't invent new statuses; map to these.

`ProgressBar` is the launch-readiness meter and the brand's payoff: the fill springs to width, and at 100% it lights up with the completion glow.

```jsx
<Status status="active" />
<Status status="done" />
<Status status="blocked" label="Blocked on review" />

<ProgressBar label="Launch readiness" value={7} max={10} />
<ProgressBar label="Ready to ship" value={100} size="lg" />  {/* glows */}
```
