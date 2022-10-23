import React from 'react'
import Head from 'next/head'

import styles from './energy.module.css'

const DAY_RATE = 43.365
const NIGHT_RATE = 14.8365
const STANDING_CHARGE = 42.861

const URL_IMPORT = 'https://api.octopus.energy/v1/electricity-meter-points/2000055440440/meters/21L3886489/consumption/'
const URL_EXPORT = 'https://api.octopus.energy/v1/electricity-meter-points/2000060049088/meters/21L3886489/consumption/'
const CREDS = Buffer.from("sk_live_nafk2UDcHE1cAWroaIFwWOoX:").toString('base64')

const AUTH = {
  "Authorization": `Basic ${CREDS}`
}

const isNight = ts => {
  const start = new Date(ts)
  const hour = start.getHours()
  const min = start.getMinutes()
  if (((hour === 0) && (min === 30))
    || ((hour >= 1) && (hour < 4))
    || ((hour === 4) && (min === 0))) {
    // console.log('night')
    return true
  }
  return false
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
  // console.log('all readings', data.results)
  console.log('num readings: ', readings.length)
  if (readings.length !== 48) {
    console.log('Warning: Expected 48 readings, found ' + readings.length)
  }
  const dayReadings = readings.filter(reading => !isNight(reading.interval_start))
  const nightReadings = readings.filter(reading => isNight(reading.interval_start))

  const dayUsage = dayReadings.reduce((prev, curr) => prev + curr.consumption, 0) 
  const dayCost = dayReadings.reduce((prev, curr) => prev + getCost(curr), 0)
  console.log('dayUsage', dayUsage)
  console.log('dayCost', dayCost)

  const nightUsage = nightReadings.reduce((prev, curr) => prev + curr.consumption, 0) 
  const nightCost = nightReadings.reduce((prev, curr) => prev + getCost(curr), 0)
  console.log('nightUsage', nightCost)
  console.log('nightCost', nightCost)

  return {
    dayUsage,
    dayCost,
    nightUsage,
    nightCost,
    readingCount: readings.length
  }
  // return Math.round(100 * readings.reduce((prev, curr) => prev + curr.consumption, 0)) / 100
}

export async function getServerSideProps (context) {
  const imp = await getYesterdaySum(URL_IMPORT)
  const exp = 0 // await getYesterdaySum(URL_EXPORT)

  return {
    props: {
      importDayUsage: imp.dayUsage,
      importDayCost: imp.dayCost,
      importNightUsage: imp.nightUsage,
      importNightCost: imp.nightCost,
      importReadingCount: imp.readingCount,
      exp
    }
  }
}

const formatSterling = pounds => pounds ? ('£' + pounds.toFixed(2 )) : ''
const formatKWh = kwh => kwh.toFixed(2)

export default function Energy ({ importDayUsage, importDayCost, importNightUsage, importNightCost, importReadingCount, exp }) {

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
      <main className={styles.main}>
        <h1>Yesterday's Energy</h1>
        <h2>Electricity import:</h2>
        {
          (importReadingCount < 48) && (
            <p>Warning: Missing readings (found: {importReadingCount})</p>
          )
        }
        <table className={styles.table}>
        <thead>
            <tr><th></th><th>kWh</th><th>Cost</th></tr>
          </thead>
          <tbody>
            <tr><th>Day</th><td>{formatKWh(importDayUsage)}</td><td>{formatSterling(importDayCost / 100)}</td></tr>
            <tr><th>Night</th><td>{formatKWh(importNightUsage)}</td><td>{formatSterling(importNightCost / 100)}</td></tr>
            <tr><th>Standing</th><td></td><td>{formatSterling(STANDING_CHARGE / 100)}</td></tr>
            <tr><th>Total</th><td>{formatKWh(importDayUsage + importNightUsage)}</td><td><strong>{formatSterling((importDayCost + importNightCost + STANDING_CHARGE) / 100)}</strong></td></tr>
          </tbody>
        </table>
        { /* <p>Export: {exp} kWh</p> */ }
      </main>
    </>
  )
}
