<script setup>
//############################################################################
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '@/lib/supabase' 
import {useAuth} from '@/components/useAuth'
const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true
    },
    vehiculo: {
        type: Object,
        required: 
        true
    }
  


  
})

/*     id_reserva:'',
   fecha_inicio: '',
    fecha_fin: '',
    estado: 'pendiente',
    img_vehiculo:'',
    aprovado_por:'NULL',
    usuario_id:'',
    id_num_economico:'',
    id_vehiculo:'',
    motivo:'',
     */


// Emitir eventos al componente padre
const emit = defineEmits(['close', 'submit'])

// Datos del formulario
const form = ref({
  
   fecha_inicio: '',
    fecha_fin: '',
    motivo:'',
  
  
  })
//reset form cuando se abre el modal
const resetForm = () => {
  form.value = {
    fecha_inicio: '',
    fecha_fin: '',
    motivo:'',
  }
}

 
// 3. Cargar el ID del usuario al montar (para resolver el Foreign Key anterior)

// Calcular fecha actual


// Cerrar modal
const closeModal = () => {
    emit('close')
}


const { user } = useAuth()

// Usuario actual
const currentUser = computed(() => {
  if (!user.value) return null
  return {
    name: user.value.user_metadata?.name || 'Sin nombre',
    email: user.value.email,
    avatarUrl: user.value.user_metadata?.avatar_url || '',
  }
})






const hoy = ref('')
const finSemana = ref('')

onMounted(() => {
 
  const hoyFecha = new Date()

  // Establecer "min" como hoy
  hoy.value = hoyFecha.toISOString().split('T')[0]

  // Calcular el domingo de la semana actual (o +7 días)
  const fin = new Date(hoyFecha)
  fin.setDate(hoyFecha.getDate() + (7 - hoyFecha.getDay()))
  finSemana.value = fin.toISOString().split('T')[0]
})







</script>




<template>
    <div v-if="isOpen" class="fixed inset-0 bg-gray-400 bg-opacity-40 flex justify-center items-center z-50">
        <div class="bg-white rounded-2xl shadow-xl p-6 w-1/2 h-3/4   relative">
            <!-- Botón de cerrar -->
            <button @click="closeModal" class="absolute top-3 text-3xl right-3 text-red-500 hover:text-blue-700">
                ✕
              </button>
    
            <h2 class="text-2xl text-black font-bold mb-4 text-center">Nueva Solicitud de Salida</h2>
            <div class="w-full flex flex-col items-center mb-4">
                <img :src="vehiculo.img_url" alt="Ícono de vehículo" class="flex w-1/4  h-1/4 mx-auto mb-2" />
              
                <h1 class="text-black text-2xl">{{currentUser.email}}</h1>

                <h1 class="text-black text-2xl">{{ vehiculo.id_num_economico }}</h1>
                
            </div>
    
    
            <form @submit.prevent="enviarSolicitud" class="space-y-4">
    
    
                <!-- Fecha de inicio -->
                <div class="flex flex-col items-center">
                    <label class="block text-black font-semibold mb-1">Fecha de Salida</label>
                    <input v-model="form.fecha_inicio" type="date"id="fecha_inicio" :min="hoy" class="w-11/12 border text-black text-2xl rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300" required />
                </div>

                  <!-- Fecha final -->
                  <div class="flex flex-col items-center">
                    <label class="block text-black font-semibold mb-1">Fecha final</label>
                    <input v-model="form.fecha_fin" type="date"id="fecha_inicio" :min="hoy"  class="w-11/12 border justify-center text-black text-2xl rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300" required />
                </div>
    
    
                <!-- Motivo -->
                <div class="flex flex-col items-center">
                    <label class="block  text-black font-semibold mb-1">Motivo</label>
                    <textarea v-model="form.motivo" rows="6"  class="w-11/12 h-full   text-black border-2 border-blue-600 rounded-lg px-3 py-2 text-2xl focus:outline-none focus:ring focus:ring-blue-300" 
                    placeholder="Describe el motivo de la reserva..." required></textarea>
                </div>
    
                <!-- Botón enviar --> 
                <div class="flex justify-center">
                    <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                    Enviar solicitud
                  </button>
                </div>
            </form>
        </div>
    </div>
</template>





<style scoped>
/* Opcional: animación de aparición */

div[role="dialog"] {
    animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>
