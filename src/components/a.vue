<template>
     <AppHeader/>
    <div class="registro-vehiculo-container">
      <h2>Registrar Nuevo Vehículo</h2>
      <form @submit.prevent="registrarVehiculo" class="vehiculo-form">
        
        <div class="form-group">
          <label for="poliza_seguro">Póliza de Seguro:</label>
          <input type="text" id="poliza_seguro" v-model="vehiculo.poliza_seguro" />
        </div>

        <div class="form-group file-upload-group">
          <label for="archivo_poliza">Archivo PDF de la póliza:</label>
          <input type="file" id="archivo_poliza" @change="handlePdfUpload" accept="application/pdf" />
        </div>

        <p v-if="pdfName">{{ pdfName }}</p>

        
        <div class="form-group">
          <label for="id_num_economico">Número Económico:</label>
          <input type="text" id="id_num_economico" v-model="vehiculo.id_num_economico" required />
        </div>
  
        <div class="form-group">
          <label for="marca">Marca:</label>
          <input type="text" id="marca" v-model="vehiculo.marca" required />
        </div>
  
        <div class="form-group">
          <label for="modelo">Modelo:</label>
          <input type="text" id="modelo" v-model="vehiculo.modelo" required />
        </div>
  
        <div class="form-group">
          <label for="year">Año:</label>
          <input type="number" id="year" v-model.number="vehiculo.year" required />
        </div>
  
        <div class="form-group checkbox-group">
          <input type="checkbox" id="disponible" v-model="vehiculo.disponible" />
          <label for="disponible">Disponible</label>
        </div>
  
        <div class="form-group">
          <label for="kilometraje">Kilometraje:</label>
          <input type="number" id="kilometraje" v-model.number="vehiculo.kilometraje" required />
        </div>
  
        <div class="form-group">
          <label for="combustible">Combustible:</label>
          <input type="text" id="combustible" v-model="vehiculo.combustible" required />
        </div>
  
        <div class="form-group file-upload-group">
          <label for="imagen">Imagen del Vehículo:</label>
          <input type="file" id="imagen" @change="handleFileUpload" accept="image/*" />
          <div v-if="imageUrl" class="image-preview">
            <img :src="imageUrl" alt="Vista previa de la imagen" />
            <p>{{ imageName }}</p>
          </div>
        </div>
  
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Registrando...' : 'Registrar Vehículo' }}
        </button>
  
        <p v-if="error" class="error-message">{{ error }}</p>
        <p v-if="success" class="success-message">{{ success }}</p>
      </form>
    </div>
</template>
  
