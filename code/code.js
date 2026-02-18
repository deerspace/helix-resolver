// ========================================
// HELIX RESOLVER — STEP 1 (Manifest Test)
// ========================================

const MANIFEST_URL =
  "https://raw.githubusercontent.com/deerspace/helix-resolver/main/helix-manifest.json";

const MANIFEST_CACHE_KEY = "helix_manifest_cache";

async function loadManifest() {
  const response = await fetch(MANIFEST_URL);

  console.log("🔥 HELIX FETCH STATUS:", response.status);
  console.log("Fetch URL:", MANIFEST_URL);

  if (!response.ok) {
    throw new Error("Network response failed: " + response.status);
  }

  const manifest = await response.json();

  console.log("Loaded manifest:", manifest.version);
  return manifest;
}

async function main() {
  try {
    const manifest = await loadManifest();

    // STEP 6: Detect tagged nodes (ds: prefix)
    const allNodes = figma.currentPage.findAll();
    const taggedNodes = allNodes.filter(node =>
      typeof node.name === "string" && node.name.startsWith("ds:")
    );

    console.log("Found tagged nodes:", taggedNodes.length);

    taggedNodes.forEach(node => {
      console.log("Tagged node:", node.name);
    });

    figma.notify("Manifest loaded: " + manifest.version);
    console.log("Manifest contents:", manifest);
  } catch (err) {
    console.error(err);
  }

  figma.closePlugin();
}

main();