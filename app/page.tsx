import { CommandCenter } from "@/components/command-center"
import { VocaCartProvider } from "@/components/providers/vocacart-provider"

export default function Page() {
  return (
    <VocaCartProvider>
      <CommandCenter />
    </VocaCartProvider>
  )
}
