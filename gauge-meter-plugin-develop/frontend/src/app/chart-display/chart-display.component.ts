import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild ,AfterViewInit, Renderer2} from '@angular/core';
import * as echarts from 'echarts';
import * as CryptoJS from "crypto-js";


@Component({
  selector: 'app-chart-display',
  templateUrl: './chart-display.component.html',
  styleUrls: ['./chart-display.component.scss']
})
export class ChartDisplayComponent implements OnInit {

  /**
   * @param widgetInfo - widget configuration metadata and widget data.
   * @param base_proxy - contain Calling API URL.
   * @param chartOptions - contain chart data from BE.
   * @param filteredData - Dashboard filter and widget filter data.
   * @param chartConfig - Dashboard filter and widget filter data.
   */

  @Input() widgetInfo: any;
  @Input() base_proxy: any;
  @Input() filteredData: any;

  public projectId: any;
  public projectType: any;
  public jsonData: any;
  public chartData: any = {};

  public metaData: any ;
  public isDataAvailable = false;
  public loader: Boolean = false;

  public hierarchy_labels ={
    data: ['a','b']
  } 

  public popoverClassEms: any ='';
  public popoverContent: any;
  public topCalculatedValue: any = '';
  public bottomCalculatedValue: any = '';
  public simpleCalculatedValue: any = '';

  public singleGaugeData: any = {};
  public topGaugeData: any = {};
  public bottomGaugeData: any = {};

  public waste = {
    k: '',
    li: '',
    Lens: '',
    KLiL: '',
    e: '',
    nsK: '',
    L: '',
  };
  public projectDetails: any = {};

  @ViewChild('outerContainer') outer!: ElementRef;
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  @ViewChild('chartContainerTop') chartContainerTop!: ElementRef;
  @ViewChild('chartContainerBottom') chartContainerBottom!: ElementRef;

  get chartConfig() {
    return this.widgetInfo?.cConfig
  }

  get chartOptions() {
    return this.widgetInfo?.cData?.chartOptions;
  }
  constructor(private http: HttpClient, private renderer: Renderer2) { }

/**
 * called when we applied any filter in dashboard and widget.
 * @param changes - contain filterData changes
 */
  ngOnChanges(changes: SimpleChanges) {
    try {
      if (changes?.['filteredData']?.currentValue && Object.keys(this.filteredData).length !== 0) {
        // on change of filter
        this.fetchTableData('filter');
      }
    } catch (error) {
      console.log(error)
    }
  }



  drawGraph() {
    if (this.chartConfig.dual_gauge) { // dual gauge
      /** Add sector points (%) */
      let maxValue = this.chartOptions.topMaximumValue;
      this.chartData.chartDetails[0]?.sectors.map((el:any, index:any) => {
        el.color = this.chartOptions.gaugeData[0]?.sectors?.[index]?.color;
        el.sectorValue = (index + 1 === this.chartData.chartDetails[0]?.sectors.length) ? 1 : el.value/maxValue;
      });
      let optionTop: any = {
        series: [
          this.getChartOptions(
            this.chartData.chartDetails[0]?.chartData?.value,
            this.chartData.chartDetails[0]?.sectors,
            maxValue,
            this.chartData.chartDetails[0]?.chartData?.unit
          )
        ]
      };
      const chartElementTop = this.chartContainerTop?.nativeElement;
      const topChart = echarts.init(chartElementTop);
      topChart.setOption(optionTop);

      /** --------- Bottom gauge --------- */
      /** Add sector points (%) */
      maxValue = this.chartOptions.bottomMaximumValue;
      this.chartData.chartDetails[1]?.sectors.map((el:any, index:any) => {
        el.color = this.chartOptions.gaugeData[0]?.sectors?.[index]?.color;
        el.sectorValue = (index + 1 === this.chartData.chartDetails[1]?.sectors.length) ? 1 : el.value/maxValue;
      });
      let optionBottom: any = {
        series: [
          this.getChartOptions(
            this.chartData.chartDetails[1]?.chartData?.value,
            this.chartData.chartDetails[1]?.sectors,
            maxValue,
            this.chartData.chartDetails[1]?.chartData?.unit
          )
        ]
      };
      
      const chartElementBottom = this.chartContainerBottom?.nativeElement;
      const bottomChart = echarts.init(chartElementBottom);
      bottomChart.setOption(optionBottom);
    } else { // single gauge
      /** Add sector points (%) */
      const maxValue = this.chartOptions.maximumValue;
      this.chartData.chartDetails[0]?.sectors.push({tag: null, value: maxValue})
      this.chartData.chartDetails[0]?.sectors.map((el:any, index:any) => {
        el.color = this.chartOptions.gaugeData[0]?.sectors?.[index]?.color;
        el.sectorValue = (index + 1 === this.chartData.chartDetails[0]?.sectors.length) ? 1 : el.value/maxValue;
      });

      let option: any = {
        series: [
          this.getChartOptions(
            this.chartData.chartDetails[0]?.chartData?.value,
            this.chartData.chartDetails[0]?.sectors,
            maxValue,
            this.chartData.chartDetails[0]?.chartData?.unit
          )
        ]
      };

      const chartElement = this.chartContainer?.nativeElement;
      const chart = echarts.init(chartElement);
      chart.setOption(option);
    }
  }

