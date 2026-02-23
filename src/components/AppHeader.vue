<template>
  <nav class="navbar">
    <div class="nav-left">
      <a class="brand" href="/">Control Vehicular</a>
    </div>

    <div class="nav-right">

      <template v-if="currentUser">

        <!-- Opciones como chips futuristas -->
        <div class="nav-actions">
          <span class="action-chip" @click="gotoadmin">Admin</span>
          <span class="action-chip" @click="gotosalidas">Salidas</span>
          <span class="action-chip" @click="gotomisreservas">Mis Reservas</span>
          <span v-show="auth.role==='Admin'" class="action-chip" @click="gotomisreguistrar">Registrar</span>
          <span class="action-chip" @click="gotovehiculonuevo">Vehículo Nuevo</span>
        </div>

        <!-- Información del usuario -->
        <div class="user-box">
          <img v-if="currentUser.avatarUrl" :src="currentUser.avatarUrl" class="avatar" />


        </div>

        <span class="logout-chip" @click="handleLogout">Cerrar sesión</span>

      </template>

      <!-- <template v-else>
        <button class="login-btn" @click="goToLogin" >Iniciar sesión</button>
      </template> -->

    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { supabase } from '@/lib/supabase'  // importa el cliente
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Admin from '@/views/Admin.vue'
const router = useRouter()
const perfilUser = ref([])  

const auth = useAuthStore()

//const isAdmin = computed(() => auth.role === 'Admin')

// async function fetchMyProfile() {
//   // Primero obtenemos el ID de la sesión actual
//   const { data: { user } } = await supabase.auth.getUser();

//   if (user) {
//     const { data, error } = await supabase
//       .from('profiles')
//       .select('name, email, role, img_avatar_url')
//       .eq('id', user.id)
//       .single(); // .single() porque solo esperamos un resultado
//     if (error) console.error(error);
//     console.log("Perfil obtenido:",data);
//     return data; // Devolvemos el perfil para uso inmediato
//   }
// }


 
function goToLogin() {
  router.push('/login') 
// redirige directamente
}
computed(() => {
  if (auth.isAuthenticated) {
    // Si ya estamos autenticados, obtenemos el perfil
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('profiles')
          .select('name, email, role, img_avatar_url')
          .eq('id', user.id)
          .single()
          .then(({ data, error }) => {
            if (error) console.error(error);
            perfilUser.value = data; // Guardamos el perfil en la ref
            console.log("Perfil del usuario:", perfilUser.value);
          });
      }
    });
  }
})



const props = defineProps({
  user: { type: Object, default: null },
  showEmail: { type: Boolean, default: false }
})
const emits = defineEmits(['logout','login','profile','settings'])

const menuOpen = ref(false)
const userBtn = ref(null)
const supaUser = ref(null) // usuario autenticado desde Supabase


onMounted(async () => {

 
  const { data: { session } } = await supabase.auth.getSession()
  supaUser.value = session?.user ?? null
  


  document.addEventListener('click', onClickOutside)
})

const gotoadmin=()=>{
  router.push('/admin')
  console.log(currentUser.value)

}
const gotosalidas=()=>{
  router.push('/salidas')

}
const gotomisreservas=()=>{
  router.push('/mi-solicitud')

}
const gotomisreguistrar=()=>{
  router.push('/signup')

}

const gotovehiculonuevo=()=>{
  router.push('/nuevovehiculo')

}
onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})

  

 console.log("Perfil del usuario en AppHeader:", perfilUser.value) // Verificar que se obtiene el perfil correctamente
  

