const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCategories() {
  try {
    console.log('Checking categories in Supabase...')
    
    const { data: categories, error } = await supabase
      .from('Category')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return
    }

    console.log(`Found ${categories?.length || 0} categories:`)
    categories?.forEach(category => {
      console.log(`- ${category.name} (${category.id})`)
    })

    if (!categories || categories.length === 0) {
      console.log('No categories found. Running seed script...')
      const { exec } = require('child_process')
      exec('node scripts/seed-categories.js', (error, stdout, stderr) => {
        if (error) {
          console.error('Error running seed script:', error)
          return
        }
        console.log('Seed script output:', stdout)
        if (stderr) console.error('Seed script errors:', stderr)
      })
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

checkCategories()
