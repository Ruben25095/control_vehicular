<template>
  <div class="p-6">


    <!-- Mostrar mensaje si no hay reservas -->
    <div v-if="reservas.length === 0" class="text-black">
      No hay reservas registradas.
    </div>

    <!-- Lista de reservas -->
    <div v-else class="grid gap-4 md:grid-cols-2 place-items-center-safe lg:grid-cols-4">
      <div
        v-for="reserva in reservas"
        :key="reserva.id"
        class="bg-gray-100 w-11/12  text-black place-items-center rounded-xl shadow-md p-4 hover:shadow-lg transition"
      >
        <h3 class=" w-full text-center bg-sky-300 font-semibold  text-lg mb-2 p-1 rounded">
          Reserva #{{ reserva.id }}
        </h3>
        
        <p><strong>No.Economico:</strong> {{  reserva.vehiculo?.id_num_economico || 'Desconocido' }}</p>
       
        <div v-if="reserva.vehiculo?.img_url" class="flex justify-center my-2">
          <img :src="reserva.vehiculo.img_url" alt="Vehículo" class="w-32 h-24 object-cover rounded-lg" />
        </div>
        <p><strong>Solicita:</strong> {{ reserva.usuario?.nombre || reserva.usuario?.name || 'Desconocido' }}</p>
        <p><strong>Vehículo:</strong> {{ reserva.vehiculo?.marca }} {{ reserva.vehiculo?.modelo }}</p>
        <p><strong>Fecha inicio:</strong> {{ formatFecha(reserva.fecha_inicio) }}</p>
         <p><strong>Fecha fin:</strong> {{ formatFecha(reserva.fecha_fin) }}</p>
        <p class="overflow-hidden w-80 ..."><strong>Motivo:</strong>{{ reserva.motivo }}</p> 
        <p><strong>Estado:</strong> 
        
          <span :class="{
            'text-green-600': reserva.estado === 'Aprobada',
            'text-yellow-500': reserva.estado === 'Pendiente',
            'text-red-600': reserva.estado === 'Rechazada'
          }">
            {{ reserva.estado }}

  
          </span>
      </p>


    </div>
    
    
       

      




    </div>


  </div>
</template>

<script setup>
import { ref, onMounted, computed, watchEffect } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/useAuth'

const reservas = ref([])
const { user } = useAuth()
const usuario = ref(null) 
const errorMsg = ref('')

// ---------------------------------------------
// 1. Lógica de Autenticación y Perfil (Refactorizada para claridad)
// ---------------------------------------------

// El ID del usuario de Supabase Auth
const userId = computed(() => user.value?.id || null)

// Carga el nombre del perfil una vez que el userId está disponible
watchEffect(async () => {
  if (userId.value) {
    const { data, error } = await supabase
      .from('profiles')
      // NOTA: Si tienes un campo 'role' o 'is_admin', agrégalo aquí
      .select('name') 
      .eq('id', userId.value)
      .single()

    if (error) {
      console.error('Error al obtener el perfil:', error)
      usuario.value = 'Error'
    } else if (data) {
      usuario.value = data.name
      // Si tuvieras un campo de rol, lo asignarías aquí también
    }
  } else {
    usuario.value = null
  }
})

// Objeto currentUser consolidado
const currentUser = computed(() => {
  if (!user.value) return null
  return {
    id: userId.value,
    name: usuario.value || 'Sin nombre', 
    email: user.value.email,
    avatarUrl: user.value.user_metadata?.avatar_url || '',
  }
})

// ---------------------------------------------
// 2. Lógica de Administración (EJEMPLO)
// ---------------------------------------------

// **Propiedad Calculada para determinar si es Admin**
// Reemplaza 'ID_DE_ADMINISTRADOR' con el ID real o usa un campo de rol de tu tabla 'profiles'
const isAdmin = computed(() => {
  // EJEMPLO SIMPLE: Comprobar un ID específico
  // return userId.value === 'ID_DE_ADMINISTRADOR' 
  
  // EJEMPLO MEJOR: Si tienes un campo de rol en 'profiles' y lo cargaste:
  // return currentUser.value?.role === 'admin' 

  // Por defecto, asumimos que NO es administrador, a menos que se defina la lógica.
  return false 
})


// ---------------------------------------------
// 3. Función de Carga de Reservas Optimizada
// ---------------------------------------------

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString()
}

const cargarReservas = async (currentUserId) => {
  let query = supabase
    .from('reservas')
    .select(`
      id,
      fecha_inicio,
      fecha_fin,
      estado,
      motivo,
      aprovado_por,
      usuario:usuario_id (name, email),
      vehiculo:id_vehiculo (marca, modelo, img_url,id_num_economico)
    `)
  
  // APLICACIÓN DE FILTRO DINÁMICO
  if (!isAdmin.value) {
    // Si NO es administrador, filtra por el ID del usuario
    query = query.eq('usuario_id', currentUserId)
  }
  // Si ES administrador, la consulta no tiene el filtro .eq() y trae TODAS.

  // Opcional: Filtro por estado para que los usuarios vean todas sus reservas (Pendientes, Aprobadas, Rechazadas)
  // Si quieres que los usuarios SOLO vean las pendientes, agrega:
  // if (condicion_especifica) { query = query.eq('estado', 'Pendiente') }
  
  query = query.order('id', { ascending: true })

  const { data, error } = await query
  

  if (error) {
    console.error('Error cargando reservas:', error)
    errorMsg.value = 'Error al cargar las reservas.'
  } else {
    reservas.value = data
    errorMsg.value = ''
  }
}

// ---------------------------------------------
// 4. Lógica de Montaje y Observación (Limpiada)
// ---------------------------------------------

// El componente reacciona automáticamente cuando el userId cambia.
// Cuando userId tiene un valor (el usuario se autentica), cargamos las reservas.
watchEffect(() => {
  if (userId.value) {
    cargarReservas(userId.value)
  } else {
    // Limpiar si el usuario cierra sesión
    reservas.value = []
  }
})

// Ya no es necesario un 'onMounted' explícito para iniciar la carga,
// el 'watchEffect' maneja la carga inicial y los cambios de sesión.

</script>
