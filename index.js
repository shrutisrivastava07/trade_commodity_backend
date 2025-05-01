const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.get('/', (req, res) => {
    res.send('Trade commodity API is running!');
  });

const registerRoutes = (app, routes) => {
    routes.forEach(({ path, route }) => {
        app.use(path, route);
    });
};

registerRoutes(app, [
    { path: '/api/auth', route: require('./routes/auth.routes') },
    { path: '/api/trades', route: require('./routes/trade.routes') },
    { path: '/api/commodites', route: require('./routes/commodity.routes') },
]);

const PORT =  3000;

app.use(errorHandler);
db.sequelize.sync({ force: false }).then(() => {
  console.log('DB synced');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
