// tslint:disable:component-selector no-input-rename ter-indent ter-arrow-parens align max-line-length no-this-assignment prefer-template no-increment-decrement no-inferrable-types
import { Component, OnInit, Input, Output, EventEmitter, HostListener, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'kl-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements OnInit, OnChanges {
  @Input() colorsList = [];
  @Input() inputModel: any = '';
  @Output() inputModelChange = new EventEmitter();
  selectedColor: any = {};
  showPicker = false;

  public _colorsList = [];
  ngOnInit() {
    this._colorsList = JSON.parse(JSON.stringify(this.colorsList || []));
    for (const eachRow of this._colorsList as any) {
      const ind = eachRow.findIndex((el: any) => el.value === this.inputModel);
      if (ind > -1) {
        this.selectedColor = JSON.parse(JSON.stringify(eachRow[ind]));
        break;
      }
    }
  }

  onColorSelect(item: any = {}) {
    this.selectedColor = JSON.parse(JSON.stringify(item));
    this.inputModel = item.value;
    this.inputModelChange.emit(this.inputModel);
  }

  @HostListener('document:click', ['$event'])
  clickout() {
    if (this.showPicker) {
      this.showPicker = false;
    }
  }

  showColorPicker(event: any) {
    event.stopPropagation();
    event.preventDefault();
    this.showPicker = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.selectedColor['value'] = this.inputModel;
    if (changes && changes['inputModel']) {
      for (const eachRow of this._colorsList as any) {
        const ind = eachRow.findIndex((el: any) => el.value === this.inputModel);
        if (ind > -1) {
          this.selectedColor = JSON.parse(JSON.stringify(eachRow[ind]));
          return;
        }
        this.selectedColor['label'] = null;
      }
    }
  }
}
