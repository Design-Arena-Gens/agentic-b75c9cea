export {};

declare global {
  interface Window {
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }

  type SpeechRecognitionConstructor = new () => SpeechRecognition;

  var webkitSpeechRecognition: SpeechRecognitionConstructor;
}
