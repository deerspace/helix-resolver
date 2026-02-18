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

      // STEP 7: Parse tag and look up manifest
      const tag = node.name.replace("ds:", "");
      const parts = tag.split(".");

      const componentName = parts[0];
      const variantToken = parts[1];

      console.log("Parsed component:", componentName);
      console.log("Parsed variant:", variantToken);

      const componentEntry = manifest.components[componentName];

      if (!componentEntry) {
        console.warn("Component not found in manifest:", componentName);
        return;
      }

      console.log("Component key from manifest:", componentEntry.key);
    });

    figma.notify("Manifest loaded: " + manifest.version);
    console.log("Manifest contents:", manifest);
  } catch (err) {
    console.error(err);
  }

  figma.closePlugin();
}

main();