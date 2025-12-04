<template>
  <AppHeader />

  <div class="registro-vehiculo-container">
    <h2>Registrar Nuevo Vehículo</h2>

    <form @submit.prevent="onSubmit" class="vehiculo-form" novalidate>

      <!-- Número económico (clave única) -->
      <div class="form-group">
        <label for="id_num_economico">Número Económico:</label>
        <input
          id="id_num_economico"
          v-model.trim="vehiculo.id_num_economico"
          type="text"
          required
          :class="{ invalid: validationErrors.id_num_economico }"
        />
        <small v-if="validationErrors.id_num_economico" class="field-error">{{ validationErrors.id_num_economico }}</small>
      </div>

      <!-- Marca, Modelo, Año -->
      <div class="form-group">
        <label for="marca">Marca:</label>
        <input id="marca" v-model.trim="vehiculo.marca" type="text" required :class="{ invalid: validationErrors.marca }" />
      </div>

      <div class="form-group">
        <label for="modelo">Modelo:</label>
        <input id="modelo" v-model.trim="vehiculo.modelo" type="text" required :class="{ invalid: validationErrors.modelo }" />
      </div>

      <div class="form-group">
        <label for="year">Año:</label>
        <input id="year" v-model.number="vehiculo.year" type="number" min="1900" :max="currentYear" required :class="{ invalid: validationErrors.year }" />
      </div>

      <div class="form-group checkbox-group">
        <input id="disponible" type="checkbox" v-model="vehiculo.disponible" />
        <label for="disponible">Disponible</label>
      </div>

      <div class="form-group">
        <label for="kilometraje">Kilometraje:</label>
        <input id="kilometraje" v-model.number="vehiculo.kilometraje" type="number" min="0" required :class="{ invalid: validationErrors.kilometraje }" />
      </div>

      <div class="form-group">
        <label for="combustible">Combustible:</label>
        <input id="combustible" v-model.trim="vehiculo.combustible" type="text" required :class="{ invalid: validationErrors.combustible }" />
      </div>

      <div class="form-group">
        <label for="poliza_seguro">Póliza de Seguro (campo libre):</label>
        <input id="poliza_seguro" v-model.trim="vehiculo.poliza_seguro" type="text" />
      </div>

      <!-- Upload PDF -->
      <div class="form-group file-upload-group">
        <label for="archivo_poliza">Archivo PDF de la póliza (máx 2 MB):</label>
        <input id="archivo_poliza" type="file" accept="application/pdf" @change="onPdfChange" />
        <small v-if="pdfName">Archivo: {{ pdfName }}</small>
        <small v-if="validationErrors.pdf" class="field-error">{{ validationErrors.pdf }}</small>
      </div>

      <!-- Upload image -->
      <div class="form-group file-upload-group">
        <label for="imagen">Imagen del Vehículo (JPG/PNG, máx 2 MB):</label>
        <input id="imagen" type="file" accept="image/*" @change="onImageChange" />
        <div v-if="imageUrl" class="image-preview">
          <img :src="imageUrl" alt="Vista previa" />
          <p>{{ imageName }}</p>
        </div>
        <small v-if="validationErrors.image" class="field-error">{{ validationErrors.image }}</small>
      </div>

      <!-- Upload status indicators -->
      <div v-if="uploadStatus.pdf || uploadStatus.image" class="upload-status">
        <p v-if="uploadStatus.pdf">PDF: {{ uploadStatus.pdf }}</p>
        <p v-if="uploadStatus.image">Imagen: {{ uploadStatus.image }}</p>
      </div>

      <!-- Buttons -->
      <div class="actions">
        <button type="submit" :disabled="isLoading">{{ isLoading ? 'Registrando...' : 'Registrar Vehículo' }}</button>
        <button type="button" class="secondary" @click="resetForm" :disabled="isLoading">Limpiar</button>
      </div>

      <!-- mensajes -->
      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="success" class="success-message">{{ success }}</p>

    </form>
  </div>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { supabase } from '@/lib/supabase'
import AppHeader from './AppHeader.vue'

const MAX_FILE_SIZE = 2 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const currentYear = new Date().getFullYear()

// === Estado del formulario ===
const vehiculo = reactive({
  id_num_economico: '',
  marca: '',
  modelo: '',
  year: null,
  disponible: true,
  kilometraje: null,
  combustible: '',
  poliza_seguro: '',
})

const selectedImage = ref(null)
const selectedPdf = ref(null)
const imageUrl = ref('')
const imageName = ref('')
const pdfName = ref('')

