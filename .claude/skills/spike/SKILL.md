---
name: spike
description: Use when the user asks for a spike, or wants to add a feature whose design is uncertain and the refactor shape is unclear. Runs the same throwaway spike three times in isolated worktrees, scores them with one rubric, picks one, discards the code, then hands off to the tdd skill for two rounds (refactor, then feature).
---

# Spike, then two rounds of TDD

Why: ADR 0014 (`docs/adr/0014-spike-with-three-parallel-attempts.md`). A single spike cannot be judged because there is nothing to compare it with. Three independent runs of the same brief give a comparison and a convergence signal. The code is thrown away; the findings are kept. Templates (brief, report, score table) are in [templates.md](templates.md). Test-first rules are in the `tdd` skill.

## 0. Preconditions
- Run only when the user asked for it (`/spike` or "spike this"). It starts three agents, which is slow and costly.
- Worktrees start from `HEAD`, so uncommitted work is invisible to them. If `git status` is not clean, ask the user to commit or stash first.
- Only spike what is truly unknown AND changes the design or the refactor. If the answer is in the code, read the code instead.

## 1. Write the brief
Fill in the brief template: the user-visible scenario in plain language, 2-4 concrete questions to answer, the rules, and the report template. Show it to the user and get a go-ahead before spawning.

## 2. Spawn three agents in one message
- Same brief, word for word, to all three. `subagent_type: general-purpose`, `isolation: "worktree"`, in the background. Do not set `model` or `effort`.
- Do not hint at an approach and do not tell one agent what another does. The agents must not read each other's worktrees.

## 3. Collect and re-measure
- An agent's final message is all that comes back, so the report template is mandatory. Agents describe what they did; do not trust their numbers.
- In each returned worktree, measure yourself: `pnpm install --frozen-lockfile` (it exits non-zero because of the ignored `@swc/core` build script but node_modules is usable), `npx tsc --noEmit`, `pnpm test`, `pnpm check:arch`, `git diff --stat HEAD`.
- Run Playwright for one worktree at a time: `pnpm dev` uses port 5173 and `reuseExistingServer` would reuse another run's server. Look at the screenshots the agents saved.

## 4. Score and decide
Use the score table in `templates.md`.
- **Hard gates** (fail means out): scenario demonstrated with evidence; `tsc` and `check:arch` pass; existing tests pass unless the break is explained and intended.
- **Ranked:** fewest existing source files bent; fewest new concepts; clear, evidenced answers to the brief's questions; quality of the friction notes; diff size (light weight, since spikes are hacks).
- **Convergence:** compare the three chosen model shapes. Same shape = high confidence. Different shapes = list where they differ, decide by the ranked criteria, and say what would change the choice.
- **Tie-break:** the simplest model.
- Decide, then show the user the table, the decision and the reasons. Keep findings from the losing runs that still matter (surprises, risks).

## 5. Discard everything
Copy out what the acceptance test will need (click coordinates, screenshots, measured values), then remove every worktree and branch. `git worktree remove --force <path>`; on Windows deep `node_modules` paths can make this fail, so use `cmd /c rmdir /s /q <path>` and then `git worktree prune`. Check that `git worktree list` and `git branch` show nothing left. Nothing from a spike is merged.

## 6. Two rounds, using the `tdd` skill
**Round 1, refactor (no behavior change):** pins first (characterization tests that pass today), then red/green toward the chosen model, existing expectations unchanged. Before finishing, write down the files that should now be stable for the feature (usually the layout and builder files). Run the four checks.

**Round 2, feature:** the Playwright acceptance test first, using the spike's recorded coordinates and values (section 4 of `tdd`): confirm red for the right reason, commit as `test.fixme`, then the inner loops (command, pure logic, UI, wiring), then remove `fixme`. **Payoff check:** `git diff --stat` for this round must not touch the files named in round 1. If it does, say so; the model was not as good as the spike suggested.

Commit only when the user asks.

## 7. Record
Add an ADR for the decision (copy `docs/adr/0000-template.md`). Context = the question and the three runs, with the score table; Decision = the chosen model; Consequences = the payoff-check result. Update `docs/adr/README.md`.

## What this does not show
It compares three spikes with each other. It does not show whether spiking beat not spiking; the round 2 payoff check is one data point per use. Same-brief runs may converge on one idea and then never explore a different design; if you want different designs, change the brief.
