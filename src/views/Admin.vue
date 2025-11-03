<template>
  <div class="min-h-screen  bg-gray-300">
   
    <AppHeader/>
   <div class="flex flex-row items-center justify-center "> <h1 class="text-black text-7xl">Solicitudes de Salida</h1></div>
    <!-- Aquí llamas a tu componente -->
    <ReservasList  />
  </div>
</template>

<script setup>
import ReservasList from '@/components/ReservasList.vue'
import AppHeader from '@/components/AppHeader.vue';

const props = defineProps({
  reserva: {
    type: Object,
    required: true,
  },
})
</script>
