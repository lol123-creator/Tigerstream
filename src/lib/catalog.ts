import type { MediaItem, Movie, TvShow } from '@/types/media';

function ep(
  season: number,
  episode: number,
  title: string,
  overview: string,
  runtime: number,
): {
  season: number;
  episode: number;
  title: string;
  overview: string;
  runtime: number;
} {
  return { season, episode, title, overview, runtime };
}

export const movies: Movie[] = [
  {
    id: 786892,
    type: 'movie',
    title: 'Furiosa: A Mad Max Saga',
    tagline: 'Fury is born.',
    overview:
      'As the world falls, young Furiosa is snatched from the Green Place into the hands of a great biker horde led by the warlord Dementus.',
    poster_path: '/iADOJ8Zymht2JPMoy3R7xceZprc.jpg',
    backdrop_path: '/wNAhuOZ3Zf84jCIlrcI6JhgmY5q.jpg',
    release_date: '2024-05-22',
    runtime: 148,
    vote_average: 7.6,
    genres: ['Action', 'Adventure', 'Science Fiction'],
  },
  {
    id: 693134,
    type: 'movie',
    title: 'Dune: Part Two',
    tagline: 'Long live the fighters.',
    overview:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against those who destroyed his family.',
    poster_path: '/1pdfLvkbY9ohJlivj1HWTci3YgG.jpg',
    backdrop_path: '/xOMo8KRK7llFOcasTrL8SEMiMsh.jpg',
    release_date: '2024-02-27',
    runtime: 167,
    vote_average: 8.2,
    genres: ['Science Fiction', 'Adventure'],
  },
  {
    id: 872585,
    type: 'movie',
    title: 'Oppenheimer',
    tagline: 'The world forever changes.',
    overview:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_path: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    release_date: '2023-07-19',
    runtime: 181,
    vote_average: 8.1,
    genres: ['Drama', 'History'],
  },
  {
    id: 569094,
    type: 'movie',
    title: 'Spider-Man: Across the Spider-Verse',
    overview:
      'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    poster_path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdrop_path: '/4HodYYKEIsgDHDI7Phl0Q6XvH0.jpg',
    release_date: '2023-05-31',
    runtime: 140,
    vote_average: 8.4,
    genres: ['Animation', 'Action', 'Adventure'],
  },
  {
    id: 1022789,
    type: 'movie',
    title: 'Inside Out 2',
    overview:
      'Riley Andersen is entering her teenage years, and new Emotions join the headquarters of her mind.',
    poster_path: '/vpn1Ed2LbptcufGdlA4E6UVY0f6.jpg',
    backdrop_path: '/9BBTo63ANSmhOM6S5vG6ceXzhq2.jpg',
    release_date: '2024-06-12',
    runtime: 96,
    vote_average: 7.6,
    genres: ['Animation', 'Family', 'Comedy'],
  },
  {
    id: 823464,
    type: 'movie',
    title: 'Godzilla x Kong: The New Empire',
    overview:
      'Two ancient titans, Godzilla and Kong, clash in an epic battle as humans unravel their intertwined origins.',
    poster_path: '/z1p34vh7rqEXjdU0iHbxt23ylXo.jpg',
    backdrop_path: '/xRdNNXh95ozqvBzei1pGj8Q3mR0.jpg',
    release_date: '2024-03-27',
    runtime: 115,
    vote_average: 7.1,
    genres: ['Action', 'Science Fiction'],
  },
];

