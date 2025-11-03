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
        <p><strong>Usuario:</strong> {{ reserva.usuario?.nombre || reserva.usuario?.nombre_user || 'Desconocido' }}</p>
        <p><strong>Autorizo:</strong> {{  reserva.aprovado_por || 'Desconocido' }}</p>
        <p><strong>Vehículo:</strong> {{ reserva.vehiculo?.marca }} {{ reserva.vehiculo?.modelo }}</p>
        <p><strong>Fecha inicio:</strong> {{ formatFecha(reserva.fecha_inicio) }}</p>
         <p><strong>Fecha fin:</strong> {{ formatFecha(reserva.fecha_fin) }}</p>
       
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
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

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
      usuario:usuario_id (nombre_user, email),
      vehiculo:id_vehiculo (marca, modelo, img_url,id_num_economico)
    `)
    .eq('estado','Aprobada')
    .order('id', { ascending: true })
  

  if (error) {
    console.error('Error cargando reservas:', error)
  } else {
    reservas.value = data
  }
}

onMounted(() => {
  cargarReservas()
})
</script>
