(() => {
    "use strict";

    const CONFIG = window.JELLYFIN_EXTERNAL_LINKS_CONFIG;
    const PROJECT_BASE = window.JELLYFIN_CUSTOM_BASE || document.currentScript?.src || "";

    if (!CONFIG || !Array.isArray(CONFIG.providers)) {
        console.error("[External Links] Missing provider config.");
        return;
    }

    const DEBUG = Boolean(CONFIG.debug);
    const URL_PATTERN = /https?:\/\/[^\s<>"']+/gi;
    const PROCESSED_ATTR = "data-jellyfin-external-links-processed";

    function log(...args) {
        if (DEBUG) {
            console.log("[External Links]", ...args);
        }
    }

    function absoluteUrl(path) {
        return new URL(path, PROJECT_BASE).href;
    }

    function normalizeHostname(hostname) {
        return hostname.toLowerCase().replace(/^www\./, "");
    }

    function normalizeUrl(url) {
        return url.replace(/[),.;\]]+$/g, "");
    }

    function providerForUrl(url) {
        let parsed;

        try {
            parsed = new URL(url);
        } catch {
            return null;
        }

        const hostname = normalizeHostname(parsed.hostname);

        return CONFIG.providers.find((provider) => {
            return provider.domains.some((domain) => {
                const normalizedDomain = normalizeHostname(domain);
                return hostname === normalizedDomain || hostname.endsWith(`.${normalizedDomain}`);
            });
        }) || null;
    }

    function findDetailRoot() {
        return document.querySelector(".detailPagePrimaryContainer")
            || document.querySelector(".itemDetailPage")
            || document.querySelector("[data-type='Movie']")
            || document.querySelector("main")
            || document.body;
    }

    function findDescription(root) {
        return root.querySelector(".overview")
            || root.querySelector(".itemOverview")
            || root.querySelector(".detailSectionContent")
            || root.querySelector(".readOnlyContent")
            || null;
    }

    function findExternalLinksContainer(root) {
        return root.querySelector(".itemExternalLinks")
            || document.querySelector(".itemExternalLinks")
            || createExternalLinksContainer(root);
    }

    function createExternalLinksContainer(root) {
        const container = document.createElement("div");
        container.className = "itemExternalLinks focuscontainer-x jellyfin-custom-external-links";

        const anchor = findDescription(root);
        if (anchor?.parentElement) {
            anchor.parentElement.insertBefore(container, anchor.nextSibling);
        } else {
            root.appendChild(container);
        }

        return container;
    }

    function collectProviderUrls(description) {
        const text = description.textContent || "";
        const matches = text.match(URL_PATTERN) || [];
        const links = [];

        for (const rawUrl of matches) {
            const url = normalizeUrl(rawUrl);
            const provider = providerForUrl(url);

            if (provider) {
                links.push({ provider, url });
            }
        }

        return links;
    }

    function removeProviderUrlsFromText(node) {
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        const textNodes = [];

        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }

        for (const textNode of textNodes) {
            textNode.nodeValue = textNode.nodeValue.replace(URL_PATTERN, (rawUrl) => {
                const url = normalizeUrl(rawUrl);
                return providerForUrl(url) ? "" : rawUrl;
            });
        }

        node.normalize();
    }

    function externalLinkExists(container, url) {
        return Boolean(container.querySelector(`a[href="${CSS.escape(url)}"]`));
    }

    function findTemplateLink(container) {
        return container.querySelector("a[href]")
            || document.querySelector(".itemExternalLinks a[href]");
    }

    function createProviderLink(container, provider, url) {
        const template = findTemplateLink(container);
        const link = template ? template.cloneNode(true) : document.createElement("a");

        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = provider.displayName;
        link.title = provider.displayName;
        link.dataset.providerKey = provider.key;
        link.classList.add("jellyfin-provider-link");
        link.style.setProperty("--provider-logo", `url("${absoluteUrl(provider.asset)}")`);

        return link;
    }

    function addProviderLinks(root, links) {
        const container = findExternalLinksContainer(root);

        for (const { provider, url } of links) {
            if (externalLinkExists(container, url)) {
                continue;
            }

            container.appendChild(createProviderLink(container, provider, url));
            log("Added provider link", provider.displayName, url);
        }
    }

    function processDetailPage() {
        const root = findDetailRoot();
        const description = findDescription(root);

        if (!description || description.getAttribute(PROCESSED_ATTR) === location.href) {
            return;
        }

        const links = collectProviderUrls(description);

        if (links.length === 0) {
            description.setAttribute(PROCESSED_ATTR, location.href);
            return;
        }

        addProviderLinks(root, links);
        removeProviderUrlsFromText(description);
        description.setAttribute(PROCESSED_ATTR, location.href);
    }

    let pending = 0;

    function scheduleProcess() {
        window.clearTimeout(pending);
        pending = window.setTimeout(processDetailPage, 250);
    }

    scheduleProcess();

    const observer = new MutationObserver(scheduleProcess);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    window.addEventListener("hashchange", scheduleProcess);
    window.addEventListener("popstate", scheduleProcess);
})();
