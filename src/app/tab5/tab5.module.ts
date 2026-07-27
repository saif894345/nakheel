import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { Tab5Page } from './tab5.page';

import { Tab5PageRoutingModule } from './tab5-routing.module';

@NgModule({
  imports: [SharedModule, Tab5PageRoutingModule],
  declarations: [Tab5Page],
})
export class Tab5PageModule {}
