import path from "path";
import { getResultFromCode } from "./scriptRenderer.js";
import { renderMD } from "./mdRenderer.js";
import typescript from "typescript";

export async function buildComponent (content, components, mds, componentsDir, args = [])
{
  const attributeRegex = /(@?)([a-zA-Z]+)\s*=\s*(['"])(.*?)\3/g;
  const tagRegex = /<(component|script)\s+([^>]+?)(?:\s*(?:>\s*(.*?)\s*<\/script>|\/>))/gs;
  let result = "";
  let cursor = 0;
  let match;

  while ((match = tagRegex.exec(content)))
  {
    result += content.slice(cursor, match.index);
    cursor = tagRegex.lastIndex;

    const [fullMatch, tagType, attributesString, innerContent] = match;
    const attributes = parseAttributes(attributesString, attributeRegex);

    if (tagType === "script")
    {
      const scriptType = attributes.find((attr) => attr.name === "@type")?.content.toLowerCase();

      if (!scriptType)
      {
        result += fullMatch;
        continue;
      }

      let processedContent = "";

      if (scriptType === "markdown" || scriptType === "md")
      {
        const mdPath = attributes.find((attr) => attr.name === "@path")?.content || "";
        let filteredCode = innerContent;

        if (!mdPath && innerContent)
        {
          filteredCode = filteredCode.replace(/<\/script>/g, "</script>");
        }

        processedContent = renderMD(filteredCode, attributes, mds);
      }
      else if (scriptType === "javascript" || scriptType === "js")
      {
        if (innerContent) processedContent = await getResultFromCode(innerContent, componentsDir, args);
      }
      else if (scriptType === "typescript" || scriptType === "ts")
      {
        if (innerContent)
        {
          const compiledCode = typescript.transpile(innerContent,
            {
              compilerOptions:
              {
                module: typescript.ModuleKind.ESNext,
                target: typescript.ScriptTarget.ESNext,
              },
            });

          processedContent = await getResultFromCode(compiledCode, componentsDir, args);
        }
      }

      result += processedContent;
    }
    else if (tagType === "component")
    {
      result += await renderComponent(attributes, components, mds, componentsDir, args);
    }
  }

  result += content.slice(cursor);
  return result;
}

async function renderComponent (attributes, components, mds, componentsDir, args = [])
{
  const componentPath = attributes.find((attr) => attr.name === "@path")?.content;
  const componentTag = attributes.find((attr) => attr.name === "@tag")?.content || "";

  const componentContent = components.find((c) =>
    path.normalize(c.path).includes(path.normalize(componentPath + ".html"))
  )?.content;

  if (!componentContent)
  {
    console.warn(`Warning: Component "${componentPath}" not found.`);
    return ``;
  }

  const renderedContent = await buildComponent(componentContent, components, mds, componentsDir, args);

  const otherAttributes = attributes
    .filter((attr) => !["@path", "@tag"].includes(attr.name))
    .map((attr) => `${attr.name}="${attr.content}"`)
    .join(" ");

  return componentTag ? `<${componentTag} ${otherAttributes}>${renderedContent}</${componentTag}>` : renderedContent;
}

function parseAttributes (attributeString, regex)
{
  const attributes = [];
  let match;
  while ((match = regex.exec(attributeString)))
  {
    attributes.push({
      name: match[1] ? "@" + match[2] : match[2],
      content: match[4],
    });
  }
  return attributes;
}
