import express from 'express';
import cors from 'cors';
import recipeRoutes from './routes/recipe.routes';
import './database/setupDatabase';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/all', recipeRoutes);

// Health check route
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});