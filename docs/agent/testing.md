# Kairo — Testing Stage

## 1. Purpose

The Testing stage determines whether the implementation actually works.

Kairo does not consider code complete simply because code generation succeeded.

## 2. Testing Flow

```text
Implementation
      ↓
Prepare Environment
      ↓
Run Tests / Validation
      ↓
Capture Output
      ↓
Analyze Result
      ↓
PASS or FAIL
```

## 3. Test Sources

Testing may use:

- Existing project tests
- Tests added by the Coder
- Build commands
- Type checking
- Linting
- API validation
- Runtime checks

## 4. Execution Environment

Tests should run inside an isolated Docker environment.

```text
Project
   ↓
Docker Container
   ↓
Dependencies
   ↓
Test Command
   ↓
Test Output
```

## 5. Test Result

A structured test result can look like:

```json
{
  "status": "failed",
  "tests_run": 10,
  "tests_passed": 8,
  "tests_failed": 2,
  "exit_code": 1
}
```

## 6. Successful Test

```text
Tests
 ↓
All Required Checks Pass
 ↓
Review
 ↓
Completed
```

## 7. Failed Test

```text
Tests
 ↓
Failure
 ↓
Capture Error
 ↓
Analyze Failure
 ↓
Debugger
```

The complete error information becomes context for debugging.

## 8. What Should Be Captured

The Executor/Tester should capture:

- Exit code
- stdout
- stderr
- Test names
- Failure messages
- Stack traces
- Execution duration

## 9. Timeouts

Tests should have execution limits.

Example:

```text
Test timeout → 60 seconds
```

The exact value can be configured according to project requirements.

## 10. Testing Principle

Kairo should prefer evidence over assumptions.

Instead of:

```text
"The code should work."
```

Kairo should aim for:

```text
"Tests executed successfully."
```

## 11. Next Stage

If tests pass:

```text
Testing
  ↓
Review
```

If tests fail:

```text
Testing
  ↓
Debugging
```
