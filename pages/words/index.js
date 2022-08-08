import React, { useEffect, useState } from 'react'

const SET1_EN = ["Good day", "Goodbye", "Thanks", "Coffee", "Tea", "Water", "Waterfall"]
const SET1_IS = ["Góðan daginn", "Bless", "Takk", "Kaffi", "Te", "Vatn", "Foss"]

const NUM_ANSWERS = 4

export default function Words ({ }) {
  const [wordIndex, setWordIndex] = useState(-1)

  useEffect(() => {
    const pick = Math.floor(Math.random() * SET1_EN.length)
    console.log(pick)
    setWordIndex(pick)
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

  return (
    <>
      <h1>Words</h1>
      {
        (wordIndex >= 0) && (
          <>
            {
              SET1_IS[wordIndex]
            }
            <ul>
              {
                getAnswers(wordIndex).map(answer => <li key={answer}>{answer}</li>)
              }
            </ul>
          </>
        )
      }
    </>
  )
}
