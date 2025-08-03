
const { neon } = require('@neondatabase/serverless');

async function addEtaColumn() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Check if eta column exists
    const columnExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tracking_data' AND column_name = 'eta'
    `;
    
    if (columnExists.length === 0) {
      console.log('Adding eta column...');
      await sql`ALTER TABLE tracking_data ADD COLUMN eta text`;
      console.log('eta column added successfully!');
    } else {
      console.log('eta column already exists');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

addEtaColumn();
