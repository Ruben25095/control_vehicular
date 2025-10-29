
  export const authService = {
    // Simular llamada a API con delay
    async authenticate(username, password) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const user = users.find(
            u => u.username === username && u.password === password
          )
          
          if (user) {
            // No devolver la contraseña
            const { password, ...userWithoutPassword } = user
            resolve({
              success: true,
              user: userWithoutPassword,
              token: `fake-jwt-token-${user.id}` // Token simulado
            })
          } else {
            reject({
              success: false,
              message: 'Usuario o contraseña incorrectos'
            })
          }
        }, 800) // Simular latencia de red
      })
    },
  
    // Validar token (para mantener sesión)
    async validateToken(token) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // En producción, aquí validarías el token con el backend
          const isValid = token && token.startsWith('fake-jwt-token')
          resolve(isValid)
        }, 300)
      })
    }
  }
  