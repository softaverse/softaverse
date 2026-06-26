# Output Templates

This file contains templates to use during Phase 2 when producing planning artifacts. Choose the appropriate template based on project scale.

---

## Table of contents

1. Feature List
2. PRD (Product Requirements Document)
3. Technical Spec
4. User Stories
5. Decision Log
6. API Requirements

---

## Feature List

Suitable for small projects, quick planning, or an initial MVP outline.

```markdown
# [Project Name] — Feature List

## Overview
One-paragraph description: what this is, who it's for, and what problem it solves.

## Priority legend
- 🔴 P0 — Must have for launch
- 🟡 P1 — Important; absence degrades experience
- 🟢 P2 — Nice-to-have
- ⚪ P3 — Future consideration

## Features

### [Feature group 1: e.g., User Management]
| # | Feature | Priority | Notes |
|---|--------:|---------:|------|
| 1 | Email signup/login | 🔴 P0 | Includes email verification |
| 2 | Google OAuth | 🟡 P1 | Lowers signup friction |
| 3 | Two-factor auth | 🟢 P2 | TOTP-based, avoid SMS |

### [Feature group 2]
...

## Out of scope
- X (reason)
- Y (reason)

## Open questions
- [ ] Question 1
- [ ] Question 2

## MVP scope
The first release includes only items marked 🔴 P0.

## Rough timeline
| Phase | Focus | Estimate |
|------|------|---------|
| Phase 1 | P0 features | X weeks |
| Phase 2 | P1 features | X weeks |
```

---

## PRD (Product Requirements Document)

Use for medium-to-large products, multi-role systems, or when alignment across stakeholders is required.

```markdown
# [Project Name] — Product Requirements Document (PRD)

**Author**: [name]
**Date**: [date]
**Status**: Draft / In review / Accepted

---

## 1. One-line summary
[Product] is a [product form] that allows [target users] to [core action].

## 2. Background & motivation
Why are we building this? What are the current pain points? Any supporting data?

## 3. Goals & success metrics

| Goal | Metric | Target |
|------|--------|--------|
| User growth | Monthly active users | Reach X within 3 months |
| Core conversion | Signup completion rate | > X% |

### Not a goal
Explicitly state what we are not pursuing to avoid scope creep.

## 4. User roles

### Role 1: [name]
- Who: description
- Pain points: current problems
- Core needs: what they want to accomplish
- Usage frequency: daily / weekly / occasional

### Role 2: [name]
...

## 5. Core user flows

### Flow 1: [flow name]
```
Step 1: User opens the homepage → sees [what]
Step 2: Clicks [button] → navigates to [page]
Step 3: Fills [form] → system [processes]
Step 4: Sees [result/confirmation]
```

Exceptions:
- If X happens → show Y
- If Z fails → guide user to W

## 6. Functional requirements

### 6.1 [feature group]

**FR-001: [feature title]**
- Description: [explicit, engineer-ready details]
- Priority: P0
- Acceptance criteria:
  - Given [condition], when [action], then [result]
  - On [error condition], system should [error handling]
- Edge cases: [list]

### 6.2 [feature group]
...

## 7. Non-functional requirements

### Performance
- Page load: < Xs (p95)
- API response: < X ms (p99)

### Security
- Authentication method
- Data encryption requirements
- Compliance requirements (e.g., privacy law)

### Scalability
- Expected concurrent users: X
- Data growth: X records/month

## 8. Data model

### Core entities

#### [Entity name]
| field | type | constraints | notes |
|------|------|------|------|
| id | UUID | PK | unique identifier |
| name | VARCHAR(255) | NOT NULL | display name |
| created_at | TIMESTAMP | NOT NULL | creation time |

#### Relationships
- [Entity A] → [Entity B]: one-to-many
- [Entity B] → [Entity C]: many-to-many (via [join table])

## 9. Technical architecture

### Recommended tech stack
| Layer | Tech | Rationale |
|------|------|------|
| Frontend | Next.js / Flutter | [reason] |
| Backend | NestJS | [reason] |
| Database | MySQL / PostgreSQL | [reason] |
| Cache | Redis | [reason] |
| Deployment | [platform] | [reason] |

### External services
| Service | Purpose | Alternatives |
|------|------|---------|
| TapPay / ECPay | Payments | Stripe |
| LINE Messaging API | Notifications | Firebase FCM |

### System architecture diagram
(Describe major components and data flow in text or ASCII)

## 10. MVP scope

### In-scope
- Feature A (P0)
- Feature B (P0)
- Feature C (P0)

### Out-of-scope (Phase 2)
- Feature X (reason)
- Feature Y (reason)

### Design reserved but not implemented
- i18n support (implement Traditional Chinese only for v1, but prepare i18n structure)
- XX

## 11. Phased plan

| Phase | Focus | Estimate | Deliverable |
|------|------|---------|--------|
| Phase 1 - Foundation | Project scaffolding, DB schema, auth | X weeks | Login skeleton |
| Phase 2 - Core | [core business logic] | X weeks | Core flow completion |
| Phase 3 - Integrations & polish | Payments, notifications, admin | X weeks | Launchable MVP |
| Phase 4 - Launch | Deploy, monitoring, load test | X weeks | Production release |

## 12. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|--------|------|---------|
| Third-party API instability | Medium | High | Add caching and degrade gracefully |

## 13. Open questions
- [ ] Unresolved item 1
- [ ] Unresolved item 2
```

