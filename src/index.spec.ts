import { KorailPassengerType } from './index.js'
import { KorailClient } from './lib/client.js'
import { KorailTrainType } from './lib/constants.js'
import { KorailSeatAvailability, KorailSeatType } from './lib/models/train.js'
import { DateTime } from 'luxon'
import { expect, test } from 'vitest'

// test(`login`, async () => {
//   const korailClient = new KorailClient()
//   const user = await korailClient.login({

//   })
//   console.log(user)
//   expect(user.name).toBeTruthy()
//   expect(user.membershipNumber).toBeTruthy()
//   const tickets = await korailClient.getTickets()
//   console.dir({ tickets }, { depth: null })
//   const reservations = await korailClient.getReservations()
//   console.dir({ reservations }, { depth: null })
//   expect(tickets).toBeTruthy()
// })

test(
  `reserve`,
  async () => {
    const korailClient = new KorailClient()
    const user = await korailClient.login({})
    const trains = await korailClient.searchAllTrains({
      departure: `동대구`,
      arrival: `서울`,
      trainType: KorailTrainType.KTX,
      date: DateTime.fromObject({
        year: 2022,
        month: 9,
        day: 15,
        hour: 7,
      }).toJSDate(),
      passengers: { [KorailPassengerType.ADULT]: 1 },
    })

    const train = trains.find((t) => t.train.number === `204`)
    if (!train) {
      throw new Error(`train not found`)
    }
    const res = await korailClient.reserve({
      train,
      passengers: [KorailPassengerType.ADULT],
      priority: [KorailSeatType.GENERAL],
    })
    console.log(res)
    expect(res).toBeTruthy()
  },
  {
    timeout: 60 * 1000,
  }
)

// test(
//   `trains`,
//   async () => {
//     const korailClient = new KorailClient()
//     const trains = await korailClient.searchAllTrains({
//       departure: `동대구`,
//       arrival: `서울`,
//       trainType: KorailTrainType.KTX,
//       date: DateTime.fromObject({
//         year: 2022,
//         month: 9,
//         day: 15,
//         hour: 7,
//       }).toJSDate(),
//       passengers: { [KorailPassengerType.ADULT]: 1 },
//     })
//     console.table(
//       trains.map(({ arrival, departure, seats, train }) => ({
//         name: train.name,
//         code: train.code,
//         number: train.number,
//         depature: departure.date.toLocaleString(),
//         arrival: arrival.date.toLocaleString(),
//         seats: Object.entries(seats)
//           .filter(([, value]) => value === KorailSeatAvailability.AVAILABLE)
//           .map(([key]) => key)
//           .join(`, `),
//       }))
//     )
//     expect(trains).toBeTruthy()
//   },
//   {
//     timeout: 60 * 1000,
//   }
// )
