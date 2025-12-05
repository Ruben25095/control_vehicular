<script setup>

//############################################################################

import { ref, computed, onMounted, watch } from 'vue'

import { supabase } from '@/lib/supabase'

import {useAuth} from '@/components/useAuth'

import { VueDatePicker } from '@vuepic/vue-datepicker';
 
import '@vuepic/vue-datepicker/dist/main.css'





const isLoading = ref(false)

const fechasBloqueadas = ref([])

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

function generarRangoDias(inicio, fin) {

const dias = []

// parsear YYYY-MM-DD a Date local

const [y1, m1, d1] = inicio.split('-').map(Number)

const [y2, m2, d2] = fin.split('-').map(Number)

let actual = new Date(y1, m1 - 1, d1)

const limite = new Date(y2, m2 - 1, d2)



while (actual <= limite) {

// empujar copia nueva (para no mutar la referencia)

dias.push(new Date(actual.getFullYear(), actual.getMonth(), actual.getDate()))

actual.setDate(actual.getDate() + 1)

}

return dias // ahora es Date[]

}







onMounted(async () => {

console.log("🔹 Modal mounted, vehículo recibido desde props:")

console.log(props.vehiculo)



console.log("🔹 ID del vehículo para consulta:")

console.log(props.vehiculo.id_vehiculo)



const { data: { user } } = await supabase.auth.getUser()

if (user) currentUserId.value = user.id



const hoyFecha = new Date()

hoy.value = hoyFecha.toISOString().split('T')[0]



const { data: reservas, error } = await supabase

.from('reservas')

.select('fecha_inicio, fecha_fin, estado')

.eq('id_vehiculo', props.vehiculo.id_vehiculo)

.eq('estado','aprobado')



console.log("🔹 Respuesta de Supabase:")

console.log("reservas:", reservas)

console.log("error:", error)



if (!error && reservas.length) {

let dias = []

reservas.forEach(r => {

const rango = generarRangoDias(r.fecha_inicio, r.fecha_fin)

dias = dias.concat(rango)

console.log("🔸 Rango generado:", rango)

})

console.log("🔹 Lista de fechas concatenadas antes de guardar:", dias)



fechasBloqueadas.value=dias



console.log("✅ Fechas convertidas a Date para datepicker:", fechasBloqueadas.value)

}else {

console.log("⚠ No hubo reservas aprobadas o hubo error")

}



})



const errorRangoFechas = computed(() => {

if (!fecha_inicio.value || !fecha_fin.value) return ''

return new Date(fecha_fin.value) < new Date(fecha_inicio.value)

? 'La fecha final no puede ser menor a la fecha de inicio.'

: ''

})



