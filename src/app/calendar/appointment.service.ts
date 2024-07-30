import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private appointments: any[] = [
    { id: 1, title: 'Meeting', date: new Date().toISOString() },
  ];

  getAppointments(): any[] {
    return this.appointments;
  }

  addAppointment(appointment: any): void {
    const newAppointment = {
      ...appointment,
      id: this.appointments.length
        ? this.appointments[this.appointments.length - 1].id + 1
        : 1,
    };
    this.appointments.push(newAppointment);
  }

  updateAppointment(updatedAppointment: any): void {
    const index = this.appointments.findIndex(
      (app) => app.id === updatedAppointment.id
    );
    if (index !== -1) {
      this.appointments[index] = updatedAppointment;
    }
  }

  deleteAppointment(id: number): void {
    this.appointments = this.appointments.filter(
      (appointment) => appointment.id !== id
    );
  }
}
