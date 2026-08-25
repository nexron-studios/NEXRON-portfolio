import apiClient from '@/api/apiClient'

export interface ContactPayload {
  name: string
  email: string
  message: string
}

/**
 * What a form provider answers with. Only the HTTP status decides success —
 * this is typed so the response is not `any`, not because anything reads it.
 */
export interface ContactResponse {
  success?: boolean
  message?: string
}

/**
 * Contact form transport.
 *
 * The provider is reached through a plain JSON POST, so switching from
 * Web3Forms to Formspree, or to a backend of your own, means changing this
 * one file and the endpoint in `.env` — nothing else in the app knows who
 * receives the message.
 */
const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT
const accessKey = import.meta.env.VITE_CONTACT_ACCESS_KEY

export const contactService = {
  /** False until `.env` is filled in — the form then offers links instead. */
  isConfigured(): boolean {
    return Boolean(endpoint) && Boolean(accessKey)
  },

  async send(payload: ContactPayload): Promise<void> {
    if (!endpoint || !accessKey) {
      throw new Error('Contact endpoint is not configured')
    }

    await apiClient.post<ContactResponse>(
      endpoint,
      {
        access_key: accessKey,
        subject: `nexron-studios.de — ${payload.name}`,
        from_name: payload.name,
        ...payload
      },
      // The form shows its own inline error state, so the global toast
      // would be a second, redundant complaint about the same failure.
      { skipGlobalErrorHandler: true }
    )
  }
}
