import { useState, useEffect } from 'react'
import { getClasses, getClassEnrollments, enrollClientInClass, unenrollClient, getFitGoldClients } from '../../lib/services'

import ClassesGrid from '../../components/Classes/ClassesGrid'
import ClassViewModal from '../../components/Classes/ClassesViewModal'
import ClassEnrollModal from '../../components/Classes/ClassesEnrollModal'

export default function Classes() {
    const [classes, setClasses] = useState([])
    const [loading, setLoading] = useState(true)

    const [enrollModal, setEnrollModal] = useState(null)
    const [viewModal, setViewModal] = useState(null)

    const [enrollments, setEnrollments] = useState([])
    const [fitGoldClients, setFitGoldClients] = useState([])
    const [enrollSearch, setEnrollSearch] = useState('')

    const [enrolling, setEnrolling] = useState(false)
    const [loadingEnroll, setLoadingEnroll] = useState(false)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const data = await getClasses()
            setClasses(data)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

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
            if (err.message && err.message.includes('duplicate')) {
                alert('Este cliente ya está matriculado en esta clase')
            }
        }
        finally { setEnrolling(false) }
    }

    async function handleUnenroll(enrollmentId) {
        if (!window.confirm('¿Retirar a este cliente de la clase?')) return
        try {
            await unenrollClient(enrollmentId)
            if (enrollModal) {
                const enrs = await getClassEnrollments(enrollModal.id)
                setEnrollments(enrs)
            }
            if (viewModal) {
                const enrs2 = await getClassEnrollments(viewModal.id)
                setEnrollments(enrs2)
            }
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
            </div>

            <ClassesGrid
                classes={classes}
                onView={openViewModal}
                onEnroll={openEnrollModal}
            />

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