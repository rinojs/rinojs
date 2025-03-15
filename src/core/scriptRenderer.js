import { spawn } from "child_process";

export function getResultFromCode (code, dirname, args = [])
{
  return new Promise((resolve, reject) =>
  {
    const child = spawn("node", ["-e", code, ...args], {
      cwd: dirname,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let output = "";
    let error = "";

    child.stdout.on("data", (data) =>
    {
      output += data;
    });

    child.stderr.on("data", (data) =>
    {
      error += data;
    });

    child.on("close", (closeCode) =>
    {
      if (closeCode === 0) resolve(output.trim());
      else reject(error || `Script exited with code ${closeCode}`);
    });
  });
}
