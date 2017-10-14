export function getResponse(lang, query, sessionId) {
	const url = `https://aaim35fgf1.execute-api.eu-west-1.amazonaws.com/dev/analyze/?query=${query}&lang=${lang}&sessionId=${sessionId}`;
	console.log(url);
	return fetch(url).then((response) => {
		console.log(response);
		return response.json();
	});
}
