import { UploadApiOptions } from 'cloudinary';

export type ResourceType = 'image' | 'raw' | 'video';

export const CloudinaryFolder = Object.freeze({
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  BRANDS: 'brands',

  USERS: 'users',
  CUSTOMERS: 'customers',

  DOCUMENTS: 'documents',
  SETTINGS: 'settings',
  REPORTS: 'reports',
});

export type CloudinaryFolderType =
  (typeof CloudinaryFolder)[keyof typeof CloudinaryFolder];

export interface UploadOptions extends Omit<
  UploadApiOptions,
  'folder' | 'resource_type'
> {
  resourceType?: ResourceType;
}