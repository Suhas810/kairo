# Kairo — Agent Workflow

## 1. Overview

Kairo uses an execution-oriented software engineering workflow.

Instead of stopping after generating code, Kairo moves through planning, research, coding, testing, and debugging before producing a final result.

```text
User Task
    ↓
Planning
    ↓
Research
    ↓
Coding
    ↓
Testing
    ↓
    ├── PASS → Review → Result
    │
    └── FAIL → Debugging
                    ↓
                  Coding
                    ↓
                  Testing
```

## 2. Workflow Stages

The primary workflow contains:

1. Planning
2. Research
3. Coding
4. Testing
5. Debugging

Each stage produces structured information for the next stage.

## 3. Orchestrator

The Orchestrator controls the complete lifecycle.

```text
Orchestrator
    │
    ├── Planner
    ├── Researcher
    ├── Coder
    ├── Tester
    └── Debugger
```

Responsibilities:

- Create an agent run
- Track the current stage
- Pass context between stages
- Call required tools
- Store agent events
- Handle failures
- Enforce iteration limits
- Decide when the workflow is complete

## 4. Context Flow

```text
User Task
   ↓
Plan
   ↓
Research Context
   ↓
Implementation Context
   ↓
Execution Result
   ↓
Test Result
   ↓
Debug Context
   ↓
Final Result
```

## 5. Successful Workflow

```text
Task
 ↓
Plan
 ↓
Research
 ↓
Code
 ↓
Execute
 ↓
Test
 ↓
Pass
 ↓
Review
 ↓
Completed
```

## 6. Failed Workflow

```text
Task
 ↓
Plan
 ↓
Research
 ↓
Code
 ↓
Execute
 ↓
Test
 ↓
Fail
 ↓
Debug
 ↓
Fix
 ↓
Execute
 ↓
Test
 ↓
Pass
 ↓
Review
 ↓
Completed
```

## 7. Failure Limit

Kairo should not retry indefinitely.

Recommended initial configuration:

```text
Maximum debugging iterations: 3–5
```

If the limit is reached:

```text
Agent Run
   ↓
Human Review Required
```

## 8. Agent Events

Each stage can emit events such as:

```json
{
  "run_id": "run_123",
  "stage": "coding",
  "status": "started",
  "message": "Implementing requested changes"
}
```

Events are stored in Supabase and displayed by the frontend.

## 9. Core Principle

Kairo follows:

```text
Reason → Act → Observe → Correct → Verify
```

This makes the system an engineering agent rather than a simple code generator.
