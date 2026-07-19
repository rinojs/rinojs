import { fork } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workerPath = fileURLToPath(new URL("./templateScriptWorker.js", import.meta.url));
const runners = new Map();

class TemplateScriptRunner
{
  #child = null;
  #queue = Promise.resolve();
  #nextId = 1;
  #pending = new Map();
  #idleTimer = null;
  #stderr = "";

  constructor(dirname)
  {
    this.dirname = path.resolve(dirname);
  }

  run(code, args = [])
  {
    const task = () => this.#runNow(code, args);
    const result = this.#queue.then(task, task);
    this.#queue = result.catch(() => {});
    return result;
  }

  close()
  {
    if (this.#idleTimer) clearTimeout(this.#idleTimer);
    this.#idleTimer = null;
    if (!this.#child) return;
    this.#child.send({ type: "close" });
    this.#child = null;
  }

  #worker()
  {
    if (this.#idleTimer) clearTimeout(this.#idleTimer);
    this.#idleTimer = null;

    if (this.#child) return this.#child;

    this.#child = fork(workerPath, [], {
      cwd: process.cwd(),
      execArgv: [],
      stdio: ["ignore", "ignore", "pipe", "ipc"]
    });

    this.#stderr = "";
    this.#child.stderr?.on("data", data =>
    {
      this.#stderr += data.toString();
    });
    this.#child.on("message", message => this.#handleMessage(message));
    this.#child.on("exit", () => this.#handleExit());
    return this.#child;
  }

  #runNow(code, args)
  {
    const child = this.#worker();
    const id = this.#nextId++;

    return new Promise((resolve, reject) =>
    {
      this.#pending.set(id, { resolve, reject });
      child.send({ type: "run", id, code, args, cwd: this.dirname });
    }).finally(() => this.#scheduleIdleClose());
  }

  #handleMessage(message)
  {
    const pending = this.#pending.get(message?.id);
    if (!pending) return;
    this.#pending.delete(message.id);

    if (message.ok) pending.resolve((message.output || "").trim());
    else pending.reject(message.error || "Template script failed");
  }

  #handleExit()
  {
    this.#child = null;
    for (const pending of this.#pending.values())
    {
      pending.reject(this.#stderr.trim() || "Template script worker exited");
    }
    this.#pending.clear();
  }

  #scheduleIdleClose()
  {
    if (this.#pending.size) return;
    this.#idleTimer = setTimeout(() => this.close(), 1000);
    this.#idleTimer.unref?.();
  }
}

export function getResultFromCode(code, dirname, args = [])
{
  const key = path.resolve(dirname);
  if (!runners.has(key)) runners.set(key, new TemplateScriptRunner(key));
  return runners.get(key).run(code, args);
}

export function closeTemplateScriptRunners()
{
  for (const runner of runners.values()) runner.close();
  runners.clear();
}

process.once("exit", closeTemplateScriptRunners);
