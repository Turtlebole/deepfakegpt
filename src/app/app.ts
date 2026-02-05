import { Component } from '@angular/core';
import { ChatInterface } from './components/chat-interface/chat-interface';

@Component({
  selector: 'app-root',
  imports: [ChatInterface],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
