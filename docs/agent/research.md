# Kairo — Research Stage

## 1. Purpose

The Research stage provides external technical information when the task requires knowledge beyond the available project context.

Kairo uses targeted web research instead of automatically searching for every task.

## 2. Research Tool

Primary research tool:

```text
Tavily
```

Typical research targets:

- Official documentation
- API usage
- Framework behavior
- Library configuration
- Current technical information
- Error investigation

## 3. Research Flow

```text
Engineering Plan
      ↓
Determine Knowledge Gaps
      ↓
Create Search Queries
      ↓
Tavily
      ↓
Collect Relevant Sources
      ↓
Extract Useful Information
      ↓
Research Context
```

## 4. When Research Is Needed

Research may be required when:

- A library/API is unfamiliar
- Current documentation is important
- The task depends on changing external information
- An error requires external investigation
- A specific framework feature needs verification

Research may be skipped when the repository already contains sufficient information.

## 5. Search Strategy

Queries should be specific.

Bad:

```text
FastAPI
```

Better:

```text
FastAPI JWT authentication official documentation
```

The Researcher should prioritize authoritative sources.

## 6. Research Output

The Researcher should return concise findings rather than dumping entire webpages into the agent context.

Example:

```json
{
  "query": "FastAPI JWT authentication official documentation",
  "findings": [
    {
      "source": "Official documentation",
      "summary": "JWT tokens can be handled using OAuth2 utilities."
    }
  ]
}
```

## 7. Context Integration

Research results are passed to the Coder.

```text
Plan
 +
Research
 +
Project Context
 ↓
Coder
```

## 8. Research Rules

The Researcher should:

- Search only when useful
- Prefer authoritative sources
- Avoid irrelevant results
- Extract actionable information
- Keep context concise
- Avoid blindly copying external code

## 9. Failure Handling

If research fails:

```text
Research Error
    ↓
Retry / Alternative Query
    ↓
If still unavailable
    ↓
Continue with available context
```

The agent should clearly record when required information could not be verified.

## 10. Next Stage

The resulting research context is passed to the Coding stage.
