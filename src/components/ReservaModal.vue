<script setup>
//############################################################################
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '@/lib/supabase' 
import {useAuth} from '@/components/useAuth'
const isLoading = ref(false)





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




// Emitir eventos al componente padre
const emit = defineEmits(['close', 'submit'])

// Datos del formulario

  
 const fecha_inicio=ref('')
 const fecha_fin= ref('')
 const motivo=ref('')
  
 
 const resetForm = () => {
  fecha_inicio.value = ''
  fecha_fin.value = ''
  motivo.value = ''
  isLoading.value = false 
}

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
//Realizar reserva 
const currentUserId = ref(null);

const hoy = ref('')
const finSemana = ref('')

onMounted(async () => {
  try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          currentUserId.value = user.id;
      }
  } catch (e) {
      console.error("Error al cargar el usuario: ", e);
  }

 
  const hoyFecha = new Date()

  // Establecer "min" como hoy
  hoy.value = hoyFecha.toISOString().split('T')[0]

  // Calcular el domingo de la semana actual (o +7 días)
  const fin = new Date(hoyFecha)
  fin.setDate(hoyFecha.getDate() + (7 - hoyFecha.getDay()))
  finSemana.value = fin.toISOString().split('T')[0]
})

const isReserving = ref(false) 
const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

/**
 * Inserta la reserva en la tabla 'reservas' de Supabase.
 */
 async function realizarReserva() {
  if (!fecha_inicio.value || !fecha_fin.value) {
    errorMessage.value = 'Debes seleccionar ambas fechas.'
    return
  }

  if (new Date(fecha_inicio.value) > new Date(fecha_fin.value)) {
    errorMessage.value = 'La fecha de inicio no puede ser posterior a la de fin.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true
  const nuevaReserva = {
    usuario_id: currentUserId.value,
    //vehiculo_id: props.vehiculo.vehiculo_id,
    fecha_inicio: fecha_inicio.value,
    fecha_fin: fecha_fin.value,
     estado: 'Pendiente',
     img_vehiculo: props.vehiculo.img_url,
    aprovado_por:'',
    id_num_economico:props.vehiculo.id_num_economico,
    id_vehiculo:props.vehiculo.id_vehiculo,
    motivo:motivo.value,
  }

  try {
    // 1️⃣ Insertar en reservas
    const { data: reservaData, error: reservaError } = await supabase
      .from('reservas')
      .insert([nuevaReserva])
      .select()

    if (reservaError) throw reservaError

    // 2️⃣ Actualizar estado del vehículo (ejemplo: marcar como no disponible)
    const { error: vehiculoError } = await supabase
      .from('vehiculos')
      .update({ disponible: false })
      .eq('id_vehiculo', nuevaReserva.id_vehiculo)

    if (vehiculoError) throw vehiculoError

    successMessage.value = `Reserva creada con éxito! ID: ${reservaData[0].id}`
        
    setTimeout(() => {
      isReserving.value = false
     
      closeModal()
    },1000)
    //resetForm()
  } catch (err) {
    console.error('Error al crear la reserva:', err)
    isLoading.value = false 
    errorMessage.value = `Error al crear la reserva: ${err.message}`
  } finally {
  
    isSubmitting.value = false
   
  }
}














</script>




<template>
    <div v-if="isOpen" class="fixed  inset-0 bg-gray-400 bg-opacity-40 flex justify-center items-center placce-cente z-50">
        <div class="flex flex-col  bg-white rounded-2xl shadow-xl p-6 w-1/4 h-9/12  relative">
            <!-- Botón de cerrar -->
            <button @click="closeModal" class="absolute top-3 text-3xl right-3 text-red-500 hover:text-blue-700">
                ✕
              </button>
    
            <h2 class="flex  justify-center text-2xl text-black font-bold mb-4 text-center">Nueva Solicitud de Salida</h2>
            <div class="w-full flex flex-col items-center mb-4">
                <img :src="vehiculo.img_url" alt="Ícono de vehículo" class="flex w-2/4  h-3/4  mb-2" />
              
                <h1 class="text-black text-2xl">{{currentUser.email}}</h1>

                <h1 class="text-black text-2xl">{{ vehiculo.id_num_economico }}</h1>
                
            </div>
    
    
           
                <!-- Fecha de inicio -->
                <div class="flex flex-col items-center">
                    <label class="block text-black font-semibold mb-1">Fecha de Salida</label>
                    <input v-model="fecha_inicio" type="date"id="fecha_inicio" :min="hoy" class="w-11/12 border text-black text-2xl rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300" required />
                </div>

                  <!-- Fecha final -->
                  <div class="flex flex-col items-center">
                    <label class="block text-black font-semibold mb-1">Fecha final</label>
                    <input v-model="fecha_fin" type="date"id="fecha_fin" :min="hoy"  class="w-11/12 border justify-center text-black text-2xl rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300" required />
                </div>
    
    
                <!-- Motivo -->
                <div class="flex flex-col items-center">
                    <label class="block  text-black font-semibold mb-1">Motivo</label>
                    <textarea v-model="motivo" rows="3" cols="50" maxlength="120" class="w-11/12 h-full   text-black border-2 border-blue-600 rounded-lg px-3 py-2 text-2xl focus:outline-none focus:ring focus:ring-blue-300" 
                    placeholder="Describe el motivo de la reserva..." required></textarea>
                </div>
                
    
                <!-- Botón enviar --> 
                <div class="flex w-full h-20 justify-center-safe my-15 mx-20 place-items-center-safe">
                    <button :disabled="isLoading" @click="realizarReserva"  class="flex justify-center items-center  w-40 h-10  bg-blue-600 hover:bg-lime-400 text-white hover:text-black rounded-lg">
                        {{ isLoading ? 'Cargando...' : 'Enviar Solicitud' }}
                  </button>
                </div>
         
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
