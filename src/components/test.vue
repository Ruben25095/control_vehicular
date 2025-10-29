
<script setup>

/**
 * Inserta la reserva en la tabla 'reservas' de Supabase.
 */
 async function realizarReserva() {
  if (!fechaInicio.value || !fechaFin.value) {
    errorMessage.value = 'Debes seleccionar ambas fechas.'
    return
  }

  if (new Date(fechaInicio.value) > new Date(fechaFin.value)) {
    errorMessage.value = 'La fecha de inicio no puede ser posterior a la de fin.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const nuevaReserva = {
    usuario_id: CURRENT_USER_ID,
    vehiculo_id: props.vehiculo.id,
    fecha_inicio: fechaInicio.value,
    fecha_fin: fechaFin.value,
    total: 0,
    estado: 'Pendiente'
  }

  try {
    // 1️⃣ Insertar en reservas
    const { data: reservaData, error: reservaError } = await supabase
      .from('reservas')
      .insert([nuevaReserva])
      .select()

    if (reservaError) throw reservaError

    // 2️⃣ Actualizar estado del vehículo (ejemplo: marcar como no disponible)
    const { error: vehiculoError } = await supabase
      .from('vehiculos')
      .update({ disponible: false })
      .eq('id', nuevaReserva.vehiculo_id)

    if (vehiculoError) throw vehiculoError

    successMessage.value = `Reserva creada con éxito! ID: ${reservaData[0].id}`

    setTimeout(() => {
      isReserving.value = false
      resetForm()
    }, 3000)

  } catch (err) {
    console.error('Error al crear la reserva:', err)
    errorMessage.value = `Error al crear la reserva: ${err.message}`
  } finally {
    isSubmitting.value = false
  }
}
</script>