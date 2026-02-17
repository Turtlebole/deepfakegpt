import {Component} from '@angular/core';
import {ChatDrawer} from './components/chat-drawer/chat-drawer';

@Component({
  selector: 'app-root',
  imports: [ChatDrawer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
