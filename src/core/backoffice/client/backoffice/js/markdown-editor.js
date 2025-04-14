let editor = new toastui.Editor({
    el: document.querySelector("#editor"),
    height: "600px",
    initialEditType: "markdown",
    previewStyle: "vertical",
    hooks: {
        addImageBlobHook: async (blob, callback) =>
        {
            const outputDir = document.getElementById("upload-dir").value;
            const formData = new FormData();

            const now = new Date();
            const timestamp = now.toISOString().replace(/[:.]/g, "-");
            const originalName = blob.name || "image";
            const baseName = originalName
                .replace(/\.[^/.]+$/, "")
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-_]/g, "");
            const safeName = `${baseName}-${timestamp}.webp`;

            formData.append("image", blob, safeName);
            formData.append("outputDir", outputDir);
            formData.append("quality", "100");

            try
            {
                const res = await fetch("/api/upload-image", {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json();
                if (res.ok)
                {
                    callback(data.url, safeName);
                }
                else
                {
                    alert("Image upload failed: " + data.error);
                }
            }
            catch (error)
            {
                console.error("Upload error:", error);
                alert("Upload failed");
            }
        },
    }
});

function toDatetimeLocalValue (isoString)
{
    if (!isoString) return "";
    const date = new Date(isoString);
    const tzOffset = -date.getTimezoneOffset();
    const diff = tzOffset >= 0 ? "+" : "-";
    const pad = (n) => `${Math.floor(Math.abs(n))}`.padStart(2, "0");
    const local = new Date(date.getTime() - tzOffset * 60 * 1000);
    return local.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
}

function fromDatetimeLocalValue (localValue)
{
    return localValue ? new Date(localValue).toISOString() : undefined;
}

async function loadFile ()
{
    const path = document.getElementById("markdown-path").value;
    const res = await fetch(`/api/load-markdown?path=${encodeURIComponent(path)}`);
    const content = await res.text();

    if (!res.ok)
    {
        return alert("Error loading file.");
    }

    const metadata = extractMetadata(content);
    document.getElementById("title").value = metadata.title || "";
    document.getElementById("time").value = toDatetimeLocalValue(metadata.time);
    document.getElementById("description").value = metadata.description || "";

    editor.setMarkdown(metadata.markdown || "");
}

async function saveFile ()
{
    const path = document.getElementById("markdown-path").value;
    const markdownContent = editor.getMarkdown();

    const metadata = {
        title: document.getElementById("title").value || undefined,
        time: fromDatetimeLocalValue(document.getElementById("time").value),
        description: document.getElementById("description").value || undefined,
    };

    const content = formatWithMetadata(metadata, markdownContent);

    const res = await fetch(`/api/save-markdown`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, content }),
    });

    const result = await res.json();

    if (!res.ok)
    {
        alert("Error: " + result.error);
    }
    else
    {
        const statusEl = document.getElementById("status-message");
        statusEl.textContent = "Saved!";
        statusEl.classList.add("visible");
        setTimeout(() => statusEl.classList.remove("visible"), 5000);
        loadCategories();
    }
}

function extractMetadata (content)
{
    const regex = /^<!--\s*({[\s\S]*?})\s*-->\s*/;
    const match = content.match(regex);
    let metadata = {};
    let markdown = content;

    if (match)
    {
        try
        {
            metadata = JSON.parse(match[1]);
            markdown = content.slice(match[0].length);
        } catch (err)
        {
            console.warn("Failed to parse metadata:", err);
        }
    }

    return { ...metadata, markdown };
}

function formatWithMetadata (meta, markdown)
{
    const metadataBlock = `<!--\n${JSON.stringify(meta, null, 2)}\n-->\n\n`;
    return metadataBlock + markdown.trimStart();
}

const fileListEl = document.getElementById("file-list");

