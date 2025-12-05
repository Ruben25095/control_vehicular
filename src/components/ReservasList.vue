<template>
    <div class="list-container">
  
      <div v-if="reservas.length === 0" class="no-reservations">
        No hay solicitudes de reserva pendientes.
      </div>
  
      <div v-else class="reservations-grid">
        <div
          v-for="reserva in reservas"
          :key="reserva.id"
          class="reservation-card group"
        >
          <h3 class="card-title">
            Solicitud #{{ reserva.id }}
          </h3>
          
          <div class="card-content">
              
              <div v-if="reserva.vehiculo?.img_url" class="card-image-wrapper">
                <img :src="reserva.vehiculo.img_url" alt="Vehículo" class="card-image" />
              </div>

              <div class="details-section">
                
                <p class="detail-item">
                  <span class="detail-label">Económico:</span> 
                  <span class="detail-value">{{  reserva.vehiculo?.id_num_economico || 'Desconocido' }}</span>
                </p>
                
                <p class="detail-item">
                  <span class="detail-label">Solicita:</span> 
                  <span class="detail-value">{{ reserva.usuario?.nombre || reserva.usuario?.name || 'Desconocido' }}</span>
                </p>
                
                <p class="detail-item">
                  <span class="detail-label">Vehículo:</span> 
                  <span class="detail-value">{{ reserva.vehiculo?.marca }} {{ reserva.vehiculo?.modelo }}</span>
                </p>
                
                <p class="detail-item date-info">
                  <span class="detail-label">Inicio:</span> 
                  <span class="detail-value">{{ formatFecha(reserva.fecha_inicio) }}</span>
                </p>
                
                 <p class="detail-item date-info">
                   <span class="detail-label">Fin:</span> 
                   <span class="detail-value">{{ formatFecha(reserva.fecha_fin) }}</span>
                 </p>
                
              </div>
          </div>
          
          <div class="motivo-box">
             <span class="label">Motivo:</span> 
             <span class="motivo-text">{{ reserva.motivo }}</span> 
          </div>

          <p class="detail-item state-label">
            <span class="detail-label">Estado:</span> 
            <span class="state-text state-pending">
              {{ reserva.estado }}
            </span>
          </p>
  
           <div class="action-buttons">
  
                 <button 
                    @click="validar(reserva.id,currentUser.name)" 
                    class="btn-action btn-accept"
                 >
                    Aprobar
                 </button>
  
                 <button 
                    @click="rechazar(reserva.id,currentUser.name)" 
                    class="btn-action btn-reject"
                 >
                    Rechazar
                 </button>
  
           </div>
  
      </div>
      </div>
  
    </div>
</template>
  
<script setup>
import { ref, onMounted,computed,watchEffect } from 'vue'
import { supabase } from '@/lib/supabase'
import {useAuth} from '@/components/useAuth'

const reservas = ref([])
const { user } = useAuth()
const usuario= ref(null) 
const errorMsg = ref('')

watchEffect(async () => {
  if (user.value) {
    const userId = user.value.id
    const { data, error } = await supabase
      .from('profiles') 
      .select('name') 
      .eq('id', userId) 
      .single() 

    if (error) {
      console.error('Error al obtener el perfil:', error)
      usuario.value = 'Sin Nombre (DB Error)'
    } else if (data) {
      usuario.value = data.name
    }
  } else {
    usuario.value = null
  }
})

const currentUser = computed(() => {
  if (!user.value) return null
  const nombre = usuario.value || user.value.email.split('@')[0] || 'Admin' 
  return {
    name: nombre, 
    email: user.value.email,
    avatarUrl: user.value.user_metadata?.avatar_url || '',
  }
})

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-MX')
}

const cargarReservas = async () => {
  const { data, error } = await supabase
    .from('reservas')
    .select(`
      id,
      fecha_inicio,
      fecha_fin,
      estado,
      motivo,
      aprovado_por,
      usuario:usuario_id (name, email),
      vehiculo:id_vehiculo (marca, modelo, img_url,id_num_economico)
     
    `)
    .eq('estado','pendiente')
    .order('id', { ascending: true })
  

  if (error) {
    console.error('Error cargando reservas:', error)
  } else {
    reservas.value = data
  }
}

