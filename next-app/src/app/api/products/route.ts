import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les produits visibles (API publique)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const visible = searchParams.get('visible') !== 'false'; // Par défaut true
    const featured = searchParams.get('featured') === 'true';
    const brand = searchParams.get('brand');
    const deviceTypeSlug = searchParams.get('deviceType');
    const categorySlug = searchParams.get('category');

    const where: any = {};
    if (visible) where.isVisible = true;
    if (featured) where.isFeatured = true;
    if (brand) where.brand = brand;
    if (deviceTypeSlug) {
      where.deviceType = { slug: deviceTypeSlug };
    }
    if (categorySlug) {
      where.hearingLossCategory = { slug: categorySlug };
    }

    const products = await prisma.product.findMany({
      where,
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
