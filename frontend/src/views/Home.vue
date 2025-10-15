<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <!-- Header / Navbar -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-lg border-b border-blue-500/10">
      <div class="container mx-auto px-6 py-5">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="text-3xl">📄</span>
            <span class="text-2xl font-bold">
              CV<span class="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Builder</span>
            </span>
          </div>
          <nav class="flex items-center gap-8">
            <a href="#features" class="text-slate-400 hover:text-blue-500 transition-colors">Funcionalidades</a>
            <a href="#pricing" class="text-slate-400 hover:text-blue-500 transition-colors">Planos</a>
            <a href="#how-it-works" class="text-slate-400 hover:text-blue-500 transition-colors">Como Funciona</a>
            <router-link to="/login" class="px-6 py-2.5 border border-blue-500/30 text-blue-500 rounded-lg hover:bg-blue-500/10 transition-all">
              Login
            </router-link>
            <router-link to="/register" class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all">
              Começar Grátis
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="pt-32 pb-20 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <!-- Hero Text -->
          <div class="relative z-10">
            <h1 class="text-6xl font-extrabold leading-tight mb-6">
              Cria o CV Perfeito com
              <span class="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Inteligência Artificial
              </span>
            </h1>
            <p class="text-xl text-slate-400 leading-relaxed mb-10">
              Otimizado para ATS, personalizado para cada vaga e validado por IA.
              Destaca-te da concorrência em minutos.
            </p>
            
            <div class="flex gap-4 mb-16">
              <router-link to="/register" class="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1 transition-all flex items-center gap-2 text-lg font-semibold">
                Criar CV Grátis
                <span>→</span>
              </router-link>
              <button class="px-8 py-4 bg-slate-800/50 text-slate-100 border border-slate-700 rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 text-lg font-semibold">
                <span>▶</span>
                Ver Demo
              </button>
            </div>

            <!-- Stats -->
            <div class="flex gap-12">
              <div>
                <div class="text-4xl font-bold text-blue-500 mb-1">50k+</div>
                <div class="text-sm text-slate-500">CVs Criados</div>
              </div>
              <div>
                <div class="text-4xl font-bold text-blue-500 mb-1">95%</div>
                <div class="text-sm text-slate-500">Score ATS Médio</div>
              </div>
              <div>
                <div class="text-4xl font-bold text-blue-500 mb-1">4.9/5</div>
                <div class="text-sm text-slate-500">Avaliação</div>
              </div>
            </div>
          </div>

          <!-- Hero Image / CV Preview -->
          <div class="relative">
            <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-blue-500/20 rounded-2xl p-12 shadow-2xl transform hover:rotate-0 rotate-y-[-5deg] transition-transform duration-500 perspective-1000">
              <div class="w-full h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mb-6"></div>
              <div class="space-y-3">
                <div class="w-full h-3 bg-slate-700/50 rounded"></div>
                <div class="w-3/5 h-3 bg-slate-700/50 rounded"></div>
                <div class="w-full h-3 bg-slate-700/50 rounded"></div>
                <div class="w-4/5 h-3 bg-slate-700/50 rounded"></div>
              </div>
              
              <!-- AI Badge -->
              <div class="absolute -top-3 -right-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/40">
                <span class="animate-pulse">✨</span>
                AI Powered
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-24 bg-gradient-to-b from-slate-900/50 to-slate-950">
      <div class="container mx-auto px-6">
        <div class="text-center mb-20">
          <h2 class="text-5xl font-extrabold mb-4">Funcionalidades Poderosas</h2>
          <p class="text-xl text-slate-400">Tudo o que precisas para criar o CV perfeito</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- AI Review -->
          <div class="bg-slate-800/50 border border-blue-500/10 rounded-2xl p-8 hover:border-blue-500/30 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/10 transition-all">
            <div class="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center text-3xl mb-5">
              🎯
            </div>
            <h3 class="text-2xl font-bold mb-3">AI Review 2.0</h3>
            <p class="text-slate-400 leading-relaxed mb-5">
              Análise completa do teu CV com pontuação detalhada: ATS, linguagem, impacto e clareza.
              Recebe recomendações práticas e acionáveis.
            </p>
            <ul class="space-y-2 text-sm text-slate-500">
              <li class="flex items-start gap-2">
                <span class="text-blue-500 mt-0.5">→</span>
                Score detalhado (ATS, Linguagem, Impacto)
              </li>
              <li class="flex items-start gap-2">
                <span class="text-blue-500 mt-0.5">→</span>
                Benchmark por área profissional
              </li>
              <li class="flex items-start gap-2">
                <span class="text-blue-500 mt-0.5">→</span>
                Correções automáticas com 1 clique
              </li>
            </ul>
          </div>

          <!-- Job Match -->
          <div class="bg-slate-800/50 border border-purple-500/10 rounded-2xl p-8 hover:border-purple-500/30 hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/10 transition-all">
            <div class="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center text-3xl mb-5">
              🎯
            </div>
            <h3 class="text-2xl font-bold mb-3">AI Job Match</h3>
            <p class="text-slate-400 leading-relaxed mb-5">
              Adapta automaticamente o teu CV para cada vaga. Importa a descrição da vaga e deixa a IA fazer o resto.
            </p>
            <ul class="space-y-2 text-sm text-slate-500">
              <li class="flex items-start gap-2">
                <span class="text-purple-500 mt-0.5">→</span>
                Análise automática de requisitos
              </li>
              <li class="flex items-start gap-2">
                <span class="text-purple-500 mt-0.5">→</span>
                Ajuste inteligente de competências
              </li>
              <li class="flex items-start gap-2">
                <span class="text-purple-500 mt-0.5">→</span>
                Destaque de palavras-chave essenciais
              </li>
            </ul>
          </div>

          <!-- Career Copilot -->
          <div class="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-purple-500/30 rounded-2xl p-8 hover:border-purple-500/50 hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/20 transition-all relative">
            <div class="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Premium
            </div>
            <div class="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-3xl mb-5">
              🚀
            </div>
            <h3 class="text-2xl font-bold mb-3">Career Copilot</h3>
            <p class="text-slate-400 leading-relaxed mb-5">
              Teu assistente de carreira pessoal. Sugestões de progressão, análise de gaps e recomendações personalizadas.
            </p>
            <ul class="space-y-2 text-sm text-slate-500">
              <li class="flex items-start gap-2">
                <span class="text-purple-500 mt-0.5">→</span>
                Simulação de perguntas de entrevista
              </li>
              <li class="flex items-start gap-2">
                <span class="text-purple-500 mt-0.5">→</span>
                Sugestão de caminhos de carreira
              </li>
              <li class="flex items-start gap-2">
                <span class="text-purple-500 mt-0.5">→</span>
                Análise de lacunas de competências
              </li>
              <li class="flex items-start gap-2">
                <span class="text-purple-500 mt-0.5">→</span>
                Recomendação de cursos/formações
              </li>
            </ul>
          </div>

          <!-- Templates -->
          <div class="bg-slate-800/50 border border-cyan-500/10 rounded-2xl p-8 hover:border-cyan-500/30 hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-500/10 transition-all">
            <div class="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center text-3xl mb-5">
              🎨
            </div>
            <h3 class="text-2xl font-bold mb-3">Templates Inteligentes</h3>
            <p class="text-slate-400 leading-relaxed mb-5">
              Templates que se adaptam à tua área profissional. Design moderno e otimizado para ATS.
            </p>
            <ul class="space-y-2 text-sm text-slate-500">
              <li class="flex items-start gap-2">
                <span class="text-cyan-500 mt-0.5">→</span>
                Design adaptativo por área
              </li>
              <li class="flex items-start gap-2">
                <span class="text-cyan-500 mt-0.5">→</span>
                Personalização de cores e layout
              </li>
              <li class="flex items-start gap-2">
                <span class="text-cyan-500 mt-0.5">→</span>
                Export PDF e DOCX
              </li>
            </ul>
          </div>

          <!-- ATS Optimization -->
          <div class="bg-slate-800/50 border border-green-500/10 rounded-2xl p-8 hover:border-green-500/30 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-500/10 transition-all">
            <div class="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center text-3xl mb-5">
              ✅
            </div>
            <h3 class="text-2xl font-bold mb-3">Otimização ATS</h3>
            <p class="text-slate-400 leading-relaxed mb-5">
              Garante que o teu CV passa pelos sistemas de recrutamento automáticos com pontuação máxima.
            </p>
            <ul class="space-y-2 text-sm text-slate-500">
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-0.5">→</span>
                Verificação de compatibilidade ATS
              </li>
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-0.5">→</span>
                Sugestão de palavras-chave
              </li>
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-0.5">→</span>
                Formatação otimizada
              </li>
            </ul>
          </div>

          <!-- Multi-language -->
          <div class="bg-slate-800/50 border border-orange-500/10 rounded-2xl p-8 hover:border-orange-500/30 hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-500/10 transition-all">
            <div class="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center text-3xl mb-5">
              🌍
            </div>
            <h3 class="text-2xl font-bold mb-3">Multi-idioma</h3>
            <p class="text-slate-400 leading-relaxed mb-5">
              Cria o teu CV em português, inglês, espanhol, francês ou alemão com apenas um clique.
            </p>
            <ul class="space-y-2 text-sm text-slate-500">
              <li class="flex items-start gap-2">
                <span class="text-orange-500 mt-0.5">→</span>
                Tradução profissional
              </li>
              <li class="flex items-start gap-2">
                <span class="text-orange-500 mt-0.5">→</span>
                Adaptação cultural
              </li>
              <li class="flex items-start gap-2">
                <span class="text-orange-500 mt-0.5">→</span>
                Múltiplas versões do mesmo CV
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="py-24">
      <div class="container mx-auto px-6">
        <div class="text-center mb-20">
          <h2 class="text-5xl font-extrabold mb-4">Como Funciona</h2>
          <p class="text-xl text-slate-400">Simples, rápido e eficaz</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center relative">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
              1
            </div>
            <h3 class="text-xl font-bold mb-3">Responde a Perguntas Simples</h3>
            <p class="text-slate-400">Experiência, formação, competências e cargo desejado. Simples e rápido.</p>
            <div class="hidden lg:block absolute top-8 -right-4 text-3xl text-blue-500/30">→</div>
          </div>

          <div class="text-center relative">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
              2
            </div>
            <h3 class="text-xl font-bold mb-3">A IA Trabalha por Ti</h3>
            <p class="text-slate-400">Melhora a redação, sugere competências e adapta o CV para ATS automaticamente.</p>
            <div class="hidden lg:block absolute top-8 -right-4 text-3xl text-blue-500/30">→</div>
          </div>

          <div class="text-center relative">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
              3
            </div>
            <h3 class="text-xl font-bold mb-3">Escolhe o Template</h3>
            <p class="text-slate-400">Seleciona o design mais adequado à tua área profissional.</p>
            <div class="hidden lg:block absolute top-8 -right-4 text-3xl text-blue-500/30">→</div>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
              4
            </div>
            <h3 class="text-xl font-bold mb-3">Download e Candidata-te</h3>
            <p class="text-slate-400">Exporta em PDF ou DOCX e começa a candidatar-te às melhores vagas.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="py-24 bg-gradient-to-b from-slate-950 to-slate-900/50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-20">
          <h2 class="text-5xl font-extrabold mb-4">Planos Para Todos</h2>
          <p class="text-xl text-slate-400">Escolhe o plano ideal para ti</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <!-- Free Plan -->
          <div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:border-blue-500/30 transition-all">
            <h3 class="text-2xl font-bold mb-2">Free</h3>
            <div class="mb-6">
              <span class="text-5xl font-bold text-blue-500">€0</span>
              <span class="text-slate-400">/mês</span>
            </div>
            <ul class="space-y-3 mb-8 text-slate-300">
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> 1 CV por mês</li>
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> AI Review básico</li>
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Templates gratuitos</li>
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Export PDF</li>
              <li class="flex items-center gap-2 text-slate-600"><span class="text-slate-600">✗</span> Job Match</li>
              <li class="flex items-center gap-2 text-slate-600"><span class="text-slate-600">✗</span> Career Copilot</li>
            </ul>
            <router-link to="/register" class="block w-full py-3 text-center border border-blue-500/30 text-blue-500 rounded-lg hover:bg-blue-500/10 transition-all">
              Começar Grátis
            </router-link>
          </div>

          <!-- Pro Plan -->
          <div class="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-8 transform scale-105 shadow-xl shadow-blue-500/20 relative">
            <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Mais Popular
            </div>
            <h3 class="text-2xl font-bold mb-2">Pro</h3>
            <div class="mb-6">
              <span class="text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">€10</span>
              <span class="text-slate-400">/mês</span>
            </div>
            <ul class="space-y-3 mb-8 text-slate-300">
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> CVs ilimitados</li>
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> AI Review completo</li>
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Job Match por vaga</li>
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Templates premium</li>
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Export PDF + DOCX</li>
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Multi-idioma</li>
              <li class="flex items-center gap-2 text-slate-600"><span class="text-slate-600">✗</span> Career Copilot</li>
            </ul>
            <router-link to="/register" class="block w-full py-3 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all font-semibold">
              Começar Agora
            </router-link>
          </div>

          <!-- Career+ Plan -->
          <div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:border-purple-500/30 transition-all">
            <h3 class="text-2xl font-bold mb-2">Career+</h3>
            <div class="mb-6">
              <span class="text-5xl font-bold text-purple-500">€25</span>
              <span class="text-slate-400">/mês</span>
            </div>
            <ul class="space-y-3 mb-8 text-slate-300">
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Tudo do Pro</li>
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Career Copilot</li>
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Simulação de entrevistas</li>
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Análise de carreira</li>
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Recomendação de cursos</li>
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Insights de mercado</li>
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Suporte prioritário</li>
            </ul>
            <router-link to="/register" class="block w-full py-3 text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all font-semibold">
              Impulsionar Carreira
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24">
      <div class="container mx-auto px-6">
        <div class="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-3xl p-16 text-center">
          <h2 class="text-5xl font-extrabold mb-6">Pronto para Criar o Teu CV Perfeito?</h2>
          <p class="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Junta-te a milhares de profissionais que já transformaram as suas carreiras.
          </p>
          <router-link to="/register" class="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-1 transition-all">
            Começar Gratuitamente
            <span>→</span>
          </router-link>
          <p class="text-sm text-slate-500 mt-4">Sem cartão de crédito necessário</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-slate-800 py-16">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <span class="text-2xl">📄</span>
              <span class="text-xl font-bold">
                CV<span class="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Builder</span>
              </span>
            </div>
            <p class="text-slate-400 text-sm">
              Cria currículos profissionais com IA em minutos.
            </p>
          </div>
          
          <div>
            <h4 class="font-semibold mb-4">Produto</h4>
            <div class="space-y-2">
              <a href="#features" class="block text-slate-400 hover:text-blue-500 text-sm transition-colors">Funcionalidades</a>
              <a href="#pricing" class="block text-slate-400 hover:text-blue-500 text-sm transition-colors">Planos</a>
              <a href="#" class="block text-slate-400 hover:text-blue-500 text-sm transition-colors">Templates</a>
            </div>
          </div>
          
          <div>
            <h4 class="font-semibold mb-4">Empresa</h4>
            <div class="space-y-2">
              <a href="#" class="block text-slate-400 hover:text-blue-500 text-sm transition-colors">Sobre</a>
              <a href="#" class="block text-slate-400 hover:text-blue-500 text-sm transition-colors">Blog</a>
              <a href="#" class="block text-slate-400 hover:text-blue-500 text-sm transition-colors">Contacto</a>
            </div>
          </div>
          
          <div>
            <h4 class="font-semibold mb-4">Legal</h4>
            <div class="space-y-2">
              <a href="#" class="block text-slate-400 hover:text-blue-500 text-sm transition-colors">Privacidade</a>
              <a href="#" class="block text-slate-400 hover:text-blue-500 text-sm transition-colors">Termos</a>
              <a href="#" class="block text-slate-400 hover:text-blue-500 text-sm transition-colors">Cookies</a>
            </div>
          </div>
        </div>
        
        <div class="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
          &copy; 2025 CVBuilder. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Home',
  mounted() {
    // Smooth scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
}
</script>

<style scoped>
/* Animação de perspectiva para o CV preview */
.perspective-1000 {
  perspective: 1000px;
}

.rotate-y-\[-5deg\] {
  transform: perspective(1000px) rotateY(-5deg);
}

/* Animação suave nos hovers */
@media (prefers-reduced-motion: no-preference) {
  * {
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
}

/* Scroll suave */
html {
  scroll-behavior: smooth;
}

/* Gradiente animado no hover dos cards */
.feature-card:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
}
</style>