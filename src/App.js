import React from 'react'
import { Button, Spinner } from 'react-bootstrap'
import './App.css'
const axios = require('axios')

class App extends React.Component {
  state = {
    DICT: [],
    meaning: {
      word: "",
      defination: {}
    },
    SpeechRecognition: undefined,
    SpeechRecognitionEvent: undefined,
    speechSynthesisUtterance: undefined,
    colors: undefined,
    grammar: undefined,
    voiceList: undefined,
    recognition: undefined,
    interimResult: "",
    finalResult: "",
    currentEvent: "end",
    events: {
      isStart: false
    }
  }
  constructor(props) {
    super(props)

    this.state.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    this.state.SpeechRecognitionEvent = window.webkitSpeechRecognitionEvent || window.SpeechRecognitionEvent
    this.state.speechSynthesisUtterance = new window.SpeechSynthesisUtterance("")
    this.state.recognition = new this.state.SpeechRecognition()
    // this.state.recognition.continuous = true
    this.state.recognition.interimResults = true
    this.state.recognition.lang = 'en-IN'

    this.loadDictionary()
    this.listen = this.listen.bind(this)

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

  /**
   * On Start
   * @param {event} event 
   */
  onStart(event) {
    this.setState({ currentEvent: arguments[0].type })
    this.setState({
      events: {
        isStart: true
      }
    })
    console.warn(new Date(), 'onstart')
  }

  /**
   * On No Match
   * @param {event} event 
   */
  onNoMatch(event) {
    // this.listen()
    this.setState({ currentEvent: arguments[0].type })
    console.warn(new Date(), 'onnomatch')
  }

  /**
   * On Speech Start
   * @param {event} event 
   */
  onSpeechStart(event) {
    // this.listen()
    this.setState({ currentEvent: arguments[0].type })
    console.warn(new Date(), 'onspeechstart')
  }
  /**
   * On Speech End
   * @param {event} event 
   */
  onSpeechEnd(event) {
    // this.listen()
    this.setState({ currentEvent: arguments[0].type })
    console.warn(new Date(), 'onspeechend')
  }
  /**
   * On Sound Start
   * @param {event} event 
   */
  onSoundStart(event) {
    // this.listen()
    this.setState({ currentEvent: arguments[0].type })
    console.warn(new Date(), 'onsoundstart')
  }
  /**
   * On Sound End
   * @param {event} event 
   */
  onSoundEnd(event) {
    // this.listen()
    this.setState({ currentEvent: arguments[0].type })
    console.warn(new Date(), 'onsoundend')
  }
  /**
   * On Match
   * @param {event} event 
   */
  onMatch(event) {
    // this.listen()
    this.setState({ currentEvent: arguments[0].type })
    console.warn(new Date(), 'onnomatch')
  }
  /**
   * On Error
   * @param {event} event 
   */
  onError(event) {
    // this.listen()
    this.setState({ currentEvent: arguments[0].type })
    console.warn(new Date(), 'onerror')
  }
  /**
   * On Audio Start
   * @param {event} event 
   */
  onAudioStart(event) {
    // this.listen()
    this.setState({ currentEvent: arguments[0].type })
    console.warn(new Date(), 'onaudiostart')
  }

  /**
   * On Audio End
   * @param {event} event 
   */
  onAudioEnd(event) {
    // this.listen()
    this.setState({ currentEvent: arguments[0].type })
    console.warn(new Date(), 'onaudioend')
  }
  /**
   * On End
   * @param {event} event 
   */
  onEnd(event) {
    this.listen()
    this.setState({
      events: {
        isStart: false
      }
    })
    this.setState({ currentEvent: arguments[0].type })
    console.warn(new Date(), 'onend')
  }
  /**
   * On Result
   * @param {event} event 
   */
  onResult(event) {
    this.setState({ currentEvent: arguments[0].type })
    var trans = event.results[0]

    if (trans.isFinal) {
      // final result
      this.resultFilter(trans[0].transcript, true)
      console.log("%c Final: " + trans[0].transcript.trim(), "color:#ff0000")
    } else {
      // interim result
      this.resultFilter(trans[0].transcript)
      console.log("%c Intrim: " + trans[0].transcript.trim(), "color:#0000ff")
    }
  }
  /**
   * Result Filter
   * @param {string} str any text
   */
  resultFilter(str, type = false) {
    str = str.trim()
    if (type) {
      this.setState({ finalResult: str })
    } else {
      this.setState({ interimResult: str })
    }
    this.getLastWordMeaning(str)
  }

  getLastWordMeaning(str) {
    var word = str.split(' ').pop()
    this.showMeaning(word)
  }
  /**
   * Show meaning or word
   * @param {strin} word any text
   */
  showMeaning(word) {
    if (word === '') {
      console.log('Empty word passed ')
      return false
    }

    var meaning = this.state.DICT[word]
    if (meaning) {
      this.setState({
        meaning: {
          word: word,
          defination: meaning
        }
      })
      this.speak(word)
    } else {
      this.speak('Not found! '+word)
      console.log('Not found meaning of ', word)
    }
  }

  /**
   * Start listening
   */
  listen() {
    if (['end', 'result', 'audioend', 'error'].includes(this.state.currentEvent)) {
      this.state.recognition.start()
    } else {
      console.log('Recognition already in on', this.state.currentEvent)
    }
  }
  speak(text) {
    this.state.speechSynthesisUtterance['text'] = text || this.state.speechSynthesisUtterance['text']
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(this.state.speechSynthesisUtterance)
  }
  /**
   * Load Dictionary
   */
  loadDictionary() {
    let _this = this
    axios.get('/dataset.json')
      .then(function (res) {
        _this.state.DICT = res.data
        console.info('Found dictionary data')
      })
      .catch(function (error) {
        console.log(error)
      })
  }
  render() {
    return (
      <div className="App">
        <section className="result">
          {Object.keys(this.state.meaning.defination).map(key =>
            <div className="list">
              <span>{key}</span>
              <ul>
                {Object.keys(this.state.meaning.defination[key]).map(key2 =>
                  <li key={'w'.key2}>{this.state.meaning.defination[key][key2]}</li>
                )}
              </ul>
            </div>
          )}
        </section>
        <nav className="navbar navbar-expand-md fixed-bottom">
          <Button variant="default" disabled>
            <Spinner
              as="span"
              animation="grow"
              size="sm"
              variant="danger"
              role="status"
              aria-hidden="true"
            />
          </Button>
          <div>{this.state.interimResult.split(' ').map(key =>
            <button onClick={this.showMeaning.bind(this, key)} className={`ml-1 btn btn-sm btn-outline-danger ${this.state.meaning.word === key?'active':''}`}>{key}</button>
          )}</div>
          <Button onClick={this.state.events.isStart ? this.stopListen : this.listen} className="ml-auto btn-sm" variant="primary">
            {this.state.events.isStart ? 'Stop' : 'Start'}
          </Button>
        </nav>
      </div>
    )
  }

}
export default App
