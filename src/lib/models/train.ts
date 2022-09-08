import { KorailSchedule, parseSchedule } from './schedule.js'

export enum KorailSeatType {
  SPECIAL = `spe`, // 특실
  GENERAL = `gen`, // 일반석
  STANDING = `stnd`, // 입석
  FREE = `free`, // 자유석
}

export enum KorailSeatAvailability {
  NOT_AVAILABLE = `00`,
  AVAILABLE = `11`,
  SOLD_OUT = `13`,
}

export interface KorailTrain extends KorailSchedule {
  reservationPossible: boolean
  reservationName: string
  seats: Record<KorailSeatType, KorailSeatAvailability>
}

const SEATS = [KorailSeatType.SPECIAL, KorailSeatType.GENERAL, KorailSeatType.STANDING, KorailSeatType.FREE]

export const parseTrain = (obj: any): KorailTrain => ({
  ...parseSchedule(obj),
  reservationPossible: obj.h_rsv_psb_flg === `Y`,
  reservationName: obj.h_rsv_psb_nm,
  seats: Object.fromEntries(SEATS.map((key) => [key, obj[`h_${key}_rsv_cd`]])) as KorailTrain['seats'],
})
