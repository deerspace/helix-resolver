// ========================================
// HELIX RESOLVER — STEP 1 (Manifest Test)
// ========================================

const MANIFEST_URL =
  "https://raw.githubusercontent.com/deerspace/helix-resolver/main/helix-manifest.json";

const MANIFEST_CACHE_KEY = "helix_manifest_cache";

async function loadManifest() {
  try {
    const response = await fetch(MANIFEST_URL);

    console.log("🔥 HELIX FETCH STATUS:", response.status);
    console.log("Fetch URL:", MANIFEST_URL);

    if (!response.ok) {
      figma.notify("Fetch failed: " + response.status);
      throw new Error("Network response failed: " + response.status);
    }

    const contentType = response.headers.get("content-type");
    console.log("Content-Type:", contentType);

    const rawText = await response.text();
    console.log("Raw response (first 200 chars):", rawText.substring(0, 200));

    let manifest;
    try {
      manifest = JSON.parse(rawText);
    } catch (parseError) {
      console.error("JSON parse failed:", parseError);
      throw new Error("Invalid JSON returned from manifest URL");
    }


    console.log("Loaded manifest from network:", manifest.version);
    return manifest;

  } catch (error) {
    console.warn("Network fetch failed. Trying cache...");


    figma.notify("No manifest available.");
    throw new Error("Manifest unavailable");
  }
}

async function main() {
  try {
    const manifest = await loadManifest();
    figma.notify("Manifest loaded: " + manifest.version);
    console.log("Manifest contents:", manifest);
  } catch (err) {
    console.error(err);
  }

  figma.closePlugin();
}

main();