import React, { useState } from 'react'
import { useSprings, animated, to as interpolate } from '@react-spring/web'
import { useDrag } from 'react-use-gesture'

import styles from './styles.module.css'

const cards = [
  'https://scontent.fdac157-1.fna.fbcdn.net/v/t39.30808-6/320579029_928475384804106_6059389954261765931_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=09cbfe&_nc_ohc=kCDqQtEZ7HQAX8fDzGd&_nc_ht=scontent.fdac157-1.fna&oh=00_AfCx9K_nse-IchD-8nk-lMKb_7rCZWWKIINFB0Kudx_q9Q&oe=63AE6906',
  'https://scontent.fdac157-1.fna.fbcdn.net/v/t39.30808-6/247699214_931339464450929_5780452823757416814_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=174925&_nc_ohc=Z00jJgtxC48AX8ZSDmH&tn=sdgaiQ3dKdP2LYI3&_nc_ht=scontent.fdac157-1.fna&oh=00_AfAC7BgrCy2FsBkafWsTrrRilI_B8oYzIfc66hyebGWknA&oe=63AEAF64',
  'https://scontent.fdac157-1.fna.fbcdn.net/v/t39.30808-6/275223416_1014209499497258_1909002267672971213_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=8bfeb9&_nc_ohc=vtR5H_ig6m8AX-cZHTV&_nc_ht=scontent.fdac157-1.fna&oh=00_AfCxKH7o_ivF8G4A7a4Y0azFOimHBcJszpFr_6xn4GeZtA&oe=63AF2EDD',
  'https://scontent.fdac157-1.fna.fbcdn.net/v/t39.30808-6/252767441_939572206960988_7903006652177777675_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=8bfeb9&_nc_ohc=ez8-bhnjapgAX_9iRiv&_nc_ht=scontent.fdac157-1.fna&oh=00_AfBarpLkpivwbflLu1NRN6T-E1ZAek7HzqoCPhpJasx9kQ&oe=63AF6DEA',
  'https://scontent.fdac157-1.fna.fbcdn.net/v/t39.30808-6/276997921_1024697595115115_8890558027339159309_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=8bfeb9&_nc_ohc=fDiH6tnJzhAAX-kvybA&_nc_ht=scontent.fdac157-1.fna&oh=00_AfA4kt_f08XSbT01toE-q4fnHKT49o-b5tKmZ2XM8Yp1eg&oe=63AFA96E',
  'https://scontent.fdac157-1.fna.fbcdn.net/v/t39.30808-6/259450904_948235676094641_3948034936335933066_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=8bfeb9&_nc_ohc=U53RT_zTlRwAX-KkxcD&tn=sdgaiQ3dKdP2LYI3&_nc_ht=scontent.fdac157-1.fna&oh=00_AfDcuIbxlwKP3EfFXw8wUs_OzgA53YVBCeoUn7z2Fp_sbw&oe=63AFE262',
]

// These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = (i: number) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
})
const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 })
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r: number, s: number) =>
  `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

function Deck() {
  const [gone] = useState(() => new Set()) // The set flags all the cards that are flicked out
  const [props, api] = useSprings(cards.length, i => ({
    ...to(i),
    from: from(i),
  })) // Create a bunch of springs using the helpers above
  // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
  const bind = useDrag(({ args: [index], down, movement: [mx], direction: [xDir], velocity }) => {
    const trigger = velocity > 0.2 // If you flick hard enough it should trigger the card to fly out
    const dir = xDir < 0 ? -1 : 1 // Direction should either point left or right
    if (!down && trigger) gone.add(index) // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
    api.start(i => {
      if (index !== i) return // We're only interested in changing spring-data for the current spring
      const isGone = gone.has(index)
      const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0 // When a card is gone it flys out left or right, otherwise goes back to zero
      const rot = mx / 100 + (isGone ? dir * 10 * velocity : 0) // How much the card tilts, flicking it harder makes it rotate faster
      const scale = down ? 1.1 : 1 // Active cards lift up a bit
      return {
        x,
        rot,
        scale,
        delay: undefined,
        config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
      }
    })
    if (!down && gone.size === cards.length)
      setTimeout(() => {
        gone.clear()
        api.start(i => to(i))
      }, 600)
  })
  // Now we're just mapping the animated values to our view, that's it. Btw, this component only renders once. :-)
  return (
    <>
      {props.map(({ x, y, rot, scale }, i) => (
        <animated.div className={styles.deck} key={i} style={{ x, y }}>
          {/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
          <animated.div
            {...bind(i)}
            style={{
              transform: interpolate([rot, scale], trans),
              backgroundImage: `url(${cards[i]})`,
            }}
          />
        </animated.div>
      ))}
    </>
  )
}

export default function App() {
  return (
    <div className={styles.container}>
      <Deck />
    </div>
  )
}
