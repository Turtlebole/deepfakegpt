import {Component, inject, signal, ViewEncapsulation} from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {ActivatedRoute, RouterOutlet} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-chat-drawer',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, RouterOutlet],
  templateUrl: './chat-drawer.html',
  styleUrl: './chat-drawer.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ChatDrawer {
  protected isOpen = signal(false);

  private readonly route = inject(ActivatedRoute);
  // TODO: Get ID from url here.
  // TODO: Propagate it down in the renderer.

  constructor() {
    this.route.params.pipe(takeUntilDestroyed()).subscribe((params) => {

    });
  }
}
