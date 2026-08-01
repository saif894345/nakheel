import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { Tab7Page } from './tab7.page';

import { Tab7PageRoutingModule } from './tab7-routing.module';

@NgModule({
  imports: [SharedModule, Tab7PageRoutingModule],
  declarations: [Tab7Page],
})
export class Tab7PageModule {}
