import React from 'react'
import { Button, Badge, ListGroup, Col, Container } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrophone } from '@fortawesome/free-solid-svg-icons'

import './App.css'
const axios = require('axios')
class App extends React.Component {
  state = {
    DICT: [],
    DICT_LANG: 'e2h',
    DICT_LEVEL: {
      1: 'Today',
      2: 'Yesterday',
      8: '1st Week',
      15: '2nd Week',
      30: 'Month'
    },
    DICT_HISTORY: [],
    meaning: {
      word: '',
      predict: {},
      defination: {}
    },
    SpeechRecognition: undefined,
    speechSynthesisUtterance: {},
    SpeechRecognitionEvent: undefined,
    speakLangAllowed: ['hi-IN', 'en-IN', 'en-US', 'en-UK'],
    grammar: undefined,
    voiceList: undefined,
    recognition: undefined,
    interimResult: '',
    finalResult: '',
    events: {
      isStart: false
    },
    isEnglish: true
  }
  constructor (props) {
    super(props)

    this.state.SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition
    this.state.SpeechRecognitionEvent =
      window.webkitSpeechRecognitionEvent || window.SpeechRecognitionEvent
    this.state.recognition = new this.state.SpeechRecognition()
    this.state.recognition.continuous = false
    this.state.recognition.interimResults = true

    this.listen = this.listen.bind(this)
    this.stopListen = this.stopListen.bind(this)

    /**
     * Events
     */
    this.onAudioEnd = this.onAudioEnd.bind(this)
    this.state.recognition.onaudioend = this.onAudioEnd

    this.onAudioStart = this.onAudioStart.bind(this)
    this.state.recognition.onaudiostart = this.onAudioStart

    this.onEnd = this.onEnd.bind(this)
    this.state.recognition.onend = this.onEnd

    this.onError = this.onError.bind(this)
    this.state.recognition.onerror = this.onError

    this.onNoMatch = this.onNoMatch.bind(this)
    this.state.recognition.onnomatch = this.onNoMatch

    this.onResult = this.onResult.bind(this)
    this.state.recognition.onresult = this.onResult

    this.onSoundEnd = this.onSoundEnd.bind(this)
    this.state.recognition.onsoundend = this.onSoundEnd

    this.onSoundStart = this.onSoundStart.bind(this)
    this.state.recognition.onsoundstart = this.onSoundStart

    this.onSpeechEnd = this.onSpeechEnd.bind(this)
    this.state.recognition.onspeechend = this.onSpeechEnd

    this.onSpeechStart = this.onSpeechStart.bind(this)
    this.state.recognition.onspeechstart = this.onSpeechStart

    this.onStart = this.onStart.bind(this)
    this.state.recognition.onstart = this.onStart
  }

  initilizeSpeechSynthesisUtterance () {
    var list = {}
    for (var i = 0; i < this.state.speakLangAllowed.length; i++) {
      var key = this.state.speakLangAllowed[i]
      list[key] = new window.SpeechSynthesisUtterance(
        'This is example of ' + key
      )
      list[key]['lang'] = key
    }
    this.setState({ speechSynthesisUtterance: list })
  }
  componentDidMount () {
    this.loadDictionary()
    this.initilizeSpeechSynthesisUtterance()
    this.loadDictionaryHistory()
  }
  /**
   * On Start
   * @param {event} event
   */
  onStart (event) {
    this.setState({
      events: {
        isStart: true
      }
    })
    // console.warn(new Date(), 'onstart')
  }

  /**
   * On No Match
   * @param {event} event
   */
  onNoMatch (event) {
    // console.warn(new Date(), 'onnomatch')
  }

  /**
   * On Speech Start
   * @param {event} event
   */
  onSpeechStart (event) {
    // console.warn(new Date(), 'onspeechstart')
  }
  /**
   * On Speech End
   * @param {event} event
   */
  onSpeechEnd (event) {
    // console.warn(new Date(), 'onspeechend')
  }
  /**
   * On Sound Start
   * @param {event} event
   */
  onSoundStart (event) {
    // console.warn(new Date(), 'onsoundstart')
  }
  /**
   * On Sound End
   * @param {event} event
   */
  onSoundEnd (event) {
    // console.warn(new Date(), 'onsoundend')
  }
  /**
   * On Match
   * @param {event} event
   */
  onMatch (event) {
    // console.warn(new Date(), 'onnomatch')
  }
  /**
   * On Error
   * @param {event} event
   */
  onError (event) {
    // console.warn(new Date(), 'onerror', event.error)
  }
  /**
   * On Audio Start
   * @param {event} event
   */
  onAudioStart (event) {
    // console.warn(new Date(), 'onaudiostart')
  }

