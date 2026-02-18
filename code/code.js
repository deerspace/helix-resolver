// ========================================
// HELIX RESOLVER — FINAL (Replace Mode)
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

    const taggedNodes = figma.currentPage.findAll(
      node =>
        typeof node.name === "string" &&
        node.name.startsWith("ds:")
    );

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

      // Apply variant props
      if (parts.length > 1) {
        for (let i = 1; i < parts.length; i++) {
          const [propName, propValue] = parts[i].split("=");

          if (propName && propValue) {
            try {
              instance.setProperties({
                [propName]: propValue
              });
            } catch (err) {
              console.warn("Variant not found:", propName, propValue);
            }
          }
        }
      }

      // Replace original node
      instance.x = node.x;
      instance.y = node.y;

      figma.currentPage.appendChild(instance);
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