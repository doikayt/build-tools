// CJS bridge: NX loads executors via require(); this wrapper dynamically imports
// the ESM executor.js so the package can remain ESM-only.
module.exports = async function runExecutor(...args) {
  const { default: executor } = await import(
    "./dist/executors/generate/executor.js"
  );
  return executor(...args);
};
