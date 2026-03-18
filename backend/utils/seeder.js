const mongoose = require('mongoose');
require('dotenv').config();

const User    = require('../models/User');
const Movie   = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show    = require('../models/Show');

/* ─────────────── MOVIES ─────────────── */
const movies = [
  {
    title: 'Echoes of the Void',
    description: 'A deep space explorer discovers an ancient alien signal that holds the key to humanity\'s future—and its darkest secrets.',
    genre: ['Sci-Fi', 'Thriller'],
    languages: ['English', 'Hindi'],
    duration: 148,
    rating: 'UA',
    imdbRating: 8.4,
    director: 'Lyra Chen',
    cast: [{ name: 'Marcus Venn', role: 'Commander Drake' }, { name: 'Aria Solano', role: 'Dr. Vasquez' }],
    releaseDate: new Date('2025-01-15'),
    poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80',
    banner: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&q=80',
    trailer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    status: 'nowShowing',
    tags: ['space', 'alien', 'sci-fi']
  },
  {
    title: 'Neon Requiem',
    description: 'In a rain-soaked cyberpunk city, a detective hunts a ghost hacker who may not be entirely human.',
    genre: ['Action', 'Sci-Fi', 'Neo-Noir'],
    languages: ['English'],
    duration: 132,
    rating: 'A',
    imdbRating: 7.9,
    director: 'Soren Blackwood',
    cast: [{ name: 'Zayne Kira', role: 'Detective Mori' }, { name: 'Elara Fox', role: 'Ghost' }],
    releaseDate: new Date('2025-02-01'),
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
    banner: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80',
    trailer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    status: 'nowShowing',
    tags: ['cyberpunk', 'action', 'detective']
  },
  {
    title: 'The Last Ember',
    description: 'An epic fantasy saga where the last fire-keeper must forge an alliance with ancient dragons to prevent eternal winter.',
    genre: ['Fantasy', 'Adventure'],
    languages: ['English', 'Tamil'],
    duration: 178,
    rating: 'UA',
    imdbRating: 8.7,
    director: 'Idris Crane',
    cast: [{ name: 'Sasha Vael', role: 'Keeper Ryn' }, { name: 'Loras Tal', role: 'Elder Drakon' }],
    releaseDate: new Date('2025-01-20'),
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&q=80',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&q=80',
    trailer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    status: 'nowShowing',
    tags: ['fantasy', 'dragons', 'epic']
  },
  {
    title: 'Parallel Lives',
    description: 'Two strangers from parallel universes swap lives and must navigate each other\'s worlds before the rift closes forever.',
    genre: ['Romance', 'Sci-Fi', 'Drama'],
    languages: ['English', 'Hindi'],
    duration: 118,
    rating: 'UA',
    imdbRating: 7.5,
    director: 'Mila Park',
    cast: [{ name: 'Dev Arora', role: 'Arjun' }, { name: 'Nina Cross', role: 'Elena' }],
    releaseDate: new Date('2025-03-01'),
    poster: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80',
    banner: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80',
    trailer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    status: 'upcoming',
    tags: ['multiverse', 'romance', 'drama']
  },
  {
    title: 'Ironclad Protocol',
    description: 'Elite soldiers race against time to stop a rogue AI from launching a nuclear arsenal that could end civilization.',
    genre: ['Action', 'Thriller'],
    languages: ['English', 'Hindi'],
    duration: 124,
    rating: 'A',
    imdbRating: 7.2,
    director: 'Rex Holden',
    cast: [{ name: 'Blade Santos', role: 'Captain Voss' }, { name: 'Kira Dawn', role: 'Tech Specialist' }],
    releaseDate: new Date('2025-01-10'),
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80',
    banner: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=80',
    trailer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    status: 'nowShowing',
    tags: ['action', 'military', 'ai']
  },
  {
    title: 'Celestia: Origins',
    description: 'An animated epic following a young star-child who must unite the cosmic realms before darkness consumes the universe.',
    genre: ['Animation', 'Fantasy', 'Family'],
    languages: ['English', 'Hindi', 'Tamil'],
    duration: 105,
    rating: 'U',
    imdbRating: 8.1,
    director: 'Yuna Bright',
    cast: [{ name: 'Lumi Star', role: 'Celestia (voice)' }, { name: 'Orion Dale', role: 'The Wanderer (voice)' }],
    releaseDate: new Date('2025-02-14'),
    poster: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&q=80',
    banner: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1200&q=80',
    trailer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    status: 'upcoming',
    tags: ['animation', 'family', 'space']
  }
];

