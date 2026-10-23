import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, relative, resolve, sep } from "node:path";

const workspace = "/workspace";
const buildDirectory = "/tmp/kairo-ts-out";

function collectTypeScriptFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) {
      continue;
    }
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTypeScriptFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: workspace,
    env: { PATH: process.env.PATH ?? "" },
    encoding: "utf8",
    maxBuffer: 64_000,
    shell: false,
    timeout: 90_000,
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) {
    process.stderr.write("TypeScript tooling failed.\n");
    process.exit(125);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const [mode, ...requestedFiles] = process.argv.slice(2);
if (mode !== "run" && mode !== "test") {
  process.stderr.write("Unsupported TypeScript operation.\n");
  process.exit(2);
}

const allFiles = collectTypeScriptFiles(workspace);
const filesToRun =
  mode === "test"
    ? requestedFiles.map((file) => resolve(workspace, file))
    : [resolve(workspace, requestedFiles[0] ?? "")];

if (
  filesToRun.length === 0 ||
  filesToRun.some(
    (file) => !file.startsWith(`${workspace}${sep}`) || !allFiles.includes(file),
  )
) {
  process.stderr.write("The TypeScript entry point is invalid.\n");
  process.exit(2);
}

run("/opt/kairo/node_modules/.bin/tsc", [
  "--target",
  "ES2022",
  "--module",
  "commonjs",
  "--rootDir",
  workspace,
  "--outDir",
  buildDirectory,
  "--skipLibCheck",
  "--esModuleInterop",
  ...allFiles,
]);

if (mode === "test") {
  const compiledTests = filesToRun.map((file) =>
    join(buildDirectory, relative(workspace, file).replace(/\.ts$/, ".js")),
  );
  run("node", ["--test", "--test-reporter=tap", ...compiledTests]);
} else {
  const compiledEntry = join(
    buildDirectory,
    relative(workspace, filesToRun[0]).replace(/\.ts$/, ".js"),
  );
  run("node", [compiledEntry]);
}
