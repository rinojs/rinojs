const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const fileList = document.getElementById("file-list");
const outputDirInput = document.getElementById("output-dir");
const form = document.getElementById("converter-form");
const outputDiv = document.getElementById("output");

let files = [];

dropZone.addEventListener("dragover", (e) =>
{
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () =>
{
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) =>
{
    e.preventDefault();
    dropZone.classList.remove("dragover");
    files = Array.from(e.dataTransfer.files);
    displayFiles(files);
});

dropZone.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) =>
{
    files = Array.from(e.target.files);
    displayFiles(files);
});

function displayFiles (files)
{
    fileList.innerHTML = "";
    files.forEach((file) =>
    {
        const li = document.createElement("li");
        li.textContent = file.name;
        fileList.appendChild(li);
    });
    dropZone.textContent = `${files.length} file(s) selected`;
}

form.addEventListener("submit", async (e) =>
{
    e.preventDefault();

    const outputDir = outputDirInput.value;
    const quality = document.getElementById("quality").value;

    if (!files.length)
    {
        alert("Please select at least one image.");
        return;
    }

    const formData = new FormData();
    formData.append("outputDir", outputDir);
    formData.append("quality", quality);
    files.forEach((file) => formData.append("images", file));

    try
    {
        const response = await fetch("/convert", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        if (response.ok)
        {
            outputDiv.innerHTML = `<p>${result.message}</p><pre>${JSON.stringify(result.files, null, 2)}</pre>`;
        } else
        {
            outputDiv.innerHTML = `<p>Error: ${result.error}</p>`;
        }
    } catch (err)
    {
        outputDiv.innerHTML = `<p>Unexpected error: ${err.message}</p>`;
    }
});

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