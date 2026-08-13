const { Client } = require('pg');
const fs = require('fs');

async function runSQL() {
    const client = new Client({
        connectionString: 'postgresql://postgres:Vegetabletonnes%40Database@db.aqxmosvcxuuygndronqn.supabase.co:5432/postgres'
    });

    try {
        await client.connect();
        console.log('Connected to Supabase');
        
        const sql = fs.readFileSync('schema.sql', 'utf8');
        await client.query(sql);
        console.log('Schema created successfully');
        
    } catch (err) {
        console.error('Error executing SQL:', err);
    } finally {
        await client.end();
    }
}

runSQL();
