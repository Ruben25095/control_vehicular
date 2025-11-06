<template>
    <form @submit.prevent="handleSubmit">
      
      <div>
        <label for="nombre">Nombre:</label>
        <input type="text" id="nombre" v-model="formData.nombre" required>
      </div>
  
      <button type="submit">Enviar</button>
    </form>
  </template>
  
  <script setup>
  import { reactive,ref,onMounted } from 'vue';
  import { supabase } from '@/lib/supabase'
  // 4. Definición del estado del formulario
  const formData = reactive({
    nombre: '',
    // Se pueden añadir más campos aquí
  });
  
  // 5. Función que se ejecuta al enviar el formulario
  const handleSubmit = () => {
    console.log('Formulario enviado con los datos:', formData);
    // Aquí es donde se suele hacer una llamada API para enviar los datos
    console.log(getreservas());
    // Opcional: Resetear el formulario después del envío
    formData.nombre = ''; 
    // ... resetear otros campos
  };

  onMounted(() => {
    getreservas();
  });
  
  const getreservas = async () => {
    
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
    
    if (error) {
      console.error('Error al obtener las reservas:', error);
    } else {
      console.log('Reservas obtenidas:', data);
    }   

  };










  </script>
  
  <style scoped>
  /* Estilos específicos para este componente (opcional) */
  form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  </style>