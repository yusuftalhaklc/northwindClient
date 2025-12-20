export interface Category {
  id: number;                  
  categoryName: string;         
  description: string;         
}

export interface CreateCategoryDto {
  categoryName: string;
  description: string;
}

export interface UpdateCategoryDto {
  id: number;
  categoryName: string;
  description: string;
}