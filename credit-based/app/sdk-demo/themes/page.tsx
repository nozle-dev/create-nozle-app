import { ThemeGallery } from './view'

// Renders the React components in one theme with sample data, for the docs screenshots.
// Open /sdk-demo/themes?theme=dark&highlight=filled (themes: light, dark, minimal, neobrutal).
export default async function ThemesPage({ searchParams }: { searchParams: Promise<{ theme?: string; highlight?: string }> }) {
  const { theme = 'light', highlight = 'outline' } = await searchParams
  return <ThemeGallery name={theme} highlight={highlight === 'filled' ? 'filled' : 'outline'} />
}
