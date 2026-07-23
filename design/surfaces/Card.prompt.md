# Card

The surface primitive — panels, list containers, dialogs, and callouts all sit on a Card. Confident 16px radius, soft layered shadow.

```jsx
<Card>Board summary…</Card>
<Card variant="raised" padding="lg">Elevated panel</Card>
<Card interactive onClick={open}>Clickable</Card>
<Card complete>All tasks done — ready to ship</Card>
```

`complete` lights the card with the green completion glow — reserve it for the genuine "done" moment.