---

## Technical Spec

Use for detailed technical design; often authored alongside the PRD.

```markdown
# [System/Feature] — Technical Specification

**Author**: [name]
**Date**: [date]
**Status**: Draft / In review / Accepted

---

## 1. Overview
What is being designed and why.

## 2. Design goals & constraints

### Goals
- Goal 1
- Goal 2

### Constraints
- Must use existing [DB/framework/service]
- Must remain backward compatible with [what]

## 3. Architecture design

### System architecture diagram
(Describe high-level architecture, components, and data flow)

### Core components
For each component describe:
- Responsibilities
- Inputs / outputs
- Dependencies

### Data model

#### Entity: [name]
| field | type | constraints | notes |
|------|------|------|------|
| id | UUID | PK | unique identifier |

#### Relationships
- One-to-many: ...
- Many-to-many: ...

#### Indexing strategy
| table | index | type | reason |
|----|------|------|------|
| users | email | UNIQUE | login lookup |

## 4. API design

### [METHOD /path]
- Description: what it does
- Auth: required / public
- Request Body: (schema)
- Response: (schema)
- Error codes: (list)

## 5. Key design decisions

### Decision 1: [title]
- Background: why this decision is needed
- Considered options: A, B, C
- Choice: B
- Rationale: because...
- Tradeoffs: we accept X to gain Y

## 6. Security considerations
- Authz/authn approach
- Data protection measures
- Input validation strategy

## 7. Testing strategy
- Unit test coverage targets
- Integration test approach
- Load testing plan

## 8. Deployment plan
- Feature flags
- Migration steps
- Rollback plan

## 9. Observability
- Key metrics
- Alert thresholds
- Logging strategy
```

---

## User Stories

Suitable for Agile teams.

```markdown
# [Project Name] — User Stories

## Epic: [Epic name]

### Story 1: [short title]
**As a** [role],
**I want** [action],
**So that** [benefit].

**Acceptance criteria**:
- Given [precondition], when [action], then [result]
- Given [precondition], when [action], then [result]

**Priority**: P0 / P1 / P2
**Estimate**: S / M / L / XL
**Dependencies**: [list]
**Notes**: [implementation hints, design references]
```

### Principles for good user stories
- The "So that" clause is crucial — it captures the "why"
- Acceptance criteria must be testable (QA should understand how to verify)
- A story should be completable within a single sprint
- If too large, split by user flow steps rather than technical layers

---

## Decision Log

Use when multiple viable options exist and reasons must be recorded.

```markdown
# [Project Name] — Decision Log

## Decision 1: [title]
**Date**: [date]
**Status**: Proposed / Accepted / Superseded

### Background
What led to this decision?

### Options considered

**Option A: [name]**
- Pros: ...
- Cons: ...
- Effort: S / M / L

**Option B: [name]**
- Pros: ...
- Cons: ...
- Effort: S / M / L

### Decision
Choose option [X].

### Rationale
Why this option over others.

### Consequences
What impact or new constraints does this decision introduce?
```

---

## API Requirements

Use when the primary deliverable is an API.

```markdown
# [API Name] — API Requirements

## Overview
What this API does, who uses it, and the interaction model (REST / GraphQL / gRPC).

## Auth & authorization
- Auth mechanism (API Key / OAuth2 / JWT)
- Permission model
- Rate limiting strategy

## Endpoints

### [resource]

#### List
`GET /api/v1/[resources]`

**Query Parameters**:
| param | type | required | description |
|------|------|------|------|
| page | int | no | page number (default 1) |
| limit | int | no | page size (default 20, max 100) |

**Success response**: `200 OK`
```json
{
  "data": [...],
  "pagination": { "page": 1, "limit": 20, "total": 150 }
}
```

#### Create
`POST /api/v1/[resources]`

**Request Body**:
```json
{ "field1": "value", "field2": 123 }
```

**Validation rules**:
- field1: required, string, max 255 chars
- field2: required, integer, min 0

**Success response**: `201 Created`
**Error codes**: 400 / 401 / 409 / 422

## Unified error format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "human-readable error message",
    "details": [...]
  }
}
```

## Versioning strategy
How API versions are managed (URL path / Header / etc.)
