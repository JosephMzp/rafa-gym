import { useState, useEffect, useCallback } from 'react'
import { FiPlus, FiActivity, FiTrendingDown, FiSliders, FiPercent } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { getClientMeasurements, createMeasurement } from '../../lib/services'
import ClientMeasurementChart from '../../components/ClientMeasurements/ClientMeasurementChart'
import ClientMeasurementsTable from '../../components/ClientMeasurements/ClientMeasurementsTable'
import ClientMeasurementFormModal from '../../components/ClientMeasurements/ClientMeasurementFormModal'

function StatCard({ icon: Icon, label, value, unit, color, delta }) {
    return (
        <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
                width: 46, height: 46, borderRadius: 'var(--radius-lg)',
                background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
            }}>
                <Icon size={20} color={color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>{label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                        {value ?? '—'}
                    </span>
                    {value != null && unit && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{unit}</span>
                    )}
                </div>
                {delta != null && (
                    <div style={{ fontSize: '0.72rem', color: delta <= 0 ? '#10b981' : '#ef4444', fontWeight: 600, marginTop: 2 }}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(1)}{unit} desde inicio
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ClientMeasurements() {
    const { user } = useAuth()
    const [measurements, setMeasurements] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)

    const loadMeasurements = useCallback(async () => {
        if (!user?.id) return
        setLoading(true)
        try {
            const data = await getClientMeasurements(user.id)
            // getClientMeasurements retorna ordenado ASC por measurement_date (para el gráfico)
            setMeasurements(data)
        } catch (err) {
            console.error('[ClientMeasurements] Error cargando medidas:', err)
        } finally {
            setLoading(false)
        }
    }, [user?.id])

    useEffect(() => {
        loadMeasurements()
    }, [loadMeasurements])

    const handleSave = async (form) => {
        if (!user?.id) {
            throw new Error("No se detectó un ID de cliente válido. Por favor recarga la página o vuelve a iniciar sesión.");
        }
        if (user?.isStaff) {
            throw new Error("Estás logueado como Staff. Solo los clientes pueden registrar medidas desde este portal.");
        }
        const rawPayload = {
            client_id: user.id,
            recorded_by: null,
            measurement_date: form.measurement_date,
            weight_kg: form.weight_kg,
            height_cm: form.height_cm,
            body_fat_pct: form.body_fat_pct,
            muscle_pct: form.muscle_pct,
            neck_cm: form.neck_cm,
            chest_cm: form.chest_cm,
            waist_cm: form.waist_cm,
            hip_cm: form.hip_cm,
            right_arm_cm: form.right_arm_cm,
            right_leg_cm: form.right_leg_cm,
            photo_front_url: form.photo_front_url || null,
            photo_side_url: form.photo_side_url || null,
            photo_back_url: form.photo_back_url || null,
            notes: form.notes || null,
        }

        const payload = Object.fromEntries(
            Object.entries(rawPayload).map(([k, v]) => {
                if (v === '' || v === undefined) return [k, null]
                if (
                    typeof v === 'string' &&
                    k !== 'measurement_date' &&
                    k !== 'notes' &&
                    !k.endsWith('url') &&
                    k !== 'client_id' &&
                    k !== 'recorded_by'
                ) {
                    const num = Number(v)
                    return [k, isNaN(num) ? null : num]
                }
                return [k, v]
            })
        )

        console.log('[ClientMeasurements] Enviando payload:', rawPayload)

        try {
            await createMeasurement(payload)
            setShowModal(false)
            await loadMeasurements()
        } catch (err) {
            console.error('[ClientMeasurements] Error al guardar:', err)
            // Re-lanzar con mensaje enriquecido para que el modal lo muestre
            const msg = err?.message || err?.error_description || JSON.stringify(err)
            throw new Error(msg)
        }
    }


    // ── Calcular stats para las tarjetas ────────────────────────────────────
    // Las medidas vienen en ASC, la última es la más reciente
    const latest = measurements[measurements.length - 1] ?? null
    const oldest = measurements[0] ?? null
    const weightDelta = (latest?.weight_kg != null && oldest?.weight_kg != null && measurements.length > 1)
        ? Number(latest.weight_kg) - Number(oldest.weight_kg)
        : null
    const fatDelta = (latest?.body_fat_pct != null && oldest?.body_fat_pct != null && measurements.length > 1)
        ? Number(latest.body_fat_pct) - Number(oldest.body_fat_pct)
        : null

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
                <div className="spinner spinner-lg" style={{ color: 'var(--primary-500)' }} />
            </div>
        )
    }

    return (
        <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--space-xl) var(--space-lg)' }}>

                {/* Page Header */}
                <div className="page-header" style={{ marginBottom: 'var(--space-xl)' }}>
                    <div>
                        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <FiActivity color="var(--primary-400)" /> Mis Medidas
                        </h1>
                        <p className="page-subtitle">
                            Registra y visualiza tu evolución física a lo largo del tiempo
                        </p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowModal(true)}
                        style={{ boxShadow: '0 4px 15px rgba(139,92,246,0.35)' }}
                    >
                        <FiPlus /> Registrar Nueva Medida
                    </button>
                </div>

                {/* Stats Cards */}
                {latest && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 'var(--space-md)',
                        marginBottom: 'var(--space-xl)'
                    }}>
                        <StatCard
                            icon={FiSliders}
                            label="Peso actual"
                            value={latest.weight_kg != null ? Number(latest.weight_kg).toFixed(1) : null}
                            unit="kg"
                            color="#8b5cf6"
                            delta={weightDelta}
                        />
                        <StatCard
                            icon={FiPercent}
                            label="% Grasa actual"
                            value={latest.body_fat_pct != null ? Number(latest.body_fat_pct).toFixed(1) : null}
                            unit="%"
                            color="#10b981"
                            delta={fatDelta}
                        />
                        <StatCard
                            icon={FiTrendingDown}
                            label="Cintura actual"
                            value={latest.waist_cm != null ? Number(latest.waist_cm).toFixed(1) : null}
                            unit="cm"
                            color="#06b6d4"
                            delta={null}
                        />
                        <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: 46, height: 46, borderRadius: 'var(--radius-lg)',
                                background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <FiActivity size={20} color="#f97316" />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>Total registros</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.5rem' }}>
                                    {measurements.length}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                    Última: {latest.measurement_date}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Gráfico de evolución */}
                <ClientMeasurementChart measurements={measurements} />

                {/* Tabla de historial */}
                <ClientMeasurementsTable measurements={measurements} />

            {/* Modal de nueva medida */}
            {showModal && (
                <ClientMeasurementFormModal
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </main>
    )
}
