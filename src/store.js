import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL, key = import.meta.env.VITE_SUPABASE_ANON_KEY
const sb = url && key ? createClient(url, key) : null
export const demo = !sb
export const CAP = 250
const LS = 'wedding_reservations'
const read = () => JSON.parse(localStorage.getItem(LS) || '[]')
const tally = (r) => ({ traditional: r.filter(x => x.traditional).reduce((a, x) => a + x.seats, 0), court: r.filter(x => x.court).reduce((a, x) => a + x.seats, 0) })

export async function counts() {
  if (!sb) return tally(read())
  const { data, error } = await sb.rpc('seat_counts'); if (error) throw error; return data
}
export async function reserve(f) {
  if (!sb) {
    const c = tally(read())
    if (f.traditional && c.traditional + f.seats > CAP) throw new Error('Not enough seats left for the Traditional Engagement')
    if (f.court && c.court + f.seats > CAP) throw new Error('Not enough seats left for the Court Wedding')
    const code = 'SL-' + Math.random().toString(36).slice(2, 7).toUpperCase()
    localStorage.setItem(LS, JSON.stringify([{ ...f, code, id: code, created_at: new Date().toISOString() }, ...read()]))
    return code
  }
  const { data, error } = await sb.rpc('reserve_seats', { p_name: f.name, p_phone: f.phone, p_email: f.email, p_seats: f.seats, p_trad: f.traditional, p_court: f.court, p_note: f.note })
  if (error) throw new Error(error.message); return data
}
export async function listRes() {
  if (!sb) return read()
  const { data, error } = await sb.from('reservations').select('*').order('created_at', { ascending: false }); if (error) throw error; return data
}
export async function removeRes(id) {
  if (!sb) return localStorage.setItem(LS, JSON.stringify(read().filter(x => x.id !== id)))
  const { error } = await sb.from('reservations').delete().eq('id', id); if (error) throw error
}
export async function adminLogin(u, p) {
  if (!sb) { if (p !== 'wedding2027') throw new Error('Wrong passcode'); sessionStorage.setItem('adm', '1'); return }
  const { error } = await sb.auth.signInWithPassword({ email: u, password: p }); if (error) throw error
}
export async function isAdmin() { return sb ? !!(await sb.auth.getSession()).data.session : !!sessionStorage.getItem('adm') }
export async function adminLogout() { sb ? await sb.auth.signOut() : sessionStorage.removeItem('adm') }
