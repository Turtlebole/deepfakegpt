import { Routes } from '@angular/router';
import {ChatInterface} from './components/chat-drawer/chat-interface/chat-interface';
import {ChatDrawer} from './components/chat-drawer/chat-drawer';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'chat' },
  {
    path: 'chat',
    component: ChatDrawer,
    children: [
      {
        path: ':guid',
        component: ChatInterface
      }
    ]
  },
];

