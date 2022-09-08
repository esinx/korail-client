import { KorailTrain } from './train.js'

export interface KorailReservation extends KorailTrain {
  id: string
  journey: {
    number: string
    count: string
  }

  changeNumber: string

  seatCount: number
  carNumber: string
  seatNumber: string

  reservedUntil: Date
  price: number
}
