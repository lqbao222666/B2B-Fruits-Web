const BACKEND_URL = 'http://localhost:3000'

export const getImageUrl = (input: any, placeholderText = 'Nông Sản'): string => {
  const defaultPlaceholder = `https://placehold.co/400x400/e2e8f0/1e293b?text=${encodeURIComponent(placeholderText)}`

  if (!input) return defaultPlaceholder

  let target: any = input

  // If input is an object representing post/product data (e.g. post)
  if (typeof input === 'object' && !Array.isArray(input)) {
    if (input.image_url || input.images || input.image || input.hinhanh || input.hinh_anh || input.avatar || input.url) {
      target = input.image_url || input.images || input.image || input.hinhanh || input.hinh_anh || input.avatar || input.url
    }
  }

  // If target is a string, check if it's a JSON array or object string
  if (typeof target === 'string') {
    const trimmed = target.trim()
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        target = JSON.parse(trimmed)
      } catch (e) {
        target = trimmed
      }
    }
  }

  // If target is an array, take the first element
  if (Array.isArray(target)) {
    if (target.length === 0) return defaultPlaceholder
    target = target[0]
  }

  // If target is an object with url property
  if (target && typeof target === 'object') {
    if (target.url) target = target.url
    else if (target.image_url) target = target.image_url
  }

  if (typeof target !== 'string') return defaultPlaceholder

  // Clean up any remaining quotes or brackets
  let cleanStr = target.trim().replace(/^["'\[]+|["'\]]+$/g, '')
  if (!cleanStr) return defaultPlaceholder

  if (cleanStr.startsWith('http://') || cleanStr.startsWith('https://')) {
    return cleanStr
  }

  const path = cleanStr.startsWith('/') ? cleanStr : `/${cleanStr}`
  return `${BACKEND_URL}${path}`
}
