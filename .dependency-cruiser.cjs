/**
 * Architecture rules (ADR 0006): the pure core must not depend on the rendering or UI
 * libraries, and the UI must never touch three.js scene objects.
 * Run with `pnpm check:arch`.
 */
const FRAMEWORKS = '(^|/)node_modules/(three|react|react-dom)/';
const PURE = '^src/(core/|layout\\.ts$|roomConfig\\.ts$)';
const NOT_TESTS = '\\.test\\.tsx?$';

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'pure-core-no-frameworks',
      comment: 'src/core, layout.ts and roomConfig.ts must not import three, react or react-dom.',
      severity: 'error',
      from: { path: PURE, pathNot: NOT_TESTS },
      to: { path: FRAMEWORKS },
    },
    {
      name: 'pure-core-no-shell',
      comment: 'The pure core must not import the UI, the three.js mapping or the app shell.',
      severity: 'error',
      from: { path: PURE, pathNot: NOT_TESTS },
      to: { path: '^src/(ui/|room\\.ts$|main\\.ts$|app\\.ts$)' },
    },
    {
      name: 'ui-no-three',
      comment: 'UI panels mutate the document through the store and never touch three.js.',
      severity: 'error',
      from: { path: '^src/ui/', pathNot: NOT_TESTS },
      to: { path: '(^|/)node_modules/three/' },
    },
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    // TypeScript 7 is not supported by dependency-cruiser's tsc parser yet (it then cruises
    // 0 modules and passes vacuously), so parse with swc. Switch back when tsc 7 is supported.
    parser: 'swc',
    tsPreCompilationDeps: true,
    exclude: { path: '\\.d\\.ts$' },
  },
};
