# 0014. Spike with three parallel attempts, then two rounds of TDD

- Status: Accepted
- Date: 2026-10-13

## Context
For the draw-wall feature we ran one throwaway spike before refactoring (ADR 0011, 0012). It reduced risk (it showed that `Part` needs a rotation, that wall ids must be stable, and that counting blue pixels is a weak test signal), but we could not tell how good it was: there was nothing to compare it with, and part of what it "found" was already predictable from reading the code. A person also found a gap the scripted spike could not (a drag is read as one click).

## Decision
- Add the project skill `spike` (`.claude/skills/spike/`). It writes one brief and sends it, word for word, to three independent agents, each in its own git worktree. Reports follow a fixed template.
- The main session re-measures the objective results itself (typecheck, tests, architecture check, diff stat) instead of trusting the reports, scores the runs with one rubric (hard gates, then fewest existing files bent, new concepts, evidenced answers, friction), checks whether the three runs converged on the same model, and picks one.
- All spike code and worktrees are discarded. The findings go into an ADR for the decision.
- The work then goes through the `tdd` skill in two rounds: a refactor with no behavior change, then the feature. The feature round must not touch the files the refactor was meant to make stable; that is the payoff check.
- Only run it when the user asks, and only for questions that are truly unknown and change the design.

## Consequences
- We get a comparison and a convergence signal that a single spike cannot give. If three independent runs agree on a model, we can trust it more; if they differ, the differences are the decision.
- It costs three agent sessions per spike, and the three runs share the same brief, so they may converge on one idea and never explore a different design. Changing the brief is how to ask for different designs.
- It still does not compare spiking against not spiking. The payoff check in the feature round is one data point per use; record it in each resulting ADR to build up evidence.
- Worktrees start from `HEAD`, so a clean tree is required, and Windows long paths can make worktree removal fail (the skill says how to deal with it).
- Agents self-report, so a wrong or optimistic report is possible; re-measuring the objective items is part of the method for that reason.
- A scripted spike cannot find how a person actually uses a feature (see Context). Manual use of the result is still needed.
