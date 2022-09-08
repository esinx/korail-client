import {
  DEFAULT_USER_AGENT,
  KORAIL_URL,
  KorailJourneyType,
  KorailPassengerType,
  KorailTrainType,
} from './constants.js'
import { parseSchedule } from './models/schedule.js'
import { KorailSeatAvailability, KorailSeatType, KorailTrain, parseTrain } from './models/train.js'
import { EMAIL_REGEX, pad, PHONE_NUMBER_REGEX } from './utils.js'
import got from 'got'
import { DateTime } from 'luxon'
import { CookieJar } from 'tough-cookie'

export interface KorailUser {
  membershipNumber: string
  name: string
  email: string
}

interface KorailResponse {
  strResult: 'SUCC' | 'FAIL'
  h_msg_cd: string
  h_msg_txt: string
}

interface KorailLoginResponse extends KorailResponse {
  Key: string
  strMbCrdNo: string
  strEmailAdr: string
  strCustNm: string
}

interface KorailTicketResponse extends KorailResponse {
  reservation_list: any[]
}

interface KorailSearchTrainsResponse extends KorailResponse {
  trn_infos: {
    trn_info: any[]
  }
}

export class KorailClientError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export class KorailError extends Error {
  constructor(code: string, message: string) {
    super(`[KorailError]: ${message}`)
    this.name = code
  }
}

const authenticated = () => (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
  const orig = descriptor.value
  descriptor.value = function (...args: any[]) {
    if (!(this as KorailClient).isAuthenticated) {
      throw new KorailClientError(
        `Attempted to call @authenticated method ${propertyKey} without authentication`
      )
    }
    return orig.apply(this, args)
  }
  return descriptor
}