// --- Computed para mostrar el usuario ---
const currentUser = computed(() => {
  
  // Prioridad: prop → supabase → localStorage → null
  if (props.user) return props.user
  if (supaUser.value) {
    return {
      name: supaUser.value.user_metadata?.name,
      email: supaUser.value.email,
      avatarUrl: supaUser.value.user_metadata?.avatar_url
    }
  }
  try {
    const raw = localStorage.getItem('user')
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
})

const shortEmail = computed(() =>
  currentUser.value?.email ? currentUser.value.email.split('@')[0] : ''
)

function toggleMenu() { menuOpen.value = !menuOpen.value }
function closeMenu() { menuOpen.value = false }

async function handleLogout() {
  await supabase.auth.signOut() // 👈 cerrar sesión en Supabase
  localStorage.removeItem('user')
  supaUser.value = null
  emits('logout')
  router.push('/') // 👈 redirigir al login después de
  closeMenu()
}

function onClickOutside(e) {
  if (!userBtn.value) return
  if (!userBtn.value.contains(e.target)) closeMenu()
}









</script>

<style>
.login-btn:hover{
  background:skyblue;
}

.login-btn{
  color:white;
}
</style>

<style scoped>
/* PALETA: 
   Negro Profundo: #000000
   Texto Claro: #FFFFFF (Blanco Nítido)
   Texto Secundario: #BDBDBD (Gris Acero)
   Acento: #FF3B30 (Rojo Deportivo)
*/

/* --- LAYOUT GENERAL --- */
.navbar {
  /* Fondo Negro Profundo (parte superior de fibra de carbono) */
  background: #000000; 
  /* Borde inferior sutil Gris Acero */
  border-bottom: 1px solid #333333; 
  /* Sombra más marcada en fondo oscuro */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5); 
  backdrop-filter: none; /* Quitamos el blur ya que el fondo es sólido */

  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
}

/* --- LOGO / MARCA --- */
.brand {
  font-weight: 700;
  font-size: 1.5rem; /* Un poco más grande para impactar */
  letter-spacing: 1.5px;
  /* Marca en Blanco Nítido */
  color: #FFFFFF; 
  text-decoration: none;
  font-family: 'Oswald', sans-serif; /* Fuente de título */
}

/* --- SECCIÓN DERECHA --- */
.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* --- CHIPS DE NAVEGACIÓN --- */
.action-chip {
  padding: 6px 14px;
  border-radius: 4px; /* Menos redondeado, más técnico */
  /* Fondo muy sutil (casi transparente) */
  background: rgba(255, 255, 255, 0.05); 
  /* Borde de Gris Acero para separación */
  border: 1px solid #333333; 
  
  /* Texto Gris Acero */
  color: #BDBDBD; 
  font-weight: 500;
  letter-spacing: 0.3px;
  font-size: 0.9rem;
  font-family: 'Roboto', sans-serif; /* Fuente de cuerpo */

  transition: 0.25s ease;
  cursor: pointer;
}

.action-chip:hover {
  /* Al pasar el ratón, usamos un toque de Rojo Deportivo sutil */
  background: rgba(255, 59, 48, 0.15); 
  border-color: #FF3B30; /* Borde Rojo */
  color: #FFFFFF;
  box-shadow: 0 0 8px rgba(255, 59, 48, 0.4); 
}

/* --- CONTENEDOR DE USUARIO --- */
.user-box {
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 6px 12px;
  border-radius: 20px;

  /* Fondo oscuro sutil */
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333333;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #BDBDBD; /* Borde Gris Acero */
}

/* --- LOGOUT CHIP (¡ACENTO IMPORTANTE!) --- */
.logout-chip {
  padding: 8px 16px;
  border-radius: 4px; /* Menos redondeado, tipo botón */

  /* Fondo Rojo Deportivo */
  background: #FF3B30; 
  border: 1px solid #FF3B30;
  color: #FFFFFF; /* Texto Blanco */

  font-weight: 700;
  cursor: pointer;
  transition: 0.25s ease;
}

.logout-chip:hover {
  /* Rojo más oscuro al pasar el ratón */
  background: #cc2f26; 
  border-color: #cc2f26;
  box-shadow: 0 0 10px rgba(255, 59, 48, 0.6);
}

/* --- LOGIN NORMAL --- */
.login-btn {
  padding: 8px 14px;
  border-radius: 4px;
  
  /* Borde Gris Acero */
  border: 1px solid #BDBDBD; 
  /* Fondo transparente sutil */
  background: transparent; 
  color: #FFFFFF; /* Texto Blanco */

  font-family: 'Roboto', sans-serif;

  cursor: pointer;
  transition: 0.25s ease;
}

.login-btn:hover {
  /* Usamos el Rojo Deportivo para el hover */
  background: rgba(255, 59, 48, 0.15); 
  border-color: #FF3B30;
  color: #FF3B30;
  box-shadow: none;
}
</style>







