<script setup>
import AppHeader from '../components/AppHeader.vue';
import VehiculoCard from '@/components/VehiculoCard.vue';
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const vehiculos = ref([])
const error = ref(null)

async function getvehiculos() {
  try {
    const { data, error: fetchError } = await supabase
      .from('vehiculos')
      .select('*')
      .order('id_vehiculo', { ascending: true })
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
  <div class="page">
    <AppHeader />

    <!-- Sección de Contador (Indicador de alto rendimiento) -->
    <section class="contador">
      <p>
        <span class="count">{{ vehiculos.length }}</span>
        vehículos disponibles actualmente
      </p>
    </section>

    <!-- Grid de Vehículos -->
    <div class="grid-vehiculos">
      <VehiculoCard
        v-for="vehiculo in vehiculos"
        :key="vehiculo.id_vehiculo"
        :vehiculo="vehiculo"
      />
    </div>
  </div>
</template>

<style scoped>
/* ========================================= */
/* === 1. IMPORTACIÓN DE FUENTES GOOGLE === */
/* ========================================= */
/* Oswald para títulos y contadores (Estilo técnico/deportivo) */
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&display=swap');
/* Roboto para el cuerpo de texto (Legibilidad) */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');


/* ========================================= */
/* === 2. PALETA DE COLORES AUTOMOTRIZ === */
/* ========================================= */
:root {
  --carbon-dark: #1c1c1c;       /* Fondo principal (Gris Fibra de Carbono) */
  --carbon-text: #ffffff;      /* Texto principal (Blanco Nítido) */
  --carbon-secondary: #bdbdbd; /* Texto secundario (Gris Acero) */
  --performance-red: #ff3b30;  /* Acento/CTA (Rojo Deportivo) */
}

/* Aplicamos las tipografías por defecto a toda la página */
* {
    font-family: 'Roboto', sans-serif; /* Roboto para todo el cuerpo */
}


/* ========================================= */
/* === 3. ESTILOS DE LA PÁGINA Y FONDO === */
/* ========================================= */
.page {
  min-height: 100vh;
  /* Fondo oscuro principal */
  background-color: var(--carbon-dark); 
  /* Texto principal blanco */
  color: var(--carbon-text); 
  overflow-x: hidden;
}


/* ========================================= */
/* === 4. CONTADOR DE VEHÍCULOS === */
/* ========================================= */
.contador {
  padding: 32px 24px 16px; /* Más espacio arriba */
  /* Línea divisoria sutil para el estilo 'tablero' */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
  text-align: center;
}

.contador p {
  font-size: 1.25rem; /* text-xl */
  /* Usamos Oswald para el estilo de panel de control */
  font-family: 'Oswald', sans-serif; 
  font-weight: 400;
  /* Gris Acero para texto secundario */
  color: var(--carbon-secondary); 
  text-transform: uppercase;
  letter-spacing: 2px;
}

.contador .count {
  /* Rojo Deportivo para destacar el número (como un medidor) */
  color: var(--performance-red); 
  font-size: 2.5rem; /* Número grande y audaz */
  font-weight: 700;
  display: block; /* Para que el número esté en su propia línea */
  line-height: 1;
  margin-bottom: 8px;
}

/* ========================================= */
/* === 5. GRID DE VEHÍCULOS === */
/* ========================================= */
.grid-vehiculos {
  padding: 30px;
  display: grid;
  gap: 30px; 
  grid-template-columns: 1fr;
  max-width: 1400px; /* Limitamos el ancho para que se vea mejor */
  margin: 0 auto; /* Centrar el grid */
}

/* Media queries para responsividad */
@media (min-width: 640px) {
  .grid-vehiculos {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-vehiculos {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 1400px) {
  .grid-vehiculos {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* ===== 6. SCROLLBAR (Ajustado para el tema oscuro) ===== */
*::-webkit-scrollbar {
  width: 10px; 
}

*::-webkit-scrollbar-thumb {
  /* Scrollbar oscuro semi-transparente */
  background: rgba(255, 255, 255, 0.15); 
  border-radius: 10px;
}
</style>
<style scoped>
/* Importamos la fuente Oswald para los encabezados y acentos */
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600&display=swap');
/* Importamos la fuente Roboto para el texto del cuerpo */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');

/* ====== Variables de Color (Para facilitar el mantenimiento) ====== */
:root {
  --carbon-dark: #1c1c1c; /* Gris Fibra de Carbono (Fondo) */
  --carbon-text: #ffffff; /* Blanco Nítido (Texto Primario) */
  --carbon-secondary: #bdbdbd; /* Gris Acero (Texto Secundario) */
  --performance-red: #ff3b30; /* Rojo Deportivo (Acento/CTA) */
}

/* Aplicamos las tipografías por defecto */
* {
    font-family: 'Roboto', sans-serif;
}

/* ====== ESTILOS DE LA PÁGINA ====== */
.page {
  min-height: 100vh;
  /* CAMBIO: Fondo oscuro */
  background-color: var(--carbon-dark); 
  /* CAMBIO: Texto principal blanco */
  color: var(--carbon-text); 
  overflow-x: hidden;
}

/* ====== CONTADOR ====== */
.contador {
  padding: 24px;
  /* CAMBIO: Separador Gris Acero sutil */
  border-bottom: 1px solid rgba(189, 189, 189, 0.2); 
}

.contador p {
  font-size: 1.125rem; /* text-lg */
  /* CAMBIO: Usamos Oswald para los títulos y contadores */
  font-family: 'Oswald', sans-serif; 
  font-weight: 600;
  /* CAMBIO: Gris Acero para texto secundario */
  color: var(--carbon-secondary); 
  text-transform: uppercase;
}

.contador .count {
  /* CAMBIO: Rojo Deportivo para destacar la cantidad */
  color: var(--performance-red); 
}

/* ====== GRID ====== */
.grid-vehiculos {
  padding: 30px;
  display: grid;
  gap: 30px; /* Aumentamos el gap para dar más aire */
  grid-template-columns: 1fr;
}

/* Media queries sin cambio */
@media (min-width: 640px) {
  .grid-vehiculos {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-vehiculos {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 2024px) {
  .grid-vehiculos {
    grid-template-columns: repeat(4, 1fr);
  }
}
/* ===== SCROLLBAR (Ajustado para el tema oscuro) ===== */
*::-webkit-scrollbar {
  width: 10px; /* Hacemos el scrollbar más delgado */
}

*::-webkit-scrollbar-thumb {
  /* CAMBIO: Scrollbar oscuro semi-transparente (efecto "smoke") */
  background: rgba(255, 255, 255, 0.1); 
  border-radius: 10px;
}
</style>