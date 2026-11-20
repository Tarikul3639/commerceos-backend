import { Injectable } from '@nestjs/common';

import {
  Permission,
  Role,
} from '../../../infrastructure/database/generated/prisma/enums.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';

import { SearchResult } from '../interfaces/search-result.interface.js';

@Injectable()
export class GlobalSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: string, role: Role): Promise<{ data: SearchResult[] }> {
    /**
     * Normalize the search query and ignore
     * queries that are too short to return useful results.
     */
    const term = query.trim();
    if (term.length < 2) return { data: [] };

    /**
     * Get the permissions available to the current role.
     *
     * SUPER_ADMIN has access to every permission,
     * while other roles use their configured role permissions.
     */
    const permissions =
      role === Role.SUPER_ADMIN
        ? Object.values(Permission)
        : (
            await this.prisma.rolePermission.findMany({
              where: { role },
              select: { permission: true },
            })
          ).map(({ permission }) => permission);

    /**
     * Prepare reusable permission and search conditions.
     *
     * All search queries use case-insensitive partial matching.
     */
    const can = (permission: Permission) => permissions.includes(permission);
    const contains = { contains: term, mode: 'insensitive' as const };
    const tasks: Promise<SearchResult[]>[] = [];

    /**
     * Search products by product name or variant SKU.
     *
     * Fetch the first product image ordered by sortOrder
     * so the search result can display a product thumbnail.
     */
    if (can(Permission.PRODUCT_READ)) {
      tasks.push(
        this.prisma.product
          .findMany({
            where: {
              deletedAt: null,
              OR: [
                { name: contains },
                { variants: { some: { sku: contains, deletedAt: null } } },
              ],
            },
            take: 6,
            orderBy: { updatedAt: 'desc' },
            select: {
              id: true,
              name: true,
              category: { select: { name: true } },
              images: {
                select: { imageUrl: true },
                orderBy: { sortOrder: 'asc' },
                take: 1,
              },
            },
          })
          .then((rows) =>
            rows.map((row) => ({
              id: row.id,
              title: row.name,
              category: 'Products',
              description: row.category.name,
              href: `/dashboard/products/${row.id}`,
              imageUrl: row.images[0]?.imageUrl ?? null,
            })),
          ),
      );
    }

    /**
     * Search orders by invoice number or customer name.
     *
     * Include customer name and order status
     * to provide useful context in the search result.
     */
    if (can(Permission.ORDER_READ)) {
      tasks.push(
        this.prisma.order
          .findMany({
            where: {
              OR: [{ invoiceNo: contains }, { customer: { name: contains } }],
            },
            take: 6,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              invoiceNo: true,
              status: true,
              customer: { select: { name: true } },
            },
          })
          .then((rows) =>
            rows.map((row) => ({
              id: row.id,
              title: row.invoiceNo,
              category: 'Orders',
              description: `${row.customer.name} · ${row.status}`,
              href: '/dashboard/orders',
            })),
          ),
      );
    }

    /**
     * Search customers by name, email, or phone number.
     *
     * Include the customer's avatar when available
     * for the search result thumbnail.
     */
    if (can(Permission.CUSTOMER_READ)) {
      tasks.push(
        this.prisma.customer
          .findMany({
            where: {
              deletedAt: null,
              OR: [
                { name: contains },
                { email: contains },
                { phone: contains },
              ],
            },
            take: 6,
            orderBy: { updatedAt: 'desc' },
            select: { id: true, name: true, email: true, avatarUrl: true },
          })
          .then((rows) =>
            rows.map((row) => ({
              id: row.id,
              title: row.name,
              category: 'Customers',
              description: row.email ?? 'Customer',
              href: '/dashboard/customers',
              imageUrl: row.avatarUrl,
            })),
          ),
      );
    }

    /**
     * Search users by name, email, or phone number.
     *
     * Hide SUPER_ADMIN accounts from every role except
     * SUPER_ADMIN, and include the user's avatar when available.
     */
    if (can(Permission.USER_READ)) {
      tasks.push(
        this.prisma.user
          .findMany({
            where: {
              deletedAt: null,
              ...(role !== Role.SUPER_ADMIN && {
                NOT: { role: Role.SUPER_ADMIN },
              }),
              OR: [
                { name: contains },
                { email: contains },
                { phone: contains },
              ],
            },
            take: 6,
            orderBy: { updatedAt: 'desc' },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              avatar: true,
            },
          })
          .then((rows) =>
            rows.map((row) => ({
              id: row.id,
              title: row.name,
              category: 'Users',
              description: `${row.email} · ${row.role}`,
              href: '/dashboard/users',
              imageUrl: row.avatar,
            })),
          ),
      );
    }

    /**
     * Search suppliers by name, email, or phone number.
     *
     * Use the email as the result description
     * when it is available.
     */
    if (can(Permission.SUPPLIER_READ)) {
      tasks.push(
        this.prisma.supplier
          .findMany({
            where: {
              OR: [
                { name: contains },
                { email: contains },
                { phone: contains },
              ],
            },
            take: 5,
            orderBy: { updatedAt: 'desc' },
            select: { id: true, name: true, email: true },
          })
          .then((rows) =>
            rows.map((row) => ({
              id: row.id,
              title: row.name,
              category: 'Suppliers',
              description: row.email ?? 'Supplier',
              href: '/dashboard/suppliers',
            })),
          ),
      );
    }

    /**
     * Search catalog brands by name.
     *
     * Include the brand image when available
     * for the search result thumbnail.
     */
    if (can(Permission.BRAND_READ)) {
      tasks.push(
        this.prisma.brand
          .findMany({
            where: { name: contains },
            take: 4,
            orderBy: { name: 'asc' },
            select: { id: true, name: true, image: true },
          })
          .then((rows) =>
            rows.map((row) => ({
              id: row.id,
              title: row.name,
              category: 'Brands',
              description: 'Catalog brand',
              href: '/dashboard/brands',
              imageUrl: row.image,
            })),
          ),
      );
    }

    /**
     * Search catalog categories by name.
     */
    if (can(Permission.CATEGORY_READ)) {
      tasks.push(
        this.prisma.category
          .findMany({
            where: { name: contains },
            take: 4,
            orderBy: { name: 'asc' },
            select: { id: true, name: true },
          })
          .then((rows) =>
            rows.map((row) => ({
              id: row.id,
              title: row.name,
              category: 'Categories',
              description: 'Catalog category',
              href: '/dashboard/categories',
            })),
          ),
      );
    }

    /**
     * Execute all permitted resource searches concurrently.
     *
     * Combine the results and limit the final response
     * to a maximum of 30 search results.
     */
    const groups = await Promise.all(tasks);
    return { data: groups.flat().slice(0, 30) };
  }
}
