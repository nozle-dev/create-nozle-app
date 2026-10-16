import { ThemeGallery } from './view'

// Renders the React components in one theme with sample data, for the docs screenshots.
// Open /sdk-demo/themes?theme=dark (light, dark, system, shadcn, minimal, neobrutal).
export default async function ThemesPage({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  const { theme = 'light' } = await searchParams
  return <ThemeGallery name={theme} />
}
