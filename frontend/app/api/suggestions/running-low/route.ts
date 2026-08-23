import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    type: 'running_low',
    title: 'Probably Running Low',
    items: [
      {
        id: 1,
        name: 'Amul Taaza Fresh Toned Milk',
        category: 'Dairy',
        brand: 'Amul',
        sale_price: 54.0,
        image_url: 'https://picsum.photos/seed/amul-milk/300/300',
        reason: 'Estimated based on your 2-day grocery cycle',
      },
      {
        id: 2,
        name: 'Aashirvaad Superior MP Atta',
        category: 'Staples',
        brand: 'Aashirvaad',
        sale_price: 265.0,
        image_url: 'https://picsum.photos/seed/aashirvaad-atta/300/300',
        reason: 'Running low in household staples',
      },
      {
        id: 3,
        name: 'Tata Salt Vacuum Evaporated',
        category: 'Staples',
        brand: 'Tata',
        sale_price: 28.0,
        image_url: 'https://picsum.photos/seed/tata-salt/300/300',
        reason: 'Restock reminder',
      },
    ],
  })
}
