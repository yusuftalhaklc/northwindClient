export interface Product {
  id: number;                    
  productName: string;           
  description: string;           
  price: number;                
  categoryId: number;           
  categoryName?: string;        
}

export interface CreateProductDto {
  productName: string;
  description: string;
  price: number;
  categoryId: number;
}

export interface UpdateProductDto {
  id: number;
  productName: string;
  description: string;
  price: number;
  categoryId: number;
}
