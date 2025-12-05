<template>
  <div class="list-container">
    <div v-if="reservas.length === 0" class="no-reservations">
      No hay reservas registradas.
    </div>

    <div v-else class="reservations-grid">
      <div
        v-for="reserva in reservas"
        :key="reserva.id"
        class="reservation-card group"
      >
        
        <!-- TARJETA -->
        <h3 class="card-title">Reserva #{{ reserva.id }}</h3>

        <div v-if="reserva.vehiculo?.img_url" class="card-image-wrapper">
          <img :src="reserva.vehiculo.img_url" class="card-image" />
        </div>

        <div class="details-content">
          <p class="detail-item">
            <span class="detail-label">No. Económico:</span>
            <span class="detail-value">{{ reserva.vehiculo?.id_num_economico }}</span>
          </p>

          <p class="detail-item">
            <span class="detail-label">Usuario:</span>
            <span class="detail-value">{{ reserva.usuario?.nombre || reserva.usuario?.name }}</span>
          </p>

          <p class="detail-item">
            <span class="detail-label">Autorizo:</span>
            <span class="detail-value">{{ reserva.aprovado_por }}</span>
          </p>

          <p class="detail-item">
            <span class="detail-label">Vehículo:</span>
            <span class="detail-value">{{ reserva.vehiculo?.marca }} {{ reserva.vehiculo?.modelo }}</span>
          </p>

          <p class="detail-item">
            <span class="detail-label">Fecha de salida:</span>
            <span class="detail-value">{{ formatFecha(reserva.fecha_inicio) }}</span>
          </p>

          <p class="detail-item">
            <span class="detail-label">Estado:</span>
            <span class="state-text"
              :class="{
                'state-approved': reserva.estado === 'aprobado',
                'state-pending': reserva.estado === 'pendiente',
                'state-travel': reserva.estado === 'En viaje',
                'state-rejected': reserva.estado === 'rechazado'
              }"
            >
              {{ reserva.estado }}
            </span>
          </p>
        </div>

        <div class="action-buttons">
          <button
            :disabled="isDisabled"
            @click="iniciarviaje(reserva.id)"
            class="btn-action btn-start"
          >
            →
          </button>

          <button
            @click="abrirModal(reserva)"
            class="btn-action btn-cancel"
          >
            X
          </button>
        </div>
      </div>
    </div>

    <!-- 🚨 MODAL ÚNICO (FUERA DEL v-for) -->
    <Formsalida
      v-if="modalAbierto"
      :isOpen="modalAbierto"
      :vehiculo="reservaSeleccionada?.vehiculo"
      :reservas="reservaSeleccionada"
      @close="cerrarModal"
    />
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import Formsalida from './Formsalida.vue'


const props = defineProps({
  isOpen: Boolean,
  vehiculo: {
        type: Object,
        required: 
        true
    },
    reservas: {
        type: Object,
        required: 
        true
    },
  
  
})

const isDisabled = ref(false)


const handleClick = async () => {
  isDisabled.value = true// deshabilita el botón
}


//Funciones para el modal de reserva
const modalAbierto = ref(false)
const reservaSeleccionada = ref(null) // 🔹 Aquí guardaremos la reserva actual

const abrirModal = (reserva) => {
  reservaSeleccionada.value = reserva
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
  reservaSeleccionada.value = null
  cargarReservas() // Recargar reservas al cerrar el modal
}




const reservas = ref([])

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-MX') // Formato español/mexicano
}

const cargarReservas = async () => {
  const { data, error } = await supabase
    .from('reservas')
    .select(`
      id,
      fecha_inicio,
      fecha_fin,
      estado,
      aprovado_por,
      usuario:usuario_id (name,email),
      vehiculo:id_vehiculo (marca, modelo, img_url,id_num_economico,kilometraje)
    `)
    .in('estado', ['aprobado', 'En viaje']) // 👈 Aquí filtras múltiples estados
 
    .order('id', { ascending: true })


  if (error) {
    console.error('Error cargando reservas:', error)
  } else {
    reservas.value = data
  }
}

