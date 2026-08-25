import { contactService } from '@/api/services/contact.service'

/**
 * Aggregator every component and composable talks to. Nothing outside
 * `src/api/` should import `apiClient` directly.
 */
export const ApiService = {
  contact: contactService
}
