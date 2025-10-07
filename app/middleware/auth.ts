export default defineNuxtRouteMiddleware(async (to) => {
  const { init, isAuthenticated, loading } = useSupabaseAuth()
  
  await init()
  
  while (loading.value) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  const protectedRoutes = ['/team-builder']
  const authRoutes = ['/login', '/signup']
  
  if (!isAuthenticated() && protectedRoutes.some(route => to.path.startsWith(route))) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath, reason: 'team-builder' }
    })
  }
  
  if (isAuthenticated() && authRoutes.includes(to.path)) {
    return navigateTo('/team-builder')
  }
})
