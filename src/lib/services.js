import { supabase } from './supabase'

// ============================================
// AUTH
// ============================================
export async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: error.message }
    return { success: true, user: data.user, session: data.session }
}

export async function logoutUser() {
    const { error } = await supabase.auth.signOut()
    if (error) return { success: false, error: error.message }
    return { success: true }
}

export async function getUserProfile(userId) {
    // Check staff first - staff.id IS the auth.users.id
    const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('*, roles(name)')
        .eq('id', userId)
        .single()

    if (staffData) {
        const roleMap = { 'Administrador': 'admin', 'Recepcionista': 'receptionist', 'Entrenador': 'trainer' }
        return {
            id: staffData.id,
            name: staffData.name,
            email: staffData.email,
            phone: staffData.phone,
            photo_url: staffData.photo_url || null,
            role: roleMap[staffData.roles?.name] || 'admin',
            roleName: staffData.roles?.name || 'Staff',
            isStaff: true
        }
    }

    // Check clients - clients.user_id = auth.users.id
    const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (clientData) {
        return {
            id: clientData.id,
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone,
            photo_url: clientData.photo_url || null,
            document: clientData.document,
            birth_date: clientData.birth_date,
            address: clientData.address,
            emergency_contact: clientData.emergency_contact,
            location_id: clientData.location_id,
            role: 'client',
            roleName: 'Cliente',
            isStaff: false
        }
    }

    console.error('getUserProfile: No profile found for userId:', userId, 'Staff error:', staffError, 'Client error:', clientError)
    return null
}

// ============================================
// STAFF
// ============================================
export async function getStaff() {
    const { data, error } = await supabase.from('staff').select('*, roles(id, name)').order('name')
    if (error) { console.error('getStaff error:', error); return [] }
    return data || []
}

export async function getRoles() {
    const { data, error } = await supabase.from('roles').select('*').order('name')
    if (error) { console.error('getRoles error:', error); return [] }
    return data || []
}

export async function updateStaff(id, updates) {
    console.log('[updateStaff] Updating:', id, updates)
    const { data, error, count } = await supabase
        .from('staff')
        .update(updates)
        .eq('id', id)
        .select('id, photo_url')
    console.log('[updateStaff] Result:', { data, error, count })
    if (error) throw error
    return data
}

// ============================================
// LOCATIONS
// ============================================
export async function getLocations() {
    const { data, error } = await supabase.from('locations').select('*').order('name')
    if (error) { console.error('getLocations error:', error); return [] }
    return data || []
}

// ============================================
// EXERCISES
// ============================================
export async function getExercises() {
    const { data, error } = await supabase.from('exercises').select('*').order('name')
    if (error) { console.error('getExercises error:', error); return [] }
    return data || []
}

export async function createExercise(exercise) {
    const { data, error } = await supabase.from('exercises').insert(exercise).select()
    if (error) throw error
    return data
}

export async function updateExercise(id, updates) {
    console.log('[updateExercise] Updating:', id, updates)
    const { data, error } = await supabase.from('exercises').update(updates).eq('id', id).select()
    console.log('[updateExercise] Result:', { data, error })
    if (error) throw error
    return data
}

export async function deleteExercise(id) {
    const { error } = await supabase.from('exercises').delete().eq('id', id)
    if (error) throw error
    return true
}

// ============================================
// MEMBERSHIP TYPES
// ============================================
export async function getMembershipTypes() {
    const { data, error } = await supabase.from('membership_types').select('*').order('price')
    if (error) { console.error('getMembershipTypes error:', error); return [] }
    return data || []
}

// ============================================
// CLIENTS
// ============================================
export async function getClients() {
    const { data, error } = await supabase
        .from('clients')
        .select(`
            *,
            location:locations(id, name),
            client_memberships(
                id, start_date, end_date, status,
                membership_type:membership_types(id, name, price, color, icon)
            )
        `)
        .order('name')
    if (error) { console.error('getClients error:', error); return [] }
    return (data || []).map(c => {
        const activeMembership = c.client_memberships?.find(m => m.status === 'active')
        return {
            ...c,
            membership_type: activeMembership?.membership_type || null,
            membership_start: activeMembership?.start_date || null,
            membership_end: activeMembership?.end_date || null,
            membership_status: activeMembership?.status || 'none',
            location_name: c.location?.name || ''
        }
    })
}

export async function createClient(clientData) {
    const { data, error } = await supabase.from('clients').insert(clientData).select().single()
    if (error) throw error
    return data
}

