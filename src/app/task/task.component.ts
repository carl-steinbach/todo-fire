import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from './task';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent {
  @Input() task: Task | null = null;
  @Input() list: string = 'todo';
  @Output() edit = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<Task>();
  @Output() checkTask = new EventEmitter<Task>();
  card_state: string = '';

  getIconName(): string {
    if (this.list === 'todo') {
      if (this.card_state === 'checked') return 'keyboard_double_arrow_right';
      return 'keyboard_double_arrow_right';
    }
    if (this.list === 'inProgress') {
      if (this.card_state === 'checked') return 'check_box';
      return 'check_box_outline_blank';
    }
    return 'check_box';
  }

  sendTask(): void {
    this.card_state = 'checked';
  }
}
