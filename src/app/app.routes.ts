import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'chat' },
  { path: 'chat', children: [] },
  { path: 'chat/:conversationId', children: [] }
];

