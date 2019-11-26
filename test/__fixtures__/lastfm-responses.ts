export const expectedTrack = {
  title: 'foo',
  artist: 'bar',
};

export const trackCurrentlyPlaying = {
  recenttracks: {
    track: [
      {
        '@attr': {
          nowplaying: 'true',
        },
        name: expectedTrack.title,
        artist: {
          '#text': expectedTrack.artist,
        },
      },
    ],
  },
};

export const noTrackCurrentlyPlaying = {
  recenttracks: {
    track: [
      {
        name: expectedTrack.title,
        artist: {
          '#text': expectedTrack.artist,
        },
      },
    ],
  },
};
