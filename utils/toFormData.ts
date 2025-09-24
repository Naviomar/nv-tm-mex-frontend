function appendFormData(formData: FormData, keyPrefix: string, value: any) {
  // Check if value is undefined and convert it to null
  if (value === undefined) {
    value = null
  }
  if (value instanceof Object && !(value instanceof File)) {
    Object.keys(value).forEach((key) => {
      const newKey = keyPrefix ? `${keyPrefix}[${key}]` : key // Use brackets for nesting
      appendFormData(formData, newKey, value[key])
    })
  } else {
    formData.append(keyPrefix, value)
  }
}

function objectToFormData(obj: any) {
  const formData = new FormData()
  appendFormData(formData, '', obj)
  return formData
}

export default objectToFormData
