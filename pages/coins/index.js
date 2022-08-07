import React from 'react'
import Head from 'next/head'
import Image from 'next/image'

import styles from '../../styles/Home.module.css'

import Binance from 'binance-api-node'

export async function getServerSideProps (context) {
  const client = new Binance()
  const prices = await client.prices()
  // manually add missing GBP pairs
  prices['AAVEGBP'] = '' + prices['AAVEBTC'] * prices['BTCGBP']
  prices['XLMGBP'] = '' + prices['XLMBTC'] * prices['BTCGBP']
  prices['EURGBP'] = '' + (prices['BTCGBP'] / prices['BTCEUR'])
  // console.log(prices['EURGBP'])
  return {
    props: {
      prices,
      timestamp: new Date().toLocaleString()
    }
  }
}

const holdings = [
  {
    name: 'BTC',
    symbol: 'BTCGBP',
    amount: 0.157,
    cost: 5001.9
  },
  {
    name: 'ETH',
    symbol: 'ETHGBP',
    amount: 2.826,
    cost: 3475.91
  },
  {
    name: 'DOT',
    symbol: 'DOTGBP',
    amount: 8.64,
    cost: 192.60
  },
  {
    name: 'LTC',
    symbol: 'LTCGBP',
    amount: 0.74,
    cost: 117.36
  },
  {
    name: 'ADA',
    symbol: 'ADAGBP',
    amount: 85.9,
    cost: 182.83
  },
  {
    name: 'AAVE',
    symbol: 'AAVEGBP',
    amount: 0.808,
    cost: 240
  },
  {
    name: 'XLM',
    symbol: 'XLMGBP',
    amount: 717.7,
    cost: 200
  },
  {
    name: 'CEUR',
    symbol: 'EURGBP',
    amount: 633.5,
    cost: 500
  }
]

const formatSterling = pounds => pounds ? ('£' + pounds.toFixed(0)) : ''

const formatValue = value => {
  const v = Number(value)
  if (v > 100) {
    return v.toFixed(0)
  } else if (v > 10) {
    return v.toFixed(1)
  } else {
    return v.toFixed(2)
  }
}

const getValue = (holding, prices) => {
  const exchange = prices[holding.symbol]
  return (holding.amount * exchange)
}

export default function Coins ({ prices, timestamp }) {
  let totalCost = 0
  let totalValue = 0

  return (
    <div className={styles.container}>
      <Head>
        <title>Crypto holdings</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="user-scalable=yes, initial-scale=1.0, maximum-scale=2.0, width=device-width" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#262626" />
        <link rel="icon" href="/Bitcoin.svg" />
      </Head>

      <main className={styles.main}>
        <Image src="/Bitcoin.svg" alt="Bitcoin Logo" width={72} height={72} />
        <p>{timestamp}</p>
        <table className={styles.cointable}>
          <thead>
            <tr><th>Coin</th><th>Quantity</th><th>Price</th><th>Cost</th><th>Value</th><th>P/L</th></tr>
          </thead>
          <tbody>
            {
              holdings.map(holding => {
                const value = getValue(holding, prices)
                totalCost += holding.cost
                totalValue += value
                const profit = value - holding.cost
                const perc = Number(100 * ((value / holding.cost) - 1)).toFixed(0)
                return (
                  <tr key={holding.name}>
                    <th>{holding.name}</th>
                    <td>{formatValue(holding.amount)}</td>
                    <td>{formatValue(prices[holding.symbol])}</td>
                    <td>{formatSterling(holding.cost)}</td>
                    <td>{formatSterling(value)}</td>
                    <td className={(profit >= 0) ? styles.up : styles.down}>{formatSterling(profit)}<br />
                    {(perc > 0) ? '+' : ''}{perc}%</td>
                  </tr>
                )
              })
            }
            <tr>
              <th colSpan={3}>Totals:</th>
              <th>{formatSterling(totalCost)}</th>
              <th>{formatSterling(totalValue)}</th>
              <th className={(totalValue >= totalCost) ? styles.up : styles.down}>{formatSterling(totalValue - totalCost)}<br />
             {Number(100 * ((totalValue / totalCost) - 1)).toFixed(0)}%</th>
            </tr>
          </tbody>
        </table>
      </main>
    </div>
  )
}
