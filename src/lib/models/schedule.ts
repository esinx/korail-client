import { DateTime } from 'luxon'

export interface KorailSchedule {
  train: {
    name: string
    code: string
    number: string
  }
  trainGroup: {
    name: string
    code: string
  }
  runDate: Date
  departure: {
    station: {
      name: string
      code: string
    }
    date: Date
  }
  arrival: {
    station: {
      name: string
      code: string
    }
    date: Date
  }
}

export const parseSchedule = (obj: any): KorailSchedule => ({
  train: {
    name: obj.h_trn_clsf_nm,
    code: obj.h_trn_clsf_cd,
    number: obj.h_trn_no,
  },
  trainGroup: {
    name: obj.h_trn_gp_nm,
    code: obj.h_trn_gp_cd,
  },
  runDate: DateTime.fromFormat(obj.h_run_dt, `yyyyMMdd`).toJSDate(),
  departure: {
    date: DateTime.fromFormat(obj.h_dpt_dt + obj.h_dpt_tm, `yyyyMMddHHmmss`).toJSDate(),
    station: {
      name: obj.h_dpt_rs_stn_nm,
      code: obj.h_dpt_rs_stn_cd,
    },
  },
  arrival: {
    date: DateTime.fromFormat(obj.h_arv_dt + obj.h_arv_tm, `yyyyMMddHHmmss`).toJSDate(),
    station: {
      name: obj.h_arv_rs_stn_nm,
      code: obj.h_arv_rs_stn_cd,
    },
  },
})
