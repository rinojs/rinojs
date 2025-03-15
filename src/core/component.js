import path from "path";
import { getResultFromCode } from "./scriptRenderer.js";
import { renderMD } from "./mdRenderer.js";
import typescript from "typescript";

export async function buildComponent(
  content,
  components,
  mds,
  componentDir,
  args = []
) {
  const componentRegex = /<component\s+([^>]+?)\s*\/?>/g;
  const scriptRegex = /<script\s+([^>]+?)\s*(?:>\s*(.*?)\s*<\/script>|\/>)/gs;
  const attributeRegex = /(@?)([a-zA-Z]+)\s*=\s*(['"])(.*?)\3/g;

  let result = content;

  result = await replaceAsync(
    result,
    scriptRegex,
    async (_, attributesString, code) => {
      const attributes = parseAttributes(attributesString, attributeRegex);
      const scriptType = attributes
        .find((attr) => attr.name === "@type")
        ?.content.toLowerCase();

      if (!scriptType) return _;

      if (scriptType == "markdown" || scriptType == "md") {
        const mdPath =
          attributes.find((attr) => attr.name === "@path")?.content || "";
        let filteredCode = code;

        if (!mdPath) {
          filteredCode = filteredCode.replace(/<\\\/script>/g, "</script>");
          filteredCode = filteredCode.replace(/<\\\\\/script>/g, "</script>");
        }

        return renderMD(filteredCode, attributes, mds);
      }

      if (scriptType == "javascript" || scriptType == "js") {
        return await getResultFromCode(code, componentDir, args);
      }

      if (scriptType == "typescript" || scriptType == "ts") {
        const compiledCode = typescript.transpile(code, {
          compilerOptions: {
            module: typescript.ModuleKind.ESNext,
            target: typescript.ScriptTarget.ESNext,
          },
        });

        return await getResultFromCode(compiledCode, componentDir, args);
      }

      return "";
    }
  );

  result = await replaceAsync(
    result,
    componentRegex,
    async (_, attributesString) => {
      const attributes = parseAttributes(attributesString, attributeRegex);

      return await renderComponent(
        attributes,
        components,
        mds,
        componentDir,
        args
      );
    }
  );

  return result;
}

async function renderComponent(
  attributes,
  components,
  mds,
  componentDir,
  args = []
) {
  const componentPath = attributes.find(
    (attr) => attr.name === "@path"
  )?.content;
  const componentTag =
    attributes.find((attr) => attr.name === "@tag")?.content || "";

  const componentContent = components.find((c) =>
    path.normalize(c.path).includes(path.normalize(componentPath + ".html"))
  )?.content;

  if (!componentContent) {
    console.warn(`Warning: Component "${componentPath}" not found.`);
    return ``;
  }

  const renderedContent = await buildComponent(
    componentContent,
    components,
    mds,
    componentDir,
    args
  );

  const otherAttributes = attributes
    .filter((attr) => !["@path", "@tag"].includes(attr.name))
    .map((attr) => `${attr.name}="${attr.content}"`)
    .join(" ");

  if (componentTag) {
    return `<${componentTag} ${otherAttributes}>${renderedContent}</${componentTag}>`;
  } else {
    return renderedContent;
  }
}

function parseAttributes(attributeString, regex) {
  const attributes = [];
  let match;
  while ((match = regex.exec(attributeString))) {
    attributes.push({
      name: match[1] ? "@" + match[2] : match[2],
      content: match[4],
    });
  }
  return attributes;
}

async function replaceAsync(str, regex, asyncFn) {
  const promises = [];
  str.replace(regex, (match, ...args) => {
    const promise = asyncFn(match, ...args);
    promises.push(promise);
  });
  const results = await Promise.all(promises);
  return str.replace(regex, () => results.shift());
}
