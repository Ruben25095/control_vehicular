<template>
  <div class="card group">

    <!-- Imagen estilo catálogo premium -->
    <div class="card-image">
      <img
        :src="vehiculo.img_url"
        alt="Vehículo"
        class="image"
      />
    </div>

    <!-- Contenido -->
    <div class="content">
      <!-- Marca / modelo -->
      <h3 class="title">
        {{ vehiculo.marca }} {{ vehiculo.modelo }}
      </h3>

      <!-- ID Económico -->
      <p class="id-eco">
        ID Económico:
        <span class="id-value">{{ vehiculo.id_num_economico }}</span>
      </p>

      <!-- Combustible -->
      <div class="fuel-label">
        Combustible: <span class="fuel-text">{{ vehiculo.combustible }}</span>
      </div>

      <!-- Barra de combustible tipo catálogo moderno -->
      <div class="fuel-bar">
        <div
          class="fuel-progress"
          :class="{
            'fuel-full': vehiculo.combustible === '4/4',
            'fuel-high': vehiculo.combustible === '3/4' || vehiculo.combustible === '2/4',
            'fuel-low': vehiculo.combustible === '1/4',
            'fuel-empty': vehiculo.combustible === '0/4'
          }"
          :style="{
            width:
              vehiculo.combustible === '4/4'
                ? '100%'
                : vehiculo.combustible === '3/4'
                ? '75%'
                : vehiculo.combustible === '2/4'
                ? '50%'
                : vehiculo.combustible === '1/4'
                ? '25%'
                : '0%'
          }"
        ></div>
      </div>

      <!-- Botón de acción -->
      <div class="action">
        <button
          @click="abrirModal"
          class="btn-action"
        >
          +
        </button>

        <ReservaModal :isOpen="modalAbierto" :vehiculo="vehiculo" @close="cerrarModal" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ReservaModal from '@/components/ReservaModal.vue'

const props = defineProps({
  isOpen: Boolean,
  vehiculo: Object
})

const modalAbierto = ref(false)
const abrirModal = () => (modalAbierto.value = true)
const cerrarModal = () => (modalAbierto.value = false)
</script>

<style scoped>
/* PALETA: 
   Fondo: #1C1C1C (Gris Fibra de Carbono)
   Negro: #000000
   Texto Claro: #FFFFFF (Blanco Nítido)
   Texto Secundario: #BDBDBD (Gris Acero)
   Acento: #FF3B30 (Rojo Deportivo)
*/

/* === CARD === */
.card {
  /* Fondo oscuro: Fibra de Carbono */
  background: #1C1C1C; 
  border-radius: 12px; /* Ligeramente menos redondeado, más técnico */
  /* Sombra más sutil en fondo oscuro */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4); 
  /* Borde de Gris Acero sutil */
  border: 1px solid #333333; 
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.card:hover {
  /* Al hacer hover, una sombra más prominente */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6); 
}

/* === IMAGEN === */
.card-image {
  width: 100%;
  height: 176px;
  /* Fondo gris muy oscuro para la zona sin imagen */
  background: #000000; 
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.5s ease;
}

.group:hover .image {
  transform: scale(1.10);
}

/* === CONTENIDO === */
.content {
  padding: 16px; /* Más padding para que respire */
  position: relative;
}

/* Marca - modelo */
.title {
  font-size: 1.4rem; /* Un poco más grande para impacto */
  font-weight: 700;
  /* Texto principal blanco */
  color: #FFFFFF; 
  letter-spacing: 0.8px; /* Un poco más espaciado */
  line-height: 1.2;
  font-family: 'Oswald', sans-serif; /* Usamos la fuente de título */
}

/* ID Económico */
.id-eco {
  /* Gris Acero para el texto secundario */
  color: #BDBDBD; 
  font-size: 0.875rem;
  margin-top: 4px;
}

.id-value {
  /* Un gris más brillante para que destaque el valor */
  color: #FFFFFF; 
  font-weight: 600;
}

/* Combustible */
.fuel-label {
  margin-top: 16px;
  font-size: 0.875rem;
  font-weight: 600;
  /* Gris Acero */
  color: #BDBDBD; 
}

.fuel-text {
  /* Texto principal blanco */
  color: #FFFFFF; 
}

/* Barra exterior */
.fuel-bar {
  width: 100%;
  /* Gris muy oscuro para el fondo de la barra */
  background: #333333; 
  border-radius: 999px;
  height: 8px;
  margin-top: 6px;
}

/* Barra progreso */
.fuel-progress {
  height: 8px;
  border-radius: 999px;
  transition: all 0.3s ease;
}

/* Colores según combustible: Mantenemos los colores de estado (Rojo, Amarillo, Verde) */
.fuel-full { background: #22c55e; } /* Verde - Mantenemos */
.fuel-high { background: #facc15; } /* Amarillo - Mantenemos */
.fuel-low { background: #ef4444; }  /* Rojo - Mantenemos */
.fuel-empty { background: #BDBDBD; } /* Gris Acero para 'empty' */


/* === BOTÓN === */
.action {
  /* Posicionamos el botón en la esquina superior derecha del CONTENT */
  position: absolute; 
  top: 16px; 
  right: 16px;
  margin-top: 0;
}

.btn-action {
  /* Rojo Deportivo para el botón CTA */
  background: #FF3B30; 
  border: none;
  color: #FFFFFF;
  font-size: 1.75rem;
  font-weight: 700;
  border-radius: 8px; /* Ligeramente cuadrado */
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Sombra sutil pero visible */
  box-shadow: 0 2px 4px rgba(255, 59, 48, 0.5); 
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-action:hover {
  /* Rojo más oscuro al pasar el ratón */
  background: #cc2f26; 
}

.btn-action:active {
  transform: scale(0.9); /* Un poco menos de 'rebote' */
}
</style>