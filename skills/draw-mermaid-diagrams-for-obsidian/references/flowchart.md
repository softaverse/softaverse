# Flowchart

## Syntax

```mermaid
flowchart TD
```

## Direction

- `TD` / `TB`: top to bottom
- `LR`: left to right
- `RL`: right to left
- `BT`: bottom to top

## Nodes

| Syntax | Shape |
|---|---|
| `A[Text]` | Rectangle |
| `B((Text))` | Circle |
| `C>Text]` | Asymmetric shape |
| `D[(Text)]` | Rounded rectangle |
| `E[/Text/]` | Slanted rectangle |

## Edges

| Syntax | Description |
|---|---|
| `-->` | Arrow |
| `---` | No arrow |
| `-.->` | Dashed arrow |
| `===` | Thick line |

## Labels

```mermaid
A -- Yes --> B
A -- No --> C
```

## Subgraph

```mermaid
subgraph MyGroup
  A
  B
end
```

## Notes

- Avoid using `end` as a node name
- If a node name contains spaces or special characters, wrap it in quotes
