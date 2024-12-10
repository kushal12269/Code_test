import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-design-tab',
  templateUrl: './design-tab.component.html',
  styleUrls: ['./design-tab.component.scss']
})
export class DesignTabComponent implements OnInit {

  /**
  * @param widgetInfo - widget configuration metadata and widget data.
  * @param widgetInfoChange - Emit change in widget data.
  * @param base_proxy - contain Calling API URL.
  */

  @Input() widgetInfo: any;
  @Input() base_proxy: any;
  @Input() disabled: boolean = false;

  @Output() widgetInfoChange = new EventEmitter();

  inputModel: any;
  hideHeader: any;
  info: any;
  inputModelChange: any;
  toggle: Boolean =  false;

  public aggregationsYaxis = {
    yaxis: [
      {
        aggregation: 'sum',
        type: 'gauge',
        tag: '',
        selectedUnit: '',
        unit: '',
        unitInfo: '',
        conversionFactor: 1,
        name: '',
        color: null,
        data: [],
        unitDataForDrop: [],
        tagType:''
      },
      {
        aggregation: 'sum',
        type: 'gauge',
        tag: '',
        selectedUnit: '',
        unit: '',
        unitInfo: '',
        conversionFactor: 1,
        name: '',
        color: null,
        data: [],
        unitDataForDrop: [],
        tagType:''
      },
      {
        aggregation: 'sum',
        type: 'gauge',
        tag: '',
        selectedUnit: '',
        unit: '',
        unitInfo: '',
        conversionFactor: 1,
        name: '',
        color: null,
        data: [],
        unitDataForDrop: [],
        tagType:''
      },
      {
        aggregation: 'sum',
        type: 'gauge',
        tag: '',
        selectedUnit: '',
        unit: '',
        unitInfo: '',
        conversionFactor: 1,
        name: '',
        color: null,
        data: [],
        unitDataForDrop: [],
        tagType:''
      },
    ],
  };

  get chartOptions() {
    return this.widgetInfo?.cData?.chartOptions
  }
  
  get chartConfig() {
    return this.widgetInfo?.cConfig
  }
  set chartConfig(value) {
    this.widgetInfo.cConfig = value;
    this.widgetInfoChange.emit(this.widgetInfo);
  }
  set chartOptions(value) {
    this.widgetInfo.cData.chartOptions = value;
    this.widgetInfoChange.emit(this.widgetInfo);
  }

  get widgetData() {
    return this.widgetInfo
  }
  set widgetData(value) {
    this.widgetInfo = value;
    this.widgetInfoChange.emit(this.widgetInfo);
  }

  public widgetPostion = [
    {
      "label": "Standard",
      "value": "standard"
    },
    {
      "label": "Flexible",
      "value": "flexible"
    }
  ]
  public labelPosition = [
    {
      "label":"Left",
      "value":"left"
    },
    {
      "label":"Center",
      "value":"center"
    },
    {
      "label":"Right",
      "value":"right"
    }
  ]
  public colWidth = [
    {
      label: '2',
      value: '2',
    },
    {
      label: '3',
      value: 3,
    },
    {
      label: '4',
      value: 4,
    },
    {
      label: '5',
      value: 5,
    },
    {
      label: '6',
      value: 6,
    },
    {
      label: '7',
      value: 7,
    },
    {
      label: '8',
      value: 8,
    },
    {
      label: '9',
      value: 9,
    },
    {
      label: '10',
      value: 10,
    },
    {
      label: '11',
      value: 11,
    },
    {
      label: '12',
      value: 12,
    },
  ]
  

  constructor() { }

  ngOnInit() {
    this.chartOptions = {
      minimumValue: 0,
      maximumValue: 100,
      topMinimumValue: 0,
      topMaximumValue: 100,
      bottomMinimumValue: 0,
      bottomMaximumValue: 100,
      ...this.chartOptions,
    }
  }

  emitChanges() {
    this.widgetInfoChange.emit(this.widgetInfo);
  }

  showHeader(){
    this.widgetInfoChange.emit(this.chartConfig);
    this.chartConfig.hideHeader = this.toggle;
  }

}
