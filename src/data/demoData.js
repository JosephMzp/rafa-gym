// Demo data for development - will be replaced with Supabase queries

export const DEMO_USER = {
    id: '1',
    email: 'admin@rafagym.com',
    role: 'admin',
    name: 'Admin RafaGym'
}

export const LOCATIONS = [
    { id: 1, name: 'RafaGym - Sede Central', address: 'Av. Larco 1234, Miraflores', phone: '01-234-5678', capacity: 150, hours: 'Lun-Sab 5:00am - 10:00pm', services: ['Musculación', 'Cardio', 'Funcional', 'Pilates'], status: 'active' },
    { id: 2, name: 'RafaGym - Sede Norte', address: 'Av. Universitaria 567, Los Olivos', phone: '01-345-6789', capacity: 120, hours: 'Lun-Sab 5:00am - 10:00pm', services: ['Musculación', 'Cardio', 'Danza', 'Aeróbicos'], status: 'active' },
    { id: 3, name: 'RafaGym - Sede Sur', address: 'Av. Benavides 890, Surco', phone: '01-456-7890', capacity: 100, hours: 'Lun-Sab 6:00am - 9:00pm', services: ['Musculación', 'Cardio', 'Funcional'], status: 'active' }
]

export const MEMBERSHIP_TYPES = [
    { id: 1, name: 'Estándar', price: 89.90, duration_days: 30, color: '#94a3b8', features: ['Acceso a 1 sede', '1 ingreso/día', 'Zona de máquinas'], icon: '🥉' },
    { id: 2, name: 'Fit', price: 149.90, duration_days: 30, color: '#3b82f6', features: ['Acceso a todas las sedes', '1 ingreso/día', 'Asesoramiento', 'Clases grupales gratis'], icon: '🥈' },
    { id: 3, name: 'Gold', price: 219.90, duration_days: 30, color: '#f59e0b', features: ['Acceso ilimitado', 'Ingresos ilimitados', 'Asesoramiento', 'Clases grupales gratis', '5 invitados/mes'], icon: '🥇' }
]

export const CLIENTS = [
    { id: 1, name: 'Carlos Mendoza', document: '72345678', email: 'carlos@email.com', phone: '987654321', birth_date: '1995-03-15', address: 'Av. Brasil 456', emergency_contact: 'María Mendoza - 987654322', membership_type_id: 3, location_id: 1, start_date: '2026-01-01', end_date: '2026-03-01', status: 'active', photo: null },
    { id: 2, name: 'Ana García', document: '71234567', email: 'ana@email.com', phone: '976543210', birth_date: '1998-07-22', address: 'Calle Los Olivos 123', emergency_contact: 'Pedro García - 976543211', membership_type_id: 2, location_id: 2, start_date: '2026-02-01', end_date: '2026-03-03', status: 'active', photo: null },
    { id: 3, name: 'Luis Paredes', document: '70123456', email: 'luis@email.com', phone: '965432109', birth_date: '1990-11-08', address: 'Jr. Huancavelica 789', emergency_contact: 'Rosa Paredes - 965432110', membership_type_id: 1, location_id: 1, start_date: '2026-01-15', end_date: '2026-02-14', status: 'active', photo: null },
    { id: 4, name: 'María Torres', document: '69012345', email: 'maria.t@email.com', phone: '954321098', birth_date: '2000-01-30', address: 'Av. Arequipa 234', emergency_contact: 'José Torres - 954321099', membership_type_id: 2, location_id: 3, start_date: '2026-02-10', end_date: '2026-03-12', status: 'active', photo: null },
    { id: 5, name: 'Jorge Ramos', document: '68901234', email: 'jorge@email.com', phone: '943210987', birth_date: '1988-05-12', address: 'Av. Javier Prado 567', emergency_contact: 'Laura Ramos - 943210988', membership_type_id: 3, location_id: 2, start_date: '2026-01-20', end_date: '2026-02-19', status: 'inactive', photo: null },
    { id: 6, name: 'Sofía Vargas', document: '67890123', email: 'sofia@email.com', phone: '932109876', birth_date: '1997-09-05', address: 'Calle Las Begonias 890', emergency_contact: 'Carmen Vargas - 932109877', membership_type_id: 1, location_id: 3, start_date: '2026-02-20', end_date: '2026-03-22', status: 'active', photo: null },
    { id: 7, name: 'Diego Flores', document: '66789012', email: 'diego@email.com', phone: '921098765', birth_date: '1993-12-18', address: 'Av. Angamos 123', emergency_contact: 'Elena Flores - 921098766', membership_type_id: 2, location_id: 1, start_date: '2026-02-05', end_date: '2026-03-07', status: 'active', photo: null },
    { id: 8, name: 'Valentina Cruz', document: '65678901', email: 'valentina@email.com', phone: '910987654', birth_date: '2001-04-25', address: 'Jr. Lampa 456', emergency_contact: 'Roberto Cruz - 910987655', membership_type_id: 3, location_id: 2, start_date: '2026-02-15', end_date: '2026-03-17', status: 'active', photo: null }
]