  /**
   * On Audio End
   * @param {event} event
   */
  onAudioEnd (event) {
    // console.warn(new Date(), 'onaudioend')
  }
  /**
   * On End
   * @param {event} event
   */
  onEnd (event) {
    this.setState({
      events: {
        isStart: false
      }
    })
    // console.warn(new Date(), 'onend')
  }
  /**
   * On Result
   * @param {event} event
   */
  onResult (event) {
    var trans = event.results[event.results.length - 1]

    if (trans.isFinal) {
      // final result
      this.resultFilter(trans[0].transcript, true)
      // console.log("%c Final: " + trans[0].transcript.trim(), "color:#ff0000")
    } else {
      // interim result
      var interim_transcript = ''
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (!event.results[i].isFinal) {
          interim_transcript += event.results[i][0].transcript
        }
      }
      this.resultFilter(interim_transcript)
      // console.log("%c Intrim: " + trans[0].transcript.trim(), "color:#0000ff")
    }
  }
  /**
   * Result Filter
   * @param {string} str any text
   */
  resultFilter (str, isFinal = false) {
    str = str.trim()
    if (isFinal) {
      // convert alphabet into word if possible
      var spellResult = this.checkSpellout(str)
      if (spellResult) {
        str = spellResult
      }
      this.setState({ finalResult: str, interimResult: '' })
      // Not allow to twice speak
      this.getLastWordMeaning(str)
    } else {
      this.setState({ interimResult: str })
    }
  }
  checkSpellout (str) {
    // first split by space
    str = str.split(' ')
    var result = str.join('')
    for (var i = 0; i < str.length; i++) {
      if (str[i].length !== 1) {
        result = ''
        break
      }
    }
    return result
  }
  getLastWordMeaning (str) {
    var word = str
      .split(' ')
      .pop()
      .toLocaleLowerCase()
    // Not allow to twice speak
    if (this.state.meaning.word !== word) {
      this.showMeaning(word)
    }
  }

  getDictWord (word) {
    return this.state.DICT[this.state.DICT_LANG][word]
  }
  /**
   * Show meaning or word
   * @param {strin} word any text
   */
  showMeaning (word) {
    if (word === '') {
      // console.log('Empty word passed ')
      return false
    }
    var meaning = this.getDictWord(word)
    var predictList = this.predictWord(word)

    if (!meaning && Object.keys(predictList).length) {
      word = Object.keys(predictList)[0]
      meaning = this.getDictWord(word)
      this.speak(word + ' found alternative !')
      // console.log('found alternative meaning of ', word)
    }
    if (meaning) {
      this.setState(
        {
          meaning: {
            word: word,
            predict: predictList,
            defination: meaning
          }
        },
        () => {
          this.speakDefination()
        }
      )
    } else {
      this.speak(word + ' not found!')
      // console.log('Not found meaning of ', word)
    }
  }

  predictWord (word) {
    var results = {}
    for (var i = 0; i < word.length; i++) {
      var firstWord = word.substring(0, i)
      var firstObj = this.getDictWord(firstWord)
      if (firstObj) {
        if (firstWord.length > 1) {
          results[firstWord] = [firstObj[Object.keys(firstObj)[0]][0]]
        }
      }
    }
    return results
  }
  /**
   * Start listening
   */
  listen (lang = 'e2h') {
    this.setState({ DICT_LANG: lang })
    this.setState(
      state => {
        if (lang === 'h2e' && state.recognition.lang !== 'h2e') {
          state.recognition.lang = 'hi-IN'
        } else if (state.recognition.lang !== 'e2h') {
          state.recognition.lang = 'en-IN'
        }
      },
      () => {
        if (!this.state.isStart) {
          this.state.recognition.start()
        } else {
          // console.log('Recognition already started')
        }
      }
    )
  }
  stopListen () {
    this.state.recognition.stop()
  }
  speak (text, lang = 'en-IN', clear = true) {
    if (clear) {
      window.speechSynthesis.cancel()
    }
    if (text) {
      var speechSynthesisUtterance = this.state.speechSynthesisUtterance[lang]
      if (speechSynthesisUtterance) {
        speechSynthesisUtterance['text'] = text
        window.speechSynthesis.speak(speechSynthesisUtterance)
      }
    }
  }
  /**
   * Load Dictionary
   */
  loadDictionary () {
    this.e2hDictionary()
    this.h2eDictionary()
  }

  e2hDictionary () {
    let _this = this
    axios
      .get('/e2h.json')
      .then(function (res) {
        _this.state.DICT['e2h'] = res.data
        // console.info('Found eh2 dictionary data')
      })
      .catch(function (error) {
        // console.log(error)
      })
  }

  h2eDictionary () {
    let _this = this
    axios
      .get('/h2e.json')
      .then(function (res) {
        _this.state.DICT['h2e'] = res.data
        // console.info('Found h2e dictionary data')
      })
      .catch(function (error) {
        // console.log(error)
      })
  }

  /**
   * Get local data from localhost
   *
   * @param {string} key
   */
  getLocalData (key) {
    var result = null
    var data = localStorage.getItem(key)
    try {
      if (data) {
        result = JSON.parse(data)
      }
    } catch (e) {
      // console.log('Error occur durning parse json', e);
    }
    return result
  }

  saveMeaning (obj) {
    let key = 'DICT_HISTORY'
    let data = this.getLocalData(key) || []
    let meaning = obj.defination[Object.keys(obj.defination)[0]][0]
    data.unshift({
      date: this.getDateString(),
      word: obj.word,
      meaning: meaning
    })
    this.setLocalData(key, data)
  }

  getDateString () {
    var d = new Date()
    return (
      d.getFullYear() +
      '-' +
      (d.getMonth() + 1) +
      '-' +
      d.getDate() +
      ' ' +
      d.getHours() +
      ':' +
      d.getMinutes() +
      ':' +
      d.getSeconds()
    )
  }
  /**
   * Set Local Data
   *
   * @param {string} key
   * @param {string} data
   */
  setLocalData (key, data) {
    localStorage.setItem(key, JSON.stringify(data))
  }
  /**
   * Load Dictionary
   */
  loadDictionaryHistory () {
    // let data = [
    //   { date: "2020-04-28 12:00:11", word: 'welcome', meaning: 'स्वीकार करना 1' },
    //   { date: "2020-04-27 12:00:13", word: 'welcome', meaning: 'स्वीकार करना 2' },
    //   { date: "2020-04-20 12:00:14", word: 'welcome', meaning: 'स्वीकार करना 7' },
    //   { date: "2020-04-14 12:00:14", word: 'welcome', meaning: 'स्वीकार करना 15' },
    //   { date: "2020-04-01 12:00:15", word: 'welcome', meaning: 'स्वीकार करना 30' },
    //   { date: "2020-03-05 12:00:16", word: 'welcome', meaning: 'स्वीकार करना 30+' }
    // ]
    let data = this.getLocalData('DICT_HISTORY') || []

    let history = {}
    var level = Object.keys(this.state.DICT_LEVEL).sort((a, b) => {
      return b - a
    })
    var day = 0

    // fill data in group
    for (var index in data) {
      day = this.getYearDay(data[index].date)

      for (var i in level) {
        if (day >= parseInt(level[i])) {
          // create array if not avaialbe
          if (typeof history[level[i]] === 'undefined') history[level[i]] = []
          history[level[i]].push(data[index])
          break
        }
      }
    }
    this.setState({ DICT_HISTORY: history })
  }

  getYearDay (date = '') {
    var now = new Date()
    var old = new Date(date)
    return parseInt((now - old) / 86400000) + 1
  }
  /**
   * Suffle word
   *
   * @param {string} str
   */
  suffle (str, join = true) {
    str = str.split('').sort(() => Math.random() - 0.5)
    if (join) str = str.join('')
    return str
  }
  speakDefination () {
    this.speak(this.state.meaning.word)
    var meaning = this.state.meaning.defination
    this.saveMeaning(this.state.meaning)
    var note = ''
    for (var g in meaning) {
      for (var i = 0; i < 5; i++) {
        var word = meaning[g][i]
        if (word && word.trim()) {
          note += `|||${meaning[g][i]}`
        }
      }
      break
    }
    note += ` आदि ${g} के रूप में प्रयोग किये जाते है|`
    var text = `${this.state.meaning.word} ${note} `
    this.speakInHi(text, false)
  }
  speakInUK () {
    this.speak(this.state.meaning.word, 'en-UK')
  }
  speakInUS () {
    this.speak(this.state.meaning.word, 'en-US')
  }
  speakInHi (text, clear = true) {
    this.speak(text, 'hi-IN', clear)
  }
  speakInEn (text) {
    this.speak(text, 'en-IN')
  }
  render () {
    return (
      <div className='App'>
        <section className='result'>
          {(this.state.meaning.word
            ? []
            : Object.keys(this.state.DICT_HISTORY)
          ).map(index => (
            <div key={index} className={`list`}>
              <div className='text-center'>{this.state.DICT_LEVEL[index]}</div>
              {this.state.DICT_HISTORY[index].map((obj, index2) => (
                <ListGroup.Item key={index2}>
                  <div className='row'>
                    <div className='col-10'>{obj.meaning}</div>
                    <div className='col-2 text-right'>
                      <Badge
                        onClick={this.showMeaning.bind(this, obj.word)}
                        variant='light'
                        className='cur-pointer noselect'
                      >
                        ?
                      </Badge>
                    </div>
                    <div className='col-10'>
                      <Badge
                        onClick={this.speakInEn.bind(this, obj.word)}
                        key={index2}
                        variant='warning'
                        className='mr-1 cur-pointer'
                      >
                        {obj.word}
                      </Badge>
                    </div>
                    <div className='col-2 text-right ok-img'></div>
                  </div>
                </ListGroup.Item>
              ))}
            </div>
          ))}
          {Object.keys(this.state.meaning.defination).map((key, index) => (
            <div key={index} className='list'>
              <span>{key}</span>
              <ul>
                {Object.keys(this.state.meaning.defination[key]).map(
                  (key2, index2) => (
                    <li key={index2}>
                      {this.state.meaning.defination[key][key2]}
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </section>
        <nav className='navbar fixed-bottom'>
          <div className='wordList'>
            {/* dictionary words */}
            {Object.keys(this.state.meaning.predict).map((key, index) => (
              <Badge
                key={index}
                onClick={this.speakInEn.bind(this, key)}
                className={`mr-1 btn btn-sm  btn-dark ${key ? '' : 'd-none'} ${
                  this.state.meaning.word === key ? 'active' : ''
                }`}
              >
                {key + ' : ' + this.state.meaning.predict[key]}
              </Badge>
            ))}
            {/* final words */}
            {this.state.finalResult.split(' ').map((key, index) => (
              <Badge
                key={index}
                onClick={this.showMeaning.bind(this, key)}
                className={`mr-1 btn btn-sm btn-warning ${key ? '' : 'd-none'}`}
              >
                {key}
              </Badge>
            ))}
            {/* intrim words */}
            {this.state.interimResult.split(' ').map((key, index) => (
              <Badge
                key={index}
                onClick={this.showMeaning.bind(this, key)}
                className={`mr-1 btn btn-sm btn-outline-warning ${
                  key ? '' : 'd-none'
                }`}
              >
                {key}
              </Badge>
            ))}

            <Badge className={`mr-1 btn btn-sm btn-outline-primary`}>
              Typing...
            </Badge>
          </div>
          <Container fluid className='p-0'>
            <Col className='p-0'>
              <div className='keypad-container'>
                <div className='keypad'>
                  <button className='key'>Q</button>
                  <button className='key'>W</button>
                  <button className='key'>E</button>
                  <button className='key'>R</button>
                  <button className='key'>T</button>
                  <button className='key'>Y</button>
                  <button className='key'>U</button>
                  <button className='key'>I</button>
                  <button className='key'>O</button>
                  <button className='key'>P</button>
                  <br />
                  <button className='key'>A</button>
                  <button className='key'>S</button>
                  <button className='key'>D</button>
                  <button className='key'>F</button>
                  <button className='key'>G</button>
                  <button className='key'>H</button>
                  <button className='key'>J</button>
                  <button className='key'>K</button>
                  <button className='key'>L</button>
                  <br />
                  <button className='key' style={{ float: 'left' }}>
                    &larr;
                  </button>
                  <button className='key'>Z</button>
                  <button className='key'>X</button>
                  <button className='key'>C</button>
                  <button className='key'>V</button>
                  <button className='key'>B</button>
                  <button className='key'>N</button>
                  <button className='key'>M</button>
                  <button className='key' style={{ float: 'right' }}>
                    &rarr;
                  </button>
                  <br />
                  <Button
                    className='listen-btn'
                    style={{ float: 'left' }}
                    disabled={
                      this.state.events.isStart &&
                      this.state.DICT_LANG !== 'h2e'
                        ? true
                        : false
                    }
                    onClick={
                      this.state.events.isStart
                        ? this.stopListen
                        : this.listen.bind(this, 'h2e')
                    }
                    size='sm'
                    variant={
                      this.state.events.isStart &&
                      this.state.DICT_LANG === 'h2e'
                        ? 'warning'
                        : 'secondary'
                    }
                  >
                    <FontAwesomeIcon
                      icon={faMicrophone}
                      size='xs'
                    ></FontAwesomeIcon>{' '}
                    HIN
                  </Button>
                  <button
                    className='key'
                    style={{ width: 'calc(100% - 136px)' }}
                  >
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  </button>
                  <Button
                    className='listen-btn'
                    style={{ float: 'right' }}
                    disabled={
                      this.state.events.isStart &&
                      this.state.DICT_LANG !== 'e2h'
                        ? true
                        : false
                    }
                    onClick={
                      this.state.events.isStart
                        ? this.stopListen
                        : this.listen.bind(this, 'e2h')
                    }
                    size='sm'
                    variant={
                      this.state.events.isStart &&
                      this.state.DICT_LANG === 'e2h'
                        ? 'warning'
                        : 'secondary'
                    }
                  >
                    <FontAwesomeIcon
                      icon={faMicrophone}
                      size='xs'
                    ></FontAwesomeIcon>{' '}
                    ENG
                  </Button>
                </div>
              </div>
            </Col>
          </Container>
        </nav>
      </div>
    )
  }
}
export default App
