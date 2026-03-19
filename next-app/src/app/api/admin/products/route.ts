import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// GET - Récupérer tous les produits
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const products = await prisma.product.findMany({
      include: {
        hearingLossCategory: true,
        deviceType: true,
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST - Créer un nouveau produit
export async function POST(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const {
      name,
      slug,
      brand,
      model,
      shortDescription,
      fullDescription,
      price,
      priceRange,
      imageUrl,
      imagePosition,
      imageAlt,
      isVisible,
      isFeatured,
      order,
      hearingLossCategoryId,
      deviceTypeId,
      features,
      pros,
      cons,
      metaTitle,
      metaDescription,
    } = body;

    // Vérifier que le slug est unique
    const existing = await prisma.product.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json({ error: 'A product with this slug already exists' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        brand,
        model,
        shortDescription,
        fullDescription,
        price: price ? parseFloat(price) : null,
        priceRange,
        imageUrl,
        imagePosition: imagePosition || 'center center',
        imageAlt,
        isVisible: isVisible !== undefined ? isVisible : true,
        isFeatured: isFeatured || false,
        order: order || 0,
        hearingLossCategoryId: hearingLossCategoryId ? parseInt(hearingLossCategoryId) : null,
        deviceTypeId: deviceTypeId ? parseInt(deviceTypeId) : null,
        features: features ? JSON.stringify(features) : null,
        pros: pros ? JSON.stringify(pros) : null,
        cons: cons ? JSON.stringify(cons) : null,
        metaTitle,
        metaDescription,
      },
      include: {
        hearingLossCategory: true,
        deviceType: true,
      },
    });

    // Invalider le cache des pages qui affichent les produits
    revalidatePath('/solutions-auditives');
    revalidatePath('/products');

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

// PUT - Mettre à jour un produit
export async function PUT(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const {
      id,
      name,
      slug,
      brand,
      model,
      shortDescription,
      fullDescription,
      price,
      priceRange,
      imageUrl,
      imagePosition,
      imageAlt,
      isVisible,
      isFeatured,
      order,
      hearingLossCategoryId,
      deviceTypeId,
      features,
      pros,
      cons,
      metaTitle,
      metaDescription,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Vérifier que le slug est unique (sauf pour le produit actuel)
    if (slug) {
      const existing = await prisma.product.findFirst({
        where: {
          slug,
          NOT: { id: parseInt(id) },
        },
      });

      if (existing) {
        return NextResponse.json({ error: 'A product with this slug already exists' }, { status: 400 });
      }
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        slug,
        brand,
        model,
        shortDescription,
        fullDescription,
        price: price ? parseFloat(price) : null,
        priceRange,
        imageUrl,
        imagePosition,
        imageAlt,
        isVisible,
        isFeatured,
        order,
        hearingLossCategoryId: hearingLossCategoryId ? parseInt(hearingLossCategoryId) : null,
        deviceTypeId: deviceTypeId ? parseInt(deviceTypeId) : null,
        features: features ? JSON.stringify(features) : null,
        pros: pros ? JSON.stringify(pros) : null,
        cons: cons ? JSON.stringify(cons) : null,
        metaTitle,
        metaDescription,
      },
      include: {
        hearingLossCategory: true,
        deviceType: true,
      },
    });

    // Invalider le cache
    revalidatePath('/solutions-auditives');
    revalidatePath('/products');
    revalidatePath(`/products/${product.slug}`);

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE - Supprimer un produit
export async function DELETE(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    // Invalider le cache
    revalidatePath('/solutions-auditives');
    revalidatePath('/products');
    revalidatePath(`/products/${product.slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
