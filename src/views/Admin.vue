<template>
  <div class="min-h-screen  bg-gray-300">
   
    <AppHeader/>
    <h1 class="text-3xl font-bold text-center text-black ">Panel de Reservas</h1>
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
