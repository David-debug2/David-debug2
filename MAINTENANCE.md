# How this profile updates

This profile combines a manually written [README](README.md) with two GitHub Actions workflows.

## Latest YouTube videos

[Refresh profile](.github/workflows/refresh-profile.yml) runs daily at **08:17 Asia/Manila**, on relevant changes to main, or when started manually from Actions.

The updater uses the official YouTube Data API to find the latest public uploads from **@Project-D-2026** and displays up to six video cards. It saves the results in [data/youtube.json](data/youtube.json) and updates only the README's video section. If a request fails, the previous successful results are kept. The API key is stored privately in GitHub Actions secrets.

## Contribution snake

[GitHub Snake Game](.github/workflows/contribution-snake.yml) runs daily at **08:00 Asia/Manila**, on every push to main, or manually from Actions.

It builds the snake animation from the account's actual GitHub contributions and reads GitHub's current contribution colors. The animations and palette metadata are published to the repository's [output branch](https://github.com/David-debug2/David-debug2/tree/output). If calendar validation fails, the previous published animations are kept.

## My Projects

The project section below the YouTube videos is managed by the owner's desktop project editor. Published project details are stored in [data/portfolio.json](data/portfolio.json), with images in assets/projects. The editor updates only the PROJECTS markers in the README, commits the changes, and pushes to main. Drafts remain on the owner's computer until published. The scheduled YouTube refresh preserves this section.

## Other authored content

The biography, links, language and tool badges, banner, and heading images are edited manually. Automatic updates preserve that content. Scheduled runs and image caches can delay when changes appear on the profile.
