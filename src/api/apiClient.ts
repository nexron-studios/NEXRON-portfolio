import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'vue-sonner'
import i18n from '@/i18n'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Set when the caller renders the failure itself instead of a toast. */
    skipGlobalErrorHandler?: boolean
  }
}

const apiClient = axios.create({
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig | undefined

    // Cancellations are not failures — the user navigated away.
    const isCancelled = axios.isCancel(error) || error.code === 'ERR_CANCELED'

    if (!isCancelled && !config?.skipGlobalErrorHandler) {
      toast.error(i18n.global.t('contact.error'))
    }

    return Promise.reject(error)
  }
)

export default apiClient
