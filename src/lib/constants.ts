const KORAIL_ROOT = `https://smart.letskorail.com`
const KORAIL_MOBILE = `${KORAIL_ROOT}/classes/com.korail.mobile`

export const KORAIL_URL = {
  LOGIN: `${KORAIL_MOBILE}.login.Login`,
  LOGOUT: `${KORAIL_MOBILE}.common.logout`,

  SEARCH_SCHEDULE: `${KORAIL_MOBILE}.seatMovie.ScheduleView`,
  TICKET_RESERVATION: `${KORAIL_MOBILE}.certification.TicketReservation`,
  REFUND: `${KORAIL_MOBILE}.refunds.RefundsRequest`,

  MY_TICKET_LIST: `${KORAIL_MOBILE}.myTicket.MyTicketList`,
  MY_TICKET_SEAT: `${KORAIL_MOBILE}.refunds.SelTicketInfo`,

  RESERVATION_LIST: `${KORAIL_MOBILE}.reservation.ReservationView`,
  CANCEL_RESERVATION: `${KORAIL_MOBILE}.reservationCancel.ReservationCancelChk`,

  STATION_DB: `${KORAIL_MOBILE}.common.stationinfo?device=ip`,
  STATION_DB_DATA: `${KORAIL_MOBILE}.common.stationdata`,

  EVENT: `${KORAIL_MOBILE}.common.event`,
  PAYMENT: `${KORAIL_MOBILE}/ebizmw/PrdPkgMainList.do`,
  PAYMENT_VOUCHER: `${KORAIL_MOBILE}/ebizmw/PrdPkgBoucherView.do`,
}

export const DEFAULT_USER_AGENT = `KorailTalk/4.13.3 (iPhone; iOS 15.0; Scale/3.00)`

export enum KorailJourneyType {
  열차상품 = 10,
  편도 = 11,
  ONE_WAY = 11,
  왕편 = 12,
  복편 = 13,
  환승편도 = 14,
  왕편환승 = 15,
  복편환승 = 16,
  병합 = 20,
  병합선행 = 21,
  병합후행 = 22,
  열차외상품 = 50,
  숙박 = 51,
  렌터카 = 52,
  선박 = 53,
  이벤트 = 54,
  항공 = 55,
}

export enum KorailTrainType {
  KTX = `100`,
  SAEMAEUL = `101`,
  MUGUNGHWA = `102`,
  TONGGUEN = `103`,
  NURIRO = `102`,
  ALL = `109`,
  AIRPORT = `105`,
  KTX_SANCHEON = `100`,
  ITX_SAEMAEUL = `101`,
  ITX_CHEONGCHUN = `104`,
}

export enum KorailPassengerType {
  ADULT = 1,
  CHILD = 2,
  SENIOR = 3,
  DISABLED_A = 4,
  DISABLED_B = 5,
}
