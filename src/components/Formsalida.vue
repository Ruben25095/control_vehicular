<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

const gasolina = ref(['4/4', '3/4', '2/4', '1/4', '0/4'])
const kilometrage_final = ref('')
const nivel_gasolina = ref('')

const props = defineProps({
  isOpen: Boolean,
  vehiculo: Object,
  reservas: Object
})

const emit = defineEmits(['close'])
const closeModal = () => emit('close')

// 👉 Lógica de terminar viaje
const terminarViaje = async () => {
  const km_recorridos = kilometrage_final.value - props.reservas?.vehiculo.kilometraje
  if (!props.reservas?.id) {
    alert('No se recibió una reserva válida')
    return
  }

  const { error: reservaError } = await supabase
    .from('reservas')
    .update({
      estado: 'Finalizada',
      kilometrage_final: kilometrage_final.value,
      km_recorridos
    })
    .eq('id', props.reservas.id)

  if (reservaError) {
    console.error('Error al finalizar reserva:', reservaError)
    return
  }

  if (props.reservas?.vehiculo.id_num_economico) {
    const { error: vehiculoError } = await supabase
      .from('vehiculos')
      .update({
        disponible: true,
        kilometraje: kilometrage_final.value,
        combustible: nivel_gasolina.value
      })
      .eq('id_num_economico', props.reservas?.vehiculo.id_num_economico)

    if (vehiculoError) {
      console.error('Error al actualizar vehículo:', vehiculoError)
      return
    }
  }

  alert(`Viaje de reserva #${props.reservas.id} finalizado con éxito`)
  closeModal()
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
  >
    <div
      class="relative bg-white w-3/5 max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-10 animate-fade-in flex flex-col gap-8"
    >
      <!-- Botón de cierre -->
      <button
        @click="closeModal"
        class="absolute top-4 right-5 text-gray-500 hover:text-red-600 text-3xl font-bold"
      >
        ✕
      </button>

      <!-- Título -->
      <h2 class="text-3xl font-bold text-gray-800 text-center mb-2">
        Finalizar Viaje
      </h2>

      <!-- Información del vehículo -->
      <div class="bg-gray-100 p-4 rounded-xl text-gray-700">
        <h3 class="font-semibold text-lg mb-2">Vehículo</h3>
        <p><strong>Marca:</strong> {{ props.reservas?.vehiculo?.marca }}</p>
        <p><strong>Modelo:</strong> {{ props.reservas?.vehiculo?.modelo }}</p>
        <p><strong>Kilometraje inicial:</strong> {{ props.reservas?.vehiculo?.kilometraje }} km</p>
      </div>

      <!-- Nivel de gasolina -->
      <div class="flex flex-col gap-3">
        <label class="text-lg font-medium text-gray-700">
          Nivel de gasolina:
        </label>
        <select
          v-model="nivel_gasolina"
          class="border border-gray-300 rounded-lg px-4 py-3 text-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
        >
          <option disabled value="">Selecciona el nivel de gasolina</option>
          <option
            v-for="nivel in gasolina"
            :key="nivel"
            :value="nivel"
          >
            {{ nivel }}
          </option>
        </select>
      </div>

      <!-- Kilometraje final -->
      <div class="flex flex-col gap-3">
        <label class="text-lg font-medium text-gray-700">
          Kilometraje final:
        </label>
        <input
          v-model="kilometrage_final"
          type="number"
          placeholder="Ejemplo: 15300"
          class="border border-gray-300 rounded-lg px-4 py-3 text-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
        />
      </div>

      <!-- Botón principal -->
      <div class="flex justify-center mt-4">
        <button
          @click="terminarViaje"
          class="bg-green-600 hover:bg-green-700 text-white font-semibold text-lg py-3 px-8 rounded-xl shadow-md transition-all active:scale-95"
        >
          Terminar viaje
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.25s ease-out;
}
</style>
