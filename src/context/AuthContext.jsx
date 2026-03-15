import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getUserProfile } from '../lib/services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check existing session
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user) {
                    const profile = await getUserProfile(session.user.id)
                    if (profile) {
                        setUser(profile)
                    }
                }
            } catch (err) {
                console.error('Auth init error:', err)
            } finally {
                setLoading(false)
            }
        }

        initAuth()

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    const profile = await getUserProfile(session.user.id)
                    if (profile) setUser(profile)
                } else if (event === 'SIGNED_OUT') {
                    setUser(null)
                }
            }
        )

        return () => subscription?.unsubscribe()
    }, [])

    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) return { success: false, error: error.message }

            const profile = await getUserProfile(data.user.id)
            if (!profile) {
                await supabase.auth.signOut()
                return { success: false, error: 'Usuario no encontrado en el sistema' }
            }

            setUser(profile)
            return { success: true, user: profile }
        } catch (err) {
            return { success: false, error: 'Error de conexión' }
        }
    }

    const logout = async () => {
        await supabase.auth.signOut()
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
