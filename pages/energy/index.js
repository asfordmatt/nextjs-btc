import React from 'react'
import Head from 'next/head'

const DAY_RATE = 41.30
const NIGHT_RATE = 14.13

const URL_IMPORT = 'https://api.octopus.energy/v1/electricity-meter-points/2000055440440/meters/21L3886489/consumption/'
const URL_EXPORT = 'https://api.octopus.energy/v1/electricity-meter-points/2000060049088/meters/21L3886489/consumption/'
const CREDS = Buffer.from("sk_live_nafk2UDcHE1cAWroaIFwWOoX:").toString('base64')

const AUTH = {
  "Authorization": `Basic ${CREDS}`
}

const getCost = reading => {
  // console.log(reading)
  const start = new Date(reading.interval_start)
  const hour = start.getHours()
  const min = start.getMinutes()
  if (((hour === 0) && (min === 30))
    || ((hour >= 1) && (hour < 4))
    || ((hour === 4) && (min === 0))) {
    // console.log('night')
    return reading.consumption * NIGHT_RATE
  } else {
    // console.log('day')
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
  console.log('num readings: ', readings.length)
  if (readings.length !== 48) {
    console.log('Warning: Expected 48 readings, found ' + readings.length)
  }
  const usage = readings.reduce((prev, curr) => prev + curr.consumption, 0) 
  const cost = readings.reduce((prev, curr) => prev + getCost(curr), 0)
  console.log('usage', usage)
  console.log('cost', cost)
  return {
    usage,
    cost
  }
  // return Math.round(100 * readings.reduce((prev, curr) => prev + curr.consumption, 0)) / 100
}

export async function getServerSideProps (context) {
  const imp = await getYesterdaySum(URL_IMPORT)
  const exp = 0 // await getYesterdaySum(URL_EXPORT)

  return {
    props: {
      importUsage: imp.usage,
      importCost: imp.cost,
      exp
    }
  }
}

const formatSterling = pounds => pounds ? ('£' + pounds.toFixed(2 )) : ''
const formatKWh = kwh => kwh.toFixed(2)

export default function Energy ({ importUsage, importCost, exp }) {

  return (
    <>
      <Head>
        <title>Yesterday's Energy</title>
        <meta name="description" content="Yesterday's Energy" />
        <meta name="viewport" content="user-scalable=yes, initial-scale=1.0, maximum-scale=2.0, width=device-width" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#262626" />
        <link rel="icon" href="/Energy.svg" />
      </Head>
      <main>
        <h1>Yesterday's Energy</h1>
        <h2>Electricity import: {formatKWh(importUsage)} kWh, {formatSterling(importCost / 100)}</h2>
        { /* <p>Export: {exp} kWh</p> */ }
      </main>
    </>
  )
}
