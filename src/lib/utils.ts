export const EMAIL_REGEX = /[^@]+@[^@]+\.[^@]+/
export const PHONE_NUMBER_REGEX = /(\d{3})-(\d{3,4})-(\d{4})/

export const pad = (num: number, length: number): string => {
  const stringified = String(num)
  if (stringified.length >= length) return stringified
  return `0`.repeat(length - stringified.length) + stringified
}
