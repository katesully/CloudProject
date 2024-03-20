const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');

app.use(express.static('public'));

// Example API endpoint for getting actor's details from TMDb
const tmdbApiKey = 'b4e019928e2da90fea8d583ca41bdd30';
const actorId = '1233'; // Replace with the ID of the actor you want to get details for
const actorUrl = `https://api.themoviedb.org/3/person/${actorId}?api_key=${tmdbApiKey}`;

// Example API endpoint for getting actor's movie credits from TMDb
const creditsUrl = `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${tmdbApiKey}`;

// Route handler for rendering the EJS template
app.get('/', async (req, res) => {
    try {
        // Fetch actor's details from TMDb
        const actorResponse = await axios.get(actorUrl);
        const actorName = actorResponse.data.name;

        // Fetch actor's movie credits from TMDb
        const creditsResponse = await axios.get(creditsUrl);
        const movies = creditsResponse.data.cast;

        // Calculate combined score for each movie and sort by score
        movies.forEach(movie => {
            // Adjust popularity to a scale between 0 and 1
            const normalizedPopularity = movie.popularity / 100;
            // Calculate score by multiplying place in cast list by adjusted popularity
            movie.score = (10 - movie.order) * (normalizedPopularity ** 2);
            // Extract release year from release_date
            movie.release_year = new Date(movie.release_date).getFullYear();
        });
        movies.sort((a, b) => b.score - a.score);

        // Get the top 5 movies based on combined score
        const top5Movies = movies.slice(0, 5);

        // Render the EJS template and pass the top 5 movies and actor's name
        res.render('index', { movies: top5Movies, actorName: actorName });
    } catch (error) {
        console.error('Error fetching data from TMDb:', error);
        res.status(500).send('Error fetching data from TMDb');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
