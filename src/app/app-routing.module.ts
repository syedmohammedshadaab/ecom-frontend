import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PerfumesComponent } from './perfumes/perfumes.component'; // ✅ import your component
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { CartComponent } from './cart/cart.component';
import { SignupComponent } from './signup/signup.component';
import { SearchPerfumeComponent } from './search-perfume/search-perfume.component';
import { PerfumedetailsComponent } from './perfumedetails/perfumedetails.component';
import { CombosComponent } from './combo/combo.component';
import { CombodetailsComponent } from './combodetails/combodetails.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'perfumes', component: PerfumesComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'cart', component: CartComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'search-perfume', component: SearchPerfumeComponent },
  { path: 'perfumes/:id', component: PerfumedetailsComponent },
  { path: 'combo', component: CombosComponent },
  { path: 'combodetails/:cid', component: CombodetailsComponent }, // Example additional route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
