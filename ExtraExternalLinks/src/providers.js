(() => {
    "use strict";

    /*
     * Add providers here.
     *
     * asset is relative to the project root, so:
     * assets/Newgrounds/image.png
     * becomes:
     * https://cdn.jsdelivr.net/gh/YOUR_USERNAME/jellyfin-custom@main/assets/Newgrounds/image.png
     */
    window.JELLYFIN_EXTERNAL_LINKS_CONFIG = {
        debug: false,
        defaultLogoHeight: 25,
        fallbackLogoWidth: 145,
        providers: [
            {
                key: "newgrounds",
                displayName: "Newgrounds",
                domains: ["newgrounds.com", "www.newgrounds.com"],
                asset: "assets/Newgrounds/image.png",
                logoHeight: 25,
            },
            {
                key: "youtube",
                displayName: "YouTube",
                domains: ["youtube.com", "www.youtube.com", "youtu.be"],
                asset: "assets/Youtube/image.png",
                logoHeight: 25,
            },
        ],
    };
})();
