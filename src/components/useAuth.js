import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

const user = ref(null)
const loading = ref(true)

// ✅ Inicializa el usuario apenas se importa este archivo
const initAuth = async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  loading.value = false
}

// ✅ Escucha los cambios de sesión globalmente
supabase.auth.onAuthStateChange((_event, session) => {
  user.value = session?.user || null
})

// Ejecuta una sola vez
initAuth()

export const useAuth = () => {
  // Registrar usuario
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { data, error }
  }

  // Iniciar sesión
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  // Cerrar sesión
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    user.value = null
    return { error }
  }

  // Obtener usuario actual
  const getUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    user.value = currentUser
    return currentUser
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    getUser
  }
}
