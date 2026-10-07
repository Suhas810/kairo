# Kairo — Agent Architecture

## 1. Purpose

Kairo uses a multi-stage agent architecture where one orchestration layer coordinates specialized engineering responsibilities.

The objective is not to create several independent chatbots. The objective is to create a controlled software-engineering pipeline.

## 2. Agent Architecture

```text
                 ┌───────────────┐
                 │   User Task   │
                 └───────┬───────┘
                         ▼
                 ┌───────────────┐
                 │ Orchestrator  │
                 └───────┬───────┘
                         ▼
                 ┌───────────────┐
                 │    Planner    │
                 └───────┬───────┘
                         ▼
                 ┌───────────────┐
                 │   Researcher  │
                 └───────┬───────┘
                         ▼
                 ┌───────────────┐
                 │     Coder     │
                 └───────┬───────┘
                         ▼
                 ┌───────────────┐
                 │   Executor    │
                 └───────┬───────┘
                         ▼
                 ┌───────────────┐
                 │    Tester     │
                 └───────┬───────┘
                         │
                    pass │ fail
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
        ┌───────────┐        ┌───────────┐
        │  Reviewer  │        │  Debugger │
        └─────┬─────┘        └─────┬─────┘
              │                    │
              │                    └──→ Coder
              ▼
           Result
```

## 3. Orchestrator

The Orchestrator is responsible for:

- Creating the run
- Managing state
- Selecting the next stage
- Passing context between stages
- Calling tools
- Handling failures
- Enforcing iteration limits
- Persisting events

It is the central control plane.

## 4. Planner

Input:

- User task
- Project context

Output:

- Engineering plan
- Required files
- Required tools
- Expected validation strategy

The Planner should produce explicit steps rather than immediately writing code.

## 5. Researcher

The Researcher determines whether external information is necessary.

Tool:

- Tavily

Output:

- Search queries
- Relevant findings
- Source references
- Implementation constraints

Research should be targeted rather than performed for every task.

## 6. Coder

The Coder is responsible for implementation.

Input:

- Task
- Plan
- Research
- Repository context
- Existing code
- Previous failures

Output:

- File changes
- Commands required for validation

## 7. Executor

The Executor provides controlled execution.

Responsibilities:

- Prepare workspace
- Install dependencies when permitted
- Run commands
- Capture output
- Enforce timeout/resource limits
- Return execution results

Execution occurs in Docker.

## 8. Tester

The Tester determines whether the implementation works.

It can:

- Run existing tests
- Run generated tests
- Perform validation commands
- Interpret test output

Output:

```text
status: passed | failed
tests_run: N
tests_passed: N
tests_failed: N
logs: ...
```

## 9. Debugger

The Debugger receives failure evidence.

Input:

- Error message
- Stack trace
- Test output
- Relevant source files
- Previous attempts

Output:

- Root-cause explanation
- Proposed fix
- Modified files

The corrected implementation returns to execution/testing.

## 10. Reviewer

The Reviewer performs the final quality check.

Checks:

- Requirement coverage
- Correctness
- Test status
- Scope of changes
- Obvious regressions

## 11. Model Layer

The reasoning layer is powered through the Nebius AI stack, using NVIDIA Nemotron models where appropriate.

The application should keep model configuration separate from orchestration logic so model settings can be changed without rewriting the entire agent system.

## 12. Tool Layer

Tools are exposed through explicit interfaces.

```text
Agent
 ├── Research Tool → Tavily
 ├── GitHub Tool → GitHub
 ├── Execution Tool → Docker
 └── Persistence → Supabase
```

The model should not directly receive unrestricted operating-system access.

## 13. Context Management

Each stage receives only the context it needs.

Example:

```text
Task
Plan
Relevant Files
Research
Previous Errors
Current Test Result
```

This reduces unnecessary context and makes the system easier to debug.

## 14. Agent Event Model

Every major operation can produce:

```json
{
  "run_id": "run_123",
  "stage": "testing",
  "status": "started",
  "message": "Running project tests"
}
```

Events are persisted in Supabase and streamed/polled by the frontend.

## 15. Iteration Policy

Recommended initial limit:

```text
Maximum repair iterations: 3–5
```

This prevents an agent from entering an uncontrolled repair loop.

## 16. Difference from Traditional Code Chat

Traditional code assistant:

```text
Prompt → Code → Response
```

Kairo:

```text
Prompt
 → Plan
 → Research
 → Code
 → Execute
 → Test
 → Debug
 → Re-test
 → Review
 → Result
```

This execution-and-feedback loop is the core of Kairo's engineering workflow.
