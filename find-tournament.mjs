import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://eufwzqccwjfxnvuttzqx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1Znd6cWNjd2pmeG52dXR0enF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzMwNzE1OSwiZXhwIjoyMDQ4ODgzMTU5fQ.RNwJfP8NeJEKLJ8Q64-DGJRqV8Pk8O_YWUl7OtLMEJA'
);

console.log('🔍 Finding SABO test tournament...');

const { data, error } = await supabase
  .from('tournaments')
  .select('id, name, status')
  .ilike('name', '%SABO Score Test%')
  .single();

if (error) {
  console.error('❌ Error:', error);
} else {
  console.log('✅ Tournament found:');
  console.log('ID:', data.id);
  console.log('Name:', data.name);
  console.log('Status:', data.status);
  console.log('🌐 URL: http://localhost:8000/tournaments/' + data.id);
}
