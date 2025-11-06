<template>
  <div class="login-container">
    <h2>Registrarse</h2>
    
    <form @submit.prevent="handleSignUp">
      <div>
        <input 
          v-model="name" 
          type="name" 
          placeholder="Nombre"
          required
        />
      </div>
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

      <div>
        <input 
          v-model="confirmPassword" 
          type="password" 
          placeholder="Confirmar Contraseña"
          required
        />
      </div>
      
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Cargando...' : 'Registrar' }}
      </button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/components/useAuth'

const router = useRouter()
const { signUp } = useAuth()

const email = ref('')
const password = ref('')
const name = ref('') // ⬅️ Nuevo ref para el nombre
const confirmPassword = ref('') // ⬅️ Nuevo ref para la confirmación
const error = ref(null)
const isLoading = ref(false)

const handleSignUp = async () => {
  error.value = null
  isLoading.value = true
  
  // ⬅️ Agrega la condición para verificar si las contraseñas coinciden
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden.'
    isLoading.value = false
    return
  }
  
  const { data, error: signUpError } = await signUp(email.value, password.value,name.value)
  
  isLoading.value = false
  
  if (signUpError) {
    error.value = signUpError.message
  } else {
    router.push('/login')
  }
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
