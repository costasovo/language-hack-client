import React from 'react';
import { StyleSheet, Text, View, NativeAppEventEmitter } from 'react-native';


var SpeechToText = require('react-native-speech-to-text-ios');

SpeechToText.startRecognition("cs");

export default class App extends React.Component {

	constructor() {
		super();
		this.state = {
			text: 'Řekni mi to česky!'
		}
	}

	componentDidMount = () => {
		NativeAppEventEmitter.addListener(
			'SpeechToText',
			(result) => {
				if (result.error) {
					alert(JSON.stringify(result.error));
				} else {
					this.setState({text: result.bestTranscription.formattedString});
				}
			}
		);
	};

  render() {
    return (
      <View style={styles.container}>
        <Text>Shit man!</Text>
        <Text>{this.state.text}</Text>
      </View>
    );
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
