import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePickerComponent } from './date-picker/date-picker.component';


import { OwlDateTimeModule, OwlNativeDateTimeModule, DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { MomentDateTimeAdapter } from './date-picker/moment-adapter/moment-date-time-adapter.class'; //This is a custom wrapper around MomentDateTimeAdapter
import { FormsModule } from '@angular/forms';
import { CustomDatePickerComponent } from './custom-date-picker/custom-date-picker.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    DatePickerComponent,
    CustomDatePickerComponent
  ],
  imports: [
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    CommonModule,
    FormsModule,
    NgSelectModule,
    NgbModule
  ],
  exports: [
    DatePickerComponent,
    CustomDatePickerComponent,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
  ],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    {
      provide: OWL_DATE_TIME_FORMATS,
      useValue: {
        fullPickerInput: 'D MMM, YYYY, HH:mm',
        parseInput: 'D MMM, YYYY, HH:mm',
        datePickerInput: 'D MMM, YYYY, HH:mm',
        timePickerInput: 'LT',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
      }
    },
  ]
})
export class DatePickerModule { }
