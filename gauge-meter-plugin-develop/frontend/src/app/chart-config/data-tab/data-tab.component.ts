import { Component, EventEmitter, Input, OnInit, Output, OnDestroy  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as CryptoJS from "crypto-js";

interface IGaugeData {
  tagData?: any[];
  parameter: {
      hierarchy: string;
      tag: string;
      unit: string;
  };
  sectors: {
      tag: string;
      color: string;
  }[];
}

@Component({
  selector: 'app-data-tab',
  templateUrl: './data-tab.component.html',
  styleUrls: ['./data-tab.component.scss'],
})
export class DataTabComponent implements OnInit, OnDestroy  {
  /**
   * @param widgetInfo - widget configuration metadata and widget data.
   * @param widgetInfoChange - Emit change in widget data.
   * @param base_proxy - contain Calling API URL.
   * @param _chartConfig - contain chart data from BE.
   */

  @Input('widgetInfo') widgetInfo: any;
  @Input() base_proxy: any;
  @Output() widgetInfoChange = new EventEmitter();
  @Output() updateChartConfig: EventEmitter<any> = new EventEmitter<any>();

  public defaultData: any = 'yesterday';

  public timeRangeList: any = [
    {
      label: 'Yesterday',
      value: 'yesterday',
    },
  ];
  public gaugeData: any;
  get chartOptions() {
    return this.widgetInfo?.cData?.chartOptions;
  }
  set chartOptions(value) {
    this.widgetInfo.cData.chartOptions = value;
    this.widgetInfoChange.emit(this.widgetInfo);
  }

  get chartConfig() {
    return this.widgetInfo?.cConfig
  }
  set chartConfig(value) {
    this.widgetInfo.cConfig = value;
    this.widgetInfoChange.emit(this.widgetInfo);
  }
  
  public hierarchyMeta: any = [];
  public tagsLoading = false;

  public unitData: any = [];
  public activeTab = '';
  public validation = [];

  public regexType: any = /^[a-zA-Z0-9\s]+([a-zA-Z0-9)(_ ;:.,@%*)}{(&!\/$|-])*$/;
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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.gaugeData = this.chartOptions.gaugeData;

    const defaultParamData: any = {
      "parameter": {
        "hierarchy": null,
        "tag": null,
        "unit": null
      },
      "sectors": [
        {
          "tag": null,
          "color": "#2caf42"
        },
        {
          "tag": null,
          "color": "#f6e847"
        },
        {
          "tag": null,
          "color": "#d23232"
        }
      ]
    };

    if (!this.chartConfig.dual_gauge) {
      /** Single Gauge */
      if (!this.gaugeData) {
        this.gaugeData = [
          JSON.parse(JSON.stringify(defaultParamData))
        ];
      } else if (this.gaugeData.length === 2) {
        this.gaugeData.splice(1, 1);
      }
    } else {
      /** Dual Gauge */
      if (!this.gaugeData) {
        this.gaugeData = [
          JSON.parse(JSON.stringify(defaultParamData)),
          JSON.parse(JSON.stringify(defaultParamData)),
        ];
      } else if (this.gaugeData.length === 1) {
        this.gaugeData.push(JSON.parse(JSON.stringify(defaultParamData)));
      }

      this.activeTab = 'top'
    }

    this.fetchHierarchy();
    this.fetchUnits();
  }

  initialFetchTag() {
    if (this.chartConfig.dual_gauge) {
      /** Fetch tags based on selected hierarchy */
      if (this.gaugeData[0].parameter.hierarchy) {
        this.fetchTags(this.gaugeData[0].parameter.hierarchy, this.gaugeData[0]);
      }
      if (this.gaugeData[1].parameter.hierarchy) {
        this.fetchTags(this.gaugeData[1].parameter.hierarchy, this.gaugeData[1]);
      }
    } else {
      /** Fetch tags based on selected hierarchy */
      this.fetchTags(this.gaugeData[0].parameter.hierarchy, this.gaugeData[0]);
    }
  }
   
  
  base64url(source: any): string {
    let encodedSource = CryptoJS.enc.Base64.stringify(source);
    encodedSource = encodedSource.replace(/=+$/, '');
    encodedSource = encodedSource.replace(/\+/g, '-');
    encodedSource = encodedSource.replace(/\//g, '_');
    return encodedSource;
  }

  decrypt(ciphertextStr) {
    const key = this.getSessionKey();
    const ciphertext = CryptoJS.enc.Base64.parse(ciphertextStr);
    // split IV and ciphertext
    const iv = ciphertext.clone();
    iv.sigBytes = 16;
    iv.clamp();
    ciphertext.words.splice(0, 4); // delete 4 words = 16 bytes
    ciphertext.sigBytes -= 16;

    // decryption
    const decrypted = CryptoJS.AES.decrypt({ ciphertext }, key, {
      iv,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  getSignedToken = (payload: any, contentType, URL?) => {
    try {
      let vSign = false;
      if (localStorage.getItem('vSign')) {
        vSign = JSON.parse(this.decrypt(localStorage.getItem('vSign')));
      }
      if (!vSign || contentType !== 'application/json') {
        return payload;
      }
      const secretKey = Object.keys(this.waste).join('');
      const header = {
        alg: 'HS256',
        typ: 'JWT',
      };
      const stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
      const encodedHeader = this.base64url(stringifiedHeader);
      const stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(payload));
      const encodedData = this.base64url(stringifiedData);
      const token = encodedHeader + '.' + encodedData;
      let signature: any = CryptoJS.HmacSHA256(token, secretKey);
      signature = this.base64url(signature);
      return token + '.' + signature;
    } catch (e) {
      console.error(e);
    }
  }

  fetchUnits() {
    this.projectDetails = this.getProjectDetails();
    const payload = {
      project_id: localStorage.getItem('project_id'),
      project_type: localStorage.getItem('project_type'),
       tz: this.projectDetails['tz'],
      language: 'en',
      endRow: 50000,
      page: 1,
      records: 50000,
      startRow: 0,
      filters: {
        "sortModel": [],
        "filterModel": {}
      },
    };
    let url = 'hry/units/list_units';
    // const encryptedPayload = this.getSignedToken(payload, 'application/json', '/hry/hierarchy/get_site_level_hierarchy');
    const encryptedPayload = this.getSignedToken(payload, 'application/json');
    this.http.post<any>(url, encryptedPayload,{   
      headers: {
      'Content-Type':'application/json'
      } }).subscribe((response: any) => {
      if (response.status === 'success') {
        this.unitData = response['data'].bodyContent;
      }
    });
  }

  fetchHierarchy() {
    this.projectDetails = this.getProjectDetails();
    const payload = {
      project_id: localStorage.getItem('project_id'),
      project_type: localStorage.getItem('project_type'),
      database: 'pre_defined',
       tz: this.projectDetails['tz'],
      language: 'en',
    };

    let url = '/hry/hierarchy/get_site_level_hierarchy';
    const encryptedPayload = this.getSignedToken(payload, 'application/json');
    this.http.post<any>(url, encryptedPayload ,{   
      headers: {
      'Content-Type':'application/json'
      } }).subscribe((response: any) => {
      if (response.status === 'success') {
        for (const item of response.data) {
          item['label'] = item['name'];
          item['value'] = item['id'];
        }
        this.hierarchyMeta = response.data;

        this.initialFetchTag();
      } else {
        console.log('get_site_level_hierarchy Failed');
      }
    });
  }

  onSelectHierarchyChange(data:any) {
    this.fetchTags(data.parameter.hierarchy, data);
    data.parameter.tag = null
    data.parameter.unit = null
    data.sectors = []
  }

  fetchTags(hierarchyId:any, data: IGaugeData) {
    this.projectDetails = this.getProjectDetails();
    try {
      const payload = {
        project_id: localStorage.getItem('project_id'),
        project_type: localStorage.getItem('project_type'),
        data: {},
        database: 'pre_defined',
        tz: this.projectDetails['tz'],
        language: 'en',
        unit_info: true,
      };
      if (!hierarchyId) {
        payload.data = {};
      } else {
        const hierarchy = this.hierarchyMeta.filter((each:any) => each.id  === hierarchyId)[0]
        payload.data = {
          [hierarchy?.node_id]: [hierarchy]
        };
      }
      let url = 'hry/hry/fetch_tags';
      const encryptedPayload = this.getSignedToken(payload, 'application/json');
      this.http.post<any>(url, encryptedPayload,{   
        headers: {
        'Content-Type':'application/json'
        } }).subscribe((response: any) => {
        if (response.status === 'success') {
          data.tagData = response['data'];
        } else {
          console.log('tag Res Failed');
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
  
  addGaugeSector(data: any) {
    if (!data.sectors) {
      data.sectors = [];
    }
    data.sectors.push({
      tag: null,
      color: '#ffffff' 
    });
  }
  deleteGaugeSector(data: any, index: number) {
    data.sectors.splice(index, 1);
    /** Reset tag of last sector */
    data.sectors[data.sectors.length - 1].tag = null;
  }

  changeActiveTab(tab: string) {
    this.activeTab = this.activeTab === tab ? '' : tab;
  }

  updateYAxisData() {
    const yAxisTemplate = {
      "aggregation": "avg",
      "type": "gauge",
      "tag": [],
      "selectedUnit": "",
      "unit": "",
      "unitInfo": "",
      "conversionFactor": 1,
      // "name": "",
      "color": null,
      "data": [],
      "unitDataForDrop": [],
      "tagType":"current"
    };

    let yAxis = [];
    if (this.chartConfig?.dual_gauge) {
      yAxis = [
        JSON.parse(JSON.stringify(yAxisTemplate)),
        JSON.parse(JSON.stringify(yAxisTemplate))
      ];
    } else {
      yAxis = [
        JSON.parse(JSON.stringify(yAxisTemplate))
      ];
    }

    yAxis.map((el, index) => {
      const paramTag = this.gaugeData[index]?.parameter?.tag;
      el.tag = this.gaugeData[index]?.tagData.filter((eachTag:any) => eachTag.value === paramTag)[0];
      el.unit = this.gaugeData[index]?.parameter?.unit;
      el.selectedUnit = this.gaugeData[index]?.parameter?.unit;
    });

    return yAxis;
  }

  ngOnDestroy() {

    /** Update Y-Axis */
    const yAxis = this.updateYAxisData();
    
    /** Cleanup tasks, unsubscribe from observables, or release resources */
    this.gaugeData.map((el:any) => {
      delete el.tagData;
    });

    this.chartOptions.gaugeData = this.gaugeData;
    this.chartOptions.yaxis = yAxis;
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
