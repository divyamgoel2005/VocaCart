import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    type: 'co_occurrence',
    title: 'Usually Bought Together',
    items: [
      {
        id: 101,
        name: 'Wagh Bakri Premium CTC Tea',
        category: 'Beverages',
        brand: 'Wagh Bakri',
        sale_price: 140.0,
        image_url: 'https://picsum.photos/seed/tea-leaf/300/300',
        reason: 'Frequently bought with Milk & Sugar',
      },
      {
        id: 102,
        name: 'Britannia 100% Whole Wheat Bread',
        category: 'Bakery',
        brand: 'Britannia',
        sale_price: 50.0,
        image_url: 'https://picsum.photos/seed/brown-bread/300/300',
        reason: 'Popular morning breakfast pairing',
      },
      {
        id: 103,
        name: 'Amul Salted Butter Block',
        category: 'Dairy',
        brand: 'Amul',
        sale_price: 60.0,
        image_url: 'https://picsum.photos/seed/amul-butter/300/300',
        reason: 'Frequently paired with Bread',
      },
    ],
  })
}
