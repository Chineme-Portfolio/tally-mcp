# Icon

Renders a single glyph from Helm's curated, Lucide-derived set. Use for every inline mark — check, status, chevrons, drag handles, actions. `currentColor` inherits from the parent, so color the parent, not the icon.

```jsx
<Icon name="check" size={18} />
<span style={{ color: 'var(--primary-text)' }}><Icon name="flag" /></span>
```

Handle/menu glyphs (`grip-vertical`, `more-vertical`, `more-horizontal`) render as filled dots; everything else as 2px stroked outlines. Full set is in `IconName`. Need a glyph that isn't here? Pull it from Lucide (same 24px grid, 2px stroke) and add its path.
