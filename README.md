# ISM-4421-Suno — Suno Studio

A one-page AI music generator built on [SunoAPI.org](https://docs.sunoapi.org), ready to deploy on Netlify.

## Features

- **Simple mode**: describe a song and Suno writes the lyrics and music.
- **Custom mode**: supply your own title, lyrics (`[Verse]`, `[Chorus]`…) and style tags.
- **AI lyrics**: generate lyrics from a short theme, then edit them.
- **Instrumental** toggle, **model** picker (V6 / V6 Wild / V6 Mini / V5 / V4.5+ / V4.5) and **vocal gender**.
- **Advanced options**: excluded styles, style influence and weirdness.
- Two variations per request, with a streaming preview while the song renders, an in-page player, MP3 download, lyrics view and cover art.
- **Extend** any finished track from a chosen timestamp.
- Remaining **credit balance** in the header.
- History of your songs saved in your browser; unfinished jobs resume after a reload.
- Light and dark themes, mobile-friendly.

## Bring your own API key

Each user enters their own SunoAPI key (🔑 button, or the prompt on first visit).
Get one at <https://sunoapi.org/api-key>.

- The key is kept in the user's browser (localStorage if "Remember on this device" is on, otherwise sessionStorage for the tab).
- It's sent with each request to the site's Netlify Function (`netlify/functions/suno.mjs`), which forwards it to `api.sunoapi.org`. The server never stores it.

## Project layout

```
public/index.html                  # the whole front end (HTML/CSS/JS, no build step)
netlify/functions/suno.mjs         # proxy: generate, extend, lyrics, status, credits
netlify/functions/suno-callback.mjs# no-op receiver for Suno's required callBackUrl
netlify.toml                       # publish dir, functions dir, /api/suno route
```

## Deploy to Netlify

1. In Netlify, choose **Add new site → Import an existing project** and pick this repo.
2. Build settings are read from `netlify.toml`: publish directory `public`, no build command.
3. Deploy. No environment variables are needed.

## Run locally

```bash
npm i -g netlify-cli
netlify dev
```

Then open http://localhost:8888.