  getChartOptions(value:any, sectors:any, maxValue:any, unit?:any) {
    const isDual = this.chartConfig.dual_gauge;
    const option = {
      type: 'gauge',
      radius: isDual ? '90%' : '85%', 
      max: maxValue,
      axisLine: {
        lineStyle: {
          width: isDual ? 5 : 10,
          color: sectors.map((el:any) => [el.sectorValue, el.color])
        }
      },
      pointer: {
        width: isDual ? 3 : 6,
        itemStyle: {
          color: this.chartConfig?.dynamicPointerColor ? 'auto' : '#5470c6'
        }
      },
      axisTick: {
        distance: isDual ? 2 : 5,
        length: isDual ? 3 : 5,
        lineStyle: {
          color: '#555',
          width: 1
        }
      },
      splitLine: {
        distance: isDual ? 2 : 5,
        length: isDual ? 5 : 8,
        lineStyle: {
          color: '#555',
          width: 1
        }
      },
      axisLabel: {
        distance: isDual ? 7 : 15,
        fontSize: isDual ? 8 : 13
      },
      detail: {
        offsetCenter: [0, '90%'],
        valueAnimation: true,
        formatter: '{value}' + (unit ? ` ${unit}` : ''),
        fontSize: isDual ? 13 : 18,
        color: this.chartConfig?.dynamicValueColor ? 'inherit' : '#555555'
      },
      data: [{ value }]
    };
    return option;
  }

  ngOnInit() {
    setTimeout(() => {
      this.projectDetails = this.getProjectDetails();
    }, 500);
    this.projectId = localStorage.getItem("project_id")
    this.projectType = localStorage.getItem("project_type")
  }

  fetchTableData(type?:any) {
    try{
      this.loader = true;
      setTimeout(() => {
        let filter: any;
        if(Object.keys(this.filteredData).length){
          filter = this.filteredData['filterData'];
        } else {
          filter = {
            timePickerValue: {
                custom: {},
                timeRange: 'yesterday',
                timeRangeLabel: "Yesterday",
                isCustom: false
            },
          }
        }

        const payload: any = {
          widgetId: this.widgetInfo?.widget_id,
          project_id: localStorage.getItem('project_id'),
          database: "pre_defined",
          tz: this.projectDetails['tz'],
          language: "en",
          widget_filter: filter,
          gaugeType: this.chartConfig.dual_gauge ? 'dual' : 'single',
          queryParam: {
            xaxis: this.chartOptions.xaxis,
            yaxis: this.chartOptions.yaxis,
            sector_aggregation :"last",
          },
        }

        if (this.chartConfig.dual_gauge) {
          payload.queryParam.sectors = {};
          payload.queryParam.sectors.top = this.chartOptions.gaugeData[0].sectors;
          payload.queryParam.sectors.bottom = this.chartOptions.gaugeData[1].sectors;

          /** Remove last sector */
          payload.queryParam.sectors.top.splice(-1, 1);
          payload.queryParam.sectors.bottom.splice(-1, 1);
        } else {
          /** Remove last sector */
          payload.queryParam.sectors = this.chartOptions.gaugeData?.[0]?.sectors.filter((el:any, index:any) => index+1 != this.chartOptions.gaugeData?.[0]?.sectors.length);
        }

        const url = this.base_proxy + 'widget/fetch_gauge';
        this.http.post<any>(url, payload).subscribe((res:any) => {
          this.loader = false;
          if (res.status === "success" && res?.data?.chartDetails?.length > 0) {
            this.isDataAvailable = true;
            this.chartData = res?.data;
            if (this.chartData.chartDetails[0].chartData.value === null) {
              this.isDataAvailable = false
            }
            setTimeout(() => {
              this.drawGraph();
            }, 500);
          } else {
            this.isDataAvailable = false;
          }
        });
      }, 600);
    } catch(error: any) {
      console.log(error) 
    }
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

