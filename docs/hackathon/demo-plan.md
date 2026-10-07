# Demo Plan

## Overview

The Kairo demo should demonstrate one complete software-development workflow from user request to tested result.

The demo should be short, controlled, and reliable.

---

# 1. Demo Objective

Demonstrate that Kairo can:

```text
Understand
   ↓
Plan
   ↓
Research
   ↓
Code
   ↓
Test
   ↓
Debug
   ↓
Deliver
```

The audience should be able to see the agent working rather than only seeing the final answer.

---

# 2. Recommended Demo Duration

Target:

**5–7 minutes**

Suggested allocation:

| Section | Time |
|---|---:|
| Introduction | 30 sec |
| Problem | 30 sec |
| Kairo Architecture | 45 sec |
| Live Demo | 3–4 min |
| Technical Explanation | 1 min |
| Conclusion | 30 sec |

---

# 3. Demo Scenario

Use a small software project prepared specifically for the demonstration.

Example task:

```text
Build a task management REST API.

Requirements:
- Create tasks
- List tasks
- Update tasks
- Delete tasks
- Validate task data
- Add automated tests
```

---

# 4. Demo Flow

## Step 1 — Open Kairo

Show the production application.

```text
Kairo
 ↓
Login
 ↓
Dashboard
```

---

## Step 2 — Create Project

Create:

```text
Project:
Task Manager API
```

---

## Step 3 — Submit Task

Enter:

```text
Build a task management REST API with CRUD operations,
input validation, and automated tests.
```

---

# 5. Planning Stage

Show the agent generating a plan.

Example:

```text
Plan

1. Analyze requirements
2. Design API structure
3. Research FastAPI patterns
4. Implement models
5. Implement CRUD endpoints
6. Add validation
7. Write tests
8. Run tests
9. Fix failures
10. Return final result
```

This demonstrates agent planning.

---

# 6. Research Stage

The agent performs research when necessary.

Example:

```text
Researching:
FastAPI CRUD patterns
Pydantic validation
Pytest API testing
```

Show that research results are being used as context for implementation.

---

# 7. Coding Stage

The agent generates or modifies code.

Show:

```text
Files Created
├── app/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   └── routes.py
│
└── tests/
    └── test_tasks.py
```

The exact files depend on the demo project.

---

# 8. Testing Stage

The agent executes tests.

Example:

```text
Running tests...

12 tests
10 passed
2 failed
```

This creates an opportunity to demonstrate debugging.

---

# 9. Debugging Stage

Show the agent identifying a failure.

Example:

```text
Test Failure
     ↓
Analyze Error
     ↓
Identify Bug
     ↓
Modify Code
     ↓
Run Tests Again
```

Then show:

```text
12 tests
12 passed
```

This is one of the most important parts of the demo.

---

# 10. Final Result

Show a final summary:

```text
Task Completed

Files changed: 6
Tests executed: 12
Tests passed: 12
Issues remaining: 0

Status: SUCCESS
```

---

# 11. Architecture Explanation

After the live workflow, briefly show:

```text
                    KAIRO
                      │
             ┌────────┴────────┐
             ↓                 ↓
         Frontend            Backend
         Vercel              FastAPI
                               │
                ┌──────────────┼──────────────┐
                ↓              ↓              ↓
             Nebius         Supabase        Tavily
               AI             DB            Search
```

Explain the role of each component in one sentence.

---

# 12. Nebius Highlight

Clearly explain:

```text
User Task
   ↓
Kairo Agent
   ↓
Nebius AI
   ↓
Planning / Reasoning / Coding
   ↓
Tool Execution
```

Do not make the Nebius integration appear incidental.

---

# 13. Backup Demo

A backup recording or pre-tested workflow should be available in case the live demo fails.

Backup should contain:

- Complete agent execution
- Planning
- Research
- Coding
- Testing
- Debugging
- Final result

---

# 14. Demo Preparation

Before recording or presenting:

- [ ] Production deployment tested
- [ ] Login tested
- [ ] Database tested
- [ ] Nebius API tested
- [ ] Tavily tested
- [ ] Agent workflow tested
- [ ] Code execution tested
- [ ] Test suite tested
- [ ] Demo project prepared
- [ ] Backup demo prepared
- [ ] Internet connection verified

---

# 15. Demo Rules

During the demo:

- Keep the workflow focused
- Avoid unnecessary navigation
- Do not manually fix code unless explaining a limitation
- Let the agent perform the important steps
- Explain what is happening while it happens
- Keep backup screenshots/video ready
- Avoid exposing API keys

---

# 16. Closing Statement

End with:

> Kairo doesn't stop at generating code. It organizes the development process, uses AI to reason through the task, executes the workflow, tests the result, and helps resolve failures.