watch(() => props.isOpen, (nuevo) => {

if (nuevo) {

resetForm()

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

isSubmitting.value = false

isLoading.value = false

errorMessage.value = ''

successMessage.value = ''

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

estado: 'pendiente',

img_vehiculo: props.vehiculo.img_url,

aprovado_por:'',

id_num_economico:props.vehiculo.id_num_economico,

id_vehiculo:props.vehiculo.id_vehiculo,

kilometrage_inicial:props.vehiculo.kilometraje,

motivo:motivo.value,

}



try {

// Insertar en reservas

const { data: reservaData, error: reservaError } = await supabase

.from('reservas')

.insert([nuevaReserva])

.select()



if (reservaError) throw reservaError



// Actualizar estado del vehículo (ejemplo: marcar como no disponible)

const { error: vehiculoError } = await supabase

.from('vehiculos')

.update({ disponible: false })

.eq('id_vehiculo', nuevaReserva.id_vehiculo)



if (vehiculoError) throw vehiculoError



successMessage.value = `Reserva creada con éxito! ID: ${reservaData[0].id}`


setTimeout(() => {

isReserving.value = false


closeModal()

},8000)

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
  <div 
    v-if="isOpen" 
    class="modal-backdrop"
  >
    <div class="modal-container">

      <!-- Botón cerrar -->
      <button @click="closeModal" class="btn-close">✕</button>

      <!-- Título -->
      <h2 class="modal-title">Nueva Solicitud de Salida</h2>

      <!-- Imagen + datos -->
      <div class="info-section">
        <img :src="vehiculo.img_url" alt="Vehículo" class="vehiculo-img"/>
        
        <div class="data-section">
          <p class="label">ECONÓMICO:</p>
          <p class="value">{{ vehiculo.id_num_economico }}</p>

          <p class="label mt-2">USUARIO:</p>
          <p class="value text-truncate">{{ currentUser.email }}</p>
        </div>
      </div>

      <!-- Fechas -->
      <div class="form-section">
        <label>Fecha de Salida</label>
        <VueDatePicker
          v-model="fecha_inicio"
          :disabled-dates="fechasBloqueadas"
          format="yyyy-MM-dd"
          :min-date="hoy"
          :enable-time-picker="false"
          dark
          class="carbon-picker"
        />

        <label>Fecha final</label>
        <VueDatePicker
          v-model="fecha_fin"
          :disabled-dates="fechasBloqueadas"
          format="yyyy-MM-dd"
          :min-date="hoy"
          :enable-time-picker="false"
          dark
          class="carbon-picker"
        />

        <!-- Mensajes -->
        <p v-if="errorRangoFechas" class="msg error">{{ errorRangoFechas }}</p>
        <p v-if="errorMessage" class="msg error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="msg success">{{ successMessage }}</p>
      </div>

      <!-- Motivo -->
      <div class="form-section">
        <label>Motivo</label>
        <textarea 
          v-model="motivo"
          maxlength="120"
          class="carbon-input"
          placeholder="Describe el motivo de la reserva..."
          required
        ></textarea>
      </div>

      <!-- Botón -->
      <div class="modal-footer">
        <button
          :disabled="isLoading"
          @click="realizarReserva"
          class="btn-submit"
          :class="{ loading: isLoading }"
        >
          {{ isLoading ? 'Cargando...' : 'Enviar Solicitud' }}
        </button>
      </div>

    </div>
  </div>
</template>




<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap');

:root {
  --carbon-bg: #1b1b1b;
  --carbon-card: #252525;
  --text-white: #fff;
  --text-gray: #bdbdbd;
  --accent-red: #ff3b30;
  --accent-blue: #3b82f6;
  --border: #333;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal-container {
  background: var(--carbon-card);
  color: var(--text-white);
  width: 95%;
  max-width: 430px;
  padding: 24px;
  border-radius: 18px;
  border: 1px solid var(--border);
  box-shadow: 0 0 40px rgba(0,0,0,0.6);
  position: relative;
}

/* Cerrar */
.btn-close {
  position: absolute;
  top: 12px;
  right: 14px;
  background: transparent;
  border: none;
  color: #888;
  font-size: 1.6rem;
  cursor: pointer;
  transition: .2s;
}
.btn-close:hover {
  color: var(--accent-red);
}

/* Título */
.modal-title {
  text-align: center;
  font-family: 'Oswald', sans-serif;
  font-size: 1.6rem;
  text-transform: uppercase;
  margin-bottom: 16px;
}

/* Info vehículo */
.info-section {
  display: flex;
  gap: 18px;
  align-items: center;
  background: #1f1f1f;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  margin-bottom: 20px;
}
.vehiculo-img {
  width: 90px;
  height: 70px;
  object-fit: contain;
}
.data-section .label {
  font-family: 'Oswald', sans-serif;
  color: #ccc;
  font-size: 0.8rem;
}
.data-section .value {
  font-family: 'Roboto';
  font-size: 1rem;
}
.text-truncate {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Formularios */
.form-section label {
  color: var(--text-gray);
  font-size: 0.9rem;
  margin: 4px 0;
  display: block;
  font-family: 'Roboto';
}

.carbon-input {
  width: 100%;
  background: #202020;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 12px;
  color: white;
  font-size: 1rem;
  resize: none;
  transition: .2s;
}
.carbon-input:focus {
  border-color: var(--accent-red);
}

.msg { text-align: center; margin-top: 6px; font-size: .9rem; }
.msg.error { color: #ff3b30; }
.msg.success { color: #22c55e; }

/* Footer */
.modal-footer {
  margin-top: 22px;
}

.btn-submit {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background: var(--accent-blue);
  border: none;
  color: white;
  text-transform: uppercase;
  font-family: 'Oswald';
  letter-spacing: 1px;
  cursor: pointer;
  transition: .2s;
}
.btn-submit:hover {
  background: #2563eb;
}
.btn-submit.loading,
.btn-submit:disabled {
  background: #555;
  cursor: not-allowed;
}

/* Datepicker - modo oscuro */
:deep(.dp__theme_dark) {
  --dp-background-color: #2a2a2a;
  --dp-text-color: white;
  --dp-hover-color: #333;
  --dp-primary-color: var(--accent-blue);
}
</style>