async function loadCategories ()
{
    const prevSelected = document.getElementById("category-select").value;
    const res = await fetch("/api/list-categories");
    const categories = await res.json();
    const select = document.getElementById("category-select");
    select.innerHTML = "";
    categories.forEach(cat =>
    {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });

    if (categories.includes(prevSelected))
    {
        select.value = prevSelected;
    }
    else if (categories.length > 0)
    {
        select.value = categories[0];
    }

    await loadFilesInCategory();
}

async function loadFilesInCategory ()
{
    const category = document.getElementById("category-select").value;
    fileListEl.innerHTML = "<li>Loading...</li>";

    const res = await fetch(`/api/list-markdown?category=${category}`);
    const files = await res.json();
    fileListEl.innerHTML = "";

    files.forEach((filePath) =>
    {
        const li = document.createElement("li");
        li.textContent = filePath.split("/").pop();
        li.style.cursor = "pointer";
        li.onclick = () =>
        {
            document.getElementById("markdown-path").value = filePath;
            loadFile();
        };
        fileListEl.appendChild(li);
    });
}

async function deleteFile ()
{
    const relPath = document.getElementById("markdown-path").value;
    if (!relPath) return alert("Enter file path to delete.");
    const ok = confirm(`Delete contents/${relPath}?`);
    if (!ok) return;
    const res = await fetch(`/api/delete-markdown?path=${encodeURIComponent(relPath)}`, {
        method: "DELETE",
    });
    const data = await res.json();
    if (res.ok)
    {
        alert("Deleted.");
        editor.setMarkdown("");
        document.getElementById("markdown-path").value = "";
        loadCategories();
    }
    else
    {
        alert("Error: " + data.error);
    }
}

loadCategories();

function generateDescription ()
{
    const markdown = editor.getMarkdown();
    const plainText = markdown
        .replace(/!\[.*?\]\(.*?\)/g, "")
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
        .replace(/[#>*_`~\-]/g, "")
        .replace(/\n+/g, " ")
        .trim();

    const words = plainText.split(/\s+/).slice(0, 50).join(" ");
    const description = words + (plainText.length > words.length ? "..." : "");

    document.getElementById("description").value = description;
}


function kebabCase (str)
{
    return str
        .normalize("NFKD")
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 60);
}

async function generateFilePath ()
{
    const category = document.getElementById("category-select").value;
    const title = document.getElementById("title").value.trim();

    if (!category || !title)
    {
        alert("Please select a category and enter a title.");
        return;
    }

    const slug = kebabCase(title);
    const res = await fetch(`/api/list-markdown?category=${category}`);
    const files = await res.json();
    const usedNumbers = new Set();

    files.forEach((filePath) =>
    {
        const normalized = filePath.replace(/\\/g, "/");
        const fileName = normalized.split("/").pop();
        const match = fileName.match(/^(\d+)-/);
        console.log(filePath);
        if (match)
        {
            usedNumbers.add(parseInt(match[1], 10));
        }
    });

    let nextNumber = 1;

    while (usedNumbers.has(nextNumber))
    {
        nextNumber++;
    }

    const fileName = `${nextNumber}-${slug}.md`;
    const fullPath = `${category}/${fileName}`;
    document.getElementById("markdown-path").value = fullPath;
}

function newEntry ()
{
    document.getElementById("markdown-path").value = "";
    document.getElementById("title").value = "";
    document.getElementById("time").value = "";
    document.getElementById("description").value = "";
    editor.setMarkdown("");
}

async function runScript (scriptName)
{
    const confirmed = confirm(`Run \`npm run ${scriptName}\`?`);
    if (!confirmed) return;

    try
    {
        const res = await fetch("/api/run-script", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ script: scriptName }),
        });

        const result = await res.json();
        if (res.ok)
        {
            alert(`Success:\n${result.output}`);
        } else
        {
            alert(`Failed:\n${result.error}`);
        }
    } catch (err)
    {
        console.error("Run script failed:", err);
        alert("Unexpected error running script.");
    }
}