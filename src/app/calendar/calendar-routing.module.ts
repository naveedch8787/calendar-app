import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarComponent } from './calendar.component';
import { MeetingFormComponent } from './meeting-form/meeting-form.component';

const routes: Routes = [
  { path: '', component: CalendarComponent },
  { path: 'meeting', component: MeetingFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalendarRoutingModule {}
