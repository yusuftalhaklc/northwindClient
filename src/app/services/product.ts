import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Product, CreateProductDto, UpdateProductDto } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  private readonly API_URL = 'http://localhost:5004/api/Product';
  private http = inject(HttpClient);

  /* ---------------------------------- */
  /* GET - Tüm Ürünleri Getir           */
  /* ---------------------------------- */
  
  async getProducts(): Promise<Product[]> {
    try {
      const response = await lastValueFrom(
        this.http.get<Product[]>(this.API_URL)
      );
      return response;
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
      throw error;
    }
  }

  /* ---------------------------------- */
  /* GET - Tek Ürün Getir               */
  /* ---------------------------------- */
  
  async getProductById(id: number): Promise<Product> {
    try {
      const response = await lastValueFrom(
        this.http.get<Product>(`${this.API_URL}/${id}`)
      );
      return response;
    } catch (error) {
      console.error(`Ürün ${id} yüklenemedi:`, error);
      throw error;
    }
  }

  /* ---------------------------------- */
  /* GET - Kategoriye Göre Ürünler      */
  /* ---------------------------------- */
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    try {
      const response = await lastValueFrom(
        this.http.get<Product[]>(`${this.API_URL}/category/${categoryId}`)
      );
      return response;
    } catch (error) {
      console.error(`Kategori ${categoryId} ürünleri yüklenemedi:`, error);
      throw error;
    }
  }

  /* ---------------------------------- */
  /* POST - Yeni Ürün Ekle              */
  /* ---------------------------------- */
  
  async addProduct(product: CreateProductDto): Promise<string> {
    try {
      const response = await lastValueFrom(
        this.http.post(
          this.API_URL,
          product,
          { responseType: 'text' }
        )
      );
      return response;
    } catch (error) {
      console.error('Ürün eklenemedi:', error);
      throw error;
    }
  }

  /* ---------------------------------- */
  /* PUT - Ürün Güncelle                */
  /* ---------------------------------- */
  
  async updateProduct(product: UpdateProductDto): Promise<string> {
    try {
      const response = await lastValueFrom(
        this.http.put(
          this.API_URL,
          product,
          { responseType: 'text' }
        )
      );
      return response;
    } catch (error) {
      console.error('Ürün güncellenemedi:', error);
      throw error;
    }
  }

  /* ---------------------------------- */
  /* DELETE - Ürün Sil                  */
  /* ---------------------------------- */
  
  async deleteProduct(productId: number): Promise<string> {
    try {
      const response = await lastValueFrom(
        this.http.delete(
          this.API_URL,
          {
            body: productId,
            headers: { 'Content-Type': 'application/json' },
            responseType: 'text'
          }
        )
      );
      return response;
    } catch (error) {
      console.error('Ürün silinemedi:', error);
      throw error;
    }
  }
}