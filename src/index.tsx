import { render } from 'preact';

import preactLogo from './assets/preact.svg';
import './style.css';
import { MainScreen } from './frontend/main-screen/MainScreen';

export function App() {
	return (
		<div id="app" className="theme-dark">
			<MainScreen />
		</div>
	);
}

function Resource(props) {
	return (
		<a href={props.href} target="_blank" class="resource">
			<h2>{props.title}</h2>
			<p>{props.description}</p>
		</a>
	);
}

render(<App />, document.getElementById('app'));
