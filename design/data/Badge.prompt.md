# Badge & Tag

`Badge` is a static count/label pill — soft tone by default, `solid` for rare emphasis, `outline` for quiet. `Tag` is an interactive chip for owners, labels, and filters — add `onRemove` for a dismiss affordance, `selected` for filter state.

```jsx
<Badge variant="primary" dot>12 open</Badge>
<Badge variant="success" tone="solid" icon="check">Shipped</Badge>
<Tag icon="anchor">infra</Tag>
<Tag onClick={pick} selected>Blocked</Tag>
<Tag onRemove={remove}>staging</Tag>
```
