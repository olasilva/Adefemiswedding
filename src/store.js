import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
const sb = url && key ? createClient(url, key) : null

export const demo = !sb
export const CAP = 250
const LS = 'wedding_reservations'
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

export async function reserve(f) {
  if (!sb) {
    const c = tally(read())
    if (f.traditional && c.traditional + f.seats > CAP) {
      throw new Error('Not enough seats left for the Traditional Wedding')
    }
    const code = 'SL-' + Math.random().toString(36).slice(2, 7).toUpperCase()
    localStorage.setItem(LS, JSON.stringify([{ ...f, code, id: code, created_at: new Date().toISOString() }, ...read()]))
    return code
  }
  const { data, error } = await sb.rpc('reserve_seats', { 
    p_name: f.name, 
    p_phone: f.phone, 
    p_email: f.email, 
    p_seats: f.seats, 
    p_trad: f.traditional, 
    p_note: f.note 
  })
  if (error) throw new Error(error.message)
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

// Updated to only take a single password argument: 'wedding2027'
export async function adminLogin(p) {
  if (p !== 'wedding2027') throw new Error('Incorrect password')
  
  if (!sb) {
    sessionStorage.setItem('adm', '1')
    return
  }
  
  // If using Supabase, you still need to sign in with the email associated with the Supabase account
  // but we are verifying the password logic here.
  const { error } = await sb.auth.signInWithPassword({ 
    email: 'larade27@wedding.com', // You might need to hardcode your actual admin email here
    password: p 
  })
  if (error) throw error
}

export async function isAdmin() { 
  return sb ? !!(await sb.auth.getSession()).data.session : !!sessionStorage.getItem('adm') 
}

export async function adminLogout() { 
  sb ? await sb.auth.signOut() : sessionStorage.removeItem('adm') 
}