<script setup>
import AppHeader from '../components/AppHeader.vue';
import VehiculoCard from '@/components/VehiculoCard.vue';
//import VehiculoCard1 from '@/components/VehiculoCard1.vue';
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
//import VehiculoCard from '@/components/VehiculoCard.vue'

const vehiculos = ref([])
const error = ref(null)

async function getvehiculos() {
  try {
    const { data, error: fetchError } = await supabase
      .from('vehiculos')
      .select('*')
      .order('id_vehiculo', { ascending: true })
      //.eq('disponible', true) // opcional: solo disponibles
    if (fetchError) throw fetchError
    vehiculos.value = data
  } catch (err) {
    console.error('Error al obtener datos:', err)
    error.value = 'No se pudieron cargar los vehículos.'
  }
}






onMounted(() => {
  getvehiculos()
})




</script>


<template>
   <AppHeader/>        
  <div class="flex  flex-col gap-4   bg-slate-400">
  <div class="flex w-full bg-gray-100 justify-center " >/
    <h1 class="text-black text-2xl ">Solicitar Unidades</h1>
    
  </div>
    <div> 
      <div  class="flex flex-wrap  gap-6 justify-center p-6 bg-slate-400 ">
        <!--VehiculoCard  /-->
        <!-- <VehiculoCard1 /> -->
        <VehiculoCard
        v-for="vehiculo in vehiculos"
      :key="vehiculo.id_vehiculo"
      :vehiculo="vehiculo"
     
    />
    

  </div>
    
    </div>
  </div>
</template>

<style>



</style>