import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#c41e3a',
        primaryDark: '#8b0000',
        gold: '#daa520',
        cream: '#fffaf0',
      },
      fontFamily: {
        sans: ['SimHei', 'Microsoft YaHei', 'sans-serif'],
        song: ['SimSun', 'STSong', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
