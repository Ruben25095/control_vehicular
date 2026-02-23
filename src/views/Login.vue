<template>

   <AppHeader/>  

   <main class="flex flex-col items-center justify-start min-h-screen bg-gray-600 main"> 
  <div class="flex flex-col justify-center bg-white   login-container   ">
    <h2 class="flex flex-col items-center font-bold   text-black text-4xl">Iniciar Sesión</h2>
    
 
    <form  @submit.prevent="handleLogin">
      <div >
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
      <div class="flex flex-col items-center">
      <button   type="submit" :disabled="isLoading">
        {{ isLoading ? 'Cargando...' : 'Iniciar Sesión' }}
      </button>
      </div>
    </form>
     <div class="flex flex-col  items-center  justify-center forgot-password-link"> ">
    <p v-if="error" class="error">{{ error }}</p>
  

   
       <p class="text-black">
      ¿No tienes cuenta? 
      
      <router-link to="/forgot-password">Recuperar contraseña</router-link>
    </p>
    </div>
   
  </div>
  
  </main> 
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
.main {
   min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content:flex-start;
    padding-top: 100px;
    padding-left: 40px;
    padding-right: 40px;
    background: linear-gradient(135deg, #8e91a8 0%, #000000 100%);
  
  
}

.login-container {
   background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    max-width: 450px;
    max-height: 600px;
    width: 100%;
    height: 100%;
  
}
forgor-password-link {
  margin-top: 20px;
}
input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 20px;
  color : black;
}

button {
  width: 70%;
  border-radius: 50px;
 
  background-color: #e03011;
  color: black;
  border: 10px solid #e03011;
  border-radius: 15px;
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
