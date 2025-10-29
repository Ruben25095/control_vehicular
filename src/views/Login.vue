<template>
   <AppHeader/>     
  <div class="login-container">
    <h2>Iniciar Sesión</h2>
    
    <form @submit.prevent="handleLogin">
      <div>
        <input 
          v-model="email" 
          type="email" 
          placeholder="Email"
          required
        />
      </div>
      
      <div>
        <input 
          v-model="password" 
          type="password" 
          placeholder="Contraseña"
          required
        />
      </div>
      
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Cargando...' : 'Iniciar Sesión' }}
      </button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
    
    <p>
      ¿No tienes cuenta? 
      <router-link to="/signup">Registrarse</router-link>
      <router-link to="/forgot-password">Recuperar contraseña</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/components/useAuth'
import AppHeader from '@/components/AppHeader.vue'
const router = useRouter()
const { signIn } = useAuth()

const email = ref('')
const password = ref('')
const error = ref(null)
const isLoading = ref(false)

const handleLogin = async () => {
  error.value = null
  isLoading.value = true

  // Llamada a Supabase
  const { data, error: loginError } = await signIn(email.value, password.value)

  isLoading.value = false

  // Si hay error, lo mostramos
  if (loginError) {
    error.value = loginError.message
    return
  }

  // Si llega aquí, el login fue exitoso
  console.log('Usuario logeado:', data.user)
  router.push('/dashboard')
}

</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
}

input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
