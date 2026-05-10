import { useState, useEffect } from 'react'
import { FiPlus } from 'react-icons/fi'
import {
    getClasses, createClass, updateClass,
    getClassEnrollments, enrollClientInClass, unenrollClient,
    getFitGoldClients, getLocations
} from '../../lib/services'

import ClassesGrid     from '../../components/Classes/ClassesGrid'
import ClassFormModal  from '../../components/Classes/ClassFormModal'
import ClassViewModal  from '../../components/Classes/ClassesViewModal'
import ClassEnrollModal from '../../components/Classes/ClassesEnrollModal'

export default function Classes() {
    const [classes,       setClasses]       = useState([])
    const [locations,     setLocations]     = useState([])
    const [loading,       setLoading]       = useState(true)
    const [saving,        setSaving]        = useState(false)

    // Modals
    const [formModal,    setFormModal]    = useState(null)   // null | {} (new) | cls (edit)
    const [enrollModal,  setEnrollModal]  = useState(null)
    const [viewModal,    setViewModal]    = useState(null)

    const [enrollments,     setEnrollments]     = useState([])
    const [fitGoldClients,  setFitGoldClients]  = useState([])
    const [enrollSearch,    setEnrollSearch]    = useState('')
    const [enrolling,       setEnrolling]       = useState(false)
    const [loadingEnroll,   setLoadingEnroll]   = useState(false)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const [cls, locs] = await Promise.all([getClasses(), getLocations()])
            setClasses(cls)
            setLocations(locs)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    /* ── Form (create / edit) ── */
    async function handleSaveClass(form) {
        setSaving(true)
        try {
            const payload = {
                name:          form.name.trim(),
                instructor:    form.instructor.trim(),
                location_id:   form.location_id,
                capacity:      Number(form.capacity),
                price_standard: Number(form.price_standard) || 0,
                days_of_week:  form.days_of_week,
                start_time:    form.start_time || null,
                end_time:      form.end_time   || null,
                status:        form.status,
            }
            if (form.id) {
                await updateClass(form.id, payload)
            } else {
                await createClass(payload)
            }
            setFormModal(null)
            await loadData()
        } catch (err) {
            console.error(err)
            alert('Error al guardar la clase: ' + (err.message || err))
        } finally { setSaving(false) }
    }

    /* ── Enroll modal ── */
    async function openEnrollModal(cls) {
        setEnrollModal(cls)
        setEnrollSearch('')
        setLoadingEnroll(true)
        try {
            const results = await Promise.all([getClassEnrollments(cls.id), getFitGoldClients()])
            setEnrollments(results[0])
            setFitGoldClients(results[1])
        } catch (err) { console.error(err) }
        finally { setLoadingEnroll(false) }
    }

    /* ── View modal ── */
    async function openViewModal(cls) {
        setViewModal(cls)
        setLoadingEnroll(true)
        try {
            const enrs = await getClassEnrollments(cls.id)
            setEnrollments(enrs)
        } catch (err) { console.error(err) }
        finally { setLoadingEnroll(false) }
    }

    async function handleEnroll(clientId) {
        if (!enrollModal) return
        setEnrolling(true)
        try {
            await enrollClientInClass(enrollModal.id, clientId)
            const enrs = await getClassEnrollments(enrollModal.id)
            setEnrollments(enrs)
            await loadData()
        } catch (err) {
            console.error(err)
            if (err.message?.includes('duplicate')) alert('Este cliente ya está matriculado en esta clase')
        } finally { setEnrolling(false) }
    }

    async function handleUnenroll(enrollmentId) {
        if (!window.confirm('¿Retirar a este cliente de la clase?')) return
        try {
            await unenrollClient(enrollmentId)
            if (enrollModal) setEnrollments(await getClassEnrollments(enrollModal.id))
            if (viewModal)   setEnrollments(await getClassEnrollments(viewModal.id))
            await loadData()
        } catch (err) { console.error(err) }
    }

    const enrolledIds = enrollments.map(e => e.client_id)
    const availableClients = fitGoldClients.filter(c => {
        const notEnrolled = !enrolledIds.includes(c.id)
        const matchSearch = !enrollSearch || c.name.toLowerCase().includes(enrollSearch.toLowerCase())
        return notEnrolled && matchSearch
    })

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Clases Grupales</h1>
                    <p className="page-subtitle">Gestiona las clases de pilates, danza, aeróbicos y más</p>
                </div>
                <button className="btn btn-primary" onClick={() => setFormModal({})}>
                    <FiPlus /> Nueva Clase
                </button>
            </div>

            <ClassesGrid
                classes={classes}
                onView={openViewModal}
                onEnroll={openEnrollModal}
                onEdit={(cls) => setFormModal(cls)}
            />

            {/* Form modal — create / edit */}
            {formModal !== null && (
                <ClassFormModal
                    cls={formModal?.id ? formModal : null}
                    locations={locations}
                    onSave={handleSaveClass}
                    onClose={() => setFormModal(null)}
                    saving={saving}
                />
            )}

            {enrollModal && (
                <ClassEnrollModal
                    cls={enrollModal}
                    enrollments={enrollments}
                    availableClients={availableClients}
                    loading={loadingEnroll}
                    enrolling={enrolling}
                    enrollSearch={enrollSearch}
                    onSearchChange={setEnrollSearch}
                    onClose={() => setEnrollModal(null)}
                    onEnroll={handleEnroll}
                    onUnenroll={handleUnenroll}
                />
            )}

            {viewModal && (
                <ClassViewModal
                    cls={viewModal}
                    enrollments={enrollments}
                    loading={loadingEnroll}
                    onClose={() => setViewModal(null)}
                    onUnenroll={handleUnenroll}
                    onOpenEnroll={() => { setViewModal(null); openEnrollModal(viewModal); }}
                />
            )}
        </div>
    )
}