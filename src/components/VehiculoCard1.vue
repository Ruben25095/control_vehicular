<!-- src/components/VehiculoCard.vue -->
<template>
  <div
    class="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-all duration-300 w-full max-w-sm"
  >
    <!-- Imagen del vehículo -->
    <img
      :src="vehiculo.imagen_url"
      alt="Vehículo"
      class="w-full h-48 object-cover rounded-xl mb-4"
    />

    <!-- ID -->
    <h2 class="text-lg font-bold text-gray-800">
      ID: {{ vehiculo.id_num_economico }}
    </h2>

    <!-- Estado -->
    <p
      class="font-semibold mt-1"
      :class="vehiculo.disponible ? 'text-green-600' : 'text-red-500'"
    >
      {{ vehiculo.disponible ? 'Disponible' : 'No disponible' }}
    </p>

    <!-- Nivel de gasolina -->
    <h1 class="text-black">{{ vehiculo.combustible }}</h1>

    <div class="flex justify-end mt-4">
    <button  @click="getusurio()" 
     class="flex-col justify-center mb-2 mr-2 items-center  bg-green-600 text-white text-3xl w-10 h-10 hover:bg-lime-300 ">+</button>
      
      
 
 
    </div>
    <!-- Barra de gasolina -->
    <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
      <div
        class="h-2 rounded-full"
        :class="{
          'bg-green-500': vehiculo.combustible === '4/4',
          'bg-yellow-400':
            vehiculo.combustible === '3/4' || vehiculo.combustible === '2/4',
          'bg-red-500': vehiculo.combustible === '1/4',
          'bg-gray-500': vehiculo.combustible === '0/4',
        }"
        :style="{
          width:
            vehiculo.combustible === '4/4'
              ? '100%'
              : vehiculo.combustible === '3/4'
              ? '75%'
              : vehiculo.combustible === '2/4'
              ? '50%'
              : vehiculo.combustible === '1/4'
              ? '25%'
              : '0%',
        }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
const usuarios = ref([])
async function getusurio() {
  try {
    const { data, error: fetchError } = await supabase
      .from('usuarios')
      .select('*')
      console.log( data)
      //.eq('disponible', true) // opcional: solo disponibles
    if (fetchError) throw fetchError
         usuarios.value = data
  } catch (err) {
    console.error('Error al obtener datos:', err)
    error.value = 'No se pudieron cargar los vehículos.'
  }
}


defineProps({
  vehiculo: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
@import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
</style>
