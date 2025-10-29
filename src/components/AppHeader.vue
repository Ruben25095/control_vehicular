<template>
  <nav class="navbar">
    <div class="nav-left">
      <slot name="brand">
        <a class="brand" href="#">Control Vehicular</a>
      </slot>
      <ul class="nav-links">
        <slot>
          <!-- enlaces por defecto si no hay slot -->
          <li><a class="text-black" href="#">Inicio</a></li>
       
          <li><a href="#">Contacto</a></li>
        </slot>
      </ul>
    </div>

    <div class="nav-right">
      <!-- Si hay usuario, mostrar avatar y menú; si no, mostrar botón de login -->
      <template v-if="currentUser">
        <div  class="user" @click="toggleMenu" ref="userBtn">
          <img v-if="currentUser.avatarUrl" :src="currentUser.avatarUrl" alt="avatar" class="avatar"/>
          <div class="user-info">
            <span class="user-name">{{ currentUser.name || shortEmail }}</span>
            
          </div><small class="user-email" v-if="showEmail">{{ currentUser.email }}</small>
          <svg class="chev" viewBox="0 0 20 20" width="14" height="14"><path d="M5 7l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>

        <div v-if="menuOpen" class="dropdown" @keydown.esc="closeMenu">
          <slot name="menu">
            <button class="dropdown-item" @click="$emit('profile')">Perfil</button>
            <button class="dropdown-item" @click="$emit('settings')">Ajustes</button>
            <hr />
            <button class="dropdown-item logout" @click="handleLogout">Cerrar sesión</button>
          </slot>
        </div>
      </template>

      <template v-else>
        <button class="login-btn" @click="goToLogin">Iniciar sesión</button>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { supabase } from '@/lib/supabase'  // 👈 importa el cliente
import { useRouter } from 'vue-router'
const router = useRouter()

function goToLogin() {
  router.push('/login') // 👈 redirige directamente
}




const props = defineProps({
  user: { type: Object, default: null },
  showEmail: { type: Boolean, default: false }
})
const emits = defineEmits(['logout','login','profile','settings'])

const menuOpen = ref(false)
const userBtn = ref(null)
const supaUser = ref(null) // usuario autenticado desde Supabase

// --- Verificar sesión activa ---
onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  supaUser.value = session?.user ?? null

  // Escuchar cambios en la sesión
  supabase.auth.onAuthStateChange((_event, session) => {
    supaUser.value = session?.user ?? null
  })

  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})

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
.navbar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:10px 16px;
  background:rgb(101, 187, 101);
  border-bottom:1px solid #e5e7eb;
}
.nav-left{display:flex;align-items:center;gap:16px}
.brand{font-weight:700;color:#807f7f;text-decoration:none}
.nav-links{display:flex;gap:12px;list-style:none;margin:0;padding:0}
.nav-links a{color:#807f7f;text-decoration:none ;font-weight:500}

.nav-right{display:flex;align-items:center;gap:12px;position:relative}
.user{display:flex;align-items:center;gap:8px;cursor:pointer;padding:6px;border-radius:8px}
.avatar{width:36px;height:36px;border-radius:9999px;object-fit:cover}
.user-name{font-weight:600 ;color:#000000}
.user-email{color:#000000;font-size:12px}
.chev{opacity:0.7}
.dropdown{position:absolute;right:0;top:56px;background:rgb(134, 128, 128);border:1px solid #b97777;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.06);min-width:160px;padding:8px;z-index:50}
.dropdown-item{display:block;width:100%;text-align:left;padding:8px;border-radius:6px;background:transparent;border:0;cursor:pointer}
.dropdown-item:hover{background:#180363}
.logout{color:#b91c1c}
.login-btn{padding:8px 12px;border-radius:6px;border:1px solid #555686;background:#182597;cursor:pointer;font-weight:600}
</style>
