export interface CommandItem {
  id: string
  title: string
  subtitle?: string
  group?: string
  keywords?: string[]
  run: () => void | Promise<void>
}
