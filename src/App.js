import React from 'react';
import { Button, Spinner } from 'react-bootstrap';
import './App.css';
const axios = require('axios');

class App extends React.Component {
  state = {
    DICT: [],
    SpeechRecognition: undefined,
    SpeechRecognitionEvent: undefined,
    colors: undefined,
    grammar: undefined,
    voiceList: undefined,
    recognition: undefined,
  };
  constructor(props) {
    super(props);

    this.state.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    this.state.SpeechRecognitionEvent = window.webkitSpeechRecognitionEvent || window.SpeechRecognitionEvent
    this.state.speechSynthesisUtterance = new window.SpeechSynthesisUtterance("");
    this.state.recognition = new this.state.SpeechRecognition();
    // this.state.recognition.continuous = true;
    this.state.recognition.interimResults = true;

    this.state.voiceList = undefined;

    this.loadDictionary()
    this.listen = this.listen.bind(this)
    
    this.onAudioEnd = this.onAudioEnd.bind(this)
    this.state.recognition.onaudioend = this.onAudioEnd;

    this.onAudioStart = this.onAudioStart.bind(this)
    this.state.recognition.onaudiostart = this.onAudioStart;

    this.onEnd = this.onEnd.bind(this)
    this.state.recognition.onend = this.onEnd;

    this.onError = this.onError.bind(this)
    this.state.recognition.onerror = this.onError;

    this.onNoMatch = this.onNoMatch.bind(this)
    this.state.recognition.onnomatch = this.onNoMatch;

    this.onResult = this.onResult.bind(this)
    this.state.recognition.onresult = this.onResult;

    this.onSoundEnd = this.onSoundEnd.bind(this)
    this.state.recognition.onsoundend = this.onSoundEnd;

    this.onSoundStart = this.onSoundStart.bind(this)
    this.state.recognition.onsoundstart = this.onSoundStart;

    this.onSpeechEnd = this.onSpeechEnd.bind(this)
    this.state.recognition.onspeechend = this.onSpeechEnd;

    this.onSpeechStart = this.onSpeechStart.bind(this)
    this.state.recognition.onspeechstart = this.onSpeechStart;

    this.onStart = this.onStart.bind(this)
    this.state.recognition.onstart = this.onStart;
  }

  /**
   * On Start
   * @param {event} event 
   */
  onStart(event) {
    // this.listen();
    console.warn(new Date(),'onstart');
  }
  
  /**
   * On No Match
   * @param {event} event 
   */
  onNoMatch(event) {
    // this.listen();
    console.warn(new Date(),'onnomatch');
  }
  
  /**
   * On Speech Start
   * @param {event} event 
   */
  onSpeechStart(event) {
    // this.listen();
    console.warn(new Date(),'onspeechstart');
  }
  /**
   * On Speech End
   * @param {event} event 
   */
  onSpeechEnd(event) {
    // this.listen();
    console.warn(new Date(),'onspeechend');
  }
  /**
   * On Sound Start
   * @param {event} event 
   */
  onSoundStart(event) {
    // this.listen();
    console.warn(new Date(),'onsoundstart');
  }
  /**
   * On Sound End
   * @param {event} event 
   */
  onSoundEnd(event) {
    // this.listen();
    console.warn(new Date(),'onsoundend');
  }
  /**
   * On Match
   * @param {event} event 
   */
  onMatch(event) {
    // this.listen();
    console.warn(new Date(),'onnomatch');
  }
  /**
   * On Error
   * @param {event} event 
   */
  onError(event) {
    // this.listen();
    console.warn(new Date(),'onerror');
  }
  /**
   * On Audio Start
   * @param {event} event 
   */
  onAudioStart(event) {
    // this.listen();
    console.warn(new Date(),'onaudiostart');
  }

  /**
   * On Audio End
   * @param {event} event 
   */
  onAudioEnd(event) {
    // this.listen();
    console.warn(new Date(),'onaudioend');
  }
  /**
   * On End
   * @param {event} event 
   */
  onEnd(event) {
    // this.listen();
    console.warn(new Date(),'onend');
  }
  /**
   * On Result
   * @param {event} event 
   */
  onResult(event) {
    var final_transcript = '';
    var interim_transcript = '';
    
    if (event.results[0].isFinal) {
      final_transcript += event.results[0][0].transcript;
    } else {
      interim_transcript += event.results[0][0].transcript;
    }
    final_transcript = final_transcript.trim();
    interim_transcript = interim_transcript.trim();
  }
  /**
   * Start listening
   */
  listen() {
    this.state.recognition.start();
    console.log('listing user voice')
  }
  /**
   * Load Dictionary
   */
  loadDictionary() {
    let _this = this;
    axios.get('/dataset.json')
      .then(function (res) {
        _this.state.DICT = res.data;
        console.info('Found dictionary data');
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  render() {
    return (
      <div className="App">
        <section onClick={this.listen} className="result"></section>
        <nav className="navbar navbar-expand-md fixed-bottom bg-light">
          <Button variant="default" disabled>
            <Spinner
              as="span"
              animation="grow"
              size="sm"
              variant="danger"
              role="status"
              aria-hidden="true"
            />
    Listening...
  </Button>
          <span>here is the large number</span>
        </nav>
      </div>
    );
  }

}
export default App;
