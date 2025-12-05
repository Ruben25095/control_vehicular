<template>
    <div
      v-if="isOpen"
      class="modal-backdrop"
    >
      <div
        class="modal-content animate-fade-in"
      >
        <!-- Botón de cierre -->
        <button
          @click="closeModal"
          class="btn-close"
        >
          ✕
        </button>
  
        <!-- Título -->
        <h2 class="modal-title">
          Finalizar Viaje
        </h2>
  
        <!-- Información del vehículo -->
        <div class="vehicle-info-box">
          <h3 class="info-subtitle">Vehículo</h3>
          <p class="info-detail">
            <span class="detail-label">Marca:</span>
            <span class="detail-value">{{ props.reservas?.vehiculo?.marca }}</span>
          </p>
          <p class="info-detail">
            <span class="detail-label">Modelo:</span>
            <span class="detail-value">{{ props.reservas?.vehiculo?.modelo }}</span>
          </p>
          <p class="info-detail">
            <span class="detail-label">Km. inicial:</span>
            <span class="detail-value">{{ props.reservas?.vehiculo?.kilometraje }} km</span>
          </p>
        </div>
  
        <!-- Nivel de gasolina -->
        <div class="form-group">
          <label class="form-label">
            Nivel de gasolina:
          </label>
          <select
            v-model="nivel_gasolina"
            class="form-input"
          >
            <option disabled value="">Selecciona el nivel de gasolina</option>
            <option
              v-for="nivel in gasolina"
              :key="nivel"
              :value="nivel"
            >
              {{ nivel }}
            </option>
          </select>
        </div>
  
        <!-- Kilometraje final -->
        <div class="form-group">
          <label class="form-label">
            Kilometraje final:
          </label>
          <input
            v-model="kilometrage_final"
            type="number"
            placeholder="Ejemplo: 15300"
            class="form-input"
          />
        </div>
  
        <!-- Botón principal -->
        <div class="flex justify-center mt-4">
          <button
            @click="terminarViaje"
            class="btn-submit"
          >
            Terminar viaje
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { supabase } from '@/lib/supabase'
  
  // Se usa una función stub para evitar errores ya que 'alert' está prohibido
  const showMessage = (msg) => {
    console.log(msg);
    // En una aplicación real, se usaría un componente Modal/Toast para mostrar el mensaje
  }
  
  
  const gasolina = ref(['4/4', '3/4', '2/4', '1/4', '0/4'])
  const kilometrage_final = ref('')
  const nivel_gasolina = ref('')
  
  const props = defineProps({
    isOpen: Boolean,
    vehiculo: Object,
    reservas: Object
  })
  
  const emit = defineEmits(['close'])
  const closeModal = () => emit('close')
  
  // 👉 Lógica de terminar viaje
  const terminarViaje = async () => {
    // Validación básica
    if (!nivel_gasolina.value) {
      showMessage('Por favor, selecciona el nivel de gasolina.');
      return;
    }
    if (!kilometrage_final.value || isNaN(kilometrage_final.value) || kilometrage_final.value <= props.reservas?.vehiculo.kilometraje) {
      showMessage('El kilometraje final debe ser un número válido y mayor que el inicial.');
      return;
    }
    
    const km_recorridos = kilometrage_final.value - props.reservas?.vehiculo.kilometraje
    
    if (!props.reservas?.id) {
      showMessage('No se recibió una reserva válida');
      return
    }
  
    // Actualizar la reserva
    const { error: reservaError } = await supabase
      .from('reservas')
      .update({
        estado: 'Finalizada',
        kilometrage_final: kilometrage_final.value,
        km_recorridos
      })
      .eq('id', props.reservas.id)
  
    if (reservaError) {
      console.error('Error al finalizar reserva:', reservaError)
      showMessage(`Error al finalizar reserva: ${reservaError.message}`);
      return
    }
  
    // Actualizar el vehículo
    if (props.reservas?.vehiculo.id_num_economico) {
      const { error: vehiculoError } = await supabase
        .from('vehiculos')
        .update({
          disponible: true,
          kilometraje: kilometrage_final.value,
          combustible: nivel_gasolina.value
        })
        .eq('id_num_economico', props.reservas?.vehiculo.id_num_economico)
  
      if (vehiculoError) {
        console.error('Error al actualizar vehículo:', vehiculoError)
        showMessage(`Error al actualizar vehículo: ${vehiculoError.message}`);
        return
      }
    }
  
    showMessage(`Viaje de reserva #${props.reservas.id} finalizado con éxito`)
    closeModal()
  }
  </script>
  
  <style scoped>
  /* PALETA: 
     Fondo: #1C1C1C (Gris Fibra de Carbono)
     Negro: #000000
     Texto Claro: #FFFFFF (Blanco Nítido)
     Texto Secundario: #BDBDBD (Gris Acero)
     Acento: #FF3B30 (Rojo Deportivo)
  */
  
  /* === ANIMACIÓN === */
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.25s ease-out;
  }
  
  
  /* === MODAL & BACKDROP === */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.7); /* Fondo más oscuro para destacar el modal */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 50;
  }
  
  .modal-content {
    /* Fondo principal oscuro (Gris Fibra de Carbono) */
    background: #1C1C1C; 
    width: 90%;
    max-width: 500px; /* Tamaño fijo para modales */
    max-height: 90vh;
    overflow-y: auto;
    border-radius: 16px;
    /* Sombra prominente para el modal */
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8); 
    border: 1px solid #333333; /* Borde sutil */
    padding: 32px;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  /* Título */
  .modal-title {
    font-size: 2rem;
    font-weight: 700;
    color: #FF3B30; /* Título en Rojo Deportivo */
    text-align: center;
    margin-bottom: 8px;
    letter-spacing: 1px;
  }
  
  /* Botón de cierre (X) */
  .btn-close {
    position: absolute;
    top: 16px;
    right: 20px;
    color: #BDBDBD; /* Gris Acero */
    font-size: 2rem;
    font-weight: 300;
    cursor: pointer;
    transition: color 0.15s ease;
  }
  
  .btn-close:hover {
    color: #FF3B30; /* Rojo Deportivo al hacer hover */
  }
  
  
  /* === INFORMACIÓN DEL VEHÍCULO === */
  .vehicle-info-box {
    /* Fondo ligeramente diferente para separar la info */
    background: #000000; 
    padding: 16px;
    border-radius: 10px;
    border-left: 4px solid #FF3B30; /* Borde de acento */
  }
  
  .info-subtitle {
    font-weight: 700;
    font-size: 1.1rem;
    color: #FFFFFF;
    margin-bottom: 8px;
  }
  
  .info-detail {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  
  .detail-label {
    /* Gris Acero para etiquetas */
    color: #BDBDBD; 
    font-weight: 400;
  }
  
  .detail-value {
    /* Blanco Nítido para valores */
    color: #FFFFFF; 
    font-weight: 600;
    text-align: right;
  }
  
  
  /* === FORMULARIO (LABEL & INPUTS/SELECT) === */
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .form-label {
    font-size: 1rem;
    font-weight: 500;
    color: #FFFFFF; /* Etiquetas blancas */
  }
  
  .form-input {
    /* Estilo oscuro para inputs/select */
    background: #333333; 
    color: #FFFFFF;
    border: 1px solid #555555;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 1rem;
    width: 100%;
    transition: all 0.2s ease;
    outline: none;
  }
  
  .form-input:focus {
    border-color: #FF3B30; /* Acento rojo al enfocar */
    box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.3);
  }
  
  /* Estilo para las opciones del select */
  .form-input option {
    background: #333333;
    color: #FFFFFF;
  }
  
  /* Placeholder color */
  .form-input::placeholder {
    color: #BDBDBD;
  }
  
  
  /* === BOTÓN SUBMIT === */
  .btn-submit {
    /* Mantenemos el color verde para "Terminar" como acción positiva */
    background: #22c55e; 
    color: #FFFFFF;
    font-weight: 600;
    font-size: 1.25rem;
    padding: 12px 32px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(34, 197, 94, 0.4); 
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
  }
  
  .btn-submit:hover {
    background: #16a34a; /* Verde más oscuro */
    box-shadow: 0 6px 12px rgba(34, 197, 94, 0.6);
  }
  
  .btn-submit:active {
    transform: scale(0.98);
  }
  </style>