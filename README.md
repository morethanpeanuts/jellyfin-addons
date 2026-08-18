# Jellyfin Custom External Links

This project lets one Jellyfin JavaScript Injector entry load your custom external-link behavior, provider configuration, CSS, and provider logo assets from GitHub.

## How It Works

Jellyfin only needs the small script in `injector.js`.

That script loads:

```text
styles/external-links.css
src/providers.js
src/external-links.js
```

The provider config lives in `src/providers.js`. Each provider maps a display name, one or more domains, and a logo asset path:

```javascript
{
    key: "newgrounds",
    displayName: "Newgrounds",
    domains: ["newgrounds.com", "www.newgrounds.com"],
    asset: "assets/Newgrounds/image.png",
}
```

The scanner in `src/external-links.js` looks for configured provider URLs in a Jellyfin detail-page description, removes those raw URLs from the description, and adds Jellyfin-style external-link buttons for them.

## Why There Is Still A Small Loader

Browser JavaScript does not have a plain `@import` syntax like CSS.

There is ES module `import`, but it can be awkward inside Jellyfin script injection because module loading, execution order, and cross-origin headers can be stricter than normal scripts.

So this project uses the most reliable setup:

1. Paste one small classic script into Jellyfin.
2. That script loads the CSS.
3. That script loads provider config first.
4. That script loads the external-link behavior second.

That gives you one Jellyfin entry while keeping the GitHub project easy to edit.

## Project Structure

```text
jellyfin-custom
├── README.md
├── injector.js
├── src
│   ├── providers.js
│   └── external-links.js
├── styles
│   └── external-links.css
└── assets
    ├── Newgrounds
    │   └── image.png
    └── Youtube
        └── image.png
```

## Create The GitHub Project

1. Go to GitHub and create a new repository.
2. Name it:

```text
jellyfin-custom
```

3. Set it to `Public`.
4. Add these files and folders to the repository.
5. Upload your provider images:

```text
assets/Newgrounds/image.png
assets/Youtube/image.png
```

## Update The Injector URL

Open `injector.js` and change this:

```javascript
const PROJECT_BASE =
    "https://cdn.jsdelivr.net/gh/YOUR_USERNAME/jellyfin-custom@main/";
```

to your real GitHub username:

```javascript
const PROJECT_BASE =
    "https://cdn.jsdelivr.net/gh/my-github-name/jellyfin-custom@main/";
```

## Paste Into Jellyfin

In Jellyfin JavaScript Injector, paste the full contents of `injector.js`.

That is the only Jellyfin-side script you need.

## Add A New Provider

1. Create a new folder:

```text
assets/ProviderName/image.png
```

2. Add a provider entry in `src/providers.js`:

```javascript
{
    key: "providername",
    displayName: "Provider Name",
    domains: ["provider.com", "www.provider.com"],
    asset: "assets/ProviderName/image.png",
}
```

3. Commit the changes to GitHub.

## Cache Notes

jsDelivr caches GitHub files. If you change a file and Jellyfin does not update right away, purge the URL at:

```text
https://www.jsdelivr.com/tools/purge
```

You can purge specific files, such as:

```text
https://cdn.jsdelivr.net/gh/YOUR_USERNAME/jellyfin-custom@main/src/providers.js
```

## Troubleshooting

If links do not appear:

1. Make sure the raw provider URL is in the Jellyfin item description.
2. Make sure the provider domain is listed in `src/providers.js`.
3. Open the browser console and temporarily set `debug: true` in `src/providers.js`.
4. Make sure the asset file exists at the configured path.
5. Make sure the GitHub repository is public.
