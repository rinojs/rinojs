import fs from "fs/promises";
import path from "path";
import { getResultFromCode } from "../scriptRenderer.js";
import { renderSSRMD } from "./ssrMDRenderer.js";
import { fileExists } from "../fsHelper.js";
import { renderDiagnostic } from "../renderDiagnostic.js";
import { transpileTSCode } from "../transpileTS.js";

export async function buildSSRComponent(componentPath, componentsDir, mdDir, args = [])
{
  try
  {
    if (!await fileExists(componentPath))
    {
      return "Budiling SSR component: HTML file not found";
    }

    const content = await fs.readFile(componentPath, "utf8");
    const attributeRegex = /([a-zA-Z][\w-]*)\s*=\s*(['"])(.*?)\2/g;
    const tagRegex = /<(component|script)\s+([^>]+?)(?:\s*\/>|>(.*?)<\/\1\s*>)/gs;
    let result = "";
    let cursor = 0;
    let match;

    while ((match = tagRegex.exec(content)))
    {
      result += content.slice(cursor, match.index);
      cursor = tagRegex.lastIndex;

      const [fullMatch, tagType, attributesString, innerContent = ""] = match;
      const attributes = parseAttributes(attributesString, attributeRegex);

      if (tagType === "script")
      {
        if (attributes.some((attr) => attr.name === "rino-export"))
        {
          result += fullMatch;
          continue;
        }

        const scriptType = attributes.find((attr) => attr.name === "rino-type")?.content.toLowerCase();

        if (!scriptType)
        {
          result += fullMatch;
          continue;
        }

        let processedContent = "";

        if (scriptType === "markdown" || scriptType === "md")
        {
          const mdPath = attributes.find((attr) => attr.name === "rino-import")?.content || "";
          let filteredCode = innerContent;

          if (!mdPath && innerContent)
          {
            filteredCode = filteredCode.replace(/<\/script>/g, "</script>");
          }

          processedContent = await renderSSRMD(filteredCode, attributes, mdDir);
        }
        else if (scriptType === "javascript" || scriptType === "js")
        {
          if (innerContent) processedContent = await getResultFromCode(innerContent, componentsDir, args);
        }
        else if (scriptType === "typescript" || scriptType === "ts")
        {
          if (innerContent)
          {
            const compiledCode = await transpileTSCode(innerContent, path.dirname(componentsDir), "template-script");
            processedContent = await getResultFromCode(compiledCode, componentsDir, args);
          }
        }

        result += processedContent;
      }
      else if (tagType === "component")
      {
        result += await renderSSRComponent(attributes, componentsDir, mdDir, args);
      }
    }

    result += content.slice(cursor);
    return result;
  }
  catch (error)
  {
    console.error(error);
    return renderDiagnostic("Building SSR component failed", error);
  }
}

async function renderSSRComponent(attributes, componentsDir, mdDir, args = [])
{
  try
  {
    const componentPath = attributes.find((attr) => attr.name === "rino-import")?.content;
    const componentTag = attributes.find((attr) => attr.name === "rino-tag")?.content || "";
    const renderedContent = await buildSSRComponent(path.join(componentsDir, componentPath + ".html"), componentsDir, mdDir, args);

    const otherAttributes = attributes
      .filter((attr) => !["rino-import", "rino-tag"].includes(attr.name))
      .map((attr) => `${ attr.name }="${ attr.content }"`)
      .join(" ");

    return componentTag ? `<${ componentTag } ${ otherAttributes }>${ renderedContent }</${ componentTag }>` : renderedContent;
  }
  catch (error)
  {
    console.error(error);
    return renderDiagnostic("Rendering SSR component failed", error);
  }
}

function parseAttributes(attributeString, regex)
{
  const attributes = [];
  let match;
  while ((match = regex.exec(attributeString)))
  {
    attributes.push({
      name: match[1],
      content: match[3],
    });
  }
  return attributes;
}
