# ChecklistItem

The board's atomic row and the product's signature moment — it composes `Checkbox`, `Status`, and `Menu` so you never rebuild them. Checking it fires the spring-pop and tints the row green; the title strikes through.

```jsx
<ChecklistItem
  title="Wire up Postgres schema"
  status="active"
  meta={<><span className="helm-item__meta-item">Claude</span><span className="helm-item__meta-item">Due Fri</span></>}
  onToggle={toggle}
  onEdit={edit}
  onDelete={remove}
/>
<ChecklistItem title="Provision staging" done />
```

Give the parent the state so `onToggle` actually flips `done`. Pass `dragging` while a row is picked up. Override the default Edit/Duplicate/Delete set with `menuItems`.
