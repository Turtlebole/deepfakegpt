import { Component } from '@angular/core';
import { ChatDrawer } from './components/chat-drawer/chat-drawer';
import {ChatInterface} from './components/chat-drawer/chat-interface/chat-interface';

@Component({
  selector: 'app-root',
  imports: [ChatDrawer, ChatInterface],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
