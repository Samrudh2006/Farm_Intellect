const fs = require('fs');
let sql = fs.readFileSync('supabase/full_database_setup_fixed.sql', 'utf8');
sql = sql.replace(/INSERT INTO public\.user_roles \(user_id, role\) VALUES \(NEW\.id, 'farmer'\);/g, 
  `INSERT INTO public.user_roles (user_id, role)\n  VALUES (\n    NEW.id,\n    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'farmer')\n  );`
);
fs.writeFileSync('supabase/full_database_setup_fixed.sql', sql);
fs.writeFileSync('C:/Users/HP/.gemini/antigravity/brain/de78a6a0-cbaa-4a96-9675-60d0f0f7371b/database_setup.md', '# Supabase Setup Script\n\nCopy this SQL and run it in the Supabase SQL Editor:\n\n```sql\n' + sql + '\n```\n');
console.log('Fixed trigger successfully.');
