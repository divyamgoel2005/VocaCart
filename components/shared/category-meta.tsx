import {
  Croissant,
  CupSoda,
  Cookie,
  Leaf,
  Milk,
  Package,
  SprayCan,
  type LucideIcon,
} from 'lucide-react'

import type { Category } from '@/lib/api/types'

interface CategoryMeta {
  label: string
  Icon: LucideIcon
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  produce: { label: 'Produce', Icon: Leaf },
  dairy: { label: 'Dairy', Icon: Milk },
  bakery: { label: 'Bakery', Icon: Croissant },
  snacks: { label: 'Snacks', Icon: Cookie },
  beverages: { label: 'Beverages', Icon: CupSoda },
  household: { label: 'Household', Icon: SprayCan },
  other: { label: 'Other', Icon: Package },
}
