import {config} from './config'

export function getResponse(lang, query, sessionId) {
	const url = `${config.api}?query=${query}&lang=${lang}&sessionId=${sessionId}`;
	//console.log(url);
	return fetch(url).then((response) => {
		//console.log(response);
		return response.json();
	});
}