<script setup>
  import { ref } from 'vue';
  import { supabase } from '@/lib/supabase' // Asegúrate de que la ruta sea correcta
  import AppHeader from './AppHeader.vue';
  
  const vehiculo = ref({
    id_num_economico: '',
    marca: '',
    modelo: '',
    year: null,
    disponible: true,
    kilometraje: null,
    combustible: '',
    // img_url se manejará después de la subida de la imagen
  });
  
  const selectedFile = ref(null);
  const pdfFile = ref(null);
  const pdfName = ref('');
  const imageUrl = ref('');
  const imageName = ref('');
  const isLoading = ref(false);
  const error = ref(null);
  const success = ref(null);
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      selectedFile.value = file;
      imageName.value = file.name;
      // Crear una URL de objeto para la vista previa local
      imageUrl.value = URL.createObjectURL(file);
    } else {
      selectedFile.value = null;
      imageUrl.value = '';
      imageName.value = '';
    }
  };
  const handlePdfUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    pdfFile.value = file
    pdfName.value = file.name
  }
}
const uploadPdf = async () => {
  if (!pdfFile.value) return null

  const file = pdfFile.value
  const fileName = `${vehiculo.value.id_num_economico}_poliza.pdf`

  try {
    const { data, error: uploadError } = await supabase.storage
      .from('polizas') // puedes usar mismo bucket o crear uno llamado "polizas"
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabase.storage
      .from('polizas')
      .getPublicUrl(fileName)

    return publicUrlData.publicUrl

  } catch (err) {
    console.error('Error al subir PDF:', err.message)
    error.value = 'Error al subir el PDF'
    return null
  }
}


  const uploadImage = async () => {
    if (!selectedFile.value) {
      return null; // No hay archivo para subir
    }
  
    const file = selectedFile.value;
    const fileName = vehiculo.value.id_num_economico; // Nombre único para el archivo
    const filePath = `${fileName}`+'.jpg'; // Carpeta 'vehiculos' en tu bucket
  
    try {
      const { data, error: uploadError } = await supabase.storage
        .from('vehiculos') // Asegúrate de que 'vehiculos' sea el nombre de tu bucket
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
  
      if (uploadError) {
        throw uploadError;
      }
  
      // Obtener la URL pública de la imagen
      const { data: publicUrlData } = supabase.storage
        .from('vehiculos')
        .getPublicUrl(filePath);
  
      if (publicUrlData && publicUrlData.publicUrl) {
        return publicUrlData.publicUrl;
      } else {
        throw new Error('No se pudo obtener la URL pública de la imagen.');
      }
  
    } catch (err) {
      console.error('Error al subir la imagen:', err.message);
      error.value = `Error al subir la imagen: ${err.message}`;
      return null;
    }
  };
  
  const registrarVehiculo = async () => {
    isLoading.value = true;
    error.value = null;
    success.value = null;

  
    try {
    let archivo_poliza_url = null
    if (pdfFile.value) {
      archivo_poliza_url = await uploadPdf()
    }
      let img_url = null;
      if (selectedFile.value) {
        img_url = await uploadImage();
        if (!img_url) {
          throw new Error('No se pudo completar la subida de la imagen.');
        }
      }
  
      const { data, error: dbError } = await supabase
        .from('vehiculos') // Asegúrate de que 'vehiculo' sea el nombre de tu tabla
        .insert({
          id_num_economico: vehiculo.value.id_num_economico,
          marca: vehiculo.value.marca,
          modelo: vehiculo.value.modelo,
          year: vehiculo.value.year,
          disponible: vehiculo.value.disponible,
          kilometraje: vehiculo.value.kilometraje,
          combustible: vehiculo.value.combustible,
          poliza_seguro: vehiculo.value.poliza_seguro,
          archivo_poliza_url: archivo_poliza_url,
          img_url: img_url, // Guarda la URL pública de la imagen
          // created_at se maneja automáticamente si tu columna tiene `now()` como valor por defecto
        });
  
      if (dbError) {
        throw dbError;
      }
  
      success.value = 'Vehículo registrado exitosamente!';
      // Limpiar formulario
      vehiculo.value = {
        id_num_economico: '',
        marca: '',
        modelo: '',
        year: null,
        disponible: true,
        kilometraje: null,
        combustible: '',
      };
      selectedFile.value = null;
      pdfFile.value = null
      pdfName.value = ''
      imageUrl.value = '';
      imageName.value = '';
      // Opcional: emitir un evento si este componente es parte de uno más grande
      // emit('vehiculoRegistrado', data);
  
    } catch (err) {
      console.error('Error al registrar el vehículo:', err.message);
      error.value = `Error al registrar el vehículo: ${err.message}`;
    } finally {
      isLoading.value = false;
    }
  };
  </script>
  
  <style scoped>
  .registro-vehiculo-container {
    max-width: 600px;
    margin: 50px auto;
    padding: 30px;
    border-radius: 12px;
    background-color: #282c34; /* Fondo oscuro */
    color: #abb2bf; /* Texto claro */
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  h2 {
    text-align: center;
    color: #61afef; /* Azul claro */
    margin-bottom: 30px;
    font-size: 2em;
  }
  
  .vehiculo-form {
    display: grid;
    gap: 20px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
  }
  
  .form-group label {
    margin-bottom: 8px;
    font-weight: bold;
    color: #98c379; /* Verde claro */
    font-size: 0.95em;
  }
  
  .form-group input[type="text"],
  .form-group input[type="number"] {
    padding: 12px 15px;
    border: 1px solid #3e4451; /* Borde más oscuro */
    border-radius: 8px;
    background-color: #3e4451; /* Fondo del input */
    color: #abb2bf;
    font-size: 1em;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  
  .form-group input[type="text"]:focus,
  .form-group input[type="number"]:focus,
  .form-group input[type="file"]:focus {
    border-color: #61afef;
    box-shadow: 0 0 0 3px rgba(97, 175, 239, 0.3);
    outline: none;
  }
  
  .checkbox-group {
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }
  
  .checkbox-group input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #e5c07b; /* Amarillo */
  }
  
  .file-upload-group input[type="file"] {
    background-color: #3e4451;
    border: 1px dashed #61afef; /* Borde punteado azul */
    padding: 15px;
    border-radius: 8px;
    cursor: pointer;
    color: #abb2bf;
    transition: background-color 0.3s;
  }
  
  .file-upload-group input[type="file"]:hover {
    background-color: #4a505f;
  }
  
  .image-preview {
    margin-top: 15px;
    text-align: center;
    background-color: #3e4451;
    padding: 15px;
    border-radius: 8px;
  }
  
  .image-preview img {
    max-width: 150px;
    max-height: 150px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid #56b6c2; /* Cian */
    margin-bottom: 10px;
  }
  
  .image-preview p {
    font-size: 0.9em;
    color: #56b6c2;
  }
  
  button[type="submit"] {
    padding: 14px 25px;
    background-color: #c678dd; /* Púrpura */
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.1em;
    font-weight: bold;
    transition: background-color 0.3s, transform 0.2s;
  }
  
  button[type="submit"]:hover:not(:disabled) {
    background-color: #d19fe8;
    transform: translateY(-2px);
  }
  
  button[type="submit"]:disabled {
    background-color: #5c6370;
    cursor: not-allowed;
  }
  
  .error-message {
    color: #e06c75; /* Rojo */
    text-align: center;
    margin-top: 15px;
    font-weight: bold;
  }
  
  .success-message {
    color: #98c379; /* Verde */
    text-align: center;
    margin-top: 15px;
    font-weight: bold;
  }
  </style>