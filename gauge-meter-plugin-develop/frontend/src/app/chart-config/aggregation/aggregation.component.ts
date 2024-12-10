import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as CryptoJS from "crypto-js";

@Component({
  selector: 'app-aggregation',
  templateUrl: './aggregation.component.html',
  styleUrls: ['./aggregation.component.scss']
})
export class AggregationComponent implements OnInit {
   /**
   * @param widgetInfo - widget configuration metadata and widget data.
   * @param widgetInfoChange - Emit change in widget data.
   * @param base_proxy - contain Calling API URL.
   */
  @Input('widgetInfo') widgetInfo: any;
  @Input() base_proxy: any
  @Output() widgetInfoChange = new EventEmitter();

  public chartConfiguration: any;
  public dropdownOptions: any = {};
  public parametersList: any[] = [];
  public staticTagsList: any = [];
  public chartDropdownOptions: any = {
    aggregationOptions: {
      samplingUnit: [
        {
          label: 'Seconds',
          value: 'seconds',
        },
        {
          label: 'Minutes',
          value: 'minutes',
        },
        {
          label: 'Hours',
          value: 'hours',
        },
        {
          label: 'Days',
          value: 'days',
        },
        {
          label: 'Weeks',
          value: 'weeks',
        },
        {
          label: 'Months',
          value: 'months',
        },
        {
          label: 'Years',
          value: 'years',
        },
      ],
      align: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'Sample',
          value: 'sample',
        },
        {
          label: 'Start Time',
          value: 'start_time',
        },
        {
          label: 'End Time',
          value: 'end_time',
        },
      ]
    },
    xaxis: {
      aggregations: [
        {
          label: 'Sum',
          value: 'sum',
        },
        {
          label: 'Min',
          value: 'min',
        },
        {
          label: 'Max',
          value: 'max',
        },
        {
          label: 'Avg',
          value: 'avg',
        },
        {
          label: 'Count',
          value: 'count',
        },
        {
          label: 'Dev',
          value: 'dev',
        },
        {
          label: 'Div',
          value: 'div',
        },
        {
          label: 'Diff',
          value: 'diff',
        },
        {
          label: 'Gaps',
          value: 'gaps',
        },
        {
          label: 'Filter',
          value: 'filter',
        },
        {
          label: 'First',
          value: 'first',
        },
        {
          label: 'Last',
          value: 'last',
        },
        {
          label: 'Least Squares',
          value: 'least_square',
        },
        {
          label: 'Percentile',
          value: 'percentile',
        },
        // {
        //   label: 'Rate',
        //   value: 'rate',
        // },
        // {
        //   label: 'Sampler',
        //   value: 'sampler',
        // },
        {
          label: 'Multiplication (Scale)',
          value: 'scale',
        },
        {
          label: 'SMA',
          value: 'sma',
        },
      ]
    }
  };
  public collapseReSampling: Boolean = true;
  public waste = {
    k: '',
    li: '',
    Lens: '',
    KLiL: '',
    e: '',
    nsK: '',
    L: '',
  };
  public projectDetails:any = {};
  tagList: any;
  public addAggrDisable = false;

  get chartConfig() {
    return this.widgetInfo?.cConfig
  }
  set chartConfig(value) {
    this.widgetInfo.cConfig = value;
    this.widgetInfoChange.emit(this.widgetInfo);
  }

  get chartOptions() {
    return this.widgetInfo?.cData?.chartOptions;
  }
  set chartOptions(value) {
    this.widgetInfo.cData.chartOptions = value;
    this.widgetInfoChange.emit(this.widgetInfo);
  }

  public aggregationsXaxis = {
    "xaxis": {
      "label": "",
      "aggregations": [
        {
          "parameters": [
            ''
          ],
          "aggregators": [
            {
              "name": "",
              "sampling": {
                "value": 1,
                "unit": ""
              },
              "align": ""
            }
          ]
        }
      ],
      "group_by": {
        "type": "timeSeries",
        "value": ""
      },
      "format": "dd/MM/yyyy HH:mm:ss"
    },
  }

  constructor() { }

  ngOnInit() {
    this.projectDetails = this.getProjectDetails();
    this.setFilterValue();

    if (!this.chartOptions.hasOwnProperty('xaxis')) {
      this.chartOptions.xaxis = {
        label: '',
        aggregations: [],
        group_by: {
          type: 'timeSeries',
          value: '',
        },
        format: 'dd/MM/yyyy HH:mm:ss',
      };
    } else {
      if (
        (!this.chartConfig?.dual_gauge && this.chartOptions.xaxis?.aggregations.length === 1) ||
        (this.chartConfig?.dual_gauge && this.chartOptions.xaxis?.aggregations.length === 2)
      ) {
        this.addAggrDisable = true;
      }
    }
  }

  setFilterValue(){
    this.tagList = []
    this.chartOptions.yaxis.forEach((el:any)=>{
      this.tagList.push(el.tag || {});
    });

    /** TODO: temp */
    localStorage.setItem('aggregation-tags', JSON.stringify(this.tagList));
  }

  ngOnDestroy() {
    this.chartOptions.tz = this.projectDetails['tz'];
    this.widgetInfoChange.emit(this.widgetInfo);
  }

  addAggregationBlock() {
    const aggrBlock = {
      parameters: [],
      aggregators: [
        {
          name: 'sum',
          sampling: {
            value: 1,
            unit: 'hours',
          },
          align: 'start_time',
        },
      ],
      group_by: {
        type: 'timeSeries',
        value: '',
      },
      format: 'dd/MM/yyyy HH:mm:ss',
    };

    if(this.chartConfig?.dual_gauge){
      if (this.chartOptions['xaxis'].aggregations.length < 2) {
        this.chartOptions['xaxis'].aggregations.push(aggrBlock);
        if (this.chartOptions['xaxis'].aggregations.length === 2) {
          this.addAggrDisable = true;
        }
      } else {
        this.addAggrDisable = true;
      }
    } else {
      if (this.chartOptions['xaxis'].aggregations.length < 1) {
        this.chartOptions['xaxis'].aggregations.push(aggrBlock);
        this.addAggrDisable = true;
      } else {
        this.addAggrDisable = true;
      }
    }
    // this.widgetInfoChange.emit(this.widgetInfo);
  }

  addAggregationAction(blockInd?:any) {
    try {
      const aggregation = {
        name: 'sum',
        sampling: {
          value: 1,
          unit: 'hours',
        },
        align: 'start_time',
      };
      this.chartOptions['xaxis'].aggregations[blockInd].aggregators.push(aggregation);
      this.widgetInfoChange.emit(this.widgetInfo);
    } catch (error) {
      console.error(error);
    }
  }

  deleteAggregation(blockInd:any, agreeInd:any) {
    try {
      this.chartOptions['xaxis'].aggregations[blockInd]['aggregators'].splice(agreeInd, 1);
      this.addAggrDisable = false;
      this.widgetInfoChange.emit(this.widgetInfo);
    } catch (error) {
      console.error(error);
    }
  }

  deleteAggregationBlock(blockInd:any) {
    this.chartOptions['xaxis'].aggregations.splice(blockInd, 1);
    this.widgetInfoChange.emit(this.widgetInfo);
  }

  getProjectDetails() {
    try {
      if ( this.getSessionKey()) {
        const encryptedProjectDetails = localStorage.getItem('projectDetails');
        let decryptedProjectDetails =  this.decryptId(encryptedProjectDetails);
        decryptedProjectDetails = decryptedProjectDetails && decryptedProjectDetails !== '' ? JSON.parse(decryptedProjectDetails) : null;
        decryptedProjectDetails = (typeof decryptedProjectDetails === 'string') ? JSON.parse(decryptedProjectDetails) : decryptedProjectDetails;
        return decryptedProjectDetails;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  getSessionKey() {
    const session_id = this.returnK();
    const parsed_session_id = CryptoJS.enc.Utf8.parse(session_id);
    return parsed_session_id;
  }

  returnK() {
    let k = '';
    // tslint:disable-next-line: forin
    for (const prop in this.waste) {
      k += prop;
    }
    return k;
  }

  decryptId(ciphertextStr: any) {
    const key = this.getSessionKey();
    const ciphertext = CryptoJS.enc.Base64.parse(ciphertextStr);
    const iv = ciphertext.clone();
    iv.sigBytes = 16;
    iv.clamp();
    const encryptedData = ciphertext.clone();
    encryptedData.words.splice(0, 4);
    encryptedData.sigBytes -= 16;
    const params = {
        ciphertext: encryptedData,
        iv: iv,
        key: key,
        salt: CryptoJS.lib.WordArray.create([]),
        algorithm: CryptoJS.algo.AES,
        mode: {
            processBlock: function () {}
        },
        padding: CryptoJS.pad.Pkcs7,
        blockSize: 128,
        formatter: CryptoJS.format.OpenSSL
    };
 
    const decrypted = CryptoJS.AES.decrypt(params, key, {
        iv: iv
    });
 
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    return decryptedString;
}
}
