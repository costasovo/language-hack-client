import React from 'react';
import {
	StyleSheet,
	Text,
	ScrollView,
	View,
	Button,
	NativeAppEventEmitter,
	Picker,
	Modal
} from 'react-native';
import { Header, Button as NButton } from "react-native-elements";
import Tts from 'react-native-tts';
import { getResponse } from './Api';


const SpeechToText = require('react-native-speech-to-text-ios');

const languageConfig = {
	cs: {
		code: 'cs',
		locale: 'cs-CZ',
		voice: 'com.apple.ttsbundle.Iveta-premium',
		greetings: 'Ahoj cestovateli',
		buy: 'Koupit',
	}
}

export default class App extends React.Component {

	constructor() {
		super();
		this.state = {
			recording: true,
			records: [],
			language: languageConfig.cs,
			modalVisible: false
		};
		this.stopTimeout = null;
		this.initialListener = false;
		this.sessionId = Math.random().toString(36).substring(7);
	}

	componentDidMount = () => {
		this.initialListener = true;
		Tts.voices().then(voices => console.log(voices));
		Tts.setDefaultLanguage(this.state.language.locale);
		Tts.setDefaultVoice(this.state.language.voice);
		Tts.setDefaultPitch(1.1);
		Tts.speak(this.state.language.greetings);
		this.addRecord({
			data: null,
			type: 'message',
			message: this.state.language.greetings,
			isFinal: true,
			key: 'a' + this.state.records.length,
		});

		Tts.addEventListener('tts-finish', (event) => {
			if (this.initialListener) {
				SpeechToText.startRecognition("cs-CZ");
				this.setState({recording: true});
			}
			this.initialListener = false;
		});

		NativeAppEventEmitter.addListener(
			'SpeechToText',
			(result) => {
				console.log(result.isFinal);
				if (result.error) {
					alert(JSON.stringify(result.error));
				}
				if (this.stopTimeout) {
					clearTimeout(this.stopTimeout);
				}

				this.stopTimeout = setTimeout(() => {
					SpeechToText.finishRecognition();
				}, 1500);

				if (result.isFinal === true) {
					SpeechToText.stopRecognition();
					if (result.bestTranscription) {
						//Tts.speak(result.bestTranscription.formattedString);
						this.handleInput(result.bestTranscription.formattedString);
					}
				}
				if (result.bestTranscription) {
					this.setState({text: result.bestTranscription.formattedString});
				}
			}
		);
	};

	speak = () => {
		console.log('speak');
		SpeechToText.startRecognition("cs-CZ");
		this.setState({recording: true});
	};

	handleInput = (input) => {
		this.addRecord({
			data: null,
			type: 'query',
			message: input,
			isFinal: true,
			key: 'a' + this.state.records.length,
		});
		getResponse('cs', input, this.sessionId).then((response) => {
			this.setState({recording: false});
			if (response.payload.isFinal) {
				this.sessionId = Math.random().toString(36).substring(7);
			}
			Tts.speak(response.payload.message);
			response.payload.key = 'a' + this.state.records.length;
			this.addRecord({
				message: response.payload.message,
				type: response.payload.type,
				data: response.payload.data,
				isFinal: response.payload.isFinal,
				key: 'a' + this.state.records.length,
			});
		});
	};

	renderSpeakButton() {
		if (this.state.recording === false) {
			return (<Button
				onPress={this.speak}
				title="Speak"
				color="#841584"
				accessibilityLabel="Learn more about this purple button"
			/>);
		} else {
			return null;
		}
	}

	renderMessage(item) {
		console.log(item);
		let style = styles.message;
		let wraperStyle = styles.messageWrapper;
		if (item.type === 'query') {
			style = styles.queryMessage;
			wraperStyle = styles.queryMessageWrapper;
		}
		let tickets = null;
		if (item.type === 'tickets') {
			tickets = item.data.map( (tic) => {
				return this.renderFlight(Math.random().toString(36).substring(7), tic);
			});
		}

		return (
			<View  key={item.key}>
			<View style={wraperStyle}>
				<View style={style}>
					<Text style={styles.messageText}>{item.message}</Text>
					{tickets? <View style={{marginTop: 5, flex: 1, flexDirection: 'column', width:'100%'}}>{tickets}</View> : null}
				</View>
			</View>
			</View>
		)
	}

	renderFlight(key, ticket) {
		return (
			<View key={key} style={styles.ticketWrapper}>
				<View>
					<Text style={{ fontSize:16, color:'#fff', fontWeight: 'bold' }}>{ticket.cityFrom} ({ticket.countryFrom}) - {ticket.cityTo} ({ticket.countryTo})</Text>
					<Text style={{ fontSize:16, color:'#fff' }}>{ticket.price} EUR</Text>
					<Text style={{ fontSize:12, color:'#fff' }}>{ticket.departureTime} - {ticket.arrivalTime}</Text>
					<Text style={{ fontSize:12, color:'#fff' }}>{ticket.routes.map((routes) => (`[${routes[0]}->${routes[1]}]`))}</Text>
				</View>
				<View style={{
					paddingTop: 10,
				}}>
					<Button
						title={this.state.language.buy}
						color="#fff"
						style={{
							backgroundColor: styles.ticketWrapper.backgroundColor,
							padding: 5,
						}}
						onPress={() => alert('DONE! (Just a mock. Out of Red Bull SRY.)')}
					/>
				</View>
			</View>
		)
	}

	addRecord(record) {
		const records = this.state.records.slice(0);
		records.push(record);
		this.setState({records: records});
	}


	renderLangPicker() {
		return (
			<Modal
				animationType="slide"
				transparent={false}
				visible={this.state.modalVisible}>
				<Picker
					selectedValue={this.state.language.code}
					onValueChange={(lang) => this.setState({language: lang})}>
					<Picker.Item label="Java" value="java" />
					<Picker.Item label="JavaScript" value="js" />
				</Picker>
			</Modal>
		)
	}


	render() {
		const messages = this.state.records.map((item) => this.renderMessage(item));

		return (
			<View style={styles.container}>
				<Header
					centerComponent={{ text: 'Kiwi', style: { color: '#fff', fontSize: 20 } }}
					backgroundColor={"#01bba5"}
					statusBarProps={{ barStyle: 'light-content' }}
					rightComponent={<Button title={this.state.language.code} onPress={() => this.setState({modalVisible:true})}/>}
				/>
				<ScrollView style={styles.scroler}>
				{messages}
				</ScrollView>
				{this.renderSpeakButton()}
				{this.renderLangPicker()}
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
		paddingTop: 70,
	},
	scroler: {
		height: 1000,
		width: '100%',
	},
	messageText: {
		color: '#fff',
		fontSize: 16,
	},
	message: {
		padding: 10,
		backgroundColor: '#01bca6',
		marginTop: 5,
		borderRadius: 10,
		borderBottomLeftRadius: 0,
		maxWidth: '85%',
	},
	messageWrapper: {
		flex: 1,
		justifyContent: 'flex-start',

		flexDirection: 'row',
		width: '100%',
		paddingLeft: 5,
	},
	queryMessage: {
		padding: 10,
		backgroundColor: '#a3a1ac',
		marginTop: 4,
		borderRadius: 10,
		borderBottomRightRadius: 0,
		maxWidth: '75%',
	},
	queryMessageWrapper: {
		flex: 1,
		justifyContent: 'flex-end',
		flexDirection: 'row',
		width: '100%',
		paddingRight: 5,
	},
	ticketWrapper: {
		width: '100%',
		borderRadius: 4,
		backgroundColor: '#01cbb6',
		padding: 6,
		marginTop: 2,
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
	}
});
