<template>
    <div class="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-all duration-300 w-full max-w-sm">
        <img :src="vehiculo.img_url" alt="Vehículo" class="w-full h-48 object-cover rounded-xl mb-4" />
    
        <h3 class="text-xl font-bold text-gray-900">{{ vehiculo.marca }} {{ vehiculo.modelo }}</h3>
    
        <h2 class="text-lg font-bold text-gray-800">
            ID Económico: {{ vehiculo.id_num_economico }}
        </h2>
    
        <p class="font-semibold mt-1" :class="vehiculo.disponible ? 'text-green-600' : 'text-red-500'">
            {{ vehiculo.disponible ? 'Disponible' : 'No disponible' }}
        </p>
    
        <h1 class="p-1 text-black">{{ vehiculo.combustible }}</h1>
        <div class=" flex p-1 w-full  justify-end">
            <button @click="abrirModal" class=" mb-1 text-white text-2xl font-bold bg-green-400 rounded-full w-10 h-10 flex items-center justify-center hover:bg-sky-500 transition-colors">
            +
          </button>
            <ReservaModal :isOpen="modalAbierto" :vehiculo="vehiculo" @close="cerrarModal"  />
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2 mt-2 mb-4">
            <div class="h-2 rounded-full" :class="{
              'bg-green-500': vehiculo.combustible === '4/4',
              'bg-yellow-400':
                vehiculo.combustible === '3/4' || vehiculo.combustible === '2/4',
              'bg-red-500': vehiculo.combustible === '1/4',
              'bg-gray-500': vehiculo.combustible === '0/4',
            }" :style="{
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
            }"></div>
    
    
    
    
    
        </div>
    
    
    </div>
</template>

<script setup>
import { ref } from 'vue'
import ReservaModal from '@/components/ReservaModal.vue'






const props = defineProps({
  isOpen: Boolean,
  vehiculo: Object
})




//Funciones para el modal de reserva


const modalAbierto = ref(false)

const abrirModal = () => modalAbierto.value = true
const cerrarModal = () => modalAbierto.value = false







//Datos del vehiculo
</script>

<style scoped>
/* Tu estilo actual */

@import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
</style>