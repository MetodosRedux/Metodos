import pg from 'pg';


let connectionString =
  process.env.ENVIRONMENT == "local"
    ? process.env.DB_CONNECTIONSTRING_LOCAL
    : process.env.DB_CONNECTIONSTRING_PROD;

const client = new pg.Client(connectionString);

export async function setupDatabase() {
  try {
    
    await client.connect();

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Users" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        "pswHash" TEXT NOT NULL,
        email TEXT NOT NULL,
        avatar_id INTEGER REFERENCES "Avatar"(id),
        lightmode INTEGER DEFAULT 1,
        role TEXT DEFAULT 'user',
        "lastLogin" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );
    `);

    // Hair table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Hair" (
        id SERIAL PRIMARY KEY,
        type INTEGER NOT NULL,
        color TEXT NOT NULL
      );
    `);

    // Eyes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Eyes" (
        id SERIAL PRIMARY KEY,
        type INTEGER NOT NULL,
        color TEXT NOT NULL
      );
    `);

    // Avatar table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Avatar" (
        id SERIAL PRIMARY KEY,
        "hairColor" VARCHAR NOT NULL,
        "skinColor" VARCHAR NOT NULL,
        "eyeColor" VARCHAR NOT NULL,
        "eyebrowType" INTEGER NOT NULL
      );
    `);

    console.log('Database setup completed successfully.');
  } catch (error) {
    console.error('Error setting up database:', error.message);
  } finally {
    await client.end();
  }
}