export const tvShows: TvShow[] = [
  {
    id: 76479,
    type: 'tv',
    title: 'The Boys',
    tagline: 'Never meet your heroes.',
    overview:
      'A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers.',
    poster_path: '/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg',
    backdrop_path: '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    first_air_date: '2019-07-25',
    vote_average: 8.4,
    genres: ['Action', 'Comedy', 'Crime'],
    seasons: [
      {
        season_number: 1,
        name: 'Season 1',
        episode_count: 8,
        episodes: [
          ep(1, 1, 'The Name of the Game', 'Meet Hughie Campbell.', 60),
          ep(1, 2, 'Cherry', 'The Boys get their first mission.', 59),
          ep(1, 3, 'Get Some', 'Homelander flexes his power.', 55),
          ep(1, 4, 'The Female of the Species', 'Butcher makes a discovery.', 58),
        ],
      },
      {
        season_number: 2,
        name: 'Season 2',
        episode_count: 8,
        episodes: [
          ep(2, 1, 'The Big Ride', 'The Boys are on the run.', 62),
          ep(2, 2, 'Proper Preparation and Planning', 'Stormfront arrives.', 59),
        ],
      },
    ],
  },
  {
    id: 1396,
    type: 'tv',
    title: 'Breaking Bad',
    tagline: 'Change the equation.',
    overview:
      'A high school chemistry teacher turned methamphetamine manufacturer partners with a former student.',
    poster_path: '/ggFHVNu6YYI5L9pCfOacjizxHFM.jpg',
    backdrop_path: '/tsRy63Mu5cu8etL1K7iH3anXLo.jpg',
    first_air_date: '2008-01-20',
    vote_average: 8.9,
    genres: ['Drama', 'Crime'],
    seasons: [
      {
        season_number: 1,
        name: 'Season 1',
        episode_count: 7,
        episodes: [
          ep(1, 1, 'Pilot', 'Walter White receives devastating news.', 58),
          ep(1, 2, "Cat's in the Bag...", 'Walter and Jesse deal with a body.', 48),
          ep(1, 3, '...And the Bag\'s in the River', 'A difficult choice looms.', 48),
        ],
      },
    ],
  },
  {
    id: 87108,
    type: 'tv',
    title: 'Chernobyl',
    overview:
      'The true story of one of the worst man-made catastrophes in history and the brave men and women who sacrificed to save Europe.',
    poster_path: '/hlLDE2lZQuf6l6sPo8m7B6K0A4V.jpg',
    backdrop_path: '/sWgBv7LV2PRoQgBKRXl6lBjzHlP.jpg',
    first_air_date: '2019-05-06',
    vote_average: 8.7,
    genres: ['Drama', 'History'],
    seasons: [
      {
        season_number: 1,
        name: 'Miniseries',
        episode_count: 5,
        episodes: [
          ep(1, 1, '1:23:45', 'An explosion rocks Chernobyl.', 65),
          ep(1, 2, 'Please Remain Calm', 'The scale becomes clear.', 65),
        ],
      },
    ],
  },
  {
    id: 100088,
    type: 'tv',
    title: 'The Last of Us',
    overview:
      'Twenty years after a fungal plague ravaged the planet, smuggler Joel is hired to escort Ellie across a post-apocalyptic United States.',
    poster_path: '/uKvVjHNqB5dmOrOqYC2uJa4tZH3.jpg',
    backdrop_path: '/9P50r99K8ygyg9kxKTxoWzd5DtU.jpg',
    first_air_date: '2023-01-15',
    vote_average: 8.5,
    genres: ['Drama', 'Sci-Fi & Fantasy'],
    seasons: [
      {
        season_number: 1,
        name: 'Season 1',
        episode_count: 9,
        episodes: [
          ep(1, 1, "When You're Lost in the Darkness", 'Joel meets Ellie.', 81),
          ep(1, 2, 'Infected', 'The journey begins.', 55),
          ep(1, 3, 'Long, Long Time', 'Bill and Frank.', 76),
        ],
      },
    ],
  },
  {
    id: 119051,
    type: 'tv',
    title: 'Shōgun',
    overview:
      'In Japan in the year 1600, Lord Yoshii Toranaga fights for his life as enemies unite against him.',
    poster_path: '/7O4iVfOMQmdCSxhOgNzrS8Y7f8M.jpg',
    backdrop_path: '/1meE7kSXhvQqwWPqvt9eb3dYDvH.jpg',
    first_air_date: '2024-02-27',
    vote_average: 8.6,
    genres: ['Drama', 'War & Politics'],
    seasons: [
      {
        season_number: 1,
        name: 'Season 1',
        episode_count: 10,
        episodes: [
          ep(1, 1, 'Anjin', 'A ship washes ashore in Japan.', 65),
          ep(1, 2, 'Servants of Two Masters', 'John Blackthorne navigates a new world.', 58),
        ],
      },
    ],
  },
];

export const allMedia: MediaItem[] = [...movies, ...tvShows];

export const featured: MediaItem = movies[0];

export function getMovie(id: number): Movie | undefined {
  return movies.find((m) => m.id === id);
}

export function getTvShow(id: number): TvShow | undefined {
  return tvShows.find((t) => t.id === id);
}

export function getMedia(id: number): MediaItem | undefined {
  return allMedia.find((m) => m.id === id);
}

export function searchCatalog(query: string): MediaItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return allMedia.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.overview.toLowerCase().includes(q) ||
      m.genres.some((g) => g.toLowerCase().includes(q)),
  );
}

export {
  movieDetailHref,
  tvDetailHref,
  watchMovieHref,
  watchTvHref,
} from '@/lib/routes';
