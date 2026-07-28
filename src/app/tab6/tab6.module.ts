import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { Tab6Page } from './tab6.page';

import { Tab6PageRoutingModule } from './tab6-routing.module';

@NgModule({
  imports: [SharedModule, Tab6PageRoutingModule],
  declarations: [Tab6Page],
})
export class Tab6PageModule {}
