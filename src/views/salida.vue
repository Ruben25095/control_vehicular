<script setup>
import AppHeader from '@/components/AppHeader.vue'
import Salidas from '@/components/Salidas.vue';
import { Container } from 'postcss';

</script>


<template>
    
    <AppHeader/>
 <div class="  flex flex-col h-full  "> <h1 class="text-2xl text-center text-white bg-red-600">Salidas Autorizadas </h1>  </div>
    <Salidas/>

</template>

<style>
.container {
  min-height: 100vh;
  background-color:red;
}


</style>