/* ─────────────── THEATRES ─────────────── */
const theatres = [
  {
    name: 'Nova Cineplex Mumbai',
    address: { street: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', zipCode: '400050' },
    phone: '+91-22-12345678',
    amenities: ['Dolby Atmos', 'IMAX', '4DX', 'Recliner Seats', 'Food Court'],
    screens: [
      { name: 'Screen 1', totalSeats: 100, rows: 10, columns: 10, seatLayout: [] },
      { name: 'Screen 2', totalSeats: 80,  rows: 8,  columns: 10, seatLayout: [] }
    ]
  },
  {
    name: 'Nova Cineplex Delhi',
    address: { street: 'Connaught Place', city: 'Delhi', state: 'Delhi', zipCode: '110001' },
    phone: '+91-11-87654321',
    amenities: ['Dolby Atmos', 'IMAX', 'Premium Lounge', 'Parking'],
    screens: [
      { name: 'Screen 1', totalSeats: 120, rows: 10, columns: 12, seatLayout: [] },
      { name: 'Screen 2', totalSeats: 80,  rows: 8,  columns: 10, seatLayout: [] }
    ]
  },
  {
    name: 'Nova Cineplex Bangalore',
    address: { street: 'MG Road', city: 'Bangalore', state: 'Karnataka', zipCode: '560001' },
    phone: '+91-80-11223344',
    amenities: ['Dolby Atmos', '3D', 'Recliner Seats', 'Sky Bar'],
    screens: [
      { name: 'Screen 1', totalSeats: 100, rows: 10, columns: 10, seatLayout: [] }
    ]
  }
];

/* ─────────────── SEED FUNCTION ─────────────── */
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/novacinema');
    console.log('✅ Connected to MongoDB');

    // Drop the movies collection completely to remove any bad indexes
    try {
      await mongoose.connection.db.dropCollection('movies');
      console.log('🗑️  Dropped movies collection (removes stale indexes)');
    } catch (e) {
      // Collection may not exist yet — that's fine
    }

    // Clear remaining collections
    await Promise.all([
      User.deleteMany({}),
      Theatre.deleteMany({}),
      Show.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Create users
    const adminUser = await User.create({
      name: 'Nova Admin',
      email: 'admin@novacinema.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91-9999999999'
    });

    await User.create({
      name: 'Test User',
      email: 'user@novacinema.com',
      password: 'User@123',
      role: 'user',
      phone: '+91-8888888888'
    });

    console.log('👤 Created users: admin@novacinema.com / Admin@123 | user@novacinema.com / User@123');

    // Create movies one-by-one using .create() so Mongoose casting runs properly
    const createdMovies = [];
    for (const movieData of movies) {
      const m = await Movie.create(movieData);
      createdMovies.push(m);
    }
    console.log(`🎬 Created ${createdMovies.length} movies`);

    // Create theatres
    const createdTheatres = [];
    for (const theatreData of theatres) {
      const t = await Theatre.create(theatreData);
      createdTheatres.push(t);
    }
    console.log(`🎭 Created ${createdTheatres.length} theatres`);

    // Create shows for nowShowing movies
    const nowShowingMovies = createdMovies.filter(m => m.status === 'nowShowing');
    const showTimes = ['10:00', '14:00', '18:00', '21:30'];
    const today = new Date();
    let showCount = 0;

    for (const movie of nowShowingMovies) {
      for (const theatre of createdTheatres) {
        for (let day = 0; day < 7; day++) {
          const showDate = new Date(today);
          showDate.setDate(showDate.getDate() + day);

          for (const time of showTimes.slice(0, 2)) {
            const screen = theatre.screens[0];
            const pricing = { standard: 200, premium: 350, recliner: 500 };
            const seats = [];
            const rowLetters = 'ABCDEFGHIJ';

            for (let r = 0; r < 10; r++) {
              for (let c = 1; c <= 10; c++) {
                const seatType = r < 2 ? 'recliner' : r < 5 ? 'premium' : 'standard';
                seats.push({
                  row: rowLetters[r],
                  seatNumber: c,
                  seatType,
                  price: pricing[seatType],
                  status: 'available'
                });
              }
            }

            await Show.create({
              movie: movie._id,
              theatre: theatre._id,
              screen: screen.name,
              showDate,
              showTime: time,
              pricing,
              seats,
              totalSeats: seats.length,
              availableSeats: seats.length,
              status: 'scheduled',
              format: day % 2 === 0 ? '2D' : '3D',
              language: movie.languages[0] || 'English'
            });
            showCount++;
          }
        }
      }
    }

    console.log(`🎪 Created ${showCount} shows`);
    console.log('\n🚀 NovaCinema seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin : admin@novacinema.com / Admin@123');
    console.log('User  : user@novacinema.com  / User@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    console.error(err);
    process.exit(1);
  }
};

seed();