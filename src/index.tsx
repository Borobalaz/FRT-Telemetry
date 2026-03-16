import { render } from 'preact';

import './style.css';
import { MainScreen } from './frontend/main-screen/MainScreen';

const rootElement = document.getElementById('app');

if (!rootElement) {
  throw new Error('Renderer root element #app was not found.');
}

rootElement.classList.add('theme-dark');

render(<MainScreen />, rootElement);
