import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product';
import { CategoryService } from '../../services/category';
import { Product, CreateProductDto, UpdateProductDto } from '../../models/product.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule],
  templateUrl: './product.html',
  styleUrl: './product.css'
})
export class ProductsComponent implements OnInit {

  /* ---------------------------------- */
  /* Dependencies (Bağımlılıklar)       */
  /* ---------------------------------- */
  
  // Birden fazla servis inject edebiliriz
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private router = inject(Router); // Sayfa yönlendirmeleri için

  /* ---------------------------------- */
  /* State (Durum Yönetimi)             */
  /* ---------------------------------- */
  
  protected products = signal<Product[]>([]); // Tüm ürünler
  protected categories = signal<Category[]>([]); // Kategoriler (dropdown için)
  protected selectedProduct = signal<Product | null>(null); // Düzenlenen ürün
  protected isLoading = signal<boolean>(false);
  protected errorMessage = signal<string>('');

  // Filtreleme için
  protected selectedCategoryFilter = signal<number>(0); // 0 = Tümü
  protected searchTerm = signal<string>(''); // Arama terimi

  // Yeni ürün formu için
  protected newProduct = signal<CreateProductDto>({
    productName: '',
    description: '',
    price: 0,
    categoryId: 0
  });

  /* ---------------------------------- */
  /* Computed (Hesaplanan Değerler)     */
  /* ---------------------------------- */
  
  // Filtrelenmiş ürünler - arama ve kategori filtresine göre
  protected filteredProducts = signal<Product[]>([]);

  /* ---------------------------------- */
  /* Lifecycle (Yaşam Döngüsü)          */
  /* ---------------------------------- */
  
  async ngOnInit() {
    await this.loadInitialData();
  }

  /* ---------------------------------- */
  /* Data Loading (Veri Yükleme)       */
  /* ---------------------------------- */
  
  async loadInitialData() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    try {
      // Kategorileri ve ürünleri paralel olarak yükle
      // Promise.all: Birden fazla async işlemi aynı anda başlatır
      const [categoriesData, productsData] = await Promise.all([
        this.categoryService.getCategories(),
        this.productService.getProducts()
      ]);
      
      this.categories.set(categoriesData);
      this.products.set(productsData);
      this.applyFilters(); // Filtreleri uygula
      
    } catch (error) {
      this.errorMessage.set('Veriler yüklenirken hata oluştu!');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadProducts() {
    try {
      const data = await this.productService.getProducts();
      this.products.set(data);
      this.applyFilters();
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
    }
  }

  /* ---------------------------------- */
  /* Filtering (Filtreleme)             */
  /* ---------------------------------- */
  
  applyFilters() {
    let filtered = this.products();

    // Kategori filtreleme
    if (this.selectedCategoryFilter() > 0) {
      filtered = filtered.filter(
        p => p.categoryId === this.selectedCategoryFilter()
      );
    }

    // Arama filtreleme (ürün adında arar)
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      filtered = filtered.filter(p =>
        p.productName.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      );
    }

    this.filteredProducts.set(filtered);
  }

  onCategoryFilterChange(event: Event) {
    const value = parseInt((event.target as HTMLSelectElement).value, 10);
    this.selectedCategoryFilter.set(value);
    this.applyFilters();
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.applyFilters();
  }

  clearFilters() {
    this.selectedCategoryFilter.set(0);
    this.searchTerm.set('');
    this.applyFilters();
  }

  /* ---------------------------------- */
  /* Helper Methods (Yardımcı)          */
  /* ---------------------------------- */
  
  // Kategori ID'sine göre kategori adını bul
  getCategoryName(categoryId: number): string {
    const category = this.categories().find(c => c.id === categoryId);
    return category ? category.categoryName : 'Bilinmeyen';
  }

  // Fiyatı formatla (Türk Lirası)
  formatPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  }

  /* ---------------------------------- */
  /* Create (Ekleme)                    */
  /* ---------------------------------- */
  
  async onAddProduct() {
    const product = this.newProduct();

    // Validasyon
    if (!product.productName.trim()) {
      alert('Ürün adı boş olamaz!');
      return;
    }

    if (product.categoryId === 0) {
      alert('Lütfen bir kategori seçin!');
      return;
    }

    if (product.price <= 0) {
      alert('Fiyat 0\'dan büyük olmalıdır!');
      return;
    }

    this.isLoading.set(true);
    
    try {
      await this.productService.addProduct(product);
      
      // Formu temizle
      this.newProduct.set({
        productName: '',
        description: '',
        price: 0,
        categoryId: 0
      });
      
      // Listeyi yenile
      await this.loadProducts();
      
      alert('Ürün başarıyla eklendi!');
    } catch (error) {
      alert('Ürün eklenirken hata oluştu!');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /* ---------------------------------- */
  /* Update (Güncelleme)                */
  /* ---------------------------------- */
  
  onEditProduct(product: Product) {
    // Ürünü kopyala ve düzenleme moduna al
    this.selectedProduct.set({ ...product });
  }

  async onUpdateProduct() {
    const product = this.selectedProduct();
    if (!product) return;

    // Validasyon
    if (!product.productName.trim()) {
      alert('Ürün adı boş olamaz!');
      return;
    }

    if (product.categoryId === 0) {
      alert('Lütfen bir kategori seçin!');
      return;
    }

    if (product.price <= 0) {
      alert('Fiyat 0\'dan büyük olmalıdır!');
      return;
    }

    this.isLoading.set(true);
    
    try {
      const updateDto: UpdateProductDto = {
        id: product.id,
        productName: product.productName,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId
      };
      
      await this.productService.updateProduct(updateDto);
      
      // Düzenleme modundan çık
      this.selectedProduct.set(null);
      
      // Listeyi yenile
      await this.loadProducts();
      
      alert('Ürün başarıyla güncellendi!');
    } catch (error) {
      alert('Ürün güncellenirken hata oluştu!');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  onCancelEdit() {
    this.selectedProduct.set(null);
  }

  /* ---------------------------------- */
  /* Delete (Silme)                     */
  /* ---------------------------------- */
  
  async onDeleteProduct(product: Product) {
    const confirmed = confirm(
      `"${product.productName}" ürününü silmek istediğinize emin misiniz?`
    );
    
    if (!confirmed) return;

    this.isLoading.set(true);
    
    try {
      await this.productService.deleteProduct(product.id);
      
      // Listeyi yenile
      await this.loadProducts();
      
      alert('Ürün başarıyla silindi!');
    } catch (error) {
      alert('Ürün silinirken hata oluştu!');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /* ---------------------------------- */
  /* Navigation (Yönlendirme)           */
  /* ---------------------------------- */
  
  // Ürün detay sayfasına git
  viewProductDetail(productId: number) {
    // Router kullanarak yönlendirme yapıyoruz
    this.router.navigate(['/products', productId]);
  }
}