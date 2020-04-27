import React from 'react'
import { Button, Spinner, Badge, ListGroup, ButtonGroup } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons'

import './App.css'
const axios = require('axios')
class App extends React.Component {
  state = {
    DICT: [],
    DICT_HISTORY: [],
    meaning: {
      word: "",
      predict: {},
      defination: {}
    },
    SpeechRecognition: undefined,
    SpeechRecognitionEvent: undefined,
    speakLangAllowed: ['hi-IN', 'en-IN', 'en-US', 'en-UK'],
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
    this.state.recognition = new this.state.SpeechRecognition()
    this.state.recognition.continuous = true
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

  componentDidMount() {

    this.loadDictionary()
    this.loadDictionaryHistory()
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
    this.setState({ currentEvent: arguments[0].type })
    console.warn(new Date(), 'onnomatch')
  }

  /**
   * On Speech Start
   * @param {event} event 
   */
  onSpeechStart(event) {
    this.setState({ currentEvent: arguments[0].type })
    console.warn(new Date(), 'onspeechstart')
  }
  /**
   * On Speech End
   * @param {event} event 
   */
  onSpeechEnd(event) {
    this.setState({ currentEvent: arguments[0].type })
    console.warn(new Date(), 'onspeechend')
  }
  /**
   * On Sound Start
   * @param {event} event 
   */
  onSoundStart(event) {
    this.setState({ currentEvent: arguments[0].type })
    console.warn(new Date(), 'onsoundstart')
  }
  /**
   * On Sound End
   * @param {event} event 
   */
  onSoundEnd(event) {
    this.setState({ currentEvent: arguments[0].type })
    console.warn(new Date(), 'onsoundend')
  }
  /**
   * On Match
   * @param {event} event 
   */
  onMatch(event) {
    this.setState({ currentEvent: arguments[0].type })
    console.warn(new Date(), 'onnomatch')
  }
  /**
   * On Error
   * @param {event} event 
   */
  onError(event) {
    this.setState({ currentEvent: arguments[0].type })
    console.warn(new Date(), 'onerror')
  }
  /**
   * On Audio Start
   * @param {event} event 
   */
  onAudioStart(event) {
    this.setState({ currentEvent: arguments[0].type })
    console.warn(new Date(), 'onaudiostart')
  }

  /**
   * On Audio End
   * @param {event} event 
   */
  onAudioEnd(event) {
    this.setState({ currentEvent: arguments[0].type })
    console.warn(new Date(), 'onaudioend')
  }
  /**
   * On End
   * @param {event} event 
   */
  onEnd(event) {
    this.setState((state) => {
      state.events.isStart = false
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
    var trans = event.results[event.results.length - 1]

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
  resultFilter(str, isFinal = false) {
    str = str.trim()
    if (isFinal) {
      // convert alphabet into word if possible
      var spellResult = this.checkSpellout(str)
      if (spellResult) {
        str = spellResult
      }
      this.setState({ finalResult: str, interimResult: '' })
    } else {
      this.setState({ interimResult: str })
    }
    // Not allow to twice speak
    this.getLastWordMeaning(str)
  }
  checkSpellout(str) {
    // first split by space
    str = str.split(' ');
    var result = str.join('');
    for (var i = 0; i < str.length; i++) {
      if (str[i].length !== 1) {
        result = ""
        break;
      }
    }
    return result
  }
  getLastWordMeaning(str) {
    var word = str.split(' ').pop().toLocaleLowerCase()
    // Not allow to twice speak
    if (this.state.meaning.word !== word) {
      this.showMeaning(word)
    }
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
    var predictList = this.predictWord(word);
    if (meaning) {
      this.setState({
        meaning: {
          word: word,
          predict: predictList,
          defination: meaning,
        }
      })
      this.speakDefination();
    } else {
      this.speak(word + ' not found!')
      console.log('Not found meaning of ', word)
    }
  }

  predictWord(word) {
    var results = {};
    for (var i = 0; i < word.length; i++) {
      var firstPart = word.substring(0, i);
      var secondPart = word.substring(i, word.length);
      var firstObj = this.state.DICT[firstPart];
      var secondObj = this.state.DICT[secondPart];
      if (firstObj || secondObj) {
        if (!i) {
          results[secondPart] = [secondObj[Object.keys(secondObj)[0][0]]]
        } else if (firstPart.length > secondPart.length ? firstObj : secondObj) {
          results[firstPart + '+' + secondPart] = [firstPart, secondPart]
          if (firstObj) {
            results[firstPart + '+' + secondPart][0] = firstObj[Object.keys(firstObj)[0][0]]
          }
          if (secondObj) {
            results[firstPart + '+' + secondPart][1] = secondObj[Object.keys(secondObj)[0][0]]
          }
        }
      }
    }
    return results;
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
  stopListen() {
    this.state.recognition.stop()
  }
  speak(text, lang = 'en-IN', clear = true) {
    if (clear) {
      window.speechSynthesis.cancel()
    }
    if (text) {
      var speechSynthesisUtterance = new window.SpeechSynthesisUtterance(text)
      if (this.state.speakLangAllowed.includes(lang)) {
        speechSynthesisUtterance['lang'] = lang
      }
      window.speechSynthesis.speak(speechSynthesisUtterance)
    }
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

  /**
   * Get local data from localhost
   * 
   * @param {string} key 
   */
  getLocalData(key) {
    var result = null
    var data = localStorage.getItem(key)
    try {
      if (data) {
        result = JSON.parse(data)
      }
    } catch (e) {
      console.log('Error occur durning parse json', e);
    }
    return result
  }

  /**
   * Set Local Data
   * 
   * @param {string} key 
   * @param {string} data 
   */
  setLocalData(key, data) {
    localStorage.setItem(key, JSON.stringify(data))
  }
  /**
   * Load Dictionary
   */
  loadDictionaryHistory() {
    let data = [
      { word: 'welcome', meaning: 'स्वीकार करना', hints: 0 },
      { word: 'welcome', meaning: 'स्वीकार करना', hints: 0 },
      { word: 'welcome', meaning: 'स्वीकार करना', hints: 0 },
      { word: 'welcome', meaning: 'स्वीकार करना', hints: 0 },
      { word: 'welcome', meaning: 'स्वीकार करना', hints: 0 },
      { word: 'welcome', meaning: 'स्वीकार करना', hints: 0 },
      { word: 'welcome', meaning: 'स्वीकार करना', hints: 0 },
      { word: 'welcome', meaning: 'स्वीकार करना', hints: 0 },
      { word: 'welcome', meaning: 'स्वीकार करना', hints: 0 },
      { word: 'welcome', meaning: 'स्वीकार करना', hints: 0 },
      { word: 'welcome', meaning: 'स्वीकार करना', hints: 0 },
      { word: 'welcome', meaning: 'स्वीकार करना', hints: 0 },
      { word: 'welcome', meaning: 'स्वीकार करना', hints: 0 }
    ]
    var list = [
      data, data, data, data, data, data, data, data, data, data
    ]
    // data = this.getLocalData('DICT_HISTORY') || list
    data = list
    if (data) {
      this.setState({ DICT_HISTORY: data })
    }
  }

  /**
   * Suffle word
   * 
   * @param {string} str 
   */
  suffle(str, join = true) {
    str = str.split('').sort(() => (Math.random() - 0.5));
    if (join) str = str.join('')
    return str;
  }
  speakDefination() {
    this.speak(this.state.meaning.word)
    var meaning = this.state.meaning.defination;
    var note = '';
    for (var g in meaning) {
      note += `${g}|`;
      for (var i = 0; i < 3; i++) {
        var word = meaning[g][i]
        if (word && word.trim()) {
          note += `${meaning[g][i]},`
        }
      }
    }
    note += " आदि को निम्नलिखित रूपों में प्रयोग कर सकते है|";
    var text = `${this.state.meaning.word} ${note} `;
    this.speakInHi(text,false)
  }
  speakInUK() {
    this.speak(this.state.meaning.word, 'en-UK')
  }
  speakInUS() {
    this.speak(this.state.meaning.word, 'en-US')
  }
  speakInHi(text,clear = true) {
    this.speak(text, 'hi-IN',clear)
  }
  speakInEn(text) {
    this.speak(text, 'en-IN')
  }
  render() {
    return (
      <div className="App">
        <section className="result">
          {this.state.DICT_HISTORY.map((day, index) => (
            <div key={index} className={`list ${this.state.meaning.word ? 'd-none' : ''}`}>
              <div className="text-center">{index ? 'Day-' + index : 'Today'}</div>
              {
                day.map((obj, i2) => (
                  <ListGroup.Item key={i2}>
                    <div className="row">
                      <div className="col-10">{obj.meaning}</div>
                      <div className="col-2 text-right"><Badge variant="light">?</Badge></div>
                      <div className="col-10">
                        {
                          obj.word.split('').sort(() => (Math.random() - 0.5)).map((letter, i3) =>
                            <Badge key={i3} variant="warning" className="mr-1">{letter}</Badge>
                          )
                        }
                      </div>
                      <div className="col-2 text-right ok-img"><Badge variant="danger"></Badge></div>
                    </div>
                  </ListGroup.Item>
                ))
              }
            </div>
          ))}
          {Object.keys(this.state.meaning.defination).map((key, index) =>
            <div key={index} className="list">
              <span>{key}</span>
              <ul>
                {Object.keys(this.state.meaning.defination[key]).map((key2, index2) =>
                  <li key={index2}>{this.state.meaning.defination[key][key2]}</li>
                )}
              </ul>
            </div>
          )}
        </section>
        <nav className="navbar fixed-bottom">
          <div className="wordList">
            {/* dictionary words */}
            {Object.keys(this.state.meaning.predict).map((key, index) =>
              <Badge key={index} onClick={this.speakInEn.bind(this, key)} className={`mr-1 btn btn-sm  btn-dark ${key ? '' : 'd-none'} ${this.state.meaning.word === key ? 'active' : ''}`}>{key}</Badge>
            )}
            {/* final words */}
            {this.state.finalResult.split(' ').map((key, index) =>
              <Badge key={index} onClick={this.showMeaning.bind(this, key)} className={`mr-1 btn btn-sm btn-warning ${key ? '' : 'd-none'}`}>{key}</Badge>
            )}
            {/* intrim words */}
            {this.state.interimResult.split(' ').map((key, index) =>
              <Badge key={index} onClick={this.showMeaning.bind(this, key)} className={`mr-1 btn btn-sm btn-outline-warning ${key ? '' : 'd-none'}`}>{key}</Badge>
            )}
          </div>
          <ButtonGroup size="lg" className="mb-2 m-auto">
            <Button onClick={this.speakInUK.bind(this)} size="lg" className="disabled" variant="outline-primary"><FontAwesomeIcon icon={faVolumeUp} size="xs" /> UK</Button>
            <Button onClick={this.state.events.isStart ? this.stopListen : this.listen} className={`listen-btn`} size="lg" variant="primary" >
              <Spinner
                as="span"
                animation="grow"
                size="sm"
                variant="light"
                role="status"
                aria-hidden="true"
              /> {this.state.events.isStart ? 'PAUSE' : 'LISTEN'}
            </Button>
            <Button  onClick={this.speakInUS.bind(this)} size="lg" className="disabled" variant="outline-primary"><FontAwesomeIcon icon={faVolumeUp} size="xs" /> US</Button>
          </ButtonGroup>

        </nav>
      </div>
    )
  }

}
export default App
