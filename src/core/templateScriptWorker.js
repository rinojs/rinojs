import util from "node:util";

async function runCode(code, args, cwd)
{
  const originalArgv = process.argv;
  const originalCwd = process.cwd();
  const originalLog = console.log;
  const originalError = console.error;
  const output = [];
  const errors = [];

  process.argv = [process.execPath, ...args];
  console.log = (...values) => output.push(util.format(...values));
  console.error = (...values) => errors.push(util.format(...values));

  try
  {
    if (cwd) process.chdir(cwd);
    const encoded = Buffer.from(`${ code }\n//# sourceURL=rino-template-script.js`, "utf8").toString("base64");
    await import(`data:text/javascript;base64,${ encoded }#${ Date.now() }-${ Math.random() }`);
    return { output: output.join("\n"), error: errors.join("\n") };
  }
  finally
  {
    process.chdir(originalCwd);
    process.argv = originalArgv;
    console.log = originalLog;
    console.error = originalError;
  }
}

process.on("message", async (message) =>
{
  if (message?.type === "close")
  {
    process.exit(0);
  }

  if (message?.type !== "run") return;

  try
  {
    const result = await runCode(message.code, message.args || [], message.cwd);
    process.send({ id: message.id, ok: true, ...result });
  }
  catch (error)
  {
    process.send({
      id: message.id,
      ok: false,
      error: error?.stack || error?.message || String(error)
    });
  }
});
