"use client"

import { motion } from "motion/react"
import { Leaf, Plus, Repeat2, Star } from "lucide-react"

import { useVocaCart } from "@/components/providers/vocacart-provider"
import type { Product } from "@/lib/api/types"
import { cn } from "@/lib/utils"

function formatPrice(price: number, currency: string) {
  const symbol = currency === "INR" || currency === "₹" ? "₹" : currency === "EUR" ? "€" : "$"
  return `${symbol}${price.toFixed(2)}`
}

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const { addParsedItem, strings } = useVocaCart()

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 28 }}
      className="flex items-start gap-3.5 rounded-xl border border-border/60 bg-background/50 p-3.5"
    >
      <div className="min-w-0 flex-1 pr-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-sm font-semibold leading-snug break-words">{product.name}</p>
          {product.organic && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-1.5 py-0.5 text-[10px] font-semibold text-success">
              <Leaf className="size-3" />
              Organic
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {product.brand} · {product.size}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3 fill-voice text-voice" />
            {product.rating.toFixed(1)}
          </span>
          {product.substituteFor && (
            <span className="inline-flex items-center gap-1 text-foreground/70">
              <Repeat2 className="size-3" />
              Alt for {product.substituteFor}
            </span>
          )}
          {!product.inStock && <span className="text-destructive font-medium">Out of stock</span>}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2 pt-0.5">
        <span className="font-mono text-sm font-semibold tabular-nums">
          {formatPrice(product.price, product.currency)}
        </span>
        <button
          type="button"
          disabled={!product.inStock}
          onClick={() =>
            addParsedItem({
              name: product.name,
              quantity: 1,
              category: product.category,
            })
          }
          aria-label={`${strings.add} ${product.name}`}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            product.inStock
              ? "bg-foreground text-background hover:scale-105"
              : "cursor-not-allowed bg-muted text-muted-foreground",
          )}
        >
          <Plus className="size-3.5" />
          {strings.add}
        </button>
      </div>
    </motion.li>
  )
}