export async function updateClient(id, updates) {
    const { data, error } = await supabase.from('clients').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error) throw error
    return data
}

export async function deleteClient(id) {
    const { error } = await supabase.from('clients').update({ status: 'inactive' }).eq('id', id)
    if (error) throw error
}

// ============================================
// CLIENT MEMBERSHIPS
// ============================================
export async function createClientMembership(data) {
    const { data: result, error } = await supabase.from('client_memberships').insert(data).select().single()
    if (error) throw error
    return result
}

// ============================================
// PAYMENTS
// ============================================
export async function getPayments() {
    const { data, error } = await supabase
        .from('payments')
        .select('*, client:clients(id, name)')
        .order('date', { ascending: false })
    if (error) { console.error('getPayments error:', error); return [] }
    return (data || []).map(p => ({ ...p, client_name: p.client?.name || '' }))
}

export async function createPayment(paymentData) {
    const { data, error } = await supabase.from('payments').insert(paymentData).select().single()
    if (error) throw error
    return data
}

// ============================================
// ATTENDANCES
// ============================================
export async function getAttendances() {
    const { data, error } = await supabase
        .from('attendances')
        .select(`
            *,
            client:clients(id, name, client_memberships(membership_type:membership_types(name))),
            location:locations(id, name)
        `)
        .order('check_in', { ascending: false })
    if (error) { console.error('getAttendances error:', error); return [] }
    return (data || []).map(a => ({
        ...a,
        client_name: a.client?.name || '',
        location_name: a.location?.name || '',
        membership_type: a.client?.client_memberships?.[0]?.membership_type?.name || '',
        date: new Date(a.check_in).toISOString().split('T')[0],
        time: new Date(a.check_in).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    }))
}

export async function createAttendance(data) {
    const { data: result, error } = await supabase.from('attendances').insert(data).select().single()
    if (error) throw error
    return result
}

// ============================================
// GUESTS
// ============================================
export async function getGuests() {
    const { data, error } = await supabase
        .from('guests')
        .select('*, host:clients!host_client_id(id, name), location:locations(id, name)')
        .order('visit_date', { ascending: false })
    if (error) { console.error('getGuests error:', error); return [] }
    return (data || []).map(g => ({
        ...g,
        host_name: g.host?.name || '',
        host_client_id: g.host?.id || g.host_client_id,
        location_name: g.location?.name || '',
        date: g.visit_date
    }))
}

export async function createGuest(guestData) {
    const { data, error } = await supabase.from('guests').insert(guestData).select().single()
    if (error) throw error
    return data
}

// ============================================
// CLASSES
// ============================================
export async function getClasses() {
    const { data, error } = await supabase
        .from('classes')
        .select('*, location:locations(id, name), class_enrollments(id)')
        .order('name')
    if (error) { console.error('getClasses error:', error); return [] }
    return (data || []).map(c => ({
        ...c,
        location_name: c.location?.name || '',
        enrolled: c.class_enrollments?.length || 0
    }))
}

export async function createClass(classData) {
    const { data, error } = await supabase.from('classes').insert(classData).select().single()
    if (error) throw error
    return data
}

export async function getClassEnrollments(classId) {
    const { data, error } = await supabase
        .from('class_enrollments')
        .select('*, client:clients(id, name, photo_url)')
        .eq('class_id', classId)
        .order('enrolled_at', { ascending: false })
    if (error) { console.error('getClassEnrollments error:', error); return [] }
    return data || []
}

export async function enrollClientInClass(classId, clientId) {
    const { data, error } = await supabase
        .from('class_enrollments')
        .insert({ class_id: classId, client_id: clientId, status: 'active' })
        .select()
        .single()
    if (error) throw error
    return data
}

export async function unenrollClient(enrollmentId) {
    const { error } = await supabase.from('class_enrollments').delete().eq('id', enrollmentId)
    if (error) throw error
    return true
}

export async function getFitGoldClients() {
    var response = await supabase
        .from('clients')
        .select(`
            id, name, email, document, photo_url,
            client_memberships!inner(
                id,
                status,
                membership_type:membership_types!inner(name)
            )
        `)
        .eq('client_memberships.status', 'active')
        .in('client_memberships.membership_types.short_name', ['gold', 'fit'])

    if (response.error) {
        console.error('Error fetching fit/gold clients:', response.error)
        return []
    }

    return response.data.map(function (c) {
        return {
            id: c.id,
            name: c.name,
            email: c.email,
            document: c.document,
            photo_url: c.photo_url,
            membership_type: c.client_memberships[0].membership_type.name
        }
    })
}

