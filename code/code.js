// ========================================
// HELIX RESOLVER — PRODUCTION STABLE
// ========================================

const MANIFEST_URL =
  "https://raw.githubusercontent.com/deerspace/helix-resolver/main/helix-manifest.json?t=" + Date.now();

async function loadManifest() {
  const response = await fetch(MANIFEST_URL);

  if (!response.ok) {
    throw new Error("Network response failed: " + response.status);
  }

  return await response.json();
}

async function main() {
  try {
    const manifest = await loadManifest();

    const taggedNodes = figma.currentPage.findAll(function (node) {
      return (
        typeof node.name === "string" &&
        node.name.indexOf("ds:") === 0
      );
    });

    for (const node of taggedNodes) {

      const tag = node.name.replace("ds:", "");
      const parts = tag.split(".");

      const componentName = parts[0];
      const componentEntry = manifest.components[componentName];

      if (!componentEntry) {
        console.warn("Component not found:", componentName);
        continue;
      }

      const component = await figma.importComponentByKeyAsync(
        componentEntry.key
      );

      const instance = component.createInstance();

      // ==========================
      // Apply Variant Props Safely
      // ==========================

      if (parts.length > 1) {
        for (let i = 1; i < parts.length; i++) {

          const split = parts[i].split("=");

          if (split.length !== 2) continue;

          const rawPropName = split[0];
          const rawPropValue = split[1];

          const availableProps = instance.variantProperties;
          if (!availableProps) continue;

          let actualPropName = null;

          for (const key in availableProps) {
            if (key.toLowerCase() === rawPropName.toLowerCase()) {
              actualPropName = key;
              break;
            }
          }

          if (!actualPropName) continue;

          const mainComponent = instance.mainComponent;
          const variantDefs = mainComponent.variantProperties;

          let actualValue = null;

          if (
            variantDefs &&
            variantDefs[actualPropName] &&
            variantDefs[actualPropName].values
          ) {
            const values = variantDefs[actualPropName].values;

            for (let j = 0; j < values.length; j++) {
              if (
                values[j].toLowerCase() ===
                rawPropValue.toLowerCase()
              ) {
                actualValue = values[j];
                break;
              }
            }
          }

          if (!actualValue) continue;

          instance.setProperties({
            [actualPropName]: actualValue
          });
        }
      }

      // ==========================
      // Replace Placeholder Safely
      // ==========================

      const parent = node.parent;
      if (!parent) continue;

      const index = parent.children.indexOf(node);

      // Insert first to inherit correct coordinate space
      parent.insertChild(index, instance);

      // Match size
      instance.resize(node.width, node.height);

      const parentIsAutoLayout =
        parent.layoutMode === "HORIZONTAL" ||
        parent.layoutMode === "VERTICAL";

      if (parentIsAutoLayout) {
        // Preserve Auto Layout props
        if ("layoutAlign" in node) {
          instance.layoutAlign = node.layoutAlign;
        }

        if ("layoutGrow" in node) {
          instance.layoutGrow = node.layoutGrow;
        }
      } else {
        // Absolute positioning
        instance.x = node.x;
        instance.y = node.y;
      }

      // Preserve constraints
      if ("constraints" in node) {
        instance.constraints = node.constraints;
      }

      node.remove();
    }

    figma.notify("Helix resolve complete");

  } catch (err) {
    console.error(err);
    figma.notify("Resolver error — check console");
  }

  figma.closePlugin();
}

main();