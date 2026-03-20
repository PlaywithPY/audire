import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/solutions - Récupérer toutes les solutions
export async function GET() {
  try {
    const solutions = await prisma.solution.findMany({
      orderBy: { solutionKey: 'asc' }
    });

    // Parser les JSON strings pour pros et cons
    const parsedSolutions = solutions.map(s => ({
      ...s,
      pros: JSON.parse(s.pros),
      cons: JSON.parse(s.cons),
    }));

    return NextResponse.json(parsedSolutions);
  } catch (error) {
    console.error('Error fetching solutions:', error);
    return NextResponse.json([], { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
