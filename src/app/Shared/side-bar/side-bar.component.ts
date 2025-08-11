import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent {
  @Input() menuItems: { label: string; value: string; route?: string }[] = [];
  @Output() menuChange = new EventEmitter<string>();

  selectedItem: string = '';

  constructor(private router: Router) {}

  selectMenu(item: { label: string; value: string; route?: string }) {
    this.selectedItem = item.value;
    this.menuChange.emit(item.value);

    if (item.route) {
      this.router.navigate([item.route]);
    }
  }
}
