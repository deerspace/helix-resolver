// ========================================
// HELIX RESOLVER — STEP 8 (Import Instance)
// ========================================

const MANIFEST_URL =
  "https://raw.githubusercontent.com/deerspace/helix-resolver/main/helix-manifest.json";

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
    const taggedNodes = allNodes.filter(
      node =>
        typeof node.name === "string" &&
        node.name.startsWith("ds:")
    );

    console.log("Found tagged nodes:", taggedNodes.length);

    for (const node of taggedNodes) {
      console.log("Tagged node:", node.name);

      // STEP 7: Parse tag
      const tag = node.name.replace("ds:", "");
      const parts = tag.split(".");

      const componentName = parts[0];
      const variantToken = parts[1];

      console.log("Parsed component:", componentName);
      console.log("Parsed variant:", variantToken);

      const componentEntry = manifest.components[componentName];

      if (!componentEntry) {
        console.warn("Component not found in manifest:", componentName);
        continue;
      }

      console.log("Component key from manifest:", componentEntry.key);

      // STEP 8: Import real component and create instance
      try {
        const component = await figma.importComponentByKeyAsync(
          componentEntry.key
        );

        const instance = component.createInstance();

        // Apply variant if applicable
        if (
          variantToken &&
          instance.variantProperties &&
          Object.keys(instance.variantProperties).length > 0
        ) {
          const variantPropName =
            Object.keys(instance.variantProperties)[0];

          instance.setProperties({
            [variantPropName]: variantToken
          });

          console.log(
            "Applied variant:",
            variantPropName,
            "=",
            variantToken
          );
        }

        // Position instance near original node
        instance.x = node.x + 40;
        instance.y = node.y + 40;

        figma.currentPage.appendChild(instance);

        console.log("Instance created for:", componentName);

      } catch (importError) {
        console.error("Failed to import component:", importError);
      }
    }

    figma.notify("Helix resolve complete");

  } catch (err) {
    console.error(err);
    figma.notify("Resolver error — check console");
  }

  figma.closePlugin();
}

main();