import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getUserProfile } from '../lib/services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        let initialDone = false

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('[Auth] Event:', event, session?.user?.email || 'no user')

                if (session?.user) {
                    setTimeout(async () => {
                        try {
                            const profile = await getUserProfile(session.user.id)
                            console.log('[Auth] Profile result:', profile?.name || 'not found')
                            if (mounted) {
                                setUser(profile)
                                setLoading(false)
                            }
                        } catch (err) {
                            console.error('[Auth] Profile error:', err)
                            if (mounted) {
                                setUser(null)
                                setLoading(false)
                            }
                        }
                    }, 0)
                } else {
                    if (mounted) {
                        setUser(null)
                        setLoading(false)
                    }
                }

                initialDone = true
            }
        )

        const timeout = setTimeout(() => {
            if (mounted && !initialDone) {
                console.warn('[Auth] Timeout - forcing loading to false')
                setLoading(false)
            }
        }, 5000)

        return () => {
            mounted = false
            clearTimeout(timeout)
            subscription?.unsubscribe()
        }
    }, [])

    const login = async (email, password) => {
        try {
            console.log('[Auth] Login attempt:', email)
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                console.error('[Auth] Login failed:', error.message)
                return { success: false, error: error.message }
            }

            const profile = await getUserProfile(data.user.id)
            if (!profile) {
                await supabase.auth.signOut()
                return { success: false, error: 'Usuario no encontrado en el sistema' }
            }

            setUser(profile)
            return { success: true, user: profile }
        } catch (err) {
            console.error('[Auth] Login exception:', err)
            return { success: false, error: 'Error de conexión' }
        }
    }

    const logout = async () => {
        await supabase.auth.signOut()
        setUser(null)
    }

    const updateUser = (updatedFields) => {
        setUser(prev => prev ? { ...prev, ...updatedFields } : prev)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
