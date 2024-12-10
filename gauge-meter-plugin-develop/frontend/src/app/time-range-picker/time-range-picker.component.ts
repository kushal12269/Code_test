// tslint:disable:component-selector variable-name no-string-literal typedef ter-indent ter-arrow-parens align max-line-length no-this-assignment prefer-template no-increment-decrement no-inferrable-types
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
@Component({
  selector: 'kl-time-range-picker',
  templateUrl: './time-range-picker.component.html',
})
export class TimeRangePickerComponent implements OnInit {

  @Input() inputModel: any = {
    custom: {},
  };
  @Input() timeRangeList: any;
  @Input() fontSize: any;
  @Input() settings: any;
  @Input() displayMode = '';
  @Input() popoverClass = '';
  @Output() inputModelChange: EventEmitter<any> = new EventEmitter<any>();
 /**
* @param widgetInfo - widget configuration metadata and widget data.
* @param widgetInfoChange - Emit change in widget data.
* @param base_proxy - contain Calling API URL.
* @param _chartConfig - contain chart data from BE.
*/
  @Input() widgetInfo: any;

  @Output() widgetInfoChange = new EventEmitter();

  public showTimeRange = false;
  public calendarSettings: any = {
    bigBanner: true,
    enableTime: true,
    format: 'dd-MM-yyyy HH:mm:ss',
    defaultOpen: false,
    closeOnSelect: true,
  };
  public popoverContent: any;
  get _chartConfig() {
    return this.widgetInfo?.cData?.chartOptions
  }

  set _chartConfig(value) {
    this.widgetInfo.cData.chartOptions = value;
    this.widgetInfoChange.emit(this.widgetInfo);
  }
  constructor() { }

  ngOnInit() {
    console.log('After selecting Time',this._chartConfig, this.widgetInfo)
    if (!this.inputModel || !this.inputModel['custom']) {
      this.inputModel = {
        custom: {},
      };
    }
  }

  showDropdownValues(event:any, p:any) {
    try {
      this.popoverContent = p;
      if (this.displayMode === 'popover') {
        this.popoverContent.open();
        if (this.popoverClass) {
          const diff = window.innerWidth - event.x;
          if (event.x > 800 && diff < 800) {
            document.documentElement.style.setProperty('--leftStyle', '-720px');
            document.documentElement.style.setProperty('--pickerLeft', '-720px');
          } else if (event.x < 800) {
            document.documentElement.style.setProperty('--pickerLeft', '-150px');
          }
        }
      }
      event.stopPropagation();
      event.preventDefault();
      if (!this.inputModel.custom) {
        const today = new Date();
        this.inputModel.custom = {
          from: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0),
          to: new Date(),
        };
      }
      this.showTimeRange = true;
    } catch (error) {
      console.error(error);
    }
  }
  getCopy(obj: any) {
    return obj ? JSON.parse(JSON.stringify(obj)) : undefined;
  }

  applyCustomRange() {
    try {
      if (this.inputModel.custom['fromDisp'] === undefined) {
        this.inputModel['custom']['fromDisp'] = new Date();
      }
      if (this.inputModel.custom['toDisp'] === undefined) {
        this.inputModel.custom['toDisp'] = new Date();
      }
      if (new Date(this.inputModel.custom['fromDisp']).getTime() > new Date(this.inputModel.custom['toDisp']).getTime()) {
        // this._toastLoad.toast('warning', 'Custom Time Range : ', 'From time cannot be greater than to time', true);
        return;
      }
      const from = this.getFormattedDateTime(new Date(this.inputModel.custom['fromDisp']), 'DD-MM-YYYY HH:MM:SS');
      const to = this.getFormattedDateTime(new Date(this.inputModel.custom['toDisp']), 'DD-MM-YYYY HH:MM:SS');
      this.inputModel.custom['to'] = new Date(this.inputModel.custom['toDisp']).getTime();
      this.inputModel.custom['from'] = new Date(this.inputModel.custom['fromDisp']).getTime();
      this.inputModel.timeRange = '';
      this.inputModel.timeRangeLabel = from + ' - ' + to;
      this.inputModel.isCustom = true;
      this.closeDropdownValues();
      this.emitChanges();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Method for assigning predefined time range into the chart options
   * @param selectedVal selected range
   */
  selectTimeRange(selectedVal:any) {
    try {
      this.inputModel.timeRange = selectedVal.value;
      this.inputModel.timeRangeLabel = selectedVal.label;
      this.inputModel.isCustom = false;
      console.log('After selecting Time',this._chartConfig, selectedVal, this.inputModel)
      this._chartConfig['timeRange'] = selectedVal.value;
      this._chartConfig['timeRangeLabel'] = selectedVal.label
      this.closeDropdownValues();
      this.emitChanges();
    } catch (error) {
      console.error(error);
    }
  }

  @HostListener('document:click', ['$event'])
  clickout($event:any) {
    if ($event.target.nodeName === 'svg' || $event.target.className?.includes('owl-dt')) {
      return;
    }
    this.closeDropdownValues();
  }

  /**
   * Method for closing custom tim range popup
   */
  closeDropdownValues() {
    try {
      if (this.showTimeRange) {
        this.showTimeRange = false;
        if (this.popoverContent) {
          this.popoverContent.close();
          document.documentElement.style.setProperty('--leftStyle', null);
          document.documentElement.style.setProperty('--pickerLeft', null);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  emitChanges() {
    this.inputModelChange.emit(this.inputModel);
  }

  getFormattedDateTime(date, format?): string {
    try {
      if (format === 'full') {
        let dateVal: any = '';
      const day = (date.getDate() > 9) ? date.getDate() : ('0' + date.getDate());
      let month:any = date.getMonth() + 1;
      month = (month > 9) ? month : ('0' + month);
      const year = date.getFullYear();
      const HH = (date.getHours() > 9) ? date.getHours() : '0' + date.getHours();
      const MM = (date.getMinutes() > 9) ? date.getMinutes() : '0' + date.getMinutes();
      const SS = (date.getSeconds() > 9) ? date.getSeconds() : '0' + date.getSeconds();
      if (format && format === 'DD-MM-YYYY HH:MM:SS') {
        dateVal = day + '-' + month + '-' + year + ' ' + HH + ':' + MM + ':' + SS;
      } else {
        dateVal = year + '-' + month + '-' + day;
      }
      // return dateVal;
        return this.formatDateFull(dateVal);
      } else {
        return this.formatDateDefault(date);
      }
    } catch (error) {
      console.error(error);
    }
  }

  formatDateFull(date: Date): string {
    // Implementation of the formatDateFull function
    return ''; // Replace with actual implementation
  }
  formatDateDefault(date: Date): string {
    // Implementation of the formatDateDefault function
    return ''; // Replace with actual implementation
  }

}
