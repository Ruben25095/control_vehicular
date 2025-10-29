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
      component: () => import('@/views/Home.vue'),
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
      meta: { requiresAuth: true }
    },

    
  ]
     
    
  
    // ... otras rutas

})

router.beforeEach(async (to, from, next) => {
  const { data } = await supabase.auth.getSession()
  const session = data.session

  if (to.meta.requiresAuth && !session) {
    next('/')
  } else if (to.path === '/' && session) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router