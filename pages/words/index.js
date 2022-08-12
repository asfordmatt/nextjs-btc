import React, { useEffect, useMemo, useState } from 'react'

import styles from './Words.module.css'

const SET1_EN = [
  "Good day", "Goodbye", "Thanks", "Coffee", "Tea", "Water", "Waterfall", "Yes", "No",
  "Beer", "Wine", "Bread", "Meat", "Fish", "Soup", "Ice cream",
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"
]
const SET1_IS = [
  "Góðan daginn", "Bless", "Takk", "Kaffi", "Te", "Vatn", "Foss", "Já", "Nei",
  "Bjór", "Vin", "Brauð", "Kjöt", "Fiskur", "Súpa", "Ís",
  "Núll", "Einn", "Tveir", "Þrír", "Fjórir", "Fimm", "Sex", "Sjö", "Átta", "Níu", "Tíu"
]

const NUM_ANSWERS = 6

export default function Words ({ }) {
  const [wordIndex, setWordIndex] = useState(-1)
  const [result, setResult] = useState('')

  const chooseWord = () => {
    const pick = Math.floor(Math.random() * SET1_EN.length)
    console.log('pick', pick)
    return pick
  }

  useEffect(() => {
    setWordIndex(chooseWord())
  }, [])

  const shuffle = arr => {
    arr.sort(() => Math.random() - .5)
  }

  const getAnswers = correct => {
    // remove correct answer & shuffle
    const before = SET1_EN.slice(0, correct)
    const after = SET1_EN.slice(correct + 1)
    const incorrect = before.concat(after)
    shuffle(incorrect)

    // take only required number of incorrect answers
    const chop = incorrect.slice(0, NUM_ANSWERS - 1)

    // add correct answer & shuffle
    const full = [SET1_EN[correct], ...chop]
    shuffle(full)

    return full
  }

  const handleClick = correct => {
    console.log('handleClick', correct)
    setResult(correct)
  }
  
  const answers = useMemo(() => getAnswers(wordIndex), [wordIndex])

  return (
    <div className={styles.main}>
      <h1>Words</h1>
      {
        (wordIndex >= 0) && (
          <>
            <span className={styles.question}>{SET1_IS[wordIndex]}</span>
            <div className={styles.answerBox}>
              {
                answers.map(answer => <button className={styles.answer} onClick={() => handleClick(answer === SET1_EN[wordIndex])} key={answer}>{answer}</button>)
              }
            </div>
            <div className={styles.result}>
              {
                (result === true) && (<span>Correct! 😊</span>)
              }
              {
                (result === false) && (<span>Wrong 😥</span>)
              }
            </div>
          </>
        )
      }
      <div>
        <button className={styles.next} onClick={() => {
          setResult('')
          setWordIndex(chooseWord())
        }}>Next</button>
      </div>
    </div>
  )
}
