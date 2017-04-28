const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/sensehat';

const client = new pg.Client(connectionString);
client.connect();
const query = client.query(
  'CREATE TABLE items(id SERIAL PRIMARY KEY, datetime varchar(64), temperature real, humidity real, pressure real)');
query.on('end', () => { client.end(); });

