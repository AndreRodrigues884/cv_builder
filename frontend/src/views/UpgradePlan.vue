<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col">
      <h2 class="text-xl font-bold mb-6">Planos</h2>
      <ul class="flex flex-col gap-4">
        <li 
          v-for="plan in plans" 
          :key="plan.name"
          @click="selectedPlan = plan.name"
          :class="['cursor-pointer px-4 py-3 rounded-lg transition-all', selectedPlan === plan.name ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold' : 'bg-slate-800 hover:bg-slate-700']"
        >
          {{ plan.name }}
        </li>
      </ul>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-12 overflow-auto">
      <header class="mb-12">
        <h1 class="text-4xl font-extrabold mb-2">Upgrade de Plano</h1>
        <p class="text-slate-400 text-lg">Escolhe o plano ideal para ti</p>
      </header>

      <section class="flex flex-col gap-8 max-w-4xl mx-auto">
        <div 
          v-for="plan in plans" 
          :key="plan.name"
          v-show="selectedPlan === plan.name"
          class="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 transition-all"
        >
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold">{{ plan.name }}</h3>
            <div class="text-3xl font-bold" :class="plan.gradientText ? 'bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600' : ''">
              {{ plan.price }}
            </div>
          </div>
          <ul class="space-y-3 mb-8 text-slate-300">
            <li v-for="(feature, index) in plan.features" :key="index" class="flex items-center gap-2">
              <span :class="feature.included ? 'text-green-500' : 'text-slate-600'">{{ feature.included ? '✓' : '✗' }}</span>
              {{ feature.text }}
            </li>
          </ul>
          <button
            class="w-full py-3 text-white rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all font-semibold"
            @click="upgradePlan(plan.name)"
          >
            Melhorar Plano
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'UpgradeView',
  data() {
    return {
      selectedPlan: 'Free',
      plans: [
        {
          name: 'Free',
          price: '€0/mês',
          gradientText: false,
          features: [
            { text: '1 CV por mês', included: true },
            { text: 'AI Review básico', included: true },
            { text: 'Templates gratuitos', included: true },
            { text: 'Export PDF', included: true },
            { text: 'Job Match', included: false },
            { text: 'Career Copilot', included: false },
          ],
        },
        {
          name: 'Pro',
          price: '€10/mês',
          gradientText: true,
          features: [
            { text: 'CVs ilimitados', included: true },
            { text: 'AI Review completo', included: true },
            { text: 'Job Match por vaga', included: true },
            { text: 'Templates premium', included: true },
            { text: 'Export PDF + DOCX', included: true },
            { text: 'Multi-idioma', included: true },
            { text: 'Career Copilot', included: false },
          ],
        },
        {
          name: 'Career+',
          price: '€25/mês',
          gradientText: false,
          features: [
            { text: 'Tudo do Pro', included: true },
            { text: 'Career Copilot', included: true },
            { text: 'Simulação de entrevistas', included: true },
            { text: 'Análise de carreira', included: true },
            { text: 'Recomendação de cursos', included: true },
            { text: 'Insights de mercado', included: true },
            { text: 'Suporte prioritário', included: true },
          ],
        },
      ],
    }
  },
  methods: {
    upgradePlan(planName) {
      // Aqui você poderá integrar Stripe futuramente
      alert(`Upgrade para o plano: ${planName}`);
    }
  }
}
</script>
