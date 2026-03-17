const { Client } = require('../ai-analyzer/node_modules/pg');

async function setup() {
  const client = new Client({
    host: '100.97.103.94',
    port: 5432,
    user: 'postgres',
    password: 'Looser127001',
    database: 'postgres',
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL as admin.');

    // Check and create user
    const userRes = await client.query("SELECT 1 FROM pg_roles WHERE rolname='incident_user'");
    if (userRes.rowCount === 0) {
      await client.query("CREATE USER incident_user WITH PASSWORD 'incident_pass'");
      console.log('Created user: incident_user');
    } else {
      console.log('User incident_user already exists.');
    }

    // Check and create database
    // Note: CREATE DATABASE cannot be run inside a transaction or with certain other commands, 
    // but here we are running it directly.
    const dbRes = await client.query("SELECT 1 FROM pg_database WHERE datname='Nexus_database'");
    if (dbRes.rowCount === 0) {
      await client.query("CREATE DATABASE Nexus_database OWNER incident_user");
      console.log('Created database: Nexus_database');
    } else {
      console.log('Database Nexus_database already exists.');
    }

    await client.query("GRANT ALL PRIVILEGES ON DATABASE Nexus_database TO incident_user");
    console.log('Granted privileges to incident_user on Nexus_database database.');

  } catch (err) {
    console.error('Error during database setup:', err);
  } finally {
    await client.end();
  }
}

setup();
