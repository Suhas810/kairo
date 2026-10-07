# Kairo — Coding Stage

## 1. Purpose

The Coding stage implements the solution described in the engineering plan.

The Coder operates using the task, project context, research, and previous execution feedback.

## 2. Input

The Coder receives:

- User task
- Engineering plan
- Research findings
- Repository structure
- Relevant source files
- Existing configuration
- Previous test/debug information

## 3. Coding Flow

```text
Task
 ↓
Plan
 ↓
Research
 ↓
Inspect Relevant Files
 ↓
Design Changes
 ↓
Implement
 ↓
Prepare Validation
```

## 4. Code Changes

The Coder may:

- Create files
- Modify files
- Delete unnecessary files
- Update configuration
- Add dependencies
- Add tests
- Fix existing implementation issues

Changes should remain within the requested scope.

## 5. Implementation Strategy

The Coder should:

1. Understand existing architecture.
2. Reuse existing patterns.
3. Make the smallest reasonable changes.
4. Avoid unnecessary rewrites.
5. Preserve existing functionality.
6. Add validation where appropriate.

## 6. Example

Task:

```text
Add a CSV validation endpoint.
```

Possible implementation:

```text
Inspect existing API
      ↓
Identify route structure
      ↓
Add upload endpoint
      ↓
Add CSV validation logic
      ↓
Add error response model
      ↓
Add tests
```

## 7. Tool Usage

The Coder may interact with:

```text
GitHub → repository files
Docker → validation
Supabase → application data where required
```

The model itself should not receive unrestricted operating-system access.

## 8. Output

The Coding stage produces:

```text
Changed files
Created files
Required commands
Implementation summary
```

Example:

```json
{
  "changed_files": [
    "app/routes/upload.py",
    "tests/test_upload.py"
  ],
  "summary": "Added CSV upload and validation endpoint."
}
```

## 9. Validation Preparation

The Coder should identify commands needed for validation.

Example:

```bash
pytest
```

or:

```bash
npm test
```

depending on the project.

## 10. Next Stage

After implementation, the project is passed to the Testing stage.

```text
Coding
  ↓
Implementation
  ↓
Testing
```
