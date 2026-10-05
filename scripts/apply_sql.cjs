const fs = require('fs');

const MGMT_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!MGMT_TOKEN) throw new Error('Set SUPABASE_ACCESS_TOKEN before running this script.');

async function runSql(filePath) {
  try {
    const query = fs.readFileSync(filePath, 'utf8');
    const response = await fetch('https://api.supabase.com/v1/projects/djrdqhetzqleygfhccco/sql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MGMT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error on ${filePath}:`, errorText);
    } else {
      console.log(`Successfully applied: ${filePath}`);
    }
  } catch (error) {
    console.error(`Exception on ${filePath}:`, error.message);
  }
}

async function main() {
  console.log("Applying transaction_types...");
  await runSql('./supabase/migrations/20260414120000_transaction_types.sql');
  
  console.log("Applying articles_insert (blogs)...");
  await runSql('./articles_insert.sql');
}

main();
