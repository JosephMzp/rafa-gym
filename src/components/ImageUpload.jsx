import { useState, useRef } from 'react'
import { FiCamera, FiX, FiLoader } from 'react-icons/fi'
import { uploadImage, getOptimizedUrl } from '../lib/cloudinary'

/**
 * Reusable image upload component with preview, drag-drop, and Cloudinary integration
 * @param {object} props
 * @param {string} props.currentUrl - Current image URL
 * @param {function} props.onUpload - Callback with {url, public_id} after successful upload
 * @param {string} props.folder - Cloudinary folder (default: 'rafagym')
 * @param {number} props.size - Avatar size in px (default: 100)
 * @param {string} props.fallbackText - Text to show when no image (e.g., first letter of name)
 */
export default function ImageUpload({ currentUrl, onUpload, folder = 'rafagym', size = 100, fallbackText = '?' }) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState(null)
    const [dragOver, setDragOver] = useState(false)
    const [error, setError] = useState(null)
    const inputRef = useRef(null)

    const displayUrl = preview || (currentUrl ? getOptimizedUrl(currentUrl, { width: size * 2, height: size * 2 }) : null)

    const handleFile = async (file) => {
        if (!file) return

        // Validate
        if (!file.type.startsWith('image/')) {
            setError('Solo se permiten archivos de imagen')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('La imagen no debe superar 5MB')
            return
        }

        setError(null)

        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target.result)
        reader.readAsDataURL(file)

        setUploading(true)
        try {
            const result = await uploadImage(file, folder)
            onUpload(result)
        } catch (err) {
            console.error('Upload error:', err)
            setError('Error al subir imagen. Intenta de nuevo.')
            setPreview(null)
        } finally {
            setUploading(false)
        }
    }

    const handleInputChange = (e) => {
        handleFile(e.target.files[0])
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        handleFile(e.dataTransfer.files[0])
    }

    const removeImage = () => {
        setPreview(null)
        onUpload({ url: null, public_id: null })
        if (inputRef.current) inputRef.current.value = ''
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <div
                onClick={() => !uploading && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{
                    width: size, height: size, borderRadius: '50%', cursor: uploading ? 'wait' : 'pointer',
                    position: 'relative', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: displayUrl ? `url(${displayUrl}) center/cover` : 'var(--dark-500)',
                    border: dragOver ? '3px dashed var(--primary-400)' : '3px solid var(--border-subtle)',
                    transition: 'all 0.2s ease',
                    boxShadow: dragOver ? '0 0 0 4px rgba(249, 115, 22, 0.2)' : 'none'
                }}
            >
                {!displayUrl && !uploading && (
                    <span style={{ fontSize: size * 0.35, fontWeight: 700, color: 'var(--text-muted)' }}>
                        {fallbackText}
                    </span>
                )}

                <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.55)', opacity: uploading ? 1 : 0, transition: 'opacity 0.2s',
                    borderRadius: '50%'
                }}
                    onMouseEnter={(e) => { if (!uploading) e.currentTarget.style.opacity = '1' }}
                    onMouseLeave={(e) => { if (!uploading) e.currentTarget.style.opacity = '0' }}
                >
                    {uploading ? (
                        <div className="spinner" style={{ width: 24, height: 24 }}></div>
                    ) : (
                        <FiCamera size={size * 0.25} color="white" />
                    )}
                </div>
            </div>

            {displayUrl && !uploading && (
                <button
                    onClick={(e) => { e.stopPropagation(); removeImage() }}
                    style={{
                        background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer',
                        fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem',
                        padding: '0.125rem 0.5rem'
                    }}
                >
                    <FiX size={12} /> Quitar foto
                </button>
            )}

            {!displayUrl && !uploading && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Clic o arrastra una imagen
                </span>
            )}

            {error && (
                <span style={{ fontSize: '0.75rem', color: 'var(--danger)', textAlign: 'center' }}>{error}</span>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                style={{ display: 'none' }}
            />
        </div>
    )
}
