# Kairo — Debugging Stage

## 1. Purpose

The Debugging stage analyzes execution or test failures and attempts to correct them.

This creates Kairo's core feedback loop.

## 2. Debugging Flow

```text
Test Failure
     ↓
Collect Error Evidence
     ↓
Identify Root Cause
     ↓
Propose Fix
     ↓
Apply Fix
     ↓
Execute Again
     ↓
Test Again
```

## 3. Debugging Input

The Debugger receives:

- Original task
- Engineering plan
- Changed files
- Execution output
- stderr
- Stack trace
- Test failures
- Previous debugging attempts

## 4. Root Cause Analysis

The Debugger should distinguish between:

```text
Symptom
  ↓
Immediate Error
  ↓
Underlying Cause
  ↓
Correct Fix
```

Example:

```text
Symptom:
API test returns 500.

Error:
Database connection failure.

Root Cause:
Incorrect Supabase environment variable.

Fix:
Correct backend environment configuration.
```

## 5. Debugging Strategy

The Debugger should:

1. Read the failure carefully.
2. Identify the affected component.
3. Inspect relevant source files.
4. Determine the most likely root cause.
5. Make a targeted fix.
6. Avoid unrelated changes.
7. Re-run validation.

## 6. Repair Loop

```text
          ┌─────────────┐
          │   Testing   │
          └──────┬──────┘
                 │
               FAIL
                 ↓
          ┌─────────────┐
          │  Debugging  │
          └──────┬──────┘
                 │
                 ↓
             Apply Fix
                 │
                 ▼
          ┌─────────────┐
          │  Execution  │
          └──────┬──────┘
                 │
                 ▼
          ┌─────────────┐
          │   Testing   │
          └──────┬──────┘
                 │
          ┌──────┴──────┐
         PASS          FAIL
          │              │
          ▼              ▼
       Review       Debug Again
```

## 7. Iteration Limit

Kairo should limit automatic repair attempts.

Recommended:

```text
Maximum debugging iterations: 3–5
```

Example:

```text
Attempt 1 → Failed
Attempt 2 → Failed
Attempt 3 → Passed
```

If all attempts fail:

```text
Debugging Limit Reached
        ↓
Human Review Required
```

## 8. Debugging Output

The Debugger should produce:

```json
{
  "root_cause": "Incorrect API response handling",
  "fix": "Updated response serialization",
  "changed_files": [
    "app/routes/users.py"
  ]
}
```

## 9. Avoiding Infinite Loops

The system should detect repeated failures.

Example:

```text
Same Error
 ↓
Same Fix
 ↓
Same Error
```

If the agent repeatedly produces the same failure, it should stop and report that automatic recovery was unsuccessful.

## 10. Completion

Successful debugging returns the workflow to testing.

```text
Debugging
   ↓
Fix Applied
   ↓
Testing
   ↓
PASS
   ↓
Review
   ↓
Completed
```

The final result should include the debugging history when relevant.
