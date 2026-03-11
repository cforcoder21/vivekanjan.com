# vivekanjan.com

Project split by responsibility:

- `frontend/`: static website (HTML/CSS/images)
- `backend/`: future API/server code

## Current frontend layout

- `frontend/html/`: HTML pages
- `frontend/css/`: stylesheet files
- `frontend/assets/images/`: local image assets

This preserves existing relative paths from HTML to CSS (`../css/...`).
Image paths from HTML now point to `../assets/images/...`.

## How to open the site

- Main page: `frontend/html/index.html`
- Other pages are in the same `frontend/html/` folder.

For features that call remote APIs (like latest YouTube videos), prefer running via a local web server instead of opening the HTML directly as `file:///`.
