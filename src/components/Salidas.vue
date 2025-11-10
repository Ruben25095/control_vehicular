<template>
  <div class=" bg-gray-300 p-6">


    <!-- Mostrar mensaje si no hay reservas -->
    <div v-if="reservas.length === 0" class="text-black place-justify-center"    >
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
        <p><strong>Usuario:</strong> {{ reserva.usuario?.nombre || reserva.usuario?.name || 'Desconocido' }}</p>
        <p><strong>Autorizo:</strong> {{  reserva.aprovado_por || 'Desconocido' }}</p>
        <p><strong>Vehículo:</strong> {{ reserva.vehiculo?.marca }} {{ reserva.vehiculo?.modelo }}</p>
        <p><strong>Fecha de Salida:</strong> {{ formatFecha(reserva.fecha_inicio) }}</p>
      
       
        <p><strong>Estado:</strong> 
        
          <span :class="{
            'text-green-600': reserva.estado === 'Aprobada',
            'text-yellow-500': reserva.estado === 'Pendiente',
            'text-red-600': reserva.estado === 'Rechazada'
          }">
            {{ reserva.estado }}

            
          </span>
      </p>

      <div class=" flex flex-row  justify-around p-1 w-full  ">  
        <button  :disabled="isDisabled"  @click="iniciarviaje(reserva.id)" class="mb-1 text-white text-2xl font-bold bg-green-400 rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-600 transition-colors">
  ->    
</button>
        
        
        <button :isvisible="false"  @click="abrirModal(reserva)" class="mb-1 text-white text-2xl font-bold bg-red-400 rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-600 transition-colors">
  X
</button>

<Formsalida
  :isOpen="modalAbierto"
  :vehiculo="reservaSeleccionada?.vehiculo"
  :reservas="reservaSeleccionada"
  @close="cerrarModal"
/>         </div>
         
     



    </div>
    
    
       

      




    </div>


  </div>
</template>

<script setup>
import { ref, onMounted, h } from 'vue'
import { supabase } from '@/lib/supabase'
import Formsalida from './Formsalida.vue'





const props = defineProps({
  isOpen: Boolean,
  vehiculo: {
        type: Object,
        required: 
        true
    },
    reservas: {
        type: Object,
        required: 
        true
    },
  
  
})

const isDisabled = ref(false)
const isvisible = ref(false)

const handleClick = async () => {
  isDisabled.value = true// deshabilita el botón
  

}



//Funciones para el modal de reserva

const modalAbierto = ref(false)
const reservaSeleccionada = ref(null) // 🔹 Aquí guardaremos la reserva actual

const abrirModal = (reserva) => {
  reservaSeleccionada.value = reserva
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
  reservaSeleccionada.value = null
  cargarReservas() // Recargar reservas al cerrar el modal
}






const reservas = ref([])

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
      aprovado_por,
      usuario:usuario_id (name,email),
      vehiculo:id_vehiculo (marca, modelo, img_url,id_num_economico,kilometraje)
    `)
    .in('estado', ['Aprobada', 'En viaje']) // 👈 Aquí filtras múltiples estados
 
    .order('id', { ascending: true })


  if (error) {
    console.error('Error cargando reservas:', error)
  } else {
    reservas.value = data
  }
}

const iniciarviaje = async (reservaId) => {
  handleClick() // Deshabilitar el botón al hacer clic


   
  // 1️⃣ Actualizar reserva
  // Se añade .select() para obtener los datos actualizados, incluyendo id_vehiculo
  const { data: reservaData, error: reservaError } = await supabase
    .from('reservas')
    .update({ estado: 'En viaje' })
    .eq('id', reservaId)
    .select(); // 👈 IMPORTANTE: Añadir .select() para obtener los datos

  // Manejo de error de la reserva
  if (reservaError) {
    throw reservaError;
  }
  
  // Verificar si se encontró y actualizó la reserva
  if (!reservaData || reservaData.length === 0) {
    throw new Error(`Reserva con ID ${reservaId} no encontrada o no actualizada.`);
  }

  cargarReservas(); // Recargar reservas después de iniciar el viaje
  console.log("Iniciando viaje para reserva ID:", reservaId);
  
};

onMounted(() => {
  cargarReservas()
})
</script>

<style scoped>



</style>