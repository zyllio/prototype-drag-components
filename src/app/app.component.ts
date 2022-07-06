import { Component } from '@angular/core';
import { ReorderComponentService } from './reorder-component.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  selection = ''

  constructor(private reorderComponentService: ReorderComponentService) {
  }

  select(selection: string, event: MouseEvent) {

    this.reorderComponentService.unregister()

    this.selection = selection

    const element = event.target as HTMLElement

    this.reorderComponentService.register(element, 'container', 1)

  }
}
