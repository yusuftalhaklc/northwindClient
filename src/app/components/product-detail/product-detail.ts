import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product';
import { CategoryService } from '../../services/category';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetailComponent implements OnInit {

  /* ---------------------------------- */
  /* Dependencies (Bağımlılıklar)       */
  /* ---------------------------------- */
  
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute); // URL parametrelerini okumak için
  private router = inject(Router);

  /* ---------------------------------- */
  /* State (Durum Yönetimi)             */
  /* ---------------------------------- */
  
  protected product = signal<Product | null>(null);
  protected category = signal<Category | null>(null);
  protected relatedProducts = signal<Product[]>([]); // Aynı kategorideki diğer ürünler
  
  protected isLoading = signal<boolean>(false);
  protected errorMessage = signal<string>('');
  protected productId = signal<number>(0);

  /* ---------------------------------- */
  /* Lifecycle (Yaşam Döngüsü)          */
  /* ---------------------------------- */
  
  async ngOnInit() {
    // URL'den ürün ID'sini al
    // Örnek: /products/5 -> id = 5
    this.route.params.subscribe(async params => {
      const id = parseInt(params['id'], 10);
      
      if (isNaN(id)) {
        this.errorMessage.set('Geçersiz ürün ID!');
        return;
      }
      
      this.productId.set(id);
      await this.loadProductDetail(id);
    });
  }

  /* ---------------------------------- */
  /* Data Loading (Veri Yükleme)       */
  /* ---------------------------------- */
  
  async loadProductDetail(id: number) {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    try {
      // Ürün bilgisini getir
      const productData = await this.productService.getProductById(id);
      this.product.set(productData);
      
      // Ürünün kategorisini getir
      if (productData.categoryId) {
        const categoryData = await this.categoryService.getCategoryById(
          productData.categoryId
        );
        this.category.set(categoryData);
        
        // Aynı kategorideki diğer ürünleri getir (bu ürün hariç)
        await this.loadRelatedProducts(productData.categoryId, id);
      }
      
    } catch (error) {
      this.errorMessage.set('Ürün bilgileri yüklenirken hata oluştu!');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadRelatedProducts(categoryId: number, currentProductId: number) {
    try {
      const allProducts = await this.productService.getProducts();
      
      // Aynı kategorideki ürünleri filtrele (bu ürün hariç)
      const related = allProducts.filter(
        p => p.categoryId === categoryId && p.id !== currentProductId
      );
      
      // İlk 4 ürünü al
      this.relatedProducts.set(related.slice(0, 4));
      
    } catch (error) {
      console.error('İlgili ürünler yüklenemedi:', error);
    }
  }

  /* ---------------------------------- */
  /* Helper Methods (Yardımcı)          */
  /* ---------------------------------- */
  
  // Fiyatı formatla
  formatPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  }

  /* ---------------------------------- */
  /* Actions (İşlemler)                 */
  /* ---------------------------------- */
  
  async deleteProduct() {
    const product = this.product();
    if (!product) return;

    const confirmed = confirm(
      `"${product.productName}" ürününü silmek istediğinize emin misiniz?\n\nBu işlem sonrası ürünler sayfasına yönlendirileceksiniz.`
    );
    
    if (!confirmed) return;

    this.isLoading.set(true);
    
    try {
      await this.productService.deleteProduct(product.id);
      
      alert('Ürün başarıyla silindi!');
      
      // Ürünler sayfasına yönlendir
      this.router.navigate(['/products']);
      
    } catch (error) {
      alert('Ürün silinirken hata oluştu!');
      console.error(error);
      this.isLoading.set(false);
    }
  }

  goBack() {
    // Bir önceki sayfaya dön (tarayıcı history kullanarak)
    window.history.back();
  }

  /* ---------------------------------- */
  /* Navigation (Yönlendirme)           */
  /* ---------------------------------- */
  
  viewProduct(productId: number) {
    // Başka bir ürünün detayına git
    this.router.navigate(['/products', productId]);
  }

  editProduct() {
    const product = this.product();
    if (!product) return;
    
    // Ürünler sayfasına yönlendir (gelecekte edit mode açılabilir)
    this.router.navigate(['/products'], { 
      state: { editProductId: product.id } 
    });
  }
}