const isLoading = ref(false)
const error = ref(null)
const success = ref(null)

const uploadStatus = reactive({ image: '', pdf: '' })

const validationErrors = reactive({
  id_num_economico: null,
  marca: null,
  modelo: null,
  year: null,
  kilometraje: null,
  combustible: null,
  image: null,
  pdf: null,
})

// === Helpers de limpieza ===
function clearValidation() {
  Object.keys(validationErrors).forEach(k => (validationErrors[k] = null))
}

function resetForm() {
  vehiculo.id_num_economico = ''
  vehiculo.marca = ''
  vehiculo.modelo = ''
  vehiculo.year = null
  vehiculo.disponible = true
  vehiculo.kilometraje = null
  vehiculo.combustible = ''
  vehiculo.poliza_seguro = ''

  selectedImage.value = null
  selectedPdf.value = null
  imageUrl.value = ''
  imageName.value = ''
  pdfName.value = ''
  uploadStatus.image = ''
  uploadStatus.pdf = ''
  clearValidation()
}

function scheduleClearMessages() {
  setTimeout(() => {
    error.value = null
    success.value = null
  }, 5000)
}

// === Validación ===
function validateForm() {
  clearValidation()
  let ok = true
  if (!vehiculo.id_num_economico) {
    validationErrors.id_num_economico = 'Número económico requerido.'
    ok = false
  }
  if (!vehiculo.marca) {
    validationErrors.marca = 'Marca requerida.'
    ok = false
  }
  if (!vehiculo.modelo) {
    validationErrors.modelo = 'Modelo requerida.'
    ok = false
  }
  if (!vehiculo.year || vehiculo.year < 1900 || vehiculo.year > currentYear + 1) {
    validationErrors.year = 'Año inválido.'
    ok = false
  }
  if (vehiculo.kilometraje == null || vehiculo.kilometraje < 0) {
    validationErrors.kilometraje = 'Kilometraje inválido.'
    ok = false
  }
  if (!vehiculo.combustible) {
    validationErrors.combustible = 'Tipo de combustible requerido.'
    ok = false
  }
  return ok
}

// === Check duplicado en DB ===
async function existsIdEconomico(id) {
  const { data, error: e } = await supabase
    .from('vehiculos')
    .select('*')
    .eq('id_num_economico', id)
    .limit(1)

  if (e) throw e
  return data.length > 0
}

// === Crear nombres de archivo NUEVA ESTRUCTURA ===
//   id_modelo_marca.ext
//
//   ej: 10_civic_honda.pdf
//
//   (sin espacios, todo minúscula)
function buildFileName(id, modelo, marca, originalName) {
  const cleanModelo = modelo.toLowerCase().replace(/\s+/g, '')
  const cleanMarca = marca.toLowerCase().replace(/\s+/g, '')
  const cleanId = String(id).replace(/[^a-zA-Z0-9-_]/g, '_')
  const ext = originalName.split('.').pop()

  return `${cleanId}_${cleanModelo}_${cleanMarca}.${ext}`
}

// === Subida genérica ===
async function uploadFile(bucket, path, file) {
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: false })

  if (uploadError) throw uploadError

  const { data: publicUrlData } = await supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrlData.publicUrl
}

// === Imagen ===
function onImageChange(e) {
  const file = e.target.files?.[0]
  validationErrors.image = null
  if (!file) return (selectedImage.value = null)

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    validationErrors.image = 'Tipo no permitido. JPG/PNG/WebP únicamente.'
    return
  }
  if (file.size > MAX_FILE_SIZE) {
    validationErrors.image = 'Máximo 2 MB.'
    return
  }

  selectedImage.value = file
  imageName.value = file.name
  imageUrl.value = URL.createObjectURL(file)
}

// === PDF ===
function onPdfChange(e) {
  const file = e.target.files?.[0]
  validationErrors.pdf = null
  if (!file) return (selectedPdf.value = null)

  if (file.type !== 'application/pdf') {
    validationErrors.pdf = 'Solo PDF'
    return
  }
  if (file.size > MAX_FILE_SIZE) {
    validationErrors.pdf = 'Máximo 2 MB.'
    return
  }

  selectedPdf.value = file
  pdfName.value = file.name
}

