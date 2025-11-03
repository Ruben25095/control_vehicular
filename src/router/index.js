import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { supabase } from '@/lib/supabase'
  
//import ForgotPassword from '../views/ForgotPassword.vue'
//import ResetPassword from '../views/ResetPassword.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false}
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
   
   
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth:false }
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('@/views/Signup.vue'),
      meta: { requiresAuth:false }
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: () => import('@/views/ForgotPassword.vue'),
      meta: { requiresAuth:false }
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: () => import('@/views/ResetPassword.vue'),
      meta: { requiresAuth:false }
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/views/Admin.vue'),
      meta: { requiresAuth: true, requiresRole: 'admin' }
    },
    
    {
      path: '/salidas',
      name: 'Salidas',
      component: () => import('@/components/Salidas.vue'),
      meta: { requiresAuth: true }
    },

    
  ]
     
    
  
    // ... otras rutas

})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.meta.requiresAuth
  const requiredRole = to.meta.requiresRole
  
  // 1. Obtener la sesión y el usuario
  const { data: { session } } = await supabase.auth.getSession()
  const { data: { user }, error } = await supabase.auth.getUser()

  // --- Lógica de AUTENTICACIÓN (¿Está logueado?) ---
  
  // Si se requiere autenticación y no hay usuario, redirigir a Login
  if (requiresAuth && (!user || error)) {
    return next({ path: '/login' })
  }
  
  // Manejo de redirecciones básicas (evitar volver a login/signup si ya estás logueado)
  if (!requiresAuth && session) {
      if (to.path === '/' || to.path === '/login' || to.path === '/signup') {
           return next('/dashboard')
      }
  }

  // --- Lógica de AUTORIZACIÓN (¿Tiene el rol?) ---

  if (requiredRole && user) {
    // A. Consultar la tabla profiles usando el ID del usuario
    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .select('role') // SOLAMENTE necesitamos la columna 'role'
      .eq('id', user.id) // Buscar la fila que coincida con el ID del usuario actual
      .single() // Esperar solo un resultado
      
    if (dbError) {
      console.error('Error al obtener el perfil del usuario:', dbError)
      // Si hay un error de DB, lo tratamos como acceso denegado o forzamos el login
      return next({ path: '/login' }) 
    }

    const currentRole = profile?.role || 'user' // Si la consulta devuelve NULL, asumimos el rol 'user'

    // B. Verificar si el rol obtenido coincide con el rol requerido
    if (currentRole !== requiredRole) {
      alert(`Acceso denegado. Se requiere el rol: ${requiredRole}. Su rol es: ${currentRole}`)
      return next({ path: '/dashboard' }) // Redirigir al dashboard si no tiene el rol
    }
  }

  // C. Si todo está bien (o no requiere autenticación/rol), continuar
  next() 
})

export default router