# Maintaining the Project D profile

The profile is published from the public David-debug2/David-debug2 repository. Its root README is displayed by GitHub.

## Local checks

Use Node.js 24. No npm dependencies or install step are required.

- Run npm test for generator/API fixture checks.
- Run npm run generate to refresh the YouTube cache and generated VIDEOS section.
- Keep biography text outside the VIDEOS comment markers.
- The former project registry and stats SVGs are retained as historical files; they are no longer generated or displayed.
- Builder Stats, personal rank, project totals, channel-stat cards, their README markers, and the rank explanation were removed at the owner request. Automation updates only videos and preserves this removal.

## Enable YouTube updates

1. In Google Cloud, enable YouTube Data API v3 and create an API key restricted to that API.
2. In this repository, open Settings → Secrets and variables → Actions → New repository secret.
3. Name the secret YOUTUBE_API_KEY and paste the key there. Never put a key in a commit, issue, README, or workflow text.
4. Open Actions → Refresh profile → Run workflow on main.
5. Confirm that data/youtube.json has status ready, the correct channel ID and update date, and that the README shows the latest uploads and channel counts.

The updater resolves @Project-D-2026 with channels.list, requests the 50 most recent upload-playlist entries, verifies public video status, sorts by publication date, and displays up to six videos. Deleted/private uploads are omitted. Subscriber counts reflect YouTube public reporting precision; hidden counts are labelled. Channel views are the API’s channel-wide total, not a sum of the six displayed videos.

A missing key or failed request preserves the last successful data. Before the first successful request, the README explicitly says Awaiting first sync. The workflow prints a warning without logging API URLs or keys. The visible date identifies the last successful refresh; it does not advance on failure.

## Troubleshoot a stale YouTube section

A green Refresh profile run means the workflow completed; it does not prove that YouTube synchronization succeeded. The updater deliberately preserves previous data when a key is missing or an API request fails.

1. Open the latest Refresh profile run and inspect the Refresh profile step for a missing-key or refresh-failed warning. Do not paste credentials or authenticated API URLs into issues.
2. Confirm that the repository Actions secret is named YOUTUBE_API_KEY. If Google rejects requests, check that YouTube Data API v3 is enabled in the key's Google Cloud project and allowed by its API restrictions.
3. Run Refresh profile manually after correcting configuration. Check [data/youtube.json](data/youtube.json): status must be ready and updatedAt must identify a successful refresh. Confirm that the rendered README matches the cache.
4. If the section is still Awaiting first sync, activation remains pending. If older data remains, its displayed date is the last successful refresh, not the latest attempted run.

Local fixture tests verify failure handling but do not establish live API access. Never replace missing counts with guessed values.

## Automation

Refresh profile runs at 00:17 UTC (08:17 Asia/Manila) daily. GitHub Snake Game runs at 00:00 UTC (08:00 Asia/Manila) daily, manually, and on every push to main. Relevant pushes also trigger profile refresh. Scheduled GitHub runs can be delayed or disabled after prolonged repository inactivity; check the Actions page if the displayed date becomes old.

Jobs have bounded runtimes and only the generating job receives contents: write. Actions are pinned to verified commit hashes. The default GitHub token publishes updates; no personal token is needed. Profile updates stage only README.md and data/youtube.json. The full pinned Platane/snk action generates github-snake.svg, github-snake-dark.svg, and ocean.gif for github.repository_owner. The light-selected SVG uses a red snake; the dark-selected SVG and GIF use blue. All retain the dark reference background and empty cells, with contribution intensity colors read from GitHub’s current contributionCalendar.colors before generation. GitHub’s isHalloween flag is recorded for verification; no holiday date table is invented. The same fetched palette feeds both SVGs, their legends, and the GIF. scripts/snake-theme.mjs fetches the calendar/theme once and validates four intensity colors (or five entries including empty); scripts/style-snake.mjs frames the SVGs with actual calendar month/weekday labels and a Less–More legend, retaining the animation and contribution data. The GIF retains the upstream animation layout. Styling checks the official calendar dates against every SVG cell before publishing, and fails without replacing prior output if geometry/data do not match. The three animations plus public snake-theme.json palette/fetch metadata are committed to output through ordinary non-force pushes; existing output files/history are preserved. Do not force-push either branch.

## Languages, tools, and video cards

The README uses Shields.io `for-the-badge` logo badges for verified languages and tools used across Alea Rental, Vault OS, and this profile. Update the authored badge list in README.md when the actual stack changes. The older local language SVGs are retained but are no longer used by that section.

The VIDEOS section is generated as up to six compact 250px dark cards using ytcards.demolab.com, matching the supplied reference style. Video IDs, titles, publication times, and optional durations come from the official YouTube API cache. Titles are escaped in HTML and encoded in image URLs; valid durations are converted from YouTube ISO 8601 metadata to seconds. Missing durations are omitted. The channel Subscribe button stays outside the generated markers. The video section intentionally omits an Updated footer; successful-refresh dates remain in the cache. Preserve the authored tool caption I Used as of 2026:.

Shields.io and the video-card service are external image dependencies. If a card image is unavailable, its accessible title and direct YouTube link remain in the README. These services do not receive the API key. Before first successful API activation, the video section retains Awaiting first sync; styling does not establish that live synchronization worked.

## Banner

assets/project-d-dancing-lights.mp4 is the supplied original. assets/project-d-banner.gif is its full silent six-second loop, preserving aspect ratio. It is linked to the MP4 for playback. The animated banner is an image because README layouts cannot rely on a custom video player. Conversion used FFmpeg at 12 fps, width 960 px, with a 128-color palette and Bayer dithering. Retain the original and keep the GIF under 5 MB.

## Visual checks

Inspect the GitHub profile on wide and narrow screens, in light and dark themes. Confirm the banner animates, no content is clipped, thumbnails open the right videos, text equivalents accompany the SVG cards, and both contribution-snake variants load. A successful generator test does not establish live YouTube access or visual acceptance.

## Sources

- [GitHub profile README requirements](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme)
- [YouTube channels.list](https://developers.google.com/youtube/v3/docs/channels/list)
- [Platane/snk](https://github.com/Platane/snk)

## Seasonal colors

GitHub documents contributionCalendar.colors and isHalloween in its [GraphQL reference](https://docs.github.com/en/graphql/reference/users#contributioncalendar). On each existing daily/manual/main-push run, the live intensity palette replaces the former year-round amber colors. GitHub-selected changes are picked up on the next successful run, including normal colors after Halloween ends. This does not add event themes to GitHub’s native graph or guarantee themes for other holidays. Source colors are kept exactly for nonempty levels; the accepted dark canvas/empty color and red/blue snakes are retained. Invalid API responses stop publication and preserve the last successful artifacts. Check output/snake-theme.json and the workflow logs for the palette and fetch time; image caches may delay display.

## Animated heading emojis

The five heading symbols in README.md use local 28px images in [assets/emojis](assets/emojis/): animated Noto GIFs for brain, rocket, handshake, and television, and the Noto toolbox SVG with a gentle looping rocking transform. Keep descriptive alt text, the same heading labels, and the [artwork attribution and licenses](assets/emojis/ATTRIBUTION.md). The icons sit outside generated markers, so video refresh retains them.
