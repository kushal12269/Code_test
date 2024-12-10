import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { NgbCalendar, NgbDateStruct, NgbTimepickerConfig, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

interface Option {
  label: string,
  value: string,
}

interface SchedulingData {
  start_time: string,
  end_time: string,
}

interface Window {
  projectStartTime?: Date;
}

interface EmittedDataType {
  timeRange?: string,
  timeRangeLabel?: string,
  isCustom?: boolean,
  custom?: {
    from: number,
    to: number,
  }
}

@Component({
  selector: 'kl-custom-date-picker',
  templateUrl: './custom-date-picker.component.html',
  styleUrls: ['./custom-date-picker.component.scss']
})
export class CustomDatePickerComponent implements OnInit, OnChanges {

  @ViewChild('pickerContainer', { static: true }) pickerContainer!: ElementRef;
  @ViewChild('dateContainer', { static: true }) dateContainer!: ElementRef;

  @Input() defaultValue: EmittedDataType = {};
  @Output() eventEmitter = new EventEmitter();
  public customSelectionOptions: Option[] = [
    {
      label: 'Custom',
      value: 'custom',
    },
    {
      label: 'Last 5 minutes',
      value: 'last_five_minutes',
    },
    {
      label: 'Last 15 minutes',
      value: 'last_fifteen_minutes',
    },
    {
      label: 'Last 3 hours',
      value: 'last_three_hours',
    },
    {
      label: 'Last 6 hours',
      value: 'last_six_hours',
    },
    {
      label: 'Last 2 days',
      value: 'last_two_days',
    },
    {
      label: 'Last 7 days',
      value: 'last_seven_days',
    },
    {
      label: 'Last 30 days',
      value: 'last_thirty_days',
    },
    {
      label: 'Last 90 days',
      value: 'last_ninety_days',
    },
    {
      label: 'Last 6 months',
      value: 'last_six_months',
    },
    {
      label: 'Last 1 year',
      value: 'last_one_year',
    },
    {
      label: 'Last 2 year',
      value: 'last_two_year',
    },
    {
      label: 'Last 5 year',
      value: 'last_five_year',
    },
    {
      label: 'Yesterday',
      value: 'yesterday',
    },
    {
      label: 'Day before yesterday',
      value: 'day_before_yesterday',
    },
    {
      label: 'This day last week',
      value: 'this_day_last_week',
    },
    {
      label: 'Previous week',
      value: 'previous_week',
    },
    {
      label: 'Previous month',
      value: 'previous_month',
    },
    {
      label: 'Previous year',
      value: 'previous_year',
    },
    {
      label: 'Today',
      value: 'today',
    },
    {
      label: 'Today so far',
      value: 'today_so_far',
    },
    {
      label: 'This week',
      value: 'this_week',
    },
    {
      label: 'This week so far',
      value: 'this_week_so_far',
    },
    {
      label: 'This month',
      value: 'this_month',
    },
    {
      label: 'This month so far',
      value: 'this_month_so_far',
    },
    {
      label: 'This year',
      value: 'this_year',
    },
    {
      label: 'This year so far',
      value: 'this_year_so_far',
    }
  ];

  public selectedValue: Option = {
    label: 'Custom',
    value: 'custom'
  };
  public startDate!: NgbDateStruct;
  public endDate!: NgbDateStruct;
  public invalidDate: boolean = false;

  public inputModel!: EmittedDataType;

  date!: { year: number; month: number };

  public scheduling: SchedulingData = {
    start_time: '',
    end_time: '',
  }

  startTime!: NgbTimeStruct;
  endTime!: NgbTimeStruct;

  constructor(private renderer: Renderer2, private calendar: NgbCalendar, private datePipe: DatePipe, config: NgbTimepickerConfig) { 
    config.seconds = true;
		config.spinners = false;
    this.initializeOutput();
  }

  ngOnInit(): void {
    this.initializeStartandEndDate();
    this.initializeTime();
    this.formatDate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defaultValue'] && changes['defaultValue']['previousValue'] !== changes['defaultValue']['currentValue']) {
      if (this.defaultValue.hasOwnProperty('isCustom')) {
        if (this.defaultValue.isCustom) {
          this.initializeStartandEndDate();
          this.initializeTime();
          this.formatDate();
        } else {
          this.initializeCustomOption();
        }
      }
    }
  }

  initializeCustomOption = () => {
    try {
      if (this.defaultValue.timeRange && this.defaultValue.timeRangeLabel) {
        this.selectedValue = {
          label: this.defaultValue.timeRangeLabel,
          value: this.defaultValue.timeRange
        }
      } else {
        this.customSelectionOptions.forEach((ele) => {
          if (this.defaultValue.timeRange === ele.value) {
            this.defaultValue['timeRangeLabel'] = ele.label;
          }
          this.selectedValue = {
            label: this.defaultValue.timeRangeLabel,
            value: this.defaultValue.timeRange
          } as Option;
        })
      }
    } catch (error) {
      console.error(error);
    }
  }

  initializeStartandEndDate = () => {
    try {
      if (this.defaultValue?.custom?.from) {
        const fromDate = new Date(this.defaultValue.custom.from);
        this.startDate = {
          year: fromDate.getFullYear(),
          month: fromDate.getMonth() + 1,
          day: fromDate.getDate()
        }
      } else {
        this.startDate = this.calendar.getToday();
      }
      if (this.defaultValue?.custom?.to) {
        const endDate = new Date(this.defaultValue.custom.to);
        this.endDate = {
          year: endDate.getFullYear(),
          month: endDate.getMonth() + 1,
          day: endDate.getDate()
        }
      } else {
        this.endDate = this.calendar.getNext(this.calendar.getToday(), 'd', 10);
      }
    } catch (error) {
      console.error(error);
    }
  }

  initializeOutput = () => {
    this.inputModel = {
      isCustom: true,
      timeRangeLabel: '',
      timeRange: '',
      custom: {
        from: new Date().getTime(),
        to: new Date().getTime(),
      }
    }
  }


  initializeTime = () => {
    if (this.defaultValue?.custom?.from && this.defaultValue?.custom?.to) {
      const fromTime = new Date(this.defaultValue.custom.from);
      this.startTime = {
        hour: fromTime.getHours(),
        minute: fromTime.getMinutes(),
        second: fromTime.getSeconds()
      }
      const toTime = new Date(this.defaultValue.custom.to);
      this.endTime = {
        hour: toTime.getHours(),
        minute: toTime.getMinutes(),
        second: toTime.getSeconds()
      }
    } else if ((window as any).projectStartTime) {
      const { hours = 0, minutes = 0, seconds = 0 } = { ...(window as any).projectStartTime } || {};
      this.startTime = {
        hour: hours,
        minute: minutes,
        second: seconds,
      }
      this.endTime = {
        hour: hours,
        minute: minutes,
        second: seconds,
      }
    } else {
      this.startTime = {
        hour: 0,
        minute: 0,
        second: 0,
      }
      this.endTime = {
        hour: 0,
        minute: 0,
        second: 0,
      }
    }
  }

  formatDate = () => {
    try {
      const startDate = new Date(this.startDate.year, this.startDate.month - 1, this.startDate.day, this.startTime.hour, this.startTime.minute, this.startTime.second);
      const endDate = new Date(this.endDate.year, this.endDate.month - 1, this.endDate.day, this.endTime.hour, this.endTime.minute, this.endTime.second);
      this.scheduling.start_time = this.datePipe.transform(startDate, 'MMM d, y, h:mm a');
      this.scheduling.end_time = this.datePipe.transform(endDate, 'MMM d, y, h:mm a');
    } catch (error) {
      console.error(error);
    }
  }

  openDatePicker() {
    this.initializeTime();
    const displayProperty = getComputedStyle(this.pickerContainer.nativeElement).getPropertyValue('display');
    if (displayProperty === 'block') {
      this.renderer.setStyle(this.pickerContainer.nativeElement, 'display', 'none');
    } else {
      this.calculateDatePickerPosition();
    }
  }

  calculateDatePickerPosition(selectedValue?) {
    try {
      
      const dateContainer = this.dateContainer.nativeElement;
      const pickerContainer = this.pickerContainer.nativeElement;
      // Get the position of the date-container relative to the viewport
      const dateContainerRect = dateContainer.getBoundingClientRect();
      const dateContainerTop = dateContainerRect.top + window.scrollY;
      const dateContainerLeft = dateContainerRect.left + window.scrollX;
  
      // Set the position of the picker-container based on the position of the date-container
      pickerContainer.style.display = 'block';
      pickerContainer.style.visibility = 'hidden';
      const pickerContainerWidth = pickerContainer.offsetWidth;
      const currentSelectedValue = selectedValue ? selectedValue.value : this.selectedValue?.value || 'custom';
      const pickerContainerHeight = currentSelectedValue === 'custom' ? 480 : 50;
      pickerContainer.style.visibility = 'visible';
      pickerContainer.style.position = currentSelectedValue !== 'custom' ? 'inherit' : '';
      pickerContainer.style.display = 'none';
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const isBelow = dateContainerTop + dateContainer.offsetHeight + (pickerContainerHeight + 60) <= windowHeight;
      let top = isBelow ? dateContainerTop + dateContainer.offsetHeight : dateContainerTop - pickerContainerHeight;
  
      // Adjust the position of the picker-container if it's getting cropped at the top or bottom
      const viewportTop = window.scrollY + 100;
      const viewportBottom = viewportTop + windowHeight;
      const popoverBottom = top + pickerContainerHeight;
      if (popoverBottom > viewportBottom) {
        // Move the popover up by the difference
        const difference = popoverBottom - viewportBottom;
        top -= difference;
      } else if (top < viewportTop) {
        // Move the popover down by the difference
        const difference = viewportTop - top;
        top += difference;
      }
  
      // Scroll the viewport if necessary
      const SCROLL_PADDING = 10; // Padding to add when scrolling
      if (top < viewportTop + SCROLL_PADDING) {
        // Scroll up to make more space
        window.scrollTo(0, top - SCROLL_PADDING);
      } else if (popoverBottom > viewportBottom - SCROLL_PADDING) {
        // Scroll down to make more space
        window.scrollTo(0, popoverBottom - windowHeight + SCROLL_PADDING);
      }
  
      // Show the picker-container
      const isRight = dateContainerLeft + pickerContainerWidth <= windowWidth;
      const left = isRight ? dateContainerLeft : windowWidth - pickerContainerWidth;
      pickerContainer.style.top = `${top}px`;
      pickerContainer.style.left = `${left}px`;
      pickerContainer.style.display = 'block';
    } catch (error) {
      console.error(error);
    }
  }

  compareStartEndTime = () => {
    try {
      const startDate = new Date(this.startDate.year, this.startDate.month - 1, this.startDate.day, this.startTime.hour, this.startTime.minute, this.startTime.second);
      const endDate = new Date(this.endDate.year, this.endDate.month - 1, this.endDate.day, this.endTime.hour, this.endTime.minute, this.endTime.second);
      if (startDate > endDate) {
        this.invalidDate = true;
      } else {
        this.invalidDate = false;
      }
    } catch (error) {
      console.error(error);
    }
  }

  
  applyTimeFilters() {
    try {
      if(this.selectedValue.value !== 'custom') {
        this.applyDateFilter();
      }
    } catch (error) {
      console.error(error);
    }
  }

  applyDateFilter() {
    try {
      this.formatDate();
      if (this.selectedValue.value === 'custom') {
        this.initializeOutput();
        this.formCustomDateRange();
      } else {
        this.initializeOutput();
        this.inputModel.timeRange = this.selectedValue.value;
        this.inputModel.timeRangeLabel = this.selectedValue.label;
        this.inputModel.isCustom = false;
        delete this.inputModel.custom;
      }
      this.eventEmitter.emit(this.inputModel);
      this.openDatePicker();
    } catch (error) {
      console.error(error);
    }
  }

  formCustomDateRange() {
    try {
      const startDate = new Date(this.startDate.year, this.startDate.month - 1, this.startDate.day, this.startTime.hour, this.startTime.minute, this.startTime.second);
      const endDate = new Date(this.endDate.year, this.endDate.month - 1, this.endDate.day, this.endTime.hour, this.endTime.minute, this.endTime.second);
      const startDateLabel = `${this.startDate.day}-${this.startDate.month}-${this.startDate.year} ${this.startTime.hour}:${this.startTime.minute}:${this.startTime.second}`;
      const endDateLabel = `${this.endDate.day}-${this.endDate.month}-${this.endDate.year} ${this.endTime.hour}:${this.endTime.minute}:${this.endTime.second}`;
      this.inputModel.custom['to'] =  endDate.getTime();
      this.inputModel.custom['from'] =  startDate.getTime();
      this.inputModel.timeRange = '';
      this.inputModel.timeRangeLabel = startDateLabel + ' - ' + endDateLabel;
      this.inputModel.isCustom = true;
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
  

}
