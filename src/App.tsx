import './index.css'
import WordleRow from './components/WordleRow'
import { useState, useEffect, useRef, MutableRefObject, MouseEvent } from 'react'
import WORDLE_WORDS from '../data/words'
import { createElement } from './utils'
import KeyboardKey from './components/KeyboardKey'
import backspace from './assets/backspace.svg'
import { TileRow } from './types'
// import { LetterStatus } from './types'

// const randomWordIndex = Math.floor( Math.random() * WORDLE_WORDS.length );
// const wordleWord = WORDLE_WORDS[randomWordIndex];
const ERR_EXP_AFTER = 2.2 * 1000
const ALPHABETS = 'abcdefghijklmnopqrstuvwxyz'

export default function App(): JSX.Element {
    const wordleWord = 'SAMIR'

    const [tiles, setTiles] = useState([
        { row: ['', '', '', '', ''], guessed: false },
        { row: ['', '', '', '', ''], guessed: false },
        { row: ['', '', '', '', ''], guessed: false },
        { row: ['', '', '', '', ''], guessed: false },
        { row: ['', '', '', '', ''], guessed: false },
    ])
    const [currRow, setRow] = useState(0)
    const [currIndex, setIndex] = useState(0)

    const [letterStatus, setLetterStatus] = useState({
        wrong: Array<string>(),
        misplaced: Array<string>(),
        correct: Array<string>(),
    })
    const errorSlideRef = useRef() as MutableRefObject<HTMLDivElement>

    // function checkLetterStatus(letter: string) {
    //     // let letterStatus: number = 0
    //     let letterStatus = LetterStatus.DEFAULT

    //     for (const tileRow of tiles) {
    //         if (tileRow.row.includes(letter)) {
    //             if (tileRow.row.indexOf(letter) === wordleWord.split('').indexOf(letter)) {
    //                 letterStatus = LetterStatus.CORRECT
    //             } else if (
    //                 tileRow.row.indexOf(letter) !== wordleWord.split('').indexOf(letter) &&
    //                 letterStatus < 4
    //             ) {
    //                 letterStatus = LetterStatus.MISPLACED
    //             } else if (!wordleWord.split('').includes(letter) && letterStatus < 3) {
    //                 letterStatus = LetterStatus.WRONG
    //             } else {
    //                 if (letterStatus < 2) letterStatus = LetterStatus.DEFAULT
    //             }
    //         }
    //     }
    //     return letterStatus
    // }

    function pushError(string: string) {
        const errorChild = createElement(
            'div',
            'bg-slate-200 p-2 text-center font-semibold rounded-lg delete-after',
            string
        )
        errorSlideRef.current.insertBefore(errorChild, errorSlideRef.current.firstChild)
        setTimeout(() => {
            errorSlideRef.current.removeChild(errorChild)
        }, ERR_EXP_AFTER)
    }

    function updateLetterStatus(tileRow: TileRow, wordleWord: string) {
        tileRow.row.forEach((letter, index) => {
            if (
                wordleWord.split('').indexOf(letter) === index &&
                !letterStatus.correct.includes(letter)
            ) {
                letterStatus.correct.push(letter)
            } else if (
                wordleWord.split('').indexOf(letter) === -1 &&
                !letterStatus.wrong.includes(letter)
            ) {
                letterStatus.wrong.push(letter)
            } else if (
                wordleWord.split('').indexOf(letter) !== index &&
                !letterStatus.misplaced.includes(letter)
            ) {
                letterStatus.misplaced.push(letter)
            }
        })
        setLetterStatus(letterStatus)
    }

    function handleGameAction(action: string | undefined) {
        if (!action) return

        if (action === 'Enter') {
            if (currIndex !== 5) {
                return pushError('Not enough words')
            }
            const tileRow = tiles[currRow]
            const currGuess = tileRow.row.join('')

            // If the word is not in global list
            if (!WORDLE_WORDS.includes(currGuess.toLowerCase())) {
                return pushError('Not in word list')
            }

            // If the guess is correct
            if (currGuess.toUpperCase() === wordleWord) {
                tileRow.guessed = true
                // Do something
                setTimeout(() => {
                    const answerElem = createElement(
                        'div',
                        'bg-slate-200 p-2 text-center font-semibold rounded-lg text-lg',
                        'Well Done!'
                    )
                    errorSlideRef.current.insertBefore(answerElem, errorSlideRef.current.firstChild)
                }, 2.5 * 1000)
                setTimeout(() => {
                    updateLetterStatus(tileRow, wordleWord)
                }, 3 * 1000)
            } else {
                tileRow.guessed = true
                // Do something
                if (currRow === 4) {
                    const answerElem = createElement(
                        'div',
                        'bg-slate-200 p-2 text-center font-semibold rounded-lg text-lg',
                        wordleWord.toUpperCase()
                    )
                    errorSlideRef.current.insertBefore(answerElem, errorSlideRef.current.firstChild)
                }
                setTimeout(() => {
                    updateLetterStatus(tileRow, wordleWord)
                }, 3 * 1000)
            }
            tiles[currRow] = tileRow
            setTiles(tiles)
            setRow(currRow + 1)
            setIndex(0)
        }

        if (action === 'Backspace') {
            if (currIndex === 0) return

            const prevIndex = currIndex
            tiles[currRow].row[prevIndex - 1] = ''

            setIndex(currIndex - 1)
            setTiles(tiles)
        }
        // const alphabets = 'abcdefghijklmnopqrstuvwxyz'
        // if (alphabets.includes(action))
        if (ALPHABETS.includes(action.toLowerCase())) {
            if (currIndex === 5) return
            tiles[currRow].row[currIndex] = action.toUpperCase()
            setIndex(currIndex + 1)
            setTiles(tiles)
        }
    }
    function handleKeyUpEvent(event: globalThis.KeyboardEvent) {
        handleGameAction(event.key)
    }

    function onKeyClick(event: MouseEvent<HTMLButtonElement>) {
        if (!(event.target instanceof HTMLButtonElement)) return
        event.target.blur()

        handleGameAction(event.target.dataset.action)
        // console.log(event.target.dataset.action)
        // handle(event)
    }
    useEffect(() => {
        document.body.addEventListener('keyup', handleKeyUpEvent)
        return () => document.body.removeEventListener('keyup', handleKeyUpEvent)
    })

    return (
        <div className="w-full h-[100vh] flex flex-col items-center justify-center relative overflow-hidden space-y-4">
            <div
                className="w-48 bg-transparent absolute p-3 space-y-4 z-10 top-28"
                ref={errorSlideRef}></div>

            <div className="wordle w-[20rem] h-[20rem] flex flex-col items-center justify-evenly">
                <WordleRow tileRow={tiles[0]} wordleWord={wordleWord} />
                <WordleRow tileRow={tiles[1]} wordleWord={wordleWord} />
                <WordleRow tileRow={tiles[2]} wordleWord={wordleWord} />
                <WordleRow tileRow={tiles[3]} wordleWord={wordleWord} />
                <WordleRow tileRow={tiles[4]} wordleWord={wordleWord} />
            </div>

            <div className="keyboard w-[30rem] h-[13rem] flex flex-col items-center justify-evenly">
                <div className="keyboard-row w-full h-1/3 flex items-center justify-evenly">
                    {'QWERTYUIOP'.split('').map((alphabet) => {
                        return (
                            <KeyboardKey
                                alphabet={alphabet}
                                onKeyClick={onKeyClick}
                                letterStatus={letterStatus}
                            />
                        )
                    })}
                </div>
                <div className="keyboard-row w-full h-1/3 flex items-center justify-evenly px-6">
                    {'ASDFGHJKL'.split('').map((alphabet) => {
                        return (
                            <KeyboardKey
                                alphabet={alphabet}
                                onKeyClick={onKeyClick}
                                letterStatus={letterStatus}
                            />
                        )
                    })}
                </div>
                <div className="keyboard-row w-full h-1/3 flex items-center justify-evenly">
                    <button
                        className="w-16 h-16 bg-gray text-white text-sm font-semibold rounded-[4px] text-center flex items-center justify-center"
                        data-action="Enter"
                        onClick={(event) => {
                            onKeyClick(event)
                        }}>
                        ENTER
                    </button>

                    {'ZXCVBNM'.split('').map((alphabet) => {
                        return (
                            <KeyboardKey
                                alphabet={alphabet}
                                onKeyClick={onKeyClick}
                                letterStatus={letterStatus}
                            />
                        )
                    })}

                    <button
                        className="w-14 h-16 bg-gray text-white text-base font-semibold rounded-[4px] flex items-center justify-center"
                        data-action="Backspace"
                        onClick={(event) => {
                            onKeyClick(event)
                        }}>
                        <img
                            src={backspace}
                            alt="Backspace key"
                            className="bg-transparent"
                            onClick={(event) => {
                                const target = event.target as HTMLImageElement
                                target.parentElement?.click()
                            }}
                        />
                    </button>
                </div>
            </div>
        </div>
    )
}
