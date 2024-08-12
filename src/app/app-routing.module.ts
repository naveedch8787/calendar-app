import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// create lazy loading route for calendar module
const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./calendar/calendar.module').then((m) => m.CalendarModule),
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
