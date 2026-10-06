import type { AxiosError } from 'axios'

export const shouldLogAxios = (error: AxiosError): boolean => {
  const status = error.response?.status

  if (!status) {
    return !(
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message === 'Network Error' ||
      (typeof navigator !== 'undefined' && !navigator.onLine)
    )
  }

  if (status === 502) return false
  if (status === 503) return false
  if (status === 504) return false

  if (status >= 500) return true

  if ([400, 401, 403, 404].includes(status)) return false

  return true
}