const iniciarviaje = async (reservaId) => {
  handleClick() // Deshabilitar el botón al hacer clic


   
  // 1️⃣ Actualizar reserva
  // Se añade .select() para obtener los datos actualizados, incluyendo id_vehiculo
  const { data: reservaData, error: reservaError } = await supabase
    .from('reservas')
    .update({ estado: 'En viaje' })
    .eq('id', reservaId)
    .select(); // 👈 IMPORTANTE: Añadir .select() para obtener los datos

  // Manejo de error de la reserva
  if (reservaError) {
    throw reservaError;
  }
  
  // Verificar si se encontró y actualizó la reserva
  if (!reservaData || reservaData.length === 0) {
    throw new Error(`Reserva con ID ${reservaId} no encontrada o no actualizada.`);
  }

  cargarReservas(); // Recargar reservas después de iniciar el viaje
  console.log("Iniciando viaje para reserva ID:", reservaId);
  
};

onMounted(() => {
  cargarReservas()
})
</script>

<style scoped>
/* PALETA: 
   Fondo: #1C1C1C (Gris Fibra de Carbono)
   Negro: #000000
   Texto Claro: #FFFFFF (Blanco Nítido)
   Texto Secundario: #BDBDBD (Gris Acero)
   Acento: #FF3B30 (Rojo Deportivo)
*/

/* === CONTENEDOR PRINCIPAL === */
.list-container {
  /* Usamos el Gris Fibra de Carbono del componente de referencia */
  background: #1C1C1C; 
  padding: 24px;
}

.no-reservations {
  color: #FFFFFF; /* Texto blanco para el mensaje */
  text-align: center;
  font-size: 1.2rem;
  padding: 20px;
}

/* === GRID DE RESERVAS === */
.reservations-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  justify-items: center;
}

/* === TARJETA INDIVIDUAL === */
.reservation-card {
  /* Fondo más oscuro para la card, parecido al fondo de la card de vehículo */
  background: #1C1C1C; 
  border-radius: 12px;
  /* Sombra sutil como en la referencia */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4); 
  border: 1px solid #333333; /* Borde sutil */
  width: 100%;
  max-width: 400px;
  padding: 16px;
  transition: all 0.3s ease;
  position: relative;
}

.reservation-card:hover {
  /* Sombra más prominente al hacer hover */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6); 
  transform: translateY(-2px);
}

/* Título */
.card-title {
  /* Usamos el color de acento para el encabezado de la card */
  background: #FF3B30; 
  color: #FFFFFF;
  font-weight: 700;
  font-size: 1.25rem;
  margin-bottom: 12px;
  padding: 6px;
  border-radius: 6px;
  text-align: center;
  letter-spacing: 0.5px;
}

/* Imagen */
.card-image-wrapper {
  display: flex;
  justify-content: center;
  margin: 10px 0;
}

.card-image {
  width: 100%;
  max-width: 160px; /* Tamaño un poco más controlado */
  height: 96px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #333333;
}

/* Detalles */
.details-content {
  padding: 8px 0;
  border-top: 1px solid #333333; /* Separador sutil */
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 0.95rem;
}

.detail-label {
  /* Gris Acero para las etiquetas */
  color: #BDBDBD; 
  font-weight: 400;
}

.detail-value {
  /* Blanco Nítido para los valores */
  color: #FFFFFF; 
  font-weight: 600;
  text-align: right;
}

/* Estado */
.state-label {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px dashed #333333;
}

.state-text {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Colores de Estado - Mantenemos la lógica de la card de vehículo */
.state-approved { color: #22c55e; } /* Verde */
.state-pending { color: #facc15; }  /* Amarillo */
.state-travel { color: #3b82f6; }   /* Azul - Nuevo para 'En viaje' */
.state-rejected { color: #ef4444; } /* Rojo */


/* === BOTONES DE ACCIÓN === */
.action-buttons {
  display: flex;
  justify-content: flex-end; /* A la derecha como el botón '+' en la card de referencia */
  gap: 12px;
  margin-top: 16px;
}

.btn-action {
  border: none;
  color: #FFFFFF;
  font-size: 1.25rem;
  font-weight: 700;
  border-radius: 8px; 
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5); 
}

/* Botón Iniciar Viaje (Flecha) */
.btn-start {
  background: #22c55e; /* Verde (Aprobado/Ir) */
  font-size: 1.75rem;
}

.btn-start:hover {
  background: #16a34a; /* Verde más oscuro */
}

/* Botón Cancelar/Modal (X) */
.btn-cancel {
  background: #FF3B30; /* Rojo Deportivo (Acento principal) */
  font-size: 1.5rem;
}

.btn-cancel:hover {
  background: #cc2f26; /* Rojo más oscuro */
}
</style>