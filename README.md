# MarkdownDiff — marketing site

A static, dependency-free landing page for MarkdownDiff. Plain HTML/CSS/JS with
animated demos (the hero diff, the 3-panel merge) and real product screenshots —
no build step.

```
website/
├── index.html         # the page
├── css/site.css       # styles (light/dark, animations)
├── js/site.js         # theme toggle, scroll reveal, animated demos
├── assets/            # favicon + product screenshots
└── CNAME              # provisional custom domain (md.oxge.net)
```

## Preview locally

Any static server works:

```bash
cd website
python -m http.server 8099      # then open http://localhost:8099
# or: npx serve .
```

Append `?theme=light`, `?theme=dark`, or `?theme=auto` to force a theme.

## Deploy

It's fully static — host it anywhere (GitHub Pages, Netlify, Vercel, S3, nginx).

**GitHub Pages:** publish this `website/` folder (e.g. via an action or the
`/docs` convention). The `CNAME` file points the site at the provisional domain
`md.oxge.net`; set that domain's DNS to GitHub Pages (or your chosen host) to go
live. Replace it when the final domain is decided.

## Enabling the "Buy me a coffee" button

The footer support button is hidden until a URL is configured (mirroring the
app). Uncomment and set, in `index.html` just before `js/site.js`:

```html
<script>window.MDD_SUPPORT_URL = "https://www.buymeacoffee.com/<account>";</script>
```

## Updating the screenshots

`assets/app-light.png` / `assets/app-dark.png` are captures of the actual GUI:

```bash
markdowndiff-gui --no-open --port 4401
# then screenshot http://localhost:4401/?theme=light and ?theme=dark
```
