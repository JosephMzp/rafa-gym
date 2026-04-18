const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
const VIDEO_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`

/**
 * Upload an image file to Cloudinary
 * @param {File} file - The image file to upload
 * @param {string} folder - Optional folder name (e.g., 'clients', 'staff')
 * @returns {Promise<{url: string, public_id: string}>}
 */
export async function uploadImage(file, folder = 'rafagym') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('folder', folder)

    const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Error al subir imagen')
    }

    const data = await response.json()
    return {
        url: data.secure_url,
        public_id: data.public_id
    }
}

/**
 * Get an optimized Cloudinary URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {object} options - Transformation options
 * @returns {string} Optimized URL
 */
export function getOptimizedUrl(url, { width = 200, height = 200, crop = 'fill', gravity = 'face' } = {}) {
    if (!url || !url.includes('cloudinary.com')) return url
    return url.replace('/upload/', `/upload/w_${width},h_${height},c_${crop},g_${gravity},q_auto,f_auto/`)
}

/**
 * Upload a video file to Cloudinary
 * @param {File} file - The video file to upload
 * @param {string} folder - Optional folder name (e.g., 'exercises/videos')
 * @returns {Promise<{url: string, public_id: string}>}
 */
export async function uploadVideo(file, folder = 'rafagym/videos') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('folder', folder)

    const response = await fetch(VIDEO_UPLOAD_URL, {
        method: 'POST',
        body: formData
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Error al subir video')
    }

    const data = await response.json()
    return {
        url: data.secure_url,
        public_id: data.public_id
    }
}
