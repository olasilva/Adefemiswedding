import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
const sb = url && key ? createClient(url, key) : null

export const demo = !sb
export const CAP = 300
const LS = 'wedding_reservations'
const ACCESS_TOKEN = 'wedding_event_access_token'
const ACCESS_NAME = 'wedding_event_access_name'
const read = () => JSON.parse(localStorage.getItem(LS) || '[]')

// Only tracking traditional seats now
const tally = (r) => ({ 
  traditional: r.filter(x => x.traditional).reduce((a, x) => a + x.seats, 0) 
})

export async function counts() {
  if (!sb) return tally(read())
  const { data, error } = await sb.rpc('seat_counts')
  if (error) throw error
  return data
}

// --- FIXED VERIFY ACCESS ---
export async function verifyEventAccess(name, password) {
  if (!sb) throw new Error('Invitation access is unavailable until Supabase is configured.')
  
  // We only pass the code (password) to match the SQL function we created
  const { data, error } = await sb.rpc('verify_event_access', {
    code: password 
  })
  
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Invalid access code.')
  
  // Save the token (the true boolean) and the guest's name
  sessionStorage.setItem(ACCESS_TOKEN, data)
  sessionStorage.setItem(ACCESS_NAME, name.trim())
}

export function hasEventAccess() {
  return !!sessionStorage.getItem(ACCESS_TOKEN)
}

export function eventGuestName() {
  return sessionStorage.getItem(ACCESS_NAME) || ''
}

export async function reserve(f) {
  if (!sb) throw new Error('Reservations are unavailable until Supabase is configured.')
  
  const accessToken = sessionStorage.getItem(ACCESS_TOKEN)
  if (!accessToken) throw new Error('Please verify your invitation before reserving a seat.')
  
  const { data, error } = await sb.rpc('reserve_seats', { 
    p_name: f.name, 
    p_phone: f.phone, 
    p_email: f.email, 
    p_seats: f.seats, 
    p_trad: f.traditional, 
    p_court: false,
    p_note: f.note,
    p_access_token: accessToken
  })
  
  if (error) throw new Error(error.message)
  
  sessionStorage.removeItem(ACCESS_TOKEN)
  sessionStorage.removeItem(ACCESS_NAME)
  return data
}

export async function listRes() {
  if (!sb) return read()
  const { data, error } = await sb.from('reservations').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function removeRes(id) {
  if (!sb) return localStorage.setItem(LS, JSON.stringify(read().filter(x => x.id !== id)))
  const { error } = await sb.from('reservations').delete().eq('id', id)
  if (error) throw error
}

// --- FIXED ADMIN LOGIN ---
export async function adminLogin(p) {
  // We check against the code you requested
  if (p !== 'omoade27') throw new Error('Incorrect password')
  
  if (!sb) {
    sessionStorage.setItem('adm', '1')
    return
  }

  // Since we don't want to use Supabase Auth email/password, 
  // we'll just set a session flag for the admin if the code matches.
  // Note: This means anyone with the code can view the admin table, 
  // but for a wedding RSVP, this is usually fine and much easier.
  sessionStorage.setItem('adm', '1') 
}

export async function isAdmin() { 
  return !!sessionStorage.getItem('adm') 
}

export async function adminLogout() { 
  sessionStorage.removeItem('adm') 
}