import pg from 'pg';


let connectionString =
  process.env.ENVIRONMENT == "local"
    ? process.env.DB_CONNECTIONSTRING_LOCAL
    : process.env.DB_CONNECTIONSTRING_PROD;

const client = new pg.Client(connectionString);

export async function setupDatabase() {
  try {
    
    await client.connect();

    // User table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        avatar TEXT,
        lastlogin TEXT
      );
    `);


    console.log('Database setup completed successfully.');
  } catch (error) {
    console.error('Error setting up database:', error.message);
  } finally {
    await client.end();
  }
}