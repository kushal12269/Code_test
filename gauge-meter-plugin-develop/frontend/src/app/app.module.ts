import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { createCustomElement } from '@angular/elements';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DesignTabComponent } from './chart-config/design-tab/design-tab.component';
import { ChartDisplayComponent } from './chart-display/chart-display.component';
import { DataTabComponent } from './chart-config/data-tab/data-tab.component';

// MODULES
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';





@NgModule({
  declarations: [
    AppComponent,
    DesignTabComponent,
    ChartDisplayComponent,
    DataTabComponent,
    AggregationComponent,
    ColorPickerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgSelectModule,
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: []
})
export class AppModule {

  constructor(private injector: Injector) { }

  /**
 * called when bootstarp array is empty and not provided.
 */

  ngDoBootstrap() {
    if (!customElements.get('app-simple-gauge-widget-template')) {
      const el = createCustomElement(AppComponent, { injector: this.injector })
      customElements.define('app-simple-gauge-widget-template', el);
    }
  }
}
import { AggregationComponent } from './chart-config/aggregation/aggregation.component';
import { ColorPickerComponent } from './color-picker/color-picker.component';

