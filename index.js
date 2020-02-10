import { Controller } from './Controller.js';
import { Reader } from './Reader.js';
const reader = new Reader(document.getElementById('main'));
reader.render();
const controller = new Controller(reader);
controller.start();
