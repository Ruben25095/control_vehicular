import { defineStore } from 'pinia'
import { authService } from '../services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => {
    // 1. Cargar datos de localStorage al INICIO del store
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    let user = null
    let isAuthenticated = false

    if (token && userStr) {
        try {
            user = JSON.parse(userStr)
            // Asumimos que si hay un token y un usuario en localStorage, 
            // el usuario está potencialmente autenticado. checkAuth confirmará esto.
            isAuthenticated = true 
        } catch (e) {
            // Error de parseo, limpiar
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        }
    }

    return {
        user: user,
        token: token,
        isAuthenticated: isAuthenticated, // true si hay datos, false si no
        loading: false,
        error: null,
        stateIsLoaded: false // CRÍTICO: Debe ser false al inicio
    }
  },

  getters: {
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.role || null,
    isAdmin: (state) => state.user?.role === 'admin',
    isModerator: (state) => state.user?.role === 'moderator',
    userName: (state) => state.user?.name || ''
  },

  actions: {
    // ... (login y logout permanecen sin cambios) ...

    async checkAuth() {
        // Optimización: si ya se cargó, no hagas la llamada API de nuevo
        if (this.stateIsLoaded) {
            return
        }

        this.loading = true
        
        try {
            const token = localStorage.getItem('token')
            const userStr = localStorage.getItem('user')
            
            if (token && userStr) {
                // Llama al servicio para validar el token con el backend
                const isValid = await authService.validateToken(token) 
                
                if (isValid) {
                    this.token = token
                    this.user = JSON.parse(userStr)
                    this.isAuthenticated = true
                } else {
                    // Token inválido, limpiar y desautenticar
                    this.logout()
                    this.isAuthenticated = false // Redundante, pero claro
                }
            } else {
                // No hay token en localStorage
                this.isAuthenticated = false
            }
        } catch (e) {
            // Manejar errores de red o del servicio de validación
            this.logout()
            this.isAuthenticated = false
        } finally {
            // 2. CRÍTICO: Marca el estado como cargado SIEMPRE al finalizar
            this.loading = false
            this.stateIsLoaded = true 
        }
    }
  }
})