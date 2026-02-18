import {Component, inject, signal, ViewEncapsulation, effect} from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {ActivatedRoute, Router, RouterOutlet, NavigationEnd} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter} from 'rxjs/operators';
import {ChatHistoryService} from '../../common/services/chat-history.service';
import { ChatInterface } from './chat-interface/chat-interface';

@Component({
  selector: 'app-chat-drawer',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, RouterOutlet, ChatInterface],
  templateUrl: './chat-drawer.html',
  styleUrl: './chat-drawer.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ChatDrawer {
  protected isOpen = signal(false);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly chatHistory = inject(ChatHistoryService);

  private getDeepestId(): string | null {
    let route = this.route.snapshot;
    while (route.firstChild) route = route.firstChild;
    return route.paramMap.get('guid') ?? route.paramMap.get('id');
  }

  constructor() {
    const applyId = (id: string | null) => {
      if (id) {
        this.chatHistory.setActiveConversation(id);
        this.isOpen.set(true);
      } else {
        this.isOpen.set(false);
      }
    };

    applyId(this.getDeepestId());
    applyId(this.chatHistory.activeConversationId());

    effect(() => {
      const active = this.chatHistory.activeConversationId();
      console.debug('[ChatDrawer] effect activeConversationId ->', active);
      this.isOpen.set(!!active);
    });

    void this.chatHistory;

    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => applyId(this.getDeepestId()));
  }
}