// ==========================================
// Dashboard Analytics Services
// ==========================================

export async function getActiveClientsWithMembershipView() {
    var res = await supabase.from('clientes_activos_con_membresia').select('*')
    if (res.error) { console.error('Error fetching active clients view:', res.error); return [] }
    return res.data
}

export async function getClassAttendanceStatsView() {
    var res = await supabase.from('class_attendance_stats').select('*')
    if (res.error) { console.error('Error fetching class stats view:', res.error); return [] }
    return res.data
}

export async function getMonthlyRevenueView() {
    var res = await supabase.from('monthly_revenue').select('*')
    if (res.error) { console.error('Error fetching monthly revenue view:', res.error); return [] }
    return res.data
}

// ============================================
// ROUTINES
// ============================================
export async function getRoutines() {
    const { data, error } = await supabase
        .from('routines')
        .select('*, client:clients(id, name)')
        .order('created_at', { ascending: false })
    if (error) { console.error('getRoutines error:', error); return [] }
    return (data || []).map(r => ({
        ...r,
        client_name: r.client?.name || '',
        trainer: r.trainer_name
    }))
}

export async function createRoutine(routineData) {
    const { data, error } = await supabase.from('routines').insert(routineData).select().single()
    if (error) throw error
    return data
}

export async function updateRoutine(id, updates) {
    const { data, error } = await supabase.from('routines').update(updates).eq('id', id).select()
    if (error) throw error
    return data
}

export async function deleteRoutine(id) {
    // First delete routine_exercises
    await supabase.from('routine_exercises').delete().eq('routine_id', id)
    const { error } = await supabase.from('routines').delete().eq('id', id)
    if (error) throw error
    return true
}

export async function getRoutineExercises(routineId) {
    const { data, error } = await supabase
        .from('routine_exercises')
        .select('*, exercises(id, name, muscle_group, equipment, image_url)')
        .eq('routine_id', routineId)
        .order('day')
        .order('order_index')
    if (error) { console.error('getRoutineExercises error:', error); return [] }
    return data || []
}

export async function saveRoutineExercises(routineId, exerciseList) {
    // Delete existing
    await supabase.from('routine_exercises').delete().eq('routine_id', routineId)
    if (!exerciseList || exerciseList.length === 0) return []
    // Insert new
    const rows = exerciseList.map(function(ex, i) {
        return {
            routine_id: routineId,
            exercise_id: ex.exercise_id,
            day: ex.day,
            sets: ex.sets,
            reps: ex.reps,
            rest_seconds: ex.rest_seconds,
            order_index: ex.order_index || (i + 1)
        }
    })
    const { data, error } = await supabase.from('routine_exercises').insert(rows).select()
    if (error) throw error
    return data
}

// ============================================
// DASHBOARD STATS
// ============================================
export async function getDashboardStats() {
    try {
        const [
            { data: clients, error: e1 },
            { data: activeClients, error: e2 },
            { data: todayAttendances, error: e3 },
            { data: payments, error: e4 },
            { data: expiringSoon, error: e5 }
        ] = await Promise.all([
            supabase.from('clients').select('id', { count: 'exact' }),
            supabase.from('clients').select('id', { count: 'exact' }).eq('status', 'active'),
            supabase.from('attendances').select('id', { count: 'exact' }).gte('check_in', new Date().toISOString().split('T')[0]),
            supabase.from('payments').select('amount, date, status'),
            supabase.from('client_memberships').select('id, end_date, client:clients(name)').eq('status', 'active')
                .lte('end_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        ])

        if (e1) console.error('Dashboard clients error:', e1)
        if (e2) console.error('Dashboard activeClients error:', e2)
        if (e3) console.error('Dashboard attendances error:', e3)
        if (e4) console.error('Dashboard payments error:', e4)
        if (e5) console.error('Dashboard expiring error:', e5)

        const thisMonth = new Date().toISOString().slice(0, 7)
        const monthlyRevenue = payments
            ?.filter(p => p.date?.startsWith(thisMonth) && p.status === 'paid')
            .reduce((sum, p) => sum + Number(p.amount), 0) || 0

        return {
            totalClients: clients?.length || 0,
            activeClients: activeClients?.length || 0,
            todayAttendances: todayAttendances?.length || 0,
            monthlyRevenue,
            expiringSoon: expiringSoon || []
        }
    } catch (err) {
        console.error('getDashboardStats error:', err)
        return { totalClients: 0, activeClients: 0, todayAttendances: 0, monthlyRevenue: 0, expiringSoon: [] }
    }
}