async function validar(idReserva,name) {
  try {
    const { error } = await supabase
      .from('reservas')
      .update({ estado:'aprobado', aprovado_por: name})
      .eq('id', idReserva)

    if (error) throw error
    await cargarReservas()
  } catch (err) {
    console.error('Error al aprobar reserva:', err)
    errorMsg.value = 'No se pudo aprobar la reserva.'
  }
}

async function rechazar(idReserva,name) {
  try {
    const { error } = await supabase
      .from('reservas')
      .update({ estado: 'rechazado', aprovado_por: name })
      .eq('id', idReserva)

    if (error) throw error

    await cargarReservas()
  } catch (err) {
    console.error('Error al rechazar reserva:', err)
    errorMsg.value = 'No se pudo rechazar la reserva.'
  }
}


onMounted(() => {
  cargarReservas()
 
})
</script>

<style scoped>
/* PALETA DE VehiculoCard.vue */
/*
   Fondo: #1C1C1C (Gris Fibra de Carbono)
   Texto Claro: #FFFFFF (Blanco Nítido)
   Texto Secundario: #BDBDBD (Gris Acero)
   Acento: #FF3B30 (Rojo Deportivo)
   Borde: #333333 (Gris Muy Oscuro)
*/

/* === CONTENEDOR PRINCIPAL === */
.list-container {
  background: #1C1C1C; 
  padding: 24px;
  min-height: 100vh;
}

.no-reservations {
  color: #FFFFFF; 
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
  /* Fondo oscuro: Fibra de Carbono */
  background: #1C1C1C; 
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4); 
  border: 1px solid #333333; 
  width: 100%;
  max-width: 400px;
  padding: 16px;
  position: relative;
  transition: all 0.3s ease; /* Transición original de la card */
}

.reservation-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6); 
  transform: translateY(-2px); /* Efecto hover original */
}

/* Título */
.card-title {
  /* Rojo Deportivo para el encabezado */
  background: #FF3B30; 
  color: #FFFFFF;
  font-weight: 700;
  font-size: 1.25rem;
  margin-bottom: 12px;
  padding: 6px;
  border-radius: 6px;
  text-align: center;
  letter-spacing: 0.5px;
  /* La fuente se mantendrá la predeterminada del sistema o la que hayas definido globalmente */
}

.card-content {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 12px;
}

/* Imagen */
.card-image-wrapper {
  flex-shrink: 0;
  background: #000000; /* Fondo negro de la zona de imagen de la card original */
  border-radius: 6px;
}

.card-image {
  width: 100px;
  height: 80px;
  object-fit: contain;
  border-radius: 6px;
  padding: 4px;
}

/* Detalles */
.details-section {
    flex-grow: 1;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 0.9rem;
}

.detail-label {
  /* Gris Acero para etiquetas */
  color: #BDBDBD; 
  font-weight: 400;
  flex-basis: 40%;
}

.detail-value {
  /* Blanco Nítido para valores */
  color: #FFFFFF; 
  font-weight: 600;
  text-align: right;
  flex-basis: 60%;
}

/* Motivo (Separado y en bloque) */
.motivo-box {
    background: #000000; /* Negro sólido para el fondo del motivo */
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #333333;
    margin-top: 10px;
    margin-bottom: 15px;
    font-size: 0.9rem;
}

.motivo-box .label {
    font-weight: 700;
    color: #FF3B30; /* Acento rojo para la etiqueta */
    display: block;
    margin-bottom: 4px;
}

.motivo-text {
    color: #FFFFFF;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Estado (Pendiente) */
.state-label {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed #333333;
  justify-content: center;
}

.state-text {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Colores de estado: Usamos el amarillo de estado original */
.state-pending { color: #facc15; } /* Amarillo */


/* === BOTONES DE ACCIÓN === */
.action-buttons {
  display: flex;
  justify-content: space-around;
  gap: 16px;
  margin-top: 20px;
}

.btn-action {
  flex-grow: 1;
  border: none;
  color: #FFFFFF;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 8px; 
  padding: 10px 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5); 
}

/* Botón Aceptar (Verde, como el fuel-full) */
.btn-accept {
  background: #22c55e;
}

.btn-accept:hover {
  background: #16a34a; 
}

/* Botón Rechazar (Rojo Deportivo) */
.btn-reject {
  background: #FF3B30; 
}

.btn-reject:hover {
  background: #cc2f26; 
}
</style>