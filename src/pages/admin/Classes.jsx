import { useState, useEffect } from 'react'
import { FiUsers, FiClock, FiMapPin, FiUserPlus, FiX, FiSearch, FiTrash2, FiEye, FiAward } from 'react-icons/fi'
import { getClasses, getClassEnrollments, enrollClientInClass, unenrollClient, getFitGoldClients } from '../../lib/services'

export default function Classes() {
    var _classes = useState([])
    var _loading = useState(true)
    var _enrollModal = useState(null)
    var _viewModal = useState(null)
    var _enrollments = useState([])
    var _fitGoldClients = useState([])
    var _enrollSearch = useState('')
    var _enrolling = useState(false)
    var _loadingEnroll = useState(false)

    var classes = _classes[0], setClasses = _classes[1]
    var loading = _loading[0], setLoading = _loading[1]
    var enrollModal = _enrollModal[0], setEnrollModal = _enrollModal[1]
    var viewModal = _viewModal[0], setViewModal = _viewModal[1]
    var enrollments = _enrollments[0], setEnrollments = _enrollments[1]
    var fitGoldClients = _fitGoldClients[0], setFitGoldClients = _fitGoldClients[1]
    var enrollSearch = _enrollSearch[0], setEnrollSearch = _enrollSearch[1]
    var enrolling = _enrolling[0], setEnrolling = _enrolling[1]
    var loadingEnroll = _loadingEnroll[0], setLoadingEnroll = _loadingEnroll[1]

    useEffect(function () { loadData() }, [])

    async function loadData() {
        try {
            var data = await getClasses()
            setClasses(data)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    async function openEnrollModal(cls) {
        setEnrollModal(cls)
        setEnrollSearch('')
        setLoadingEnroll(true)
        try {
            var results = await Promise.all([getClassEnrollments(cls.id), getFitGoldClients()])
            setEnrollments(results[0])
            setFitGoldClients(results[1])
        } catch (err) { console.error(err) }
        finally { setLoadingEnroll(false) }
    }

    async function openViewModal(cls) {
        setViewModal(cls)
        setLoadingEnroll(true)
        try {
            var enrs = await getClassEnrollments(cls.id)
            setEnrollments(enrs)
        } catch (err) { console.error(err) }
        finally { setLoadingEnroll(false) }
    }

    async function handleEnroll(clientId) {
        if (!enrollModal) return
        setEnrolling(true)
        try {
            await enrollClientInClass(enrollModal.id, clientId)
            var enrs = await getClassEnrollments(enrollModal.id)
            setEnrollments(enrs)
            await loadData()
        } catch (err) {
            console.error(err)
            if (err.message && err.message.includes('duplicate')) {
                alert('Este cliente ya esta matriculado en esta clase')
            }
        }
        finally { setEnrolling(false) }
    }

    async function handleUnenroll(enrollmentId) {
        if (!window.confirm('¿Retirar a este cliente de la clase?')) return
        try {
            await unenrollClient(enrollmentId)
            if (enrollModal) {
                var enrs = await getClassEnrollments(enrollModal.id)
                setEnrollments(enrs)
            }
            if (viewModal) {
                var enrs2 = await getClassEnrollments(viewModal.id)
                setEnrollments(enrs2)
            }
            await loadData()
        } catch (err) { console.error(err) }
    }

    var enrolledIds = enrollments.map(function (e) { return e.client_id })
    var availableClients = fitGoldClients.filter(function (c) {
        var notEnrolled = enrolledIds.indexOf(c.id) === -1
        var matchSearch = !enrollSearch || c.name.toLowerCase().includes(enrollSearch.toLowerCase())
        return notEnrolled && matchSearch
    })

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Clases Grupales</h1>
                    <p className="page-subtitle">Gestiona las clases de pilates, danza, aerobicos y mas</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-lg)' }}>
                {classes.map(function (cls) {
                    var fill = cls.capacity > 0 ? Math.round((cls.enrolled / cls.capacity) * 100) : 0
                    return (
                        <div key={cls.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
                                <div>
                                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>{cls.name}</h3>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        Instructor: {cls.instructor}
                                    </div>
                                </div>
                                <span className={'badge ' + (cls.status === 'active' ? 'badge-success' : 'badge-neutral')}>
                                    {cls.status === 'active' ? 'Activa' : 'Inactiva'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: 'var(--space-lg)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    <FiClock size={14} /> {cls.schedule}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    <FiMapPin size={14} /> {cls.location_name}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    <FiUsers size={14} /> {cls.enrolled}/{cls.capacity} inscritos
                                </div>
                            </div>

                            <div style={{ marginBottom: 'var(--space-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.375rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Ocupacion</span>
                                    <span style={{ fontWeight: 600, color: fill >= 90 ? 'var(--danger)' : fill >= 70 ? 'var(--warning)' : 'var(--success)' }}>{fill}%</span>
                                </div>
                                <div style={{ height: 6, background: 'var(--dark-500)', borderRadius: 3, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', width: fill + '%',
                                        background: fill >= 90 ? 'var(--danger)' : fill >= 70 ? 'var(--warning)' : 'var(--success)',
                                        borderRadius: 3, transition: 'width var(--transition-base)'
                                    }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)', paddingBottom: 'var(--space-md)', borderBottom: '1px solid var(--border-subtle)' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Precio Estandar: </span>
                                    <span style={{ fontWeight: 700, color: 'var(--primary-400)' }}>S/ {Number(cls.price_standard).toFixed(0)}</span>
                                </div>
                                <span className="badge badge-info">Fit/Gold: Gratis</span>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                <button className="btn btn-sm btn-ghost" style={{ flex: 1 }} onClick={function () { openViewModal(cls) }}>
                                    <FiEye size={14} /> Ver Inscritos
                                </button>
                                <button className="btn btn-sm btn-primary" style={{ flex: 1 }} onClick={function () { openEnrollModal(cls) }}
                                    disabled={cls.enrolled >= cls.capacity}>
                                    <FiUserPlus size={14} /> Matricular
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {enrollModal && (
                <div className="modal-overlay" onClick={function () { setEnrollModal(null) }}>
                    <div className="modal modal-lg" onClick={function (e) { e.stopPropagation() }} style={{ maxWidth: 560, maxHeight: '85vh', overflow: 'auto' }}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Matricular en {enrollModal.name}</h2>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                                    Solo clientes con membresia Fit o Gold (gratis)
                                </p>
                            </div>
                            <button className="btn btn-ghost btn-icon" onClick={function () { setEnrollModal(null) }}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            {loadingEnroll ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner spinner-lg"></div></div>
                            ) : (
                                <>
                                    {enrollments.length > 0 && (
                                        <div style={{ marginBottom: 'var(--space-xl)' }}>
                                            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-md)' }}>
                                                Inscritos Actualmente ({enrollments.length})
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {enrollments.map(function (enr) {
                                                    return (
                                                        <div key={enr.id} style={{
                                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                            padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--dark-600)'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.6875rem' }}>
                                                                    {(enr.client?.name || '?').charAt(0)}
                                                                </div>
                                                                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{enr.client?.name}</span>
                                                            </div>
                                                            <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28, color: 'var(--danger)' }}
                                                                onClick={function () { handleUnenroll(enr.id) }} title="Retirar">
                                                                <FiTrash2 size={14} />
                                                            </button>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-md)' }}>
                                            Agregar Cliente Fit/Gold
                                        </h3>
                                        <div className="search-bar" style={{ marginBottom: 'var(--space-md)' }}>
                                            <span className="search-bar-icon"><FiSearch /></span>
                                            <input placeholder="Buscar cliente Fit o Gold..." value={enrollSearch}
                                                onChange={function (e) { setEnrollSearch(e.target.value) }} />
                                        </div>

                                        {availableClients.length === 0 && (
                                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem' }}>
                                                {fitGoldClients.length === 0 ? 'No hay clientes Fit/Gold registrados' : 'No hay clientes disponibles para matricular'}
                                            </p>
                                        )}

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {availableClients.map(function (client) {
                                                var mtColor = client.membership_type === 'Gold' ? '#f59e0b' : '#8b5cf6'
                                                return (
                                                    <div key={client.id} style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)',
                                                        background: 'var(--dark-600)', border: '1px solid var(--border-subtle)',
                                                        transition: 'border-color 0.2s'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                                            <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                                                                {client.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{client.name}</div>
                                                                <span className="badge" style={{
                                                                    background: mtColor + '20', color: mtColor,
                                                                    fontWeight: 600, fontSize: '0.625rem'
                                                                }}>
                                                                    <FiAward size={10} /> {client.membership_type}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button className="btn btn-sm btn-primary" onClick={function () { handleEnroll(client.id) }}
                                                            disabled={enrolling}>
                                                            <FiUserPlus size={14} /> Matricular
                                                        </button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {viewModal && (
                <div className="modal-overlay" onClick={function () { setViewModal(null) }}>
                    <div className="modal" onClick={function (e) { e.stopPropagation() }} style={{ maxWidth: 480 }}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Inscritos - {viewModal.name}</h2>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                                    {viewModal.enrolled}/{viewModal.capacity} inscritos
                                </p>
                            </div>
                            <button className="btn btn-ghost btn-icon" onClick={function () { setViewModal(null) }}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            {loadingEnroll ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner spinner-lg"></div></div>
                            ) : enrollments.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{'📋'}</div>
                                    No hay clientes inscritos en esta clase
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {enrollments.map(function (enr, idx) {
                                        return (
                                            <div key={enr.id} style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)',
                                                background: 'var(--dark-600)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: 20 }}>{idx + 1}</span>
                                                    <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                                                        {(enr.client?.name || '?').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{enr.client?.name}</div>
                                                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                                                            {new Date(enr.enrolled_at).toLocaleDateString('es-PE')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28, color: 'var(--danger)' }}
                                                    onClick={function () { handleUnenroll(enr.id) }} title="Retirar">
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={function () { setViewModal(null) }}>Cerrar</button>
                            <button className="btn btn-primary" onClick={function () { setViewModal(null); openEnrollModal(viewModal) }}>
                                <FiUserPlus size={14} /> Matricular Nuevo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
