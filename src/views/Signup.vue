<template>
    <AppHeader />
    <div class="main-container">
     
      <div class="card-form-wrapper">
        <form class="register-form" @submit.prevent="handleSignUp">
          
          <h2 class="form-title">Crear Cuenta</h2>
          
          <div class="form-group">
            <input 
              v-model="name" 
              type="text" 
              placeholder="Nombre"
              class="carbon-input"
              required
            />
          </div>
          
          <div class="form-group">
            <input 
              v-model="email" 
              type="email" 
              placeholder="Email"
              class="carbon-input"
              required
            />
          </div>
          
          <div class="form-group">
            <input 
              v-model="password" 
              type="password" 
              placeholder="Contraseña"
              class="carbon-input"
              required
            />
          </div>
  
          <div class="form-group">
            <input 
              v-model="confirmPassword" 
              type="password" 
              placeholder="Confirmar Contraseña"
              class="carbon-input"
              required
            />
          </div>
          
          <p v-if="error" class="error-message">{{ error }}</p>
          
          <button type="submit" :disabled="isLoading" class="btn-submit">
            {{ isLoading ? 'Cargando...' : 'Registrar' }}
          </button>
        </form>
      </div>
    </div>
  </template>
  
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuth } from '@/components/useAuth'
  import AppHeader from '@/components/AppHeader.vue'
  
  const router = useRouter()
  const { signUp } = useAuth()
  
  const email = ref('')
  const password = ref('')
  const name = ref('')
  const confirmPassword = ref('')
  const error = ref(null)
  const isLoading = ref(false)
  
  const handleSignUp = async () => {
    error.value = null
    isLoading.value = true
    
  
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
      // Redireccionar o mostrar mensaje de éxito si es necesario
      router.push('/login')
    }
  }
  </script>
  
  
  <style scoped>
  /* PALETA: 
     Fondo: #1C1C1C (Gris Fibra de Carbono)
     Negro: #000000
     Texto Claro: #FFFFFF (Blanco Nítido)
     Texto Secundario: #BDBDBD (Gris Acero)
     Acento: #FF3B30 (Rojo Deportivo)
     Borde: #333333 (Gris Muy Oscuro)
  */
  
  .main-container {
    /* Fondo oscuro principal para el cuerpo */
    background: #1C1C1C;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 50px 0;
  }
  
  /* === CARD/FORMULARIO CONTENEDOR === */
  .card-form-wrapper {
    /* Fondo aún más oscuro para que resalte */
    background: #000000;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(255, 59, 48, 0.15); /* Sombra sutil con acento rojo */
    border: 1px solid #333333;
    width: 100%;
    max-width: 400px;
    padding: 30px;
  }
  
  .register-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .form-title {
    font-size: 2rem;
    font-weight: 700;
    color: #FF3B30; /* Título en Rojo Deportivo */
    text-align: center;
    margin-bottom: 15px;
  }
  
  /* === INPUTS === */
  .carbon-input {
    width: 100%;
    /* Fondo oscuro para los inputs */
    background: #1C1C1C; 
    color: #FFFFFF;
    border: 1px solid #333333;
    border-radius: 8px;
    padding: 12px 15px;
    font-size: 1rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    outline: none;
  }
  
  .carbon-input::placeholder {
    color: #BDBDBD;
  }
  
  .carbon-input:focus {
    border-color: #FF3B30; /* Acento rojo al enfocar */
    box-shadow: 0 0 0 2px rgba(255, 59, 48, 0.4);
  }
  
  /* === BOTÓN SUBMIT === */
  .btn-submit {
    width: 100%;
    /* Rojo Deportivo para el CTA */
    background-color: #FF3B30; 
    color: #FFFFFF;
    font-weight: 700;
    padding: 12px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.15s ease, transform 0.15s ease;
    margin-top: 10px;
  }
  
  .btn-submit:hover {
    background-color: #cc2f26; /* Rojo más oscuro al hacer hover */
  }
  
  .btn-submit:active {
    transform: scale(0.98);
  }
  
  .btn-submit:disabled {
    background-color: #333333; /* Gris oscuro para deshabilitado */
    color: #BDBDBD;
    cursor: not-allowed;
    box-shadow: none;
  }
  
  /* === MENSAJES DE ERROR === */
  .error-message {
    color: #FF3B30; /* Usamos el acento rojo para los errores */
    font-size: 0.9rem;
    text-align: center;
    margin-top: -5px;
  }
  </style>