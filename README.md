# Nǐ haǒ IRL

A playful first taste of Mandarin Chinese. Explore the characters 你 (you) and 好 (good), then try three everyday phrases with simplified Chinese, pinyin, English explanations, and optional pronunciation.

This preview includes a skippable, replayable animated intro, an interactive character playground, and keyboard controls for the phrase tabs. It respects the system’s reduced-motion preference and includes a pause button for background animation. Full lessons, quizzes, and games are planned for later.

## Run locally

Open `index.html` in a modern browser. You can also serve the project over HTTP from its root directory:

```sh
python3 -m http.server 8000
```

Then open [localhost:8000](http://localhost:8000/). The site needs no build step, application server, or database.

## Architecture

| File | Responsibility |
| --- | --- |
| `index.html` | Defines the intro, landing page, character playground, phrase tabs, and initial phrase card. Loads the stylesheet, script, and Google Fonts. |
| `styles.css` | Defines the visual theme, responsive layouts, animations, and reduced-motion styles. |
| `app.js` | Controls the intro, focus and motion settings, scroll reveals, character interactions, phrase selection, and pronunciation. Holds the three phrase records. |
| `favicon.svg` | Supplies the browser tab icon. |

The browser loads the HTML, CSS, and JavaScript directly. Selecting a phrase tab updates the existing card from the `phrases` object in `app.js`. Selecting **Hear it** passes the current phrase’s Chinese characters to the browser’s speech synthesis API. The app uses a Mandarin voice when one is available and displays a message otherwise. Google Fonts supplies the preferred typefaces, with local fallback fonts defined in the stylesheet.

To add a phrase, add a record to `phrases` in `app.js` and a tab in `index.html` whose `data-phrase` value matches the record key.
