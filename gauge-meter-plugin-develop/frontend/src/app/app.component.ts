import { Component, EventEmitter, Output, Input, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  constructor() { }
  /**
  * @param widgetInfo - widget configuration metadata and widget data.
  * @param widgetInfoChange - Emit change in widget data.
  * @param base_proxy - contain Calling API URL.
  * @param pageMode - Tabs in widget configuration.
  * @param activetab - Default active tab in widget configuration.
  */

  @Input() widgetInfo: any;
  @Output() widgetInfoChange = new EventEmitter();
  @Input() base_proxy: string = '';
  @Input() pageMode: string = 'display';
  @Input() activetab : string = '';
  @Input() filteredData: any;

  ngOnInit(){
    console.log(this.pageMode);
    console.log(this.activetab);
    
  }
  
}