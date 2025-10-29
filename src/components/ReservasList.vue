<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4 text-black">Listado de Reservas</h2>

    <!-- Mostrar mensaje si no hay reservas -->
    <div v-if="reservas.length === 0" class="text-black">
      No hay reservas registradas.
    </div>

    <!-- Lista de reservas -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="reserva in reservas"
        :key="reserva.id"
        class="bg-gray text-black rounded-xl shadow-md p-4 hover:shadow-lg transition"
      >
        <h3 class=" bg-sky-300 font-semibold text-lg mb-2">
          Reserva #{{ reserva.id_reserva }}
        </h3>
        <p><strong>Usuario:</strong> {{ reserva.usuario.nombre }}</p>
        <p><strong>Vehículo:</strong> {{ reserva.vehiculo.marca }} {{ reserva.vehiculo.modelo }}</p>
        <p><strong>Fecha inicio:</strong> {{ formatFecha(reserva.fecha_inicio) }}</p>
        <p><strong>Fecha fin:</strong> {{ formatFecha(reserva.fecha_fin) }}</p>
       
        <p><strong>Estado:</strong> {{ reserva.estado }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase' // Ajusta la ruta según tu proyecto

const reservas = ref([])

// Función para formatear fechas
function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString()
}

// Cargar las reservas con relaciones
const cargarReservas = async () => {
  const { data, error } = await supabase
    .from('reservas')
    .select(`
      id,
      id_reserva,
      fecha_inicio,
      fecha_fin,

      estado,
      usuario:usuario_id (nombre, email),
      vehiculo:vehiculo_id (marca, modelo, imagen_url)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando reservas:', error)
  } else {
    reservas.value = data
  }
}
console.log(reservas)
onMounted(() => {
  cargarReservas()
})
</script>

<style scoped>
/* Pequeños estilos opcionales */
</style>
