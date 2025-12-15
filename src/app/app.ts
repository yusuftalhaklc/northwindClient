import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {

  /* ---------------------------------- */
  /* Dependencies & Base State          */
  /* ---------------------------------- */

  private http = inject(HttpClient);

  protected readonly title = signal('NorthwindEntities');

  protected categories = signal<any>([]);
  protected products = signal<any>([]);

  protected selectedCategory = signal<any | null>(null);
  protected selectedProduct = signal<any | null>(null);

  /* ---------------------------------- */
  /* Lifecycle                          */
  /* ---------------------------------- */

  async ngOnInit() {
    this.categories.set(await this.getCategories());
    this.products.set(await this.getProducts());
  }

  /* ---------------------------------- */
  /* Category API                       */
  /* ---------------------------------- */

  async getCategories(): Promise<Object> {
    try {
      return lastValueFrom(
        this.http.get('http://localhost:5004/api/Category')
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getProducts(): Promise<Object> {
    try {
      return lastValueFrom(
        this.http.get('http://localhost:5004/api/Product')
      );
    } catch (error) {
      console.log(error);
      throw new Error("Products can't be loaded");
    }
  }

  /* ---------------------------------- */
  /* Category Creation                  */
  /* ---------------------------------- */

  protected newCategoryName = signal<string>('');
  protected newCategoryDescription = signal<string>('');

  onNewCategoryNameChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.newCategoryName.set(value);
  }

  onNewCategoryDescriptionChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.newCategoryDescription.set(value);
  }

  async addCategory(event: Event) {
    event.preventDefault();

    const body = {
      categoryName: this.newCategoryName(),
      description: this.newCategoryDescription(),
    };

    try {
      const message = await lastValueFrom(
        this.http.post(
          'http://localhost:5004/api/Category',
          body,
          { responseType: 'text' }
        )
      );

      console.log('API mesajı ', message);

      this.categories.set(await this.getCategories());

      this.newCategoryName.set('');
      this.newCategoryDescription.set('');
    } catch (error) {
      console.log(error);
    }
  }

  async deleteCategory(categoryId: number) {
    try {
      const message = await lastValueFrom(
        this.http.delete(
          'http://localhost:5004/api/Category/softDelete',
          {
            body: categoryId,
            headers: { 'Content-Type': 'application/json' },
            responseType: 'text',
          }
        )
      );

      console.log('API mesajı ', message);

      this.categories.set(await this.getCategories());
      this.categories.update(list =>
        list.filter((c: any) => c.id !== categoryId)
      );
    } catch (error) {
      console.log(error);
    }
  }

  /* ---------------------------------- */
  /* Category Update                    */
  /* ---------------------------------- */

  editCategory(category: any) {
    console.log('Düzenlenecek kategori ', category);
    this.selectedCategory.set({ ...category });
  }

  onEditNameChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    this.selectedCategory.update(x => {
      if (!x) return x;
      return { ...x, categoryName: value };
    });
  }

  onEditDescriptionChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    this.selectedCategory.update(x => {
      if (!x) return x;
      return { ...x, description: value };
    });
  }

  async updateCategory(event: Event) {
    event.preventDefault();

    const categoryToUpdate = this.selectedCategory();
    if (!categoryToUpdate) return;

    try {
      const body = {
        id: categoryToUpdate.id,
        categoryName: categoryToUpdate.categoryName,
        description: categoryToUpdate.description,
      };

      const message = await lastValueFrom(
        this.http.put(
          'http://localhost:5004/api/Category',
          body,
          { responseType: 'text' }
        )
      );

      console.log('API mesajı ', message);

      this.categories.set(await this.getCategories());
      this.selectedCategory.set(null);
    } catch (error) {
      console.log(error);
    }
  }

  cancelEdit() {
    this.selectedCategory.set(null);
  }

  /* ---------------------------------- */
  /* Product Creation / Edit            */
  /* ---------------------------------- */

  protected newProductName = signal<string>('');
  protected newProductDescription = signal<string>('');
  protected newProductPrice = signal<number>(0);
  protected newProductCategoryId = signal<number>(0);

  onNewProductNameChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.newProductName.set(value);
  }

  onNewProductDescriptionChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.newProductDescription.set(value);
  }

  onNewProductPriceChange(event: Event): void {
    const value = parseFloat(
      (event.target as HTMLInputElement).value
    );
    this.newProductPrice.set(value);
  }

  onNewProductCategoryIdChange(event: Event): void {
    const value = parseInt(
      (event.target as HTMLSelectElement).value,
      10
    );
    this.newProductCategoryId.set(value);
  }

  editProduct(product: any) {
    console.log('Düzenlenecek ürün ', product);
    this.selectedProduct.set({ ...product });
    this.newProductCategoryId.set(product.categoryId);
  }

  cancelEditProduct() {
    this.selectedProduct.set(null);
  }

  onProductCategoryIdChange(event: Event) {
    const value = parseInt(
      (event.target as HTMLInputElement).value,
      10
    );

    this.selectedProduct.update(x => {
      if (!x) return x;
      return { ...x, categoryId: value };
    });
  }

  async addProduct(event: Event) {
    event.preventDefault();

    const body = {
      productName: this.newProductName(),
      description: this.newProductDescription(),
      price: this.newProductPrice(),
      categoryId: this.newProductCategoryId(),
    };

    try {
      await lastValueFrom(
        this.http.post(
          'http://localhost:5004/api/Product',
          body,
          { responseType: 'text' }
        )
      );

      this.products.set(await this.getProducts());
    } catch (error) {
      console.log(error);
    }
  }
















  
  async updateProduct(event: Event) {
    event.preventDefault();

    const productToUpdate = this.selectedProduct();
    if (!productToUpdate) return;

    try {
      const body = {
        id: productToUpdate.id,
        productName: productToUpdate.productName,
        description: productToUpdate.description,
        price: productToUpdate.price,
        categoryId: productToUpdate.categoryId,
      };

      const message = await lastValueFrom(
        this.http.put(
          'http://localhost:5004/api/Product',
          body,
          { responseType: 'text' }
        )
      );

      console.log('API mesajı ', message);

      this.products.set(await this.getProducts());
      this.selectedProduct.set(null);
    } catch (error) {
      console.log(error);
    }
  }

  async deleteProduct(productId: number) {
    try {
      await lastValueFrom(
        this.http.delete(
          'http://localhost:5004/api/Product',
          {
            body: productId,
            headers: { 'Content-Type': 'application/json' },
            responseType: 'text',
          }
        )
      );

      this.products.set(await this.getProducts());
    } catch (error) {
      console.log(error);
    }
  }
}
