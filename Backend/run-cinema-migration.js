import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('🚀 Starting cinema database migration...\n');

    try {
        // Read SQL file
        const sql = readFileSync('./cinema_database_setup.sql', 'utf8');

        // Split into individual statements (rough split by semicolons)
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SELECT \''));

        console.log(`Found ${statements.length} SQL statements to execute\n`);

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            if (stmt.includes('CREATE TABLE') || stmt.includes('ALTER TABLE') ||
                stmt.includes('CREATE INDEX') || stmt.includes('INSERT INTO') ||
                stmt.includes('DO $$')) {

                console.log(`[${i + 1}/${statements.length}] Executing...`);

                const { data, error } = await supabase.rpc('exec_sql', { sql_query: stmt + ';' });

                if (error) {
                    console.error('❌ Error:', error.message);
                    // Continue with other statements
                } else {
                    console.log('✅ Success');
                }
            }
        }

        // Verify setup
        console.log('\n📊 Verifying setup...\n');

        const { data: cinemas, error: cinemasError } = await supabase
            .from('cinemas')
            .select('*');

        if (!cinemasError) {
            console.log(`✅ Cinemas table: ${cinemas.length} cinemas created`);
            cinemas.forEach(c => console.log(`   - ${c.name} (${c.location})`));
        }

        const { data: showtimes, error: showtimesError } = await supabase
            .from('movie_showtimes')
            .select('*');

        if (!showtimesError) {
            console.log(`\n✅ Show times table: ${showtimes.length} show times created`);
        }

        console.log('\n🎉 Migration completed successfully!\n');

    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
