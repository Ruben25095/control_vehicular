
<script setup>
import { ref, reactive, computed } from 'vue'
import { supabase } from '@/lib/supabase' // asegúrate ruta correcta
import AppHeader from './AppHeader.vue'
  import { VueDatePicker } from '@vuepic/vue-datepicker';
  import '@vuepic/vue-datepicker/dist/main.css'
// --- Configuraciones ---
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const currentYear = new Date().getFullYear()

// --- Estado reactivo ---
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

// Errores de validación locales
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

// -- Helpers --
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

// Auto-clear mensajes después de 5s
function scheduleClearMessages() {
  setTimeout(() => {
    error.value = null
    success.value = null
  }, 5000)
}

// --- Manejo de archivos ---
function onImageChange(e) {
  const file = e.target.files && e.target.files[0]
  validationErrors.image = null
  if (!file) return (selectedImage.value = null)

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    validationErrors.image = 'Tipo de archivo no permitido. Usa JPG o PNG.'
    selectedImage.value = null
    imageUrl.value = ''
    imageName.value = ''
    return
  }

  if (file.size > MAX_FILE_SIZE) {
    validationErrors.image = 'El archivo excede el tamaño máximo de 2 MB.'
    selectedImage.value = null
    imageUrl.value = ''
    imageName.value = ''
    return
  }

  selectedImage.value = file
  imageName.value = file.name
  imageUrl.value = URL.createObjectURL(file)
}

function onPdfChange(e) {
  const file = e.target.files && e.target.files[0]
  validationErrors.pdf = null
  if (!file) return (selectedPdf.value = null)

  if (file.type !== 'application/pdf') {
    validationErrors.pdf = 'Solo se aceptan archivos PDF.'
    selectedPdf.value = null
    pdfName.value = ''
    return
  }

  if (file.size > MAX_FILE_SIZE) {
    validationErrors.pdf = 'El archivo excede el tamaño máximo de 2 MB.'
    selectedPdf.value = null
    pdfName.value = ''
    return
  }

  selectedPdf.value = file
  pdfName.value = file.name
}

// --- Validaciones de formulario ---
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
    validationErrors.modelo = 'Modelo requerido.'
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

  // archivos ya validados en handlers
  return ok
}

// --- Check duplicado en DB ---
async function existsIdEconomico(id) {
  const { data, error: e } = await supabase.from('vehiculos').select('id').eq('id_num_economico', id).limit(1)
  if (e) throw e
  return Array.isArray(data) && data.length > 0
}

// --- Subidas ---
// Genera nombres únicos y carpeta por vehiculo para no sobreescribir
function makeFilePath(id, originalName) {
  const timestamp = Date.now()
  // limpiar caracteres inseguros
  const safeId = String(id).replace(/[^a-zA-Z0-9-_]/g, '_')
  const ext = originalName.split('.').pop()
  return `vehiculos/${safeId}/${timestamp}_${Math.random().toString(36).slice(2,8)}.${ext}`
}

async function uploadFileToSupabase(bucket, path, file) {
  // upsert = false para evitar sobreescritura, pero path ya debe ser único
  uploadStatus.image = uploadStatus.image || ''
  try {
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false })
    if (uploadError) throw uploadError

    const { data: publicUrlData, error: urlError } = await supabase.storage.from(bucket).getPublicUrl(path)
    if (urlError) throw urlError
    return publicUrlData.publicUrl
  } catch (err) {
    throw err
  }
}

// --- Envío del formulario ---
async function onSubmit() {
  error.value = null
  success.value = null

  if (!validateForm()) return

  // confirmación rápida
  const confirmed = window.confirm('¿Deseas registrar este vehículo?')
  if (!confirmed) return

  isLoading.value = true

  try {
    // 1) verificar duplicado
    const exists = await existsIdEconomico(vehiculo.id_num_economico)
    if (exists) {
      throw new Error('Ya existe un vehículo con ese número económico.')
    }

    // 2) preparar rutas de archivos (si existen)
    const uploads = []
    let archivo_poliza_url = null
    let img_url = null

    if (selectedPdf.value) {
      const pdfPath = makeFilePath(vehiculo.id_num_economico, selectedPdf.value.name)
      uploadStatus.pdf = 'Iniciando...'
      uploads.push(
        uploadFileToSupabase('vehiculos', pdfPath, selectedPdf.value)
          .then(url => {
            archivo_poliza_url = url
            uploadStatus.pdf = 'Completado'
          })
          .catch(err => {
            uploadStatus.pdf = 'Error'
            throw new Error('Error al subir PDF: ' + (err.message || err))
          })
      )
    }

    if (selectedImage.value) {
      const imgPath = makeFilePath(vehiculo.id_num_economico, selectedImage.value.name)
      uploadStatus.image = 'Iniciando...'
      uploads.push(
        uploadFileToSupabase('vehiculos', imgPath, selectedImage.value)
          .then(url => {
            img_url = url
            uploadStatus.image = 'Completado'
          })
          .catch(err => {
            uploadStatus.image = 'Error'
            throw new Error('Error al subir imagen: ' + (err.message || err))
          })
      )
    }

    // subir en paralelo
    if (uploads.length) await Promise.all(uploads)

    // 3) Insertar registro en la tabla
    const payload = {
      id_num_economico: vehiculo.id_num_economico,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      year: vehiculo.year,
      disponible: vehiculo.disponible,
      kilometraje: vehiculo.kilometraje,
      combustible: vehiculo.combustible,
      poliza_seguro: vehiculo.poliza_seguro || null,
      archivo_poliza_url: archivo_poliza_url,
      img_url: img_url,
    }

    const { data: insertData, error: dbError } = await supabase.from('vehiculos').insert(payload)
    if (dbError) throw dbError

    success.value = 'Vehículo registrado exitosamente!'
    scheduleClearMessages()
    // limpiar formulario ligeramente después
    resetForm()

  } catch (err) {
    console.error('Registro fallido:', err)
    error.value = err.message || String(err)
    scheduleClearMessages()
  } finally {
    isLoading.value = false
  }
}
</script>