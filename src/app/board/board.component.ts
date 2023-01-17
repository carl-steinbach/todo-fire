import { Component, Input } from '@angular/core';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { Task } from '../task/task';
import { MatDialog } from '@angular/material/dialog'
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { TaskDialogResult } from '../task-dialog/task-dialog.component';

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

const getObservable = (collection: AngularFirestoreCollection<Task>) => {
  const subject = new BehaviorSubject<Task[]>([]);
  collection.valueChanges({ idField: 'id' }).subscribe((val: Task[]) => {
    subject.next(val);
  });
  return subject;
}

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent {
  todo = getObservable(this.store.collection('todo')) as Observable<Task[]>;
  inProgress = getObservable(this.store.collection('inProgress')) as Observable<Task[]>;
  done = getObservable(this.store.collection('done')) as Observable<Task[]>;

  constructor(private dialog: MatDialog, private store: AngularFirestore) {
    //this.todo = store.collection<Task>('todo').valueChanges({ idField: 'id' });
    //this.inProgress = store.collection<Task>('inProgress').valueChanges({ idField: 'id' });
    //this.done = store.collection<Task>('done').valueChanges({ idField: 'id' });
  }

  editTask(list: 'todo' | 'inProgress' | 'done', task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task: task,
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult | undefined) => {
        if (!result) {
          return;
        }
        this.store.collection(list).doc(task.id).update(task);
      });
  }

  deleteTask(list: 'todo' | 'inProgress' | 'done', task: Task): void {
    this.store.collection(list).doc(task.id).delete();
  }

  newTask(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task: {},
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult | undefined) => {
        if (!result) {
          return;
        } else if (!result.task.title) {
          return;
        }
        this.store.collection('todo').add(result.task);
      });
  }

  checkTask(list: 'todo' | 'inProgress' | 'done', task: Task): void {
    setTimeout(() => {
      this.store.collection(list).doc(task.id).delete();
      this.store.collection(this.nextList(list)).add(task);
    }, 333);
  }

  nextList(list: 'todo' | 'inProgress' | 'done'): string {
    if (list === 'todo') {
      return 'inProgress';
    } else {
      return 'done';
    }
  }

  // drag and drop an item into one of the lists
  drop(event: CdkDragDrop<Task[] | null>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    if (!event.container.data || !event.previousContainer.data) {
      return;
    }
    const item = event.previousContainer.data[event.previousIndex];
    this.store.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.store.collection(event.previousContainer.id).doc(item.id).delete(),
        this.store.collection(event.container.id).add(item),
      ]);
      return promise;
    });
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    )
  }
}
