import { spawn } from "node:child_process";

import { Plugin } from "@opencode/plugin";

type RunSlopInput = {
  path: string;
};

type RunSlopResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
};

export default Plugin.define({
  id: "sloperator.run-slop",
  setup: async (ctx) => {
    const projectRoot = ctx.location.project.canonical;

    await ctx.tool.transform((tools) => {
      tools.add({
        name: "run_slop",
        description:
          "Run a SlopLang program with Sloperator and return its stdout, stderr, and exit code as JSON.",
        input: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path to the .slop file, relative to the project root or absolute.",
            },
          },
          required: ["path"],
          additionalProperties: false,
        },
        options: { codemode: false },
        execute: async (input) => {
          const { path } = input as RunSlopInput;

          const result = await new Promise<RunSlopResult>((resolve, reject) => {
            const child = spawn("uv", ["run", "--no-active", "sloperator.py", path], {
              cwd: projectRoot,
              stdio: ["ignore", "pipe", "pipe"],
            });

            let stdout = "";
            let stderr = "";

            child.stdout.setEncoding("utf8");
            child.stderr.setEncoding("utf8");
            child.stdout.on("data", (chunk: string) => {
              stdout += chunk;
            });
            child.stderr.on("data", (chunk: string) => {
              stderr += chunk;
            });

            child.once("error", reject);
            child.once("close", (exitCode) => {
              resolve({ stdout, stderr, exitCode });
            });
          });

          return { content: JSON.stringify(result, null, 2) };
        },
      });
    });
  },
});
