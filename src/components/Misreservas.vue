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
          <h3 class="card-title">
            Reserva #{{ reserva.id }}
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
                  <span class="detail-label">Vehículo:</span> 
                  <span class="detail-value">{{ reserva.vehiculo?.marca }} {{ reserva.vehiculo?.modelo }}</span>
                </p>
                
                <p class="detail-item">
                  <span class="detail-label">Solicita:</span> 
                  <span class="detail-value">{{ reserva.usuario?.nombre || reserva.usuario?.name || 'Desconocido' }}</span>
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
            <span
              :class="{
                'state-approved': reserva.estado === 'aprobado' || reserva.estado === 'Finalizada',
                'state-pending': reserva.estado === 'pendiente',
                'state-rejected': reserva.estado === 'rechazado' || reserva.estado === 'Rechazada',
                'state-travel': reserva.estado === 'En viaje'
              }"
              class="state-text"
            >
              {{ reserva.estado }}
            </span>
          </p>
  
      </div>
      </div>
  
    </div>
</template>
  
  <script setup>
  import { ref, computed, watchEffect } from 'vue'
  import { supabase } from '@/lib/supabase'
  import { useAuth } from '@/components/useAuth'
  
  const reservas = ref([])
  const { user } = useAuth()
  const usuario = ref(null) 
  const errorMsg = ref('')
  
  const userId = computed(() => user.value?.id || null)
  
  watchEffect(async () => {
    if (userId.value) {
      const { data, error } = await supabase
        .from('profiles')
        .select('name') 
        .eq('id', userId.value)
        .single()
  
      if (error) {
        console.error('Error al obtener el perfil:', error)
        usuario.value = 'Error'
      } else if (data) {
        usuario.value = data.name
      }
    } else {
      usuario.value = null
    }
  })
  
  const currentUser = computed(() => {
    if (!user.value) return null
    return {
      id: userId.value,
      name: usuario.value || 'Sin nombre', 
      email: user.value.email,
    }
  })
  
  const isAdmin = computed(() => {
    // Lógica para determinar si el usuario es administrador (debe coincidir con tu app)
    return false 
  })
  
  function formatFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-MX')
  }
  
  const cargarReservas = async (currentUserId) => {
    let query = supabase
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
    
    // Filtro principal: Solo mostrar las reservas del usuario actual
    if (currentUserId) {
        query = query.eq('usuario_id', currentUserId)
    }
  
    query = query.order('id', { ascending: false }) // Mostrar las más recientes primero
  
    const { data, error } = await query
    
  
    if (error) {
      console.error('Error cargando reservas:', error)
      errorMsg.value = 'Error al cargar las reservas.'
    } else {
      reservas.value = data
      errorMsg.value = ''
    }
  }
  
  watchEffect(() => {
    if (userId.value) {
      cargarReservas(userId.value)
    } else {
      reservas.value = []
    }
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
  transition: all 0.3s ease; 
}

.reservation-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6); 
  transform: translateY(-2px); 
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
  background: #000000; 
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
    background: #000000; 
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #333333;
    margin-top: 10px;
    margin-bottom: 15px;
    font-size: 0.9rem;
}

.motivo-box .label {
    font-weight: 700;
    color: #FF3B30; 
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

/* Estado (Destacado) */
.state-label {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed #333333;
  justify-content: space-between; /* Alineación del estado */
}

.state-text {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Colores de estado: */
.state-approved { color: #22c55e; } /* Verde para Aprobado/Finalizado */
.state-pending { color: #facc15; }  /* Amarillo para Pendiente */
.state-rejected { color: #ef4444; } /* Rojo para Rechazado */
.state-travel { color: #3b82f6; }   /* Azul para En Viaje */
</style>