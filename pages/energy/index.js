import React from 'react'

const DAY_RATE = 29.31
const NIGHT_RATE = 20.23

const URL_IMPORT = 'https://api.octopus.energy/v1/electricity-meter-points/2000055440440/meters/21L3886489/consumption/'
const URL_EXPORT = 'https://api.octopus.energy/v1/electricity-meter-points/2000060049088/meters/21L3886489/consumption/'
const CREDS = Buffer.from("sk_live_nafk2UDcHE1cAWroaIFwWOoX:").toString('base64')

const AUTH = {
  "Authorization": `Basic ${CREDS}`
}

const getCost = reading => {
  console.log(reading)
  const start = new Date(reading.interval_start)
  const hour = start.getHours()
  const min = start.getMinutes()
  if (((hour === 0) && (min === 30))
    || ((hour >= 1) && (hour < 4))
    || ((hour === 4) && (min === 0))) {
    console.log('night')
    return reading.consumption * NIGHT_RATE
  } else {
    console.log('day')
    return reading.consumption * DAY_RATE
  }
}

const getYesterdaySum = async url => {
  const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24).getDate()
  const res = await fetch(url, {
    headers: AUTH
  })
  const data = await res.json()
  const readings = data.results.filter(reading => {
    return (new Date(reading.interval_start).getDate() == yesterday)
  })
  const cost = readings.reduce((prev, curr) => prev + getCost(curr), 0)
  console.log('cost', cost)
  return Math.round(100 * readings.reduce((prev, curr) => prev + curr.consumption, 0)) / 100
}

export async function getServerSideProps (context) {
  const imp = await getYesterdaySum(URL_IMPORT)
  const exp = await getYesterdaySum(URL_EXPORT)

  return {
    props: {
      imp,
      exp
    }
  }
}

export default function Energy ({ imp, exp }) {

  return (
    <>
      <h1>Energy</h1>
      <p>Import: {imp} kWh</p>
      <p>Export: {exp} kWh</p>
    </>
  )
}
