import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/category.model';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  
  private readonly API_URL = 'http://localhost:5004/api/Category';
  
  private http = inject(HttpClient);

  /* ---------------------------------- */
  /* GET - Tüm Kategorileri Getir       */
  /* ---------------------------------- */
  
  async getCategories(): Promise<Category[]> {
    try {
      // HTTP GET isteği atıyoruz
      // lastValueFrom: Observable'ı Promise'e çevirir
      const response = await lastValueFrom(
        this.http.get<Category[]>(this.API_URL)
      );
      return response;
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error);
      throw error; 
    }
  }

  /* ---------------------------------- */
  /* GET - Tek Kategori Getir           */
  /* ---------------------------------- */
  
  async getCategoryById(id: number): Promise<Category> {
    try {
      const response = await lastValueFrom(
        this.http.get<Category>(`${this.API_URL}/${id}`)
      );
      return response;
    } catch (error) {
      console.error(`Kategori ${id} yüklenemedi:`, error);
      throw error;
    }
  }

  /* ---------------------------------- */
  /* POST - Yeni Kategori Ekle          */
  /* ---------------------------------- */
  
  async addCategory(category: CreateCategoryDto): Promise<string> {
    try {
      const response = await lastValueFrom(
        this.http.post(
          this.API_URL,
          category,
          { responseType: 'text' } // API text döndürüyor
        )
      );
      return response;
    } catch (error) {
      console.error('Kategori eklenemedi:', error);
      throw error;
    }
  }

  /* ---------------------------------- */
  /* PUT - Kategori Güncelle            */
  /* ---------------------------------- */
  
  async updateCategory(category: UpdateCategoryDto): Promise<string> {
    try {
      const response = await lastValueFrom(
        this.http.put(
          this.API_URL,
          category,
          { responseType: 'text' }
        )
      );
      return response;
    } catch (error) {
      console.error('Kategori güncellenemedi:', error);
      throw error;
    }
  }

  /* ---------------------------------- */
  /* DELETE - Kategori Sil              */
  /* ---------------------------------- */
  
  async deleteCategory(categoryId: number): Promise<string> {
    try {
      const response = await lastValueFrom(
        this.http.delete(
          `${this.API_URL}/softDelete`,
          {
            body: categoryId,
            headers: { 'Content-Type': 'application/json' },
            responseType: 'text'
          }
        )
      );
      return response;
    } catch (error) {
      console.error('Kategori silinemedi:', error);
      throw error;
    }
  }
}