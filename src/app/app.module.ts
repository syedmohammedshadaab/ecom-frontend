import { NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PerfumesComponent } from './perfumes/perfumes.component';
import {
  HttpClientModule,
  provideHttpClient,
  withFetch,
} from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { CartComponent } from './cart/cart.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { SearchPerfumeComponent } from './search-perfume/search-perfume.component';
import { FooterComponent } from './footer/footer.component';
import { PerfumedetailsComponent } from './perfumedetails/perfumedetails.component';
import { CombosComponent } from './combo/combo.component';
import { CombodetailsComponent } from './combodetails/combodetails.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [
    AppComponent,
    PerfumesComponent,
    HomeComponent,
    CartComponent,
    LoginComponent,
    SignupComponent,
    SearchPerfumeComponent,
    FooterComponent,
    PerfumedetailsComponent,
    CombosComponent,
    CombodetailsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule
  ],
  providers: [provideClientHydration(withEventReplay())],
  bootstrap: [AppComponent],
})
export class AppModule {}
