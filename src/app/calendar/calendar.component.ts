import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { AppointmentService, Appointment } from './appointment.service';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  daysOfWeek: string[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  daysInMonth: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  appointmentsByDay$: Observable<{ [key: number]: Appointment[] }> = of({});
  connectedTo: string[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.appointmentsByDay$ = this.appointmentService
      .getAppointments()
      .pipe(map((appointments) => this.groupAppointmentsByDay(appointments)));

    this.connectedTo = this.daysInMonth.map((day) => `day-${day}`);
  }

  groupAppointmentsByDay(appointments: Appointment[]): {
    [key: number]: Appointment[];
  } {
    const grouped: { [key: number]: Appointment[] } = {};
    appointments.forEach((appointment) => {
      const day = new Date(appointment.date).getDate();
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(appointment);
    });
    return grouped;
  }

  openDialog(day?: number): void {
    const date = day
      ? new Date(new Date().setDate(day)).toISOString()
      : new Date().toISOString();
    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      data: { date },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.id) {
          this.appointmentService.updateAppointment(result);
        } else {
          this.appointmentService.addAppointment(result);
        }
      }
    });
  }

  openAppointmentDetails(event: Event, appointment: Appointment): void {
    event.stopPropagation();
    console.log(appointment);
    this.dialog
      .open(AppointmentFormComponent, {
        data: appointment,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.appointmentService.updateAppointment(result);
        }
      });
  }

  drop(event: CdkDragDrop<Appointment[]>, day: number): void {
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

      const appointment = event.container.data[event.currentIndex];
      const newDate = new Date(appointment.date);
      newDate.setDate(day);
      appointment.date = newDate.toISOString();

      this.appointmentService.updateAppointment(appointment);
    }
  }

  formatTimeToAMPM(time: string): string {
    const [hour, minute] = time.split(':');
    const period = +hour >= 12 ? 'PM' : 'AM';
    const formattedHour = +hour % 12 || 12;
    return `${this.padZero(formattedHour)}:${minute} ${period}`;
  }

  padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  getTooltipText(appointment: Appointment): string {
    return `Title: ${appointment.title}\nDate: ${new Date(
      appointment.date
    ).toLocaleString()}\nTime: ${this.formatTimeToAMPM(
      appointment.startTime
    )} - ${this.formatTimeToAMPM(appointment.endTime)}`;
  }
}
