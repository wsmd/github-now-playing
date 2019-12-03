<h1 align="center">github-now-playing</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/github-now-playing">
    <img src="https://img.shields.io/npm/v/github-now-playing.svg" alt="Current Release" />
  </a>
  <a href="https://travis-ci.org/wsmd/github-now-playing">
    <img src="https://travis-ci.org/wsmd/github-now-playing.svg?branch=master" alt="CI Build">
  </a>
  <a href="https://coveralls.io/github/wsmd/github-now-playing?branch=master">
    <img src="https://coveralls.io/repos/github/wsmd/github-now-playing/badge.svg?branch=master" alt="Coverage Status">
  </a>
  <a href="https://github.com/wsmd/github-now-playing/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/wsmd/github-now-playing.svg" alt="Licence">
  </a>
</p>

<details>
<summary>📖 Table of Contents</summary>
<p>

- [Motivation](#motivation)
- [Installation](#installation)
- [Example](#example)
- [API](#api)
  - [Class: `GitHubNowPlaying`](#class-githubnowplaying)
    - [Constructor Options](#constructor-options)
    - [Methods](#methods)
      - [`nowPlaying.setSource(source)`](#nowplayingsetsourcesource)
      - [`nowPlaying.on(event, listener)`](#nowplayingonevent-listener)
      - [`nowPlaying.off(event, listener)`](#nowplayingoffevent-listener)
      - [`nowPlaying.listen()`](#nowplayinglisten)
      - [`nowPlaying.stop()`](#nowplayingstop)
  - [Sources Providers: `GitHubNowPlaying.Sources`](#sources-providers-githubnowplayingsources)
    - [`LastFM`](#lastfm)
    - [`ITunes`](#itunes)
    - [`Spotify`](#spotify)
  - [Events: `GitHubNowPlaying.Events`](#events-githubnowplayingevents)
    - [`Error`](#error)
    - [`ListenStart`](#listenstart)
    - [`ListenStop`](#listenstop)
    - [`StatusUpdated`](#statusupdated)
    - [`StatusCleared`](#statuscleared)

</p>
</details>

## Motivation

GitHub introduced a [new feature](https://github.blog/changelog/2019-01-09-set-your-status/) that allows you to set a status on your profile, so I thought it would be a cool idea if I could share the music I'm listening to — kind of like #NowPlaying — right on my GitHub profile!

<div align="center">
<img width="694" alt="Screen Shot 2019-04-09 at 7 28 36 PM" src="https://user-images.githubusercontent.com/2100222/70015382-2ffc0f00-154b-11ea-9b1f-3d492c81687d.png">
</div>

## Installation

This library is available on the [npm](https://www.npmjs.com/package/github-now-playing) registry as a [node](https://nodejs.org/en/) module and can be installed by running:

```sh
# via npm
npm install --save github-now-playing

# via yarn
yarn add github-now-playing
```

You also need to generate a [personal access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) with the **user** scope to allow this library to communicate with GitHub.

## Example

```ts
import { GitHubNowPlaying } from 'github-now-playing';

const nowPlaying = new GitHubNowPlaying({
 token: process.env.GITHUB_ACCESS_TOKEN,
});

// Create a new source to retrieve the track that is currently playing
const spotifySource = new GitHubNowPlaying.Sources.Spotify({
 // wait time in milliseconds between checks for any track changes
 updateFrequency: 1000,
});

// Make sure a source is set before calling listen()
nowPlaying.setSource(spotifySource);

// Don't forget to handle the error event!
nowPlaying.on(GitHubNowPlaying.Events.Error, error => {
  console.log('something went wrong');
});

// Listen to any track changes and update the profile status accordingly.
nowPlaying.listen();

// Don't forget to stop reporting any track changes when the process exists.
process.on('SIGINT', () => {
  // Calling the stop() method will clear the profile status.
  nowPlaying.stop()
});
```

## API

`github-now-playing` exposes a named export class `GitHubNowPlaying` that is also a namespace for various [source providers](#sources-providers-githubnowplayingsources) and [event names](#events-githubnowplayingevents).

### Class: `GitHubNowPlaying`

```ts
new GitHubNowPlaying(options: GitHubNowPlayingConstructorOptions)
```

Creates a new instance of `GitHubNowPlaying`.

#### Constructor Options

An object with the following keys:

- `token: string`: a [personal access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) with the **user** scope.

#### Methods

##### `nowPlaying.setSource(source)`

Assigns a [source provider object](#sources) from which the currently-playing track will be retrieved.

This method must be called before calling [`listen()`](#listen-void).

##### `nowPlaying.on(event, listener)`

Adds the `listener` function as an event handler for the named `event`. The `event` parameter can be one of the values available under the [`GitHubNowPlaying.Events` namespace](#events).

Returns a reference to the `GitHubNowPlaying` instance, so that calls can be chained.

##### `nowPlaying.off(event, listener)`

Removes the specified `listener` function for the named `event`.

The `event` parameter can be one of the values available under the [`GitHubNowPlaying.Events` namespace](#events).

Returns a reference to the `GitHubNowPlaying` instance, so that calls can be chained.

##### `nowPlaying.listen()`

Starts listening to any track changes coming from the specified source and updates the GitHub profile status accordingly.

The event `GitHubNowPlaying.Events.ListenStart` is emitted upon calling this method.

Additionally, every time the profile status is updated, the event `GitHubNowPlaying.Events.StatusUpdated` is emitted with the [profile status](https://github.com/wsmd/github-profile-status#userstatus) object.

Note that upon calling `listen()`, the profile status will be updated immediately to reflect the currently playing track.

##### `nowPlaying.stop()`

Stops listening to any track changes.

Calling this method will result in clearing the profile status if it has been already updated with a currently playing track.

If the status is cleared, the event `GitHubNowPlaying.Events.StatusCleared` is emitted, then followed by the event `GitHubNowPlaying.Events.ListenStop`.

This method is asynchronous and will resolve after clearing the profile status.

----

### Sources Providers: `GitHubNowPlaying.Sources`

`GitHubNowPlaying` relies on a source provider object that retrieves the currently playing track from a specific source.

These sources can be either local desktop applications, such [iTunes](https://www.apple.com/itunes/) or [Spotify](https://www.spotify.com/us/), or even via web APIs, such as Last.fm.

`GitHubNowPlaying` comes with built-in support for all of these sources. Note that support for desktop applications is currently limited to macOS.

The following sources are available under the namespace `GitHubNowPlaying.Sources`:

#### `LastFM`

Fetches information about the currently-playing track via Last.fm.

```js
const lastFmSource = new GitHubNowPlaying.Sources.LastFM({
 apiKey: process.env.LAST_FM_API_KEY, // Your Last.fm API key
 updateFrequency: 1000,
});

nowPlaying.setSource(lastFmSource);
```

#### `ITunes`

Fetches information about the currently-playing track in [iTunes](https://www.apple.com/itunes/).

```js
const iTunesSource = new GitHubNowPlaying.Sources.ITunes({
 updateFrequency: 1000,
});

nowPlaying.setSource(iTunesSource);
```

Platforms supported: macOS

#### `Spotify`

Fetches information about the currently-playing track in Spotify.

```js
const spotifySource = new GitHubNowPlaying.Sources.Spotify({
 updateFrequency: 1000,
});

nowPlaying.setSource(spotifySource);
```

Platforms supported: macOS

---

### Events: `GitHubNowPlaying.Events`

Instances of `GitHubNowPlaying` emit various events during the program life-cycle. You can add or remove event listeners via [`on()`](#nowplayingonevent-listener) and [`off()`](#nowplayingoffevent-listener) respectively.

#### `Error`

Emitted when an error occurs:

```ts
nowPlaying.on(GitHubNowPlaying.Events.Error, (error) => { /* ... */ });
```

#### `ListenStart`

Emitted when `GitHubNowPlaying` starts listening to track changes via the specified source:

```ts
nowPlaying.on(GitHubNowPlaying.Events.ListenStart, () => { /* ... */ });
```

#### `ListenStop`


Emitted when `GitHubNowPlaying` has stopped listening to track changes via the specified source:

```ts
nowPlaying.on(GitHubNowPlaying.Events.ListenStop, () => { /* ... */ });
```

#### `StatusUpdated`

Emitted when `GitHubNowPlaying` has updated the profile status with currently-playing track successfully. Listeners of this event are called with the [user-status object](https://github.com/wsmd/github-profile-status#userstatus).

```ts
nowPlaying.on(GitHubNowPlaying.Events.ListenStop, (status) => { /* ... */ });
```

#### `StatusCleared`


Emitted when `GitHubNowPlaying` has cleared the profile status after it has been updated with a currently playing track. This happens when the source provider reports that there are no tracks are currently playing, or when [`stop()`](#nowplayingstop) is called.

```ts
nowPlaying.on(GitHubNowPlaying.Events.StatusCleared, () => { /* ... */ });
```

# See Also

- [`github-profile-status`](https://github.com/wsmd/github-profile-status)

# License

MIT
