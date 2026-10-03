---
description:
---

---
description: Code and refactor features locally using Ollama and Qwen 2.5 Coder
---
When this workflow is triggered (`/qwen`), follow these steps:

1. **Target Local Endpoint**: Route all completions to the local Ollama service running at `http://127.0.0.1:11434/v1`.
2. **Model**: Use `qwen2.5-coder:7b`.
3. **Task Instructions**:
   - Analyze the selected files or code context.
   - Refactor or generate new features as requested by the user.
   - Provide clean, production-ready code with concise explanations.