export class KorailClient {
  private korailKey = `korail1234567890`
  private cookieJar = new CookieJar()
  private client = got.extend({
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
    },
    cookieJar: this.cookieJar,
    hooks: {
      beforeRequest: [
        (options) => {
          const data = {
            Device: `IP`,
            Version: `220701001`,
            Key: this.korailKey,
          }
          const orig = options.searchParams
          if (typeof orig === `string`) {
            options.searchParams += `&${new URLSearchParams(Object.entries(data)).toString()}`
          }
          if (typeof orig === `object`) {
            if (orig instanceof URLSearchParams) {
              Object.entries(data).forEach(([key, value]) => orig.append(key, value))
            } else {
              options.searchParams = {
                ...orig,
                ...data,
              }
            }
          }
        },
      ],
      afterResponse: [
        (response) => {
          const json = JSON.parse(response.body as string) as KorailResponse
          if (json.strResult === `FAIL`) {
            throw new KorailError(json.h_msg_cd, json.h_msg_txt)
          }
          return response
        },
      ],
    },
  })

  private _user?: KorailUser
  private _authenticated?: boolean

  constructor() {}

  async login(args: { id: string; password: string }): Promise<KorailUser> {
    const { id, password } = args

    const flag = EMAIL_REGEX.test(id) ? 5 : PHONE_NUMBER_REGEX.test(id) ? 4 : 2

    const data = {
      txtInputFlg: flag,
      txtMemberNo: id,
      txtPwd: Buffer.from(password).toString(`base64`),
    }

    const res = await this.client
      .post(KORAIL_URL.LOGIN, {
        searchParams: data,
      })
      .json<KorailLoginResponse>()
    if (res.strResult !== `SUCC` || typeof res.strCustNm !== `string`) {
      throw new Error(`Could not fetch user info from Korail`)
    }
    if (Object.prototype.hasOwnProperty.call(res, `Key`)) {
      this.korailKey = res.Key
    }
    this._user = {
      email: res.strEmailAdr,
      membershipNumber: res.strMbCrdNo,
      name: res.strCustNm,
    }
    this._authenticated = true
    return this._user
  }

  @authenticated()
  async getTickets() {
    const data = {
      txtIndex: `1`,
      h_page_no: `1`,
    }
    const res = await this.client
      .post(KORAIL_URL.MY_TICKET_LIST, {
        searchParams: data,
      })
      .json<KorailTicketResponse>()
    return res.reservation_list
  }

  @authenticated()
  async reserve(args: { train: KorailTrain; passengers: KorailPassengerType[]; priority: KorailSeatType[] }) {
    const { train, passengers, priority } = args
    const seatType = priority.filter((p) => train.seats[p] === KorailSeatAvailability.AVAILABLE)[0] ?? null
    if (!seatType) {
      throw new KorailClientError(`Cannot find seat with given priority`)
    }

    const runDateTime = DateTime.fromJSDate(train.runDate)
    const departureDateTime = DateTime.fromJSDate(train.departure.date)

    const passengerData = Object.entries()

    const data = {
      txtGdNo: ``,
      txtJobId: `1101`,
      txtTotPsgCnt: Object.values(passengers).reduce((acc, cur) => acc + cur, 0),

      txtSeatAttCd1: `000`,
      txtSeatAttCd2: `000`,
      txtSeatAttCd3: `000`,
      txtSeatAttCd4: `015`,
      txtSeatAttCd5: `000`,

      // might have to update these values later to enable free/standing seats
      hidFreeFlg: `N`,
      txtStndFlg: `N`,

      txtMenuId: `11`,
      txtSrcarCnt: `0`,
      txtJrnyCnt: `1`,

      txtJrnySqno1: `001`,
      txtJrnyTpCd1: `11`,

      txtDptDt1: departureDateTime.toFormat(`yyyyMMdd`),
      txtDptTm1: departureDateTime.toFormat(`HHmmss`),
      txtRunDt1: runDateTime.toFormat(`yyyyMMdd`),

      txtDptRsStnCd1: train.departure.station.code,
      txtArvRsStnCd1: train.arrival.station.code,

      txtTrnNo1: train.train.number,
      txtTrnClsfCd1: train.train.code,

      txtPsrmClCd1: seatType,
      txtTrnGpCd1: train.trainGroup.code,
      txtChgFlg1: ``,
    }

    console.log(data)

    const res = await this.client
      .post(KORAIL_URL.TICKET_RESERVATION, {
        searchParams: data,
      })
      .json()

    return res
  }

  @authenticated()
  async getReservations() {
    const data = {}
    const res = await this.client
      .post(KORAIL_URL.RESERVATION_LIST, {
        searchParams: data,
      })
      .json()
    return res
  }

  async searchAllTrains(args: {
    departure: string
    arrival: string
    date?: Date
    trainType?: KorailTrainType
    passengers: Partial<Record<KorailPassengerType, number>>
    includeSoldout?: boolean
  }) {
    const { date = new Date() } = args
    const luxonDate = DateTime.fromJSDate(date)
    let cursorDate = DateTime.fromJSDate(date)
    let trains: KorailTrain[] = []
    while (cursorDate.get(`day`) === luxonDate.get(`day`)) {
      const result = await this.searchTrains({
        ...args,
        date: cursorDate.toJSDate(),
      })
      if (result.length === 0) {
        break
      }
      trains = [...trains, ...result]
      const lastDepartureTime = result.at(-1)!.departure.date
      cursorDate = DateTime.fromJSDate(lastDepartureTime).plus({
        minute: 1,
      })
    }
    return trains
  }

  async searchTrains(args: {
    departure: string
    arrival: string

    date?: Date
    trainType?: KorailTrainType
    passengers: Partial<Record<KorailPassengerType, number>>
    includeSoldout?: boolean
  }) {
    const {
      arrival,
      departure,
      date = new Date(),
      trainType = KorailTrainType.ALL,
      passengers,
      includeSoldout = false,
    } = args
    const luxonDate = DateTime.fromJSDate(date)
    const passengerFlags = Object.fromEntries(
      [
        KorailPassengerType.ADULT,
        KorailPassengerType.CHILD,
        KorailPassengerType.SENIOR,
        KorailPassengerType.DISABLED_A,
        KorailPassengerType.DISABLED_B,
      ].map((key) => [`txtPsgFlg_${key}`, pad(passengers[key] ?? 0, 2)])
    )
    const data = {
      radJobId: `1`,
      selGoTrain: trainType,
      txtTrnGpCd: trainType,
      txtCardPsgCnt: `0`,
      txtGdNo: ``,
      txtGoAbrdDt: luxonDate.toFormat(`yyyyMMdd`),
      txtGoHour: luxonDate.toFormat(`HHmmss`),
      txtGoEnd: arrival,
      txtGoStart: departure,
      ...passengerFlags,
      //  I have no idea what these params are supposed to do
      txtJobDv: ``,
      txtMenuId: `11`,
      txtSeatAttCd_2: `000`,
      txtSeatAttCd_3: `000`,
      txtSeatAttCd_4: `015`,
    }

    const res = await this.client
      .post(KORAIL_URL.SEARCH_SCHEDULE, {
        searchParams: data,
      })
      .json<KorailSearchTrainsResponse>()
    const trains = res.trn_infos.trn_info.map((k) => parseTrain(k))
    if (includeSoldout) return trains
    return trains.filter((t) => t.reservationPossible)
  }

  get user() {
    return this._user
  }
  get isAuthenticated() {
    return !!this._authenticated
  }
}