export const ATTENDANCES = [
    { id: 1, client_id: 1, client_name: 'Carlos Mendoza', location_id: 1, location_name: 'Sede Central', date: '2026-03-01', time: '06:30', membership_type: 'Gold' },
    { id: 2, client_id: 2, client_name: 'Ana García', location_id: 2, location_name: 'Sede Norte', date: '2026-03-01', time: '07:15', membership_type: 'Fit' },
    { id: 3, client_id: 7, client_name: 'Diego Flores', location_id: 1, location_name: 'Sede Central', date: '2026-03-01', time: '08:00', membership_type: 'Fit' },
    { id: 4, client_id: 4, client_name: 'María Torres', location_id: 3, location_name: 'Sede Sur', date: '2026-03-01', time: '08:45', membership_type: 'Fit' },
    { id: 5, client_id: 6, client_name: 'Sofía Vargas', location_id: 3, location_name: 'Sede Sur', date: '2026-03-01', time: '09:30', membership_type: 'Estándar' },
    { id: 6, client_id: 8, client_name: 'Valentina Cruz', location_id: 2, location_name: 'Sede Norte', date: '2026-03-01', time: '10:00', membership_type: 'Gold' },
    { id: 7, client_id: 1, client_name: 'Carlos Mendoza', location_id: 1, location_name: 'Sede Central', date: '2026-02-28', time: '06:15', membership_type: 'Gold' },
    { id: 8, client_id: 2, client_name: 'Ana García', location_id: 2, location_name: 'Sede Norte', date: '2026-02-28', time: '07:30', membership_type: 'Fit' },
    { id: 9, client_id: 3, client_name: 'Luis Paredes', location_id: 1, location_name: 'Sede Central', date: '2026-02-28', time: '17:00', membership_type: 'Estándar' },
    { id: 10, client_id: 7, client_name: 'Diego Flores', location_id: 1, location_name: 'Sede Central', date: '2026-02-28', time: '18:30', membership_type: 'Fit' }
]

export const PAYMENTS = [
    { id: 1, client_id: 1, client_name: 'Carlos Mendoza', concept: 'Mensualidad Gold', amount: 219.90, method: 'Tarjeta', date: '2026-02-01', next_due: '2026-03-01', status: 'paid' },
    { id: 2, client_id: 2, client_name: 'Ana García', concept: 'Mensualidad Fit', amount: 149.90, method: 'Efectivo', date: '2026-02-01', next_due: '2026-03-03', status: 'paid' },
    { id: 3, client_id: 3, client_name: 'Luis Paredes', concept: 'Mensualidad Estándar', amount: 89.90, method: 'Yape', date: '2026-01-15', next_due: '2026-02-14', status: 'overdue' },
    { id: 4, client_id: 4, client_name: 'María Torres', concept: 'Mensualidad Fit', amount: 149.90, method: 'Transferencia', date: '2026-02-10', next_due: '2026-03-12', status: 'paid' },
    { id: 5, client_id: 5, client_name: 'Jorge Ramos', concept: 'Mensualidad Gold', amount: 219.90, method: 'Tarjeta', date: '2026-01-20', next_due: '2026-02-19', status: 'overdue' },
    { id: 6, client_id: 6, client_name: 'Sofía Vargas', concept: 'Mensualidad Estándar', amount: 89.90, method: 'Efectivo', date: '2026-02-20', next_due: '2026-03-22', status: 'paid' },
    { id: 7, client_id: 7, client_name: 'Diego Flores', concept: 'Mensualidad Fit', amount: 149.90, method: 'Yape', date: '2026-02-05', next_due: '2026-03-07', status: 'paid' },
    { id: 8, client_id: 8, client_name: 'Valentina Cruz', concept: 'Mensualidad Gold', amount: 219.90, method: 'Tarjeta', date: '2026-02-15', next_due: '2026-03-17', status: 'paid' }
]

