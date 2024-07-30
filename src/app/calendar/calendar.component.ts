import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { AppointmentService } from './appointment.service';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';

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
  appointmentsByDay: { [key: number]: any[] } = {};
  dayContainers: string[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.dayContainers = this.daysInMonth.map((day) => `day-${day}`);
  }

  loadAppointments(): void {
    const appointments = this.appointmentService.getAppointments();
    this.appointmentsByDay = this.groupAppointmentsByDay(appointments);
  }

  groupAppointmentsByDay(appointments: any[]): { [key: number]: any[] } {
    const grouped: { [key: number]: any[] } = {};
    appointments.forEach((appointment) => {
      const day = new Date(appointment.date).getDate();
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(appointment);
    });
    return grouped;
  }

  openDialog(day: number): void {
    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      data: { date: new Date().setDate(day) },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.appointmentService.addAppointment(result);
        this.loadAppointments();
      }
    });
  }

  drop(event: CdkDragDrop<any[]>, day: number): void {
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
      this.loadAppointments();
    }
  }

  deleteAppointment(id: number, event: Event): void {
    event.stopPropagation();
    this.appointmentService.deleteAppointment(id);
    this.loadAppointments();
  }
}
