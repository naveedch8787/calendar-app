import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Meeting, MeetingService } from './service/meeting.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MeetingFormComponent } from './meeting-form/meeting-form.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  connectedTo: string[] = [];
  daysOfWeek: string[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  meetingsByDay$: Observable<{ [key: number]: Meeting[] }> = of({});
  daysInMonth: number[] = Array.from({ length: 31 }, (_, i) => i + 1);

  constructor(
    private meetingService: MeetingService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.meetingsByDay$ = this.meetingService
      .getMeetings()
      .pipe(map((meetings) => this.groupMeetingsByDay(meetings)));
    this.connectedTo = this.daysInMonth.map((day) => `day-${day}`);
  }

  groupMeetingsByDay(meetings: Meeting[]): {
    [key: number]: Meeting[];
  } {
    const grouped: { [key: number]: Meeting[] } = {};
    meetings.forEach((meeting) => {
      const day = new Date(meeting.date).getDate();
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(meeting);
    });
    return grouped;
  }

  openDialog(day?: number): void {
    const date = day
      ? new Date(new Date().setDate(day)).toISOString()
      : new Date().toISOString();
    const dialogRef = this.dialog.open(MeetingFormComponent, {
      data: { date },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.id) {
          this.meetingService.updateMeetings(result);
        } else {
          this.meetingService.addMeetings(result);
        }
      }
    });
  }

  openMeetingDetails(event: Event, meeting: Meeting): void {
    event.stopPropagation();
    this.dialog
      .open(MeetingFormComponent, {
        data: meeting,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.meetingService.updateMeetings(result);
        }
      });
  }

  drop(event: CdkDragDrop<Meeting[]>, day: number): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const meeting = event.container.data[event.currentIndex];
      const newDate = new Date(meeting.date);
      newDate.setDate(day);
      meeting.date = newDate.toISOString();
      this.meetingService.updateMeetings(meeting);
    }
  }

  padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  getTooltipText(meeting: Meeting): string {
    return `Title: ${meeting.title}\nDate: ${new Date(
      meeting.date
    ).toLocaleString()}\nTime: ${this.formatTimeToAMPM(
      meeting.startTime
    )} - ${this.formatTimeToAMPM(meeting.endTime)}`;
  }

  formatTimeToAMPM(time: string): string {
    const [hour, minute] = time.split(':');
    const period = +hour >= 12 ? 'PM' : 'AM';
    const formattedHour = +hour % 12 || 12;
    return `${this.padZero(formattedHour)}:${minute} ${period}`;
  }
}
