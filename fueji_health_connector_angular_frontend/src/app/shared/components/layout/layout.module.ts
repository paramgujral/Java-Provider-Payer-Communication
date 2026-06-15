import { NgModule } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  imports: [HeaderComponent, SidebarComponent, FooterComponent],
  exports: [HeaderComponent, SidebarComponent, FooterComponent]
})
export class LayoutModule {}
