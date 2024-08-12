import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Meeting {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  private meetingsSubject = new BehaviorSubject<Meeting[]>([]);
  meetings$: Observable<Meeting[]> = this.meetingsSubject.asObservable();

  constructor() {
    const initialMeeting: Meeting[] = [];
    this.meetingsSubject.next(initialMeeting);
  }

  getMeetings(): Observable<Meeting[]> {
    return this.meetings$;
  }

  addMeetings(meeting: Meeting): void {
    const newId = this.meetingsSubject.value.length
      ? Math.max(...this.meetingsSubject.value.map((a) => a.id)) + 1
      : 1;

    if (!meeting.id) {
      meeting.id = newId;
    }

    const currentMeetings = this.meetingsSubject.value;
    this.meetingsSubject.next([...currentMeetings, meeting]);
  }

  updateMeetings(updatedMeeting: Meeting): void {
    const currentMeetings = this.meetingsSubject.value;
    const index = currentMeetings.findIndex(
      (app) => app.id === updatedMeeting.id
    );
    if (index !== -1) {
      currentMeetings[index] = updatedMeeting;
      this.meetingsSubject.next([...currentMeetings]);
    }
  }

  deleteMeeting(id: number): void {
    const currentMeetings = this.meetingsSubject.value;
    const updatedMeetings = currentMeetings.filter(
      (meeting) => meeting.id !== id
    );
    this.meetingsSubject.next(updatedMeetings);
  }
}
