import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../models/category.model';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, FormsModule], // CommonModule: *ngFor, *ngIf için. FormsModule: form işlemleri için
  templateUrl: './category.html',
  styleUrl: './category.css'
})
export class CategoryComponent implements OnInit {

  /* ---------------------------------- */
  /* Dependencies (Bağımlılıklar)       */
  /* ---------------------------------- */
  
  // Servisimizi inject ediyoruz
  private categoryService = inject(CategoryService);

  /* ---------------------------------- */
  /* State (Durum Yönetimi)             */
  /* ---------------------------------- */
  
  // signal: Angular 17+ ile gelen reaktif state yönetimi
  // Değer değişince otomatik olarak UI güncellenir
  
  protected categories = signal<Category[]>([]); // Tüm kategoriler
  protected selectedCategory = signal<Category | null>(null); // Düzenlenen kategori
  protected isLoading = signal<boolean>(false); // Yükleniyor mu?
  protected errorMessage = signal<string>(''); // Hata mesajı

  // Yeni kategori formu için
  protected newCategory = signal<CreateCategoryDto>({
    categoryName: '',
    description: ''
  });

  /* ---------------------------------- */
  /* Lifecycle (Yaşam Döngüsü)          */
  /* ---------------------------------- */
  
  // ngOnInit: Component yüklendiğinde çalışır
  async ngOnInit() {
    await this.loadCategories();
  }

  /* ---------------------------------- */
  /* Data Loading (Veri Yükleme)       */
  /* ---------------------------------- */
  
  async loadCategories() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    try {
      const data = await this.categoryService.getCategories();
      this.categories.set(data);
    } catch (error) {
      this.errorMessage.set('Kategoriler yüklenirken hata oluştu!');
      console.error(error);
    } finally {
      this.isLoading.set(false); // Her durumda loading'i kapat
    }
  }

  /* ---------------------------------- */
  /* Create (Ekleme)                    */
  /* ---------------------------------- */
  
  async onAddCategory() {
    // Form validasyonu
    if (!this.newCategory().categoryName.trim()) {
      alert('Kategori adı boş olamaz!');
      return;
    }

    this.isLoading.set(true);
    
    try {
      await this.categoryService.addCategory(this.newCategory());
      
      // Başarılı olunca formu temizle
      this.newCategory.set({
        categoryName: '',
        description: ''
      });
      
      // Listeyi yeniden yükle
      await this.loadCategories();
      
      alert('Kategori başarıyla eklendi!');
    } catch (error) {
      alert('Kategori eklenirken hata oluştu!');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /* ---------------------------------- */
  /* Update (Güncelleme)                */
  /* ---------------------------------- */
  
  onEditCategory(category: Category) {
    // Kategoriyi kopyalayıp seçili yap
    this.selectedCategory.set({ ...category });
  }

  async onUpdateCategory() {
    const category = this.selectedCategory();
    if (!category) return;

    // Validasyon
    if (!category.categoryName.trim()) {
      alert('Kategori adı boş olamaz!');
      return;
    }

    this.isLoading.set(true);
    
    try {
      const updateDto: UpdateCategoryDto = {
        id: category.id,
        categoryName: category.categoryName,
        description: category.description
      };
      
      await this.categoryService.updateCategory(updateDto);
      
      // Düzenleme modundan çık
      this.selectedCategory.set(null);
      
      // Listeyi yenile
      await this.loadCategories();
      
      alert('Kategori başarıyla güncellendi!');
    } catch (error) {
      alert('Kategori güncellenirken hata oluştu!');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  onCancelEdit() {
    this.selectedCategory.set(null);
  }

  /* ---------------------------------- */
  /* Delete (Silme)                     */
  /* ---------------------------------- */
  
  async onDeleteCategory(category: Category) {
    // Onay al
    const confirmed = confirm(
      `"${category.categoryName}" kategorisini silmek istediğinize emin misiniz?`
    );
    
    if (!confirmed) return;

    this.isLoading.set(true);
    
    try {
      await this.categoryService.deleteCategory(category.id);
      
      // Listeyi yenile
      await this.loadCategories();
      
      alert('Kategori başarıyla silindi!');
    } catch (error) {
      alert('Kategori silinirken hata oluştu!');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }
}