<template>
  <div class="p-6">

    <!--PLANTILLA DE AUTOS SOLICITADOS PARA SU APROBACION O RECHAZO DE RENTA "ADMIN"-->

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
        <p class="overflow-hidden w-80 ..."><strong>Motivo:</strong> {{ reserva.motivo }}</p> 
        <p><strong>Estado:</strong> 
        
          <span :class="{
            'text-green-600': reserva.estado === 'aprobado',
            'text-yellow-500': reserva.estado === 'pendiente',
            'text-red-600': reserva.estado === 'rechazado'
          }">
            {{ reserva.estado }}

  
          </span>
      </p>

         <div class=" flex flex-row w-full place-items-center justify-around ">

               <button @click="validar(reserva.id,currentUser.name)" class="flex p-6 h-1/4 w-1/4 border-2 justify-center bg-green-500 hover:bg-yellow-300">Aceptar</button>


               <button @click="rechazar(reserva.id,currentUser.name)" class="flex p-6 h-1/4 w-1/4 border-2 justify-center bg-red-500 hover:bg-yellow-300">Rechazar</button>

         </div>


    </div>
    </div>


  </div>
</template>

<script setup>
import { ref, onMounted,computed,watchEffect } from 'vue'
import { supabase } from '@/lib/supabase'
import {useAuth} from '@/components/useAuth'
const reservas = ref([])

// Dentro de tu componente o script donde defines currentUser
const { user } = useAuth()
const usuario= ref(null) // Usaremos una ref para almacenar el nombre

watchEffect(async () => {
  if (user.value) {
    // 1. Obtener el ID del usuario autenticado
    const userId = user.value.id
    
    // 2. Realizar la consulta a la tabla 'profiles'
    const { data, error } = await supabase
      .from('profiles') // Tu tabla de perfiles
      .select('name') // La columna que contiene el nombre
      .eq('id', userId) // Asume que la columna ID de 'profiles' se llama 'id' y es igual al ID de auth
      .single() // Esperamos un solo resultado

    if (error) {
      console.error('Error al obtener el perfil:', error)
      usuario.value = 'Error'
    } else if (data) {
      // 3. Almacenar el nombre obtenido
      usuario.value = data.name
    }
  } else {
    usuario.value = null
  }
})

const currentUser = computed(() => {
  if (!user.value) return null
  
  // Opción 1: Priorizar el nombre de la base de datos (nameFromDB)
  const nombre = usuario.value || 'Sin nombre'
  
  
  return {
    name: nombre, 
    email: user.value.email,
    avatarUrl: user.value.user_metadata?.avatar_url || '',
  }
})

console.log(currentUser.name)

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString()
}

const cargarReservas = async () => {
  const { data, error } = await supabase
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
    .eq('estado','pendiente')
    .order('id', { ascending: true })
  

  if (error) {
    console.error('Error cargando reservas:', error)
  } else {
    reservas.value = data
  }
}


const errorMsg = ref('')

async function validar(idReserva,name) {

  try {
    const { error } = await supabase
      .from('reservas')
      .update({ estado:'aprobado',aprovado_por:name})
      .eq('id', idReserva,'id', idReserva)

    if (error) throw error
    console.log(idReserva)
    await cargarReservas()
  } catch (err) {
    console.error('Error al aprobar reserva:', err)
    errorMsg.value = 'No se pudo aprobar la reserva.'
  }
}

async function rechazar(idReserva,name) {
  try {
    const { error } = await supabase
      .from('reservas')
      .update({ estado: 'Rechazada',aprovado_por:name })
      .eq('id', idReserva)

    if (error) throw error

    await cargarReservas()
  } catch (err) {
    console.error('Error al rechazar reserva:', err)
    errorMsg.value = 'No se pudo rechazar la reserva.'
  }
}


onMounted(() => {
  cargarReservas()
 
})
</script>
