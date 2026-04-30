import "../style.css";

const threeSection = document.querySelector("#three-showcase");
const sceneMount = document.querySelector("#model-viewer");
const status = document.querySelector("#model-status");

let stopThreeScene = null;
let hasLoadedScene = false;

function canRunThreeJs() {
  return typeof window !== "undefined" && "WebGLRenderingContext" in window;
}

async function initThreeSection() {
  if (hasLoadedScene || !sceneMount) return;
  hasLoadedScene = true;

  if (!canRunThreeJs()) {
    if (status) {
      status.textContent =
        "3D preview unavailable on this device. Please try a newer browser.";
    }
    return;
  }

  try {
    if (status) status.textContent = "Loading 3D preview...";
    const module = await import("./three/scene.js");
    stopThreeScene = await module.mountThreeScene(sceneMount, { statusEl: status });
  } catch (error) {
    if (status) {
      status.textContent =
        "Could not load the 3D preview right now. Please refresh and try again.";
    }
    console.error("Failed to load Three.js section:", error);
  }
}

if (threeSection && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          initThreeSection();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.25 }
  );

  observer.observe(threeSection);
} else {
  initThreeSection();
}

window.addEventListener("beforeunload", () => {
  if (typeof stopThreeScene === "function") stopThreeScene();
});
