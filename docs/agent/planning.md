# Kairo — Planning Stage

## 1. Purpose

The Planning stage converts a user's natural-language software request into a structured engineering plan.

The Planner should understand what needs to be built before implementation begins.

## 2. Input

The Planner receives:

- User request
- Project information
- Repository context when available
- Existing relevant files
- Project constraints

Example:

```text
Build an authentication API using FastAPI
with JWT-based login and registration.
```

## 3. Planning Process

```text
User Request
     ↓
Understand Requirements
     ↓
Identify Constraints
     ↓
Inspect Project Context
     ↓
Identify Required Changes
     ↓
Define Validation Strategy
     ↓
Implementation Plan
```

## 4. Plan Structure

A plan should contain:

```text
Objective
Requirements
Files to inspect
Files to create
Files to modify
Dependencies
Implementation steps
Testing strategy
Potential risks
```

## 5. Example Plan

```text
Objective:
Add JWT authentication.

Steps:
1. Inspect existing FastAPI structure.
2. Identify user model.
3. Add password hashing.
4. Add registration endpoint.
5. Add login endpoint.
6. Generate JWT tokens.
7. Add authentication dependency.
8. Protect required routes.
9. Add authentication tests.
10. Run tests and fix failures.
```

## 6. Planning Rules

The Planner should:

- Avoid writing implementation code prematurely
- Break large tasks into manageable steps
- Identify dependencies
- Identify files likely to change
- Define how the result will be validated
- Keep the plan proportional to task complexity

## 7. Output

The Planner produces structured data that becomes context for later agents.

Conceptually:

```json
{
  "objective": "Add JWT authentication",
  "steps": [
    "Inspect project",
    "Implement authentication",
    "Add tests",
    "Run validation"
  ],
  "validation": [
    "Run unit tests",
    "Run API checks"
  ]
}
```

## 8. Failure Handling

If the request is ambiguous or impossible to execute safely, the Planner should identify the issue instead of inventing requirements.

## 9. Next Stage

The completed plan is passed to the Research stage.

```text
Planning
   ↓
Structured Plan
   ↓
Research
```
