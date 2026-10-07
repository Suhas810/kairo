# Judging Strategy

## Overview

This document defines how Kairo should be presented and evaluated during the hackathon.

The primary objective is not to demonstrate the largest number of features.

The objective is to demonstrate a **clear, useful, technically strong, and reliable AI software-engineering workflow**.

---

# 1. Core Story

The central story of Kairo is:

> Kairo turns a software development task into an organized AI engineering workflow involving planning, research, coding, testing, and debugging.

The project should be presented as an **AI software engineering agent**, not simply as another AI chatbot.

---

# 2. Problem

Traditional AI coding interfaces often require the developer to manually coordinate multiple steps:

```text
Understand Problem
      ↓
Research
      ↓
Plan
      ↓
Write Code
      ↓
Run Tests
      ↓
Read Errors
      ↓
Fix Code
      ↓
Repeat
```

This creates context switching and requires the developer to manually manage the workflow.

---

# 3. Kairo's Approach

Kairo organizes these activities into an agent-driven workflow:

```text
                    User Task
                        ↓
                    Planner
                        ↓
                    Research
                        ↓
                    Coding
                        ↓
                    Testing
                        ↓
                   Debugging
                        ↓
                    Result
```

The important difference is the **workflow orchestration**.

---

# 4. What Judges Should See

The demonstration should make the following visible:

### 1. User Request

Show the task being submitted.

### 2. Planning

Show how the agent breaks the task into steps.

### 3. Research

Show relevant technical information being gathered.

### 4. Coding

Show the agent producing or modifying code.

### 5. Testing

Show actual verification.

### 6. Debugging

If a test fails, demonstrate the agent analyzing and fixing the problem.

### 7. Final Result

Show the completed implementation and verification status.

---

# 5. Nebius Demonstration

Nebius should be visible as a meaningful part of the architecture.

Explain:

```text
Kairo Backend
      ↓
Agent Controller
      ↓
Nebius AI
      ↓
Reasoning / Generation
      ↓
Agent Workflow
```

The presentation should explain why Nebius is important to Kairo's architecture.

---

# 6. Technical Differentiation

Kairo should differentiate itself from a simple chatbot.

### Chatbot

```text
User
 ↓
Prompt
 ↓
AI
 ↓
Text Response
```

### Kairo

```text
User
 ↓
Task
 ↓
Planner
 ↓
Research
 ↓
Coding
 ↓
Execution
 ↓
Testing
 ↓
Debugging
 ↓
Verified Result
```

The emphasis should be on **action and verification**, not only text generation.

---

# 7. Demo Reliability

The judging demo must prioritize reliability.

Avoid demonstrating unnecessary features that could introduce failures.

The chosen demo should:

- Have a predictable workflow
- Use a controlled project
- Use a manageable task
- Complete within the available time
- Produce visible results
- Have a fallback demonstration

---

# 8. Recommended Demo Task

Use a task that demonstrates multiple agent capabilities without being excessively large.

Example:

```text
Build a REST API endpoint for managing tasks.

Requirements:
- Create task
- List tasks
- Update task
- Delete task
- Validate input
- Add tests
```

This provides opportunities to demonstrate:

```text
Planning
Research
Coding
Testing
Debugging
```

---

# 9. Judge-Focused Questions

The presentation should answer:

### What problem does Kairo solve?

Explain the software-development workflow problem.

### Why does this need AI?

Explain where reasoning, code generation, research, and debugging are required.

### Why is Kairo different?

Focus on orchestration and verification.

### Why Nebius?

Explain how Nebius powers the AI layer.

### Does it actually work?

Show the complete workflow.

### Can it be deployed?

Show the production application.

---

# 10. Technical Depth

If judges ask technical questions, be prepared to explain:

- Agent architecture
- Planning strategy
- Tool orchestration
- API architecture
- Authentication
- Database design
- Nebius integration
- Search integration
- Code execution
- Testing
- Error recovery
- Security
- Deployment

---

# 11. Avoid

Do not spend significant demo time on:

- Long introductions
- Generic AI explanations
- Excessive UI animations
- Features that are not functional
- Large amounts of source code
- Manual steps disguised as automation

The demo should show the system doing the work.

---

# 12. Evaluation Strategy

Kairo should optimize for four qualities:

```text
        KAIRO
          │
 ┌────────┼────────┐
 ↓        ↓        ↓
Innovation Technical Execution
          │
          ↓
       Impact
```

The exact scoring criteria should always be checked against the official hackathon rules before final submission.

---

# 13. One-Sentence Pitch

Use a concise project pitch:

> **Kairo is an AI software engineering agent that transforms development tasks into an end-to-end workflow of planning, research, coding, testing, and debugging.**

---

# 14. Judge Takeaway

At the end of the demonstration, judges should remember three things:

1. **Kairo is an agent, not just a chatbot.**
2. **Kairo can execute and verify software-development workflows.**
3. **Nebius powers the intelligence behind the workflow.**