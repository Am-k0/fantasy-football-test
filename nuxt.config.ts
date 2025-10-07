// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY
    }
  },

  // 1. ADDING THE 'app' BLOCK FOR GLOBAL HEAD CONFIGURATION
  app: {
    head: {
      // Set the default title for the entire application
      title: 'Fantasy Football Amel | Build Your Dream Team', 
      
      meta: [
        // Standard SEO Meta Tags
        { name: 'description', content: 'Create your ultimate team and dominate the Fantasy Football league. A free, modern application for all football fans.' },
        
        // --- OPEN GRAPH (OG) TAGS: Used by Facebook, WhatsApp, LinkedIn, Telegram ---
        { property: 'og:title', content: 'Fantasy Football Amel | Build Your Dream Team' },
        { property: 'og:description', content: 'Create your ultimate team and dominate the Fantasy Football league. A free, modern application for all football fans.' },
        { property: 'og:image', content: 'https://fantasy-football-amel.vercel.app/fantasy-preview.jpg' }, 
        { property: 'og:url', content: 'https://fantasy-football-amel.vercel.app/' },
        { property: 'og:type', content: 'website' },

        // --- TWITTER CARD TAGS: Used by X (Twitter) ---
        { name: 'twitter:card', content: 'summary_large_image' }, // Ensures a large image preview
        { name: 'twitter:title', content: 'Fantasy Football Amel | Build Your Dream Team' },
        { name: 'twitter:description', content: 'Create your ultimate team and dominate the Fantasy Football league. A free, modern application for all football fans.' },
        { name: 'twitter:image', content: 'https://fantasy-football-amel.vercel.app/fantasy-preview.jpg' }, 
      ],
    },
  },
})