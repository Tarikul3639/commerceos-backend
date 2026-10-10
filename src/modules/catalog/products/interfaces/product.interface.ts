export interface ProductImageInput {
  imageUrl: string;
  publicId: string;
  sortOrder?: number;
}

export interface ProductVariantSummary {
  id: string;
  title: string | null;
  sku: string;
  barcode: string | null;
  stock: number;
  isActive: boolean;
}

export interface ProductOptionSummary {
  id: string;
  name: string;
  type: string;
  values: string[];
}
