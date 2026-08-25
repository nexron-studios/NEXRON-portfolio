import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { ApiService } from '@/api'

export const contactFieldList = ['name', 'email', 'message'] as const
export type ContactField = (typeof contactFieldList)[number]

type FieldRecord = Record<ContactField, string>
type ErrorRecord = Record<ContactField, string | null>

const MIN_MESSAGE_LENGTH = 12
/** Deliberately loose: the provider does the real check, this catches typos. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const useContactForm = () => {
  const { t } = useI18n()

  const values = reactive<FieldRecord>({ name: '', email: '', message: '' })
  const errors = reactive<ErrorRecord>({ name: null, email: null, message: null })
  const touched = reactive<Record<ContactField, boolean>>({
    name: false,
    email: false,
    message: false
  })

  const isSubmitting = ref(false)
  const isSubmitted = ref(false)
  const isConfigured = ApiService.contact.isConfigured()

  const validateField = (field: ContactField): string | null => {
    const value = values[field].trim()

    if (field === 'name') return value ? null : t('contact.error_name_required')

    if (field === 'email') {
      if (!value) return t('contact.error_email_required')
      return EMAIL_PATTERN.test(value) ? null : t('contact.error_email_invalid')
    }

    if (!value) return t('contact.error_message_required')
    return value.length < MIN_MESSAGE_LENGTH ? t('contact.error_message_short') : null
  }

  /** Only complains about fields the user has already left. */
  const revalidate = (field: ContactField): void => {
    if (!touched[field]) return
    errors[field] = validateField(field)
  }

  const handleBlur = (field: ContactField): void => {
    touched[field] = true
    errors[field] = validateField(field)
  }

  const isValid = computed(() => contactFieldList.every((field) => validateField(field) === null))

  const submit = async (): Promise<void> => {
    contactFieldList.forEach((field) => {
      touched[field] = true
      errors[field] = validateField(field)
    })

    if (!isValid.value || isSubmitting.value) return

    isSubmitting.value = true
    try {
      await ApiService.contact.send({
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim()
      })

      isSubmitted.value = true
      toast.success(t('contact.success'))
      contactFieldList.forEach((field) => {
        values[field] = ''
        touched[field] = false
        errors[field] = null
      })
    } catch (error) {
      console.error(error)
      toast.error(t('contact.error'))
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    values,
    errors,
    isSubmitting,
    isSubmitted,
    isConfigured,
    isValid,
    handleBlur,
    revalidate,
    submit
  }
}
