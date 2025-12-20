import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { CategoryComponent } from './components/category/category';
import {  ProductsComponent } from './components/product/product';
import {  ProductDetailComponent } from './components/product-detail/product-detail';

export const routes: Routes = [
    {path : '', component:Home},
    {path : 'categories', component:CategoryComponent},
    {path : 'products', component:ProductsComponent},
    {path : 'products/:id', component:ProductDetailComponent},
    {path : '**', redirectTo: ''}
];
