# Spike templates

## Brief (sent word for word to all three agents)

````
You are running a throwaway spike in an isolated git worktree of this repo. Read CLAUDE.md first.

SCENARIO (what the user sees):
<plain-language behavior, e.g. "click Draw wall, click two floor points, a wall appears; Ctrl+Z removes it">

QUESTIONS TO ANSWER (the spike is done when these are answered with evidence):
1. <question that is truly unknown and changes the design or refactor>
2. ...

RULES
- Throwaway: hack freely. No unit tests, no cleanup, no ADRs, no docs.
- Work only in your worktree. Do not commit to main and do not look at any other worktree or branch.
- Timebox: about 1 hour. If you run out, stop and say what is still unknown.
- Demonstrate the scenario in the running app with a throwaway Playwright script outside tests/ (use `--use-angle=swiftshader --enable-unsafe-swiftshader`; start vite on your own free port). Save screenshots in your worktree under `spike-evidence/`.
- Do not change the Playwright config or the existing tests.

REPORT (your final message must use exactly these headings, under 600 words)
1. Result: scenario demonstrated yes/no, and the evidence (screenshot paths, pixel counts).
2. Chosen model: the data shape you ended up with (types, 10 lines max) and why.
3. Answers to the questions above, one per question, each with evidence.
4. Friction: every existing file you had to bend and what resisted.
5. New concepts: types, functions or modules you had to add.
6. Values for the acceptance test: button labels, click coordinates and viewport, pixel positions and colors.
7. What you would do differently, and what is still unknown.
8. Worktree path and branch.
````

## Score table (fill in one column per attempt)

| | Run A | Run B | Run C |
|---|---|---|---|
| Scenario demonstrated (evidence seen by me) | | | |
| `tsc` passes (my run) | | | |
| `pnpm check:arch` passes (my run) | | | |
| `pnpm test`: failures (my run) | | | |
| Existing source files modified (`git diff --stat HEAD`) | | | |
| New files / new concepts | | | |
| Diff size (insertions + deletions) | | | |
| Chosen model shape (one line) | | | |
| Questions answered with evidence (n of N) | | | |
| Gates passed | | | |

Convergence: do A, B and C choose the same model shape? <yes / no, and where they differ>

Decision: <run, why, and what would change the choice>

Carry over from the losing runs: <surprises and risks worth keeping>
