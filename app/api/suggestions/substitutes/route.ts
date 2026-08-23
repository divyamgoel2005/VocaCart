import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    type: 'substitutes',
    title: 'Smart Substitutes',
    items: [
      {
        id: 201,
        name: 'Epigamia Greek Yogurt (Plain)',
        category: 'Dairy',
        brand: 'Epigamia',
        sale_price: 60.0,
        image_url: 'https://picsum.photos/seed/epigamia-yogurt/300/300',
        reason: 'Healthier protein substitute for standard curd',
      },
      {
        id: 202,
        name: 'Organic Whole Jaggery Powder',
        category: 'Staples',
        brand: 'Organic Tattva',
        sale_price: 90.0,
        image_url: 'https://picsum.photos/seed/jaggery/300/300',
        reason: 'Natural unrefined substitute for white sugar',
      },
    ],
  })
}