export const CLASSES = [
    { id: 1, name: 'Pilates', instructor: 'Laura Ruiz', schedule: 'Lun, Mié, Vie 9:00-10:00', location_id: 1, location_name: 'Sede Central', capacity: 20, enrolled: 15, price_standard: 30, status: 'active' },
    { id: 2, name: 'Danza Fitness', instructor: 'Carmen López', schedule: 'Mar, Jue 18:00-19:00', location_id: 2, location_name: 'Sede Norte', capacity: 25, enrolled: 22, price_standard: 25, status: 'active' },
    { id: 3, name: 'Aeróbicos', instructor: 'Pedro Sánchez', schedule: 'Lun-Vie 7:00-8:00', location_id: 1, location_name: 'Sede Central', capacity: 30, enrolled: 18, price_standard: 20, status: 'active' },
    { id: 4, name: 'Yoga', instructor: 'Natalia Vega', schedule: 'Mar, Jue, Sab 8:00-9:00', location_id: 3, location_name: 'Sede Sur', capacity: 15, enrolled: 12, price_standard: 35, status: 'active' },
    { id: 5, name: 'Spinning', instructor: 'Marcos Rivera', schedule: 'Lun, Mié, Vie 19:00-20:00', location_id: 2, location_name: 'Sede Norte', capacity: 20, enrolled: 20, price_standard: 30, status: 'active' }
]

export const GUESTS = [
    { id: 1, name: 'Roberto Pérez', document: '75001234', host_client_id: 1, host_name: 'Carlos Mendoza', date: '2026-02-25', location_id: 1, location_name: 'Sede Central' },
    { id: 2, name: 'Lucía Chávez', document: '75002345', host_client_id: 8, host_name: 'Valentina Cruz', date: '2026-02-26', location_id: 2, location_name: 'Sede Norte' },
    { id: 3, name: 'Fernando Díaz', document: '75003456', host_client_id: 1, host_name: 'Carlos Mendoza', date: '2026-02-28', location_id: 1, location_name: 'Sede Central' }
]

export const ROUTINES = [
    { id: 1, client_id: 1, client_name: 'Carlos Mendoza', trainer: 'Miguel Ángel', objective: 'Ganancia muscular', level: 'Avanzado', duration: '8 semanas', days: ['Lun', 'Mar', 'Jue', 'Vie'], status: 'active', created_at: '2026-02-01' },
    { id: 2, client_id: 2, client_name: 'Ana García', trainer: 'Miguel Ángel', objective: 'Pérdida de peso', level: 'Intermedio', duration: '6 semanas', days: ['Lun', 'Mié', 'Vie'], status: 'active', created_at: '2026-02-10' },
    { id: 3, client_id: 4, client_name: 'María Torres', trainer: 'Patricia Gómez', objective: 'Tonificación', level: 'Principiante', duration: '4 semanas', days: ['Mar', 'Jue', 'Sab'], status: 'active', created_at: '2026-02-15' }
]

// Chart data for dashboard
export const MONTHLY_REVENUE = [
    { month: 'Sep', revenue: 8500 },
    { month: 'Oct', revenue: 9200 },
    { month: 'Nov', revenue: 10100 },
    { month: 'Dic', revenue: 9800 },
    { month: 'Ene', revenue: 11500 },
    { month: 'Feb', revenue: 12300 }
]

export const WEEKLY_ATTENDANCE = [
    { day: 'Lun', count: 85 },
    { day: 'Mar', count: 72 },
    { day: 'Mié', count: 90 },
    { day: 'Jue', count: 68 },
    { day: 'Vie', count: 95 },
    { day: 'Sab', count: 55 }
]

export const MEMBERSHIP_DISTRIBUTION = [
    { name: 'Estándar', value: 45, color: '#94a3b8' },
    { name: 'Fit', value: 35, color: '#3b82f6' },
    { name: 'Gold', value: 20, color: '#f59e0b' }
]
