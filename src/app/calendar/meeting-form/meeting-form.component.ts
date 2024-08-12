import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Meeting, MeetingService } from '../meeting.service';

@Component({
  selector: 'app-meeting-form',
  templateUrl: './meeting-form.component.html',
  styleUrls: ['./meeting-form.component.scss'],
})
export class MeetingFormComponent implements OnInit {
  meetingForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MeetingFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Meeting | { date: string },
    private meetingService: MeetingService
  ) {
    this.meetingForm = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.meetingForm = this.fb.group({
      title: [
        this.isExistingMeeting() ? (this.data as Meeting).title : '',
        Validators.required,
      ],
      date: [
        this.isExistingMeeting()
          ? (this.data as Meeting).date
          : (this.data as { date: string }).date,
        Validators.required,
      ],
      startTime: [
        this.isExistingMeeting() ? (this.data as Meeting).startTime : '',
        Validators.required,
      ],
      endTime: [
        this.isExistingMeeting() ? (this.data as Meeting).endTime : '',
        Validators.required,
      ],
    });
  }

  isExistingMeeting(): boolean {
    return (this.data as Meeting).id !== undefined;
  }

  onSubmit(): void {
    if (this.meetingForm.valid) {
      const result = {
        ...this.meetingForm.value,
        id: this.isExistingMeeting() ? (this.data as Meeting).id : undefined,
      };
      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    if (this.isExistingMeeting()) {
      this.meetingService.deleteMeeting((this.data as Meeting).id);
      this.dialogRef.close();
    }
  }
}
