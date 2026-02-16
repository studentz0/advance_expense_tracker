import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createTestUser() {
  const email = 'test-e2e@example.com'
  const password = 'password123'

  console.log(`Attempting to sign up ${email}...`)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    if (error.message.includes('already registered')) {
      console.log('User already exists.')
    } else {
      console.error('Error signing up:', error.message)
    }
  } else {
    console.log('User created successfully. Confirmation email sent (will be bypassed).')
  }
}

createTestUser()