// === Submit ===
async function onSubmit() {
  error.value = null
  success.value = null

  if (!validateForm()) return

  const confirmed = window.confirm('¿Registrar vehículo?')
  if (!confirmed) return

  isLoading.value = true

  try {
    // 1) Duplicado
    const exists = await existsIdEconomico(vehiculo.id_num_economico)
    if (exists) throw new Error('Número económico ya registrado.')

    // 2) Subidas
    let archivo_poliza_url = null
    let img_url = null
    const uploads = []

    // PDF → bucket "polizas"
    if (selectedPdf.value) {
      const fileName = buildFileName(
        vehiculo.id_num_economico,
        vehiculo.modelo,
        vehiculo.marca,
        selectedPdf.value.name
      )
      const fullPath = fileName
      uploadStatus.pdf = 'Subiendo...'

      uploads.push(
        uploadFile('polizas', fullPath, selectedPdf.value)
          .then(url => {
            archivo_poliza_url = url
            uploadStatus.pdf = 'Completado'
          })
          .catch(err => {
            uploadStatus.pdf = 'Error'
            throw new Error('Error al subir PDF: ' + err.message)
          })
      )
    }

    // Imagen → bucket "vehiculos"
    if (selectedImage.value) {
      const fileName = buildFileName(
        vehiculo.id_num_economico,
        vehiculo.modelo,
        vehiculo.marca,
        selectedImage.value.name
      )
      const fullPath = fileName
      uploadStatus.image = 'Subiendo...'

      uploads.push(
        uploadFile('vehiculos', fullPath, selectedImage.value)
          .then(url => {
            img_url = url
            uploadStatus.image = 'Completado'
          })
          .catch(err => {
            uploadStatus.image = 'Error'
            throw new Error('Error al subir imagen: ' + err.message)
          })
      )
    }

    if (uploads.length) await Promise.all(uploads)

    // 3) Insertar en DB
    const payload = {
      id_num_economico: vehiculo.id_num_economico,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      year: vehiculo.year,
      disponible: vehiculo.disponible,
      kilometraje: vehiculo.kilometraje,
      combustible: vehiculo.combustible,
      poliza_seguro: vehiculo.poliza_seguro || null,
      archivo_poliza_url,
      img_url,
    }

    const { error: dbError } = await supabase
      .from('vehiculos')
      .insert(payload)

    if (dbError) throw dbError

    success.value = 'Vehículo registrado correctamente.'
    scheduleClearMessages()
    resetForm()

  } catch (err) {
    error.value = err.message
    scheduleClearMessages()
  } finally {
    isLoading.value = false
  }
}
</script>


<style scoped>
.registro-vehiculo-container { max-width: 680px; margin: 40px auto; padding: 26px; border-radius: 12px; background-color: #282c34; color: #abb2bf; box-shadow: 0 8px 30px rgba(0,0,0,0.35); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
h2 { text-align:center; color: #61afef; margin-bottom: 18px; font-size: 1.8rem }
.vehiculo-form { display: grid; gap: 14px }
.form-group { display:flex; flex-direction: column }
.form-group label { margin-bottom: 6px; font-weight:600; color: #98c379 }
.form-group input[type="text"], .form-group input[type="number"], .form-group input[type="file"] { padding: 10px 12px; border: 1px solid #3e4451; border-radius: 8px; background: #3e4451; color: #abb2bf }
.form-group input:focus { border-color: #61afef; box-shadow: 0 0 0 3px rgba(97,175,239,0.2); outline:none }
.checkbox-group { flex-direction: row; gap: 10px; align-items:center }
.file-upload-group input[type="file"] { border: 1px dashed #61afef; padding: 10px; border-radius: 8px }
.image-preview { margin-top: 10px; background:#3e4451; padding:10px; border-radius:8px; text-align:center }
.image-preview img { max-width:140px; max-height:140px; object-fit:cover; border-radius:8px; border:1px solid #56b6c2 }
.actions { display:flex; gap:10px }
button { padding: 12px 18px; border-radius:8px; border:none; cursor:pointer; font-weight:700 }
button:disabled { opacity:0.65; cursor:not-allowed }
button[type="submit"] { background:#c678dd; color:#fff }
button.secondary { background:#4a505f; color:#fff }
.error-message { color:#e06c75; text-align:center; font-weight:700 }
.success-message { color:#98c379; text-align:center; font-weight:700 }
.field-error { color:#e5c07b; margin-top:6px; font-size:0.9rem }
.invalid { box-shadow: 0 0 0 3px rgba(224,108,117,0.08); border-color: #e06c75 }
.upload-status p { font-size:0.95rem; color:#abb2bf }
</style>
