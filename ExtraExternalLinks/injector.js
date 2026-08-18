(() => {
    "use strict";

    /*
     * Paste this file into Jellyfin's JavaScript Injector.
     *
     * Change YOUR_USERNAME to your GitHub username after you create the repo.
     * Keep the repo public if you want to use jsDelivr.
     */
    const PROJECT_BASE =
        "https://cdn.jsdelivr.net/gh/morethanjustpeanuts/jellyfin-addons@main/ExtraExternalLinks/";

    const FILES = {
        css: "styles/external-links.css",
        config: "src/providers.js",
        app: "src/external-links.js",
    };

    function joinUrl(base, path) {
        return new URL(path, base).href;
    }

    function loadCSS(path) {
        const url = joinUrl(PROJECT_BASE, path);

        if (document.querySelector(`link[data-jellyfin-custom-css="${url}"]`)) {
            return;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;
        link.dataset.jellyfinCustomCss = url;
        document.head.appendChild(link);
    }

    function loadScript(path) {
        const url = joinUrl(PROJECT_BASE, path);

        if (document.querySelector(`script[data-jellyfin-custom-script="${url}"]`)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = url;
            script.async = false;
            script.dataset.jellyfinCustomScript = url;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load ${url}`));
            document.head.appendChild(script);
        });
    }

    window.JELLYFIN_CUSTOM_BASE = PROJECT_BASE;

    loadCSS(FILES.css);
    loadScript(FILES.config)
        .then(() => loadScript(FILES.app))
        .catch((error) => {
            console.error("[Jellyfin Custom]", error);
        });
})();
