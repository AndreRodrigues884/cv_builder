import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import LoginView from "../views/Login.vue";
import RegisterView from "../views/Register.vue";
import ProfileView from "../views/Profile.vue";
import Home from "../views/Home.vue";
import AuthCallback from '../views/AuthCallback.vue';
import Dashboard from '../views/Dashboard.vue'

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: LoginView },
  { path: "/register", component: RegisterView },
  { path: "/profile", component: ProfileView, meta: { requiresAuth: true } },
   { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
   { path: '/auth/callback', component: AuthCallback },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Se a rota requer autenticação e o user não está logado
  if (to.meta.requiresAuth && !authStore.user) {
    next("/login");
  }
  // Se o user está logado e tenta acessar login/register
  else if ((to.path === "/login" || to.path === "/register") && authStore.user) {
    next("/profile");
  } else {
    next();
  }
});

export default router;
