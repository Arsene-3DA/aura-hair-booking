
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Palette professionnelle noir, blanc, or avec variables CSS
				'luxury-black': 'hsl(var(--luxury-black))',
				'luxury-charcoal': 'hsl(var(--luxury-charcoal))',
				'luxury-gold': {
					50: 'hsl(var(--luxury-gold-50))',
					100: 'hsl(var(--luxury-gold-100))',
					200: 'hsl(var(--luxury-gold-200))',
					300: 'hsl(var(--luxury-gold-300))',
					400: 'hsl(var(--luxury-gold-400))',
					500: 'hsl(var(--luxury-gold-500))',
					600: 'hsl(var(--luxury-gold-600))',
					700: 'hsl(var(--luxury-gold-700))',
					800: 'hsl(var(--luxury-gold-800))',
					900: 'hsl(var(--luxury-gold-900))',
				},
				// Palette de compatibilité (à garder pour les anciens composants)
				luxury: {
					black: '#0a0a0a',
					charcoal: '#1a1a1a', 
					gray: '#2a2a2a',
					silver: '#e5e5e5',
					white: '#ffffff',
					gold: {
						50: '#fffcf0',
						100: '#fff8db',
						200: '#fff0b7',
						300: '#ffe488',
						400: '#ffd43b',
						500: '#ffc107',
						600: '#d39e00',
						700: '#b8860b',
						800: '#9b6914',
						900: '#7c5415',
					}
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in': {
					'0%': { opacity: '0', transform: 'translateX(-30px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 30px rgba(255, 196, 7, 0.3)' },
					'50%': { boxShadow: '0 0 60px rgba(255, 196, 7, 0.6)' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.8s ease-out',
				'slide-in': 'slide-in 0.6s ease-out',
				'glow': 'glow 3s ease-in-out infinite',
				'shimmer': 'shimmer 2s infinite',
				'float': 'float 6s ease-in-out infinite'
			},
			backgroundImage: {
				'gradient-luxury': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%)',
				'gradient-gold': 'linear-gradient(135deg, #ffd43b 0%, #ffc107 50%, #d39e00 100%)',
				'gradient-gold-subtle': 'linear-gradient(135deg, #fff8db 0%, #fff0b7 100%)',
				'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255, 196, 7, 0.4), transparent)'
			},
			backdropBlur: {
				xs: '2px',
			},
			boxShadow: {
				'luxury': '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
				'gold': '0 10px 30px -5px rgba(255, 196, 7, 0.3)',
				'inner-gold': 'inset 0 2px 4px 0 rgba(255, 196, 7, 0.1)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
