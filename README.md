<h1 align="center">github-now-playing</h1>

<br />

<details>
<summary>📖 Table of Contents</summary>
<p>

- [Motivation](#motivation)
- [Usage](#usage)
- [Now Playing Sources](#now-playing-sources)
  - [Last.fm](#lastfm)
  - [iTunes](#itunes)
  - [Spotify](#spotify)
- [Authentication & Security Disclaimer](#authentication--security-disclaimer)

</p>
</details>

## Motivation

GitHub recently introduced a [new feature](https://github.blog/changelog/2019-01-09-set-your-status/) that allows users to set a status on their GitHub profile.

I built [`github-profile-status`](https://raw.githubusercontent.com/wsmd/github-profile-status) as a way to update that status programmatically to do all sort of cool stuff. I wanted to put it into use, and I though it would be a cool idea if I could share the music I'm listening to on my GitHub profile!

It's kind of like #NowPlaying but for GitHub!

<div align="center">
<img width="652" alt="Screen Shot 2019-04-09 at 7 28 36 PM" src="https://user-images.githubusercontent.com/2100222/55842350-16f8a680-5b01-11e9-9dc3-171980a091b2.png">
</div>

## Usage

```ts
import { GitHubNowPlaying, NowPlayingSources } from 'github-now-playing';

const nowPlaying = new GitHubNowPlaying({
  sessionCookie: process.env.GITHUB_SESSION_COOKIE,
});

// NowPlayingSources includes iTunes and Spotify as well
nowPlaying.source = new NowPlayingSources.LastFM({
  apiKey: process.env.LASTFM_API_KEY,
  updateFrequency: 1000,
});

// A new track was captured, and the profile status was updated successfully
nowPlaying.on(GitHubNowPlaying.Events.StatusUpdated, track => {
  console.log('status updated', track.title, track.artist);
});

// No tracks were captured, and the profile status was cleared successfully
nowPlaying.on(GitHubNowPlaying.Events.StatusCleared, () => {
  console.log('status cleared');
});

// Something went wrong!
nowPlaying.on(GitHubNowPlaying.Events.Error, error => {
  console.log('something went wrong');
});
```

## Now Playing Sources

`github-now-playing` supports the following sources from which the currently playing track will be fetched:

### Last.fm

Fetches information of the currently playing track from Last.fm.

```js
nowPlaying.source = new NowPlayingSources.LastFM({
  apiKey: process.env.LAST_FM_API_KEY,
  updateFrequency: 1000,
});
```

### iTunes

Fetches information of the current track playing in iTunes.

```js
nowPlaying.source = new NowPlayingSources.iTunes({
  updateFrequency: 1000,
});
```

Platforms supported: macOS

### Spotify

Fetches information of the current track playing in Spotify.

```js
nowPlaying.source = new NowPlayingSources.Spotify({
  updateFrequency: 1000,
});
```

Platforms supported: macOS

## Authentication & Security Disclaimer

I built this tool for my own personal use. Since this functionality is not provided by the GitHub API, there are a few points to highlight regarding authentication and security:

- This tool **does not use any of GitHub's official authentication methods**.
- This tool requires either the `user_session` cookie from an active login session of the user account or the user basic login information: username and password.
- This tool uses this information to imitate a user login via `https://github.com` and perform a status update/check.
- **It is highly encouraged that you provide this information using environment variables**, and not include them in your code.
- While this tool **does not persist or share** any of the information provided, it is very important that you are aware of this limitation. Please use at your own risk.

# License

MIT
