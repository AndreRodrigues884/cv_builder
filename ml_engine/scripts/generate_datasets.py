"""
🎯 CV Builder - Dataset Generator
Gera datasets completos para melhoria de CVs com IA

Uso:
    python scripts/generate_datasets.py
"""

import json
import pandas as pd
from pathlib import Path
from datetime import datetime
from typing import List, Dict

class CVDatasetGenerator:
    def __init__(self):
        self.output_dir = Path("datasets/processed")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def generate_text_improvement_dataset(self) -> List[Dict]:
        """Gera dataset para melhoria de texto"""
        print("📝 Gerando dataset de melhoria de texto...")
        
        dataset = []
        
        # ========== EXPERIÊNCIAS PROFISSIONAIS ==========
        experiences = [
            {
                "id": "exp_001",
                "original": "Trabalhei como desenvolvedor na empresa X",
                "section": "experience",
                "improved": "Desenvolvi e mantive aplicações web full-stack utilizando React e Node.js, resultando em aumento de 30% na eficiência operacional e redução de 25% no tempo de resposta",
                "improvements": ["verbo de ação forte", "tecnologias específicas", "quantificação de resultados", "impacto mensurável"],
                "keywords": ["desenvolvi", "mantive", "React", "Node.js", "30%", "25%", "full-stack"],
                "ats_score": 88,
                "industry": "technology",
                "seniority": "mid-level"
            },
            {
                "id": "exp_002",
                "original": "Fiz gestão de projetos na empresa",
                "section": "experience",
                "improved": "Geri portfolio de 15 projetos simultâneos com orçamento total de €500K, entregando 95% dentro do prazo estabelecido e 20% abaixo do orçamento previsto",
                "improvements": ["quantificação clara", "métricas financeiras", "taxa de sucesso", "gestão de recursos"],
                "keywords": ["geri", "15 projetos", "€500K", "95%", "20%", "portfolio"],
                "ats_score": 92,
                "industry": "project_management",
                "seniority": "senior"
            },
            {
                "id": "exp_003",
                "original": "Ajudei a equipa com várias tarefas",
                "section": "experience",
                "improved": "Colaborei com equipa cross-functional de 12 pessoas na implementação da metodologia Agile/Scrum, reduzindo time-to-market em 40% e aumentando satisfação do cliente para 4.8/5",
                "improvements": ["especificidade", "tamanho da equipa", "metodologia clara", "impacto medido"],
                "keywords": ["colaborei", "cross-functional", "12 pessoas", "Agile", "Scrum", "40%", "4.8/5"],
                "ats_score": 90,
                "industry": "technology",
                "seniority": "mid-level"
            },
            {
                "id": "exp_004",
                "original": "Trabalhei em marketing digital",
                "section": "experience",
                "improved": "Executei campanhas de marketing digital multi-canal em Google Ads, Meta Ads e LinkedIn, gerando 150K+ impressões, 12K leads qualificados e ROI de 320%",
                "improvements": ["plataformas específicas", "métricas de performance", "ROI claro", "volume de resultados"],
                "keywords": ["executei", "Google Ads", "Meta Ads", "LinkedIn", "150K+", "12K leads", "320%"],
                "ats_score": 94,
                "industry": "marketing",
                "seniority": "mid-level"
            },
            {
                "id": "exp_005",
                "original": "Dei suporte técnico aos clientes",
                "section": "experience",
                "improved": "Prestei suporte técnico de nível 2 a 200+ clientes mensais via Zendesk e Slack, mantendo NPS de 87, CSAT de 4.6/5 e reduzindo tempo médio de resolução em 35%",
                "improvements": ["nível de suporte", "volume quantificado", "métricas de satisfação", "ferramentas usadas"],
                "keywords": ["prestei", "nível 2", "200+", "Zendesk", "Slack", "NPS 87", "CSAT 4.6", "35%"],
                "ats_score": 86,
                "industry": "customer_support",
                "seniority": "junior"
            }
        ]
        
        # ========== SUMÁRIOS PROFISSIONAIS ==========
        summaries = [
            {
                "id": "sum_001",
                "original": "Sou dedicado e gosto de trabalhar em equipa",
                "section": "summary",
                "improved": "Engenheiro de Software com 5+ anos de experiência em desenvolvimento full-stack (React, Node.js, Python), especializado em arquiteturas cloud-native e microservices. Histórico comprovado de entrega de soluções escaláveis que aumentaram eficiência operacional em 40% e geraram €2M+ em valor de negócio",
                "improvements": ["título profissional claro", "anos de experiência", "stack tecnológico", "resultados de negócio"],
                "keywords": ["5+ anos", "full-stack", "React", "Node.js", "Python", "cloud-native", "40%", "€2M+"],
                "ats_score": 91,
                "industry": "technology",
                "seniority": "mid-level"
            },
            {
                "id": "sum_002",
                "original": "Tenho experiência em várias áreas",
                "section": "summary",
                "improved": "Product Manager com 7 anos gerindo roadmaps de produtos SaaS B2B em fintechs e healthtechs. Track record de 5 lançamentos bem-sucedidos que alcançaram 50K+ utilizadores, €3M ARR e 15% market share. Certificado PSPO III e PSM II pela Scrum.org",
                "improvements": ["role específico", "tipo de produto", "indústrias", "certificações"],
                "keywords": ["Product Manager", "7 anos", "SaaS B2B", "50K+", "€3M ARR", "PSPO III", "PSM II"],
                "ats_score": 95,
                "industry": "product_management",
                "seniority": "senior"
            }
        ]
        
        # ========== EDUCAÇÃO ==========
        education = [
            {
                "id": "edu_001",
                "original": "Licenciatura em Informática",
                "section": "education",
                "improved": "Licenciatura em Engenharia Informática - Universidade do Minho (2018-2021) | Média: 16/20 | Projeto Final: Sistema de Gestão de CVs com IA (classificação: 18/20)",
                "improvements": ["nome completo do curso", "instituição", "período", "média", "projeto relevante"],
                "keywords": ["Engenharia Informática", "Universidade do Minho", "16/20", "IA", "18/20"],
                "ats_score": 85
            }
        ]
        
        # ========== SKILLS ==========
        skills = [
            {
                "id": "ski_001",
                "original": "Python, Excel",
                "section": "skills",
                "improved": "Python (NumPy, Pandas, Scikit-learn) | Excel Avançado (Power Query, VBA, Macros) | SQL (PostgreSQL, MySQL) | Git/GitHub",
                "improvements": ["bibliotecas específicas", "nível avançado", "ferramentas relacionadas"],
                "keywords": ["Python", "NumPy", "Pandas", "Excel Avançado", "SQL", "PostgreSQL", "Git"],
                "ats_score": 87
            }
        ]
        
        # Combinar tudo
        dataset.extend(experiences)
        dataset.extend(summaries)
        dataset.extend(education)
        dataset.extend(skills)
        
        # Adicionar metadata
        for item in dataset:
            item['created_at'] = datetime.now().isoformat()
            item['language'] = 'pt-PT'
        
        return dataset
    
    def generate_skills_database(self) -> Dict:
        """Gera base de dados completa de skills por área"""
        print("💡 Gerando database de skills...")
        
        database = {
            "technology": {
                "frontend": [
                    {"name": "React", "priority": "high", "demand_score": 95, "salary_impact": "+18%"},
                    {"name": "Vue.js", "priority": "high", "demand_score": 85, "salary_impact": "+15%"},
                    {"name": "TypeScript", "priority": "high", "demand_score": 92, "salary_impact": "+20%"},
                    {"name": "Next.js", "priority": "high", "demand_score": 88, "salary_impact": "+16%"},
                    {"name": "Tailwind CSS", "priority": "medium", "demand_score": 82, "salary_impact": "+10%"},
                ],
                "backend": [
                    {"name": "Node.js", "priority": "high", "demand_score": 93, "salary_impact": "+18%"},
                    {"name": "Python", "priority": "high", "demand_score": 96, "salary_impact": "+22%"},
                    {"name": "Django", "priority": "medium", "demand_score": 80, "salary_impact": "+15%"},
                    {"name": "FastAPI", "priority": "medium", "demand_score": 78, "salary_impact": "+14%"},
                    {"name": "GraphQL", "priority": "medium", "demand_score": 75, "salary_impact": "+12%"},
                ],
                "devops": [
                    {"name": "Docker", "priority": "high", "demand_score": 94, "salary_impact": "+20%"},
                    {"name": "Kubernetes", "priority": "high", "demand_score": 90, "salary_impact": "+25%"},
                    {"name": "AWS", "priority": "high", "demand_score": 92, "salary_impact": "+22%"},
                    {"name": "Terraform", "priority": "high", "demand_score": 85, "salary_impact": "+18%"},
                    {"name": "CI/CD", "priority": "high", "demand_score": 91, "salary_impact": "+17%"},
                ],
                "database": [
                    {"name": "PostgreSQL", "priority": "high", "demand_score": 90, "salary_impact": "+15%"},
                    {"name": "MongoDB", "priority": "high", "demand_score": 85, "salary_impact": "+11%"},
                    {"name": "Redis", "priority": "medium", "demand_score": 78, "salary_impact": "+10%"},
                    {"name": "MySQL", "priority": "medium", "demand_score": 82, "salary_impact": "+9%"},
                ]
            },
            "marketing": {
                "digital_marketing": [
                    {"name": "Google Ads", "priority": "high", "demand_score": 90, "salary_impact": "+18%"},
                    {"name": "Meta Ads", "priority": "high", "demand_score": 88, "salary_impact": "+17%"},
                    {"name": "SEO", "priority": "high", "demand_score": 92, "salary_impact": "+16%"},
                    {"name": "Google Analytics", "priority": "high", "demand_score": 95, "salary_impact": "+12%"},
                ]
            },
            "soft_skills": [
                {"name": "Liderança", "priority": "high", "demand_score": 98, "salary_impact": "+25%"},
                {"name": "Comunicação", "priority": "high", "demand_score": 99, "salary_impact": "+15%"},
                {"name": "Trabalho em Equipa", "priority": "high", "demand_score": 97, "salary_impact": "+12%"},
                {"name": "Resolução de Problemas", "priority": "high", "demand_score": 96, "salary_impact": "+18%"},
            ]
        }
        
        return database
    
    def generate_ats_keywords(self) -> Dict:
        """Gera keywords ATS por área profissional"""
        print("🔑 Gerando keywords ATS...")
        
        keywords = {
            "technology": {
                "must_have": ["desenvolveu", "implementou", "arquitetou", "otimizou", "escalou"],
                "strong": ["liderou", "geri", "mentorizou", "aumentou", "reduziu"],
                "metrics": ["% de melhoria", "utilizadores", "transações", "uptime"]
            },
            "marketing": {
                "must_have": ["executou", "otimizou", "analisou", "aumentou", "geriu"],
                "strong": ["lançou", "desenvolveu", "coordenou", "maximizou"],
                "metrics": ["ROI", "conversão", "engagement", "reach", "impressões"]
            }
        }
        
        return keywords
    
    def save_all_datasets(self):
        """Salva todos os datasets"""
        print("\n🚀 Iniciando geração de datasets...")
        print("="*60)
        
        # 1. Text Improvement
        text_data = self.generate_text_improvement_dataset()
        
        # Organizar por secção
        organized_data = {
            "metadata": {
                "version": "1.0.0",
                "created_at": datetime.now().isoformat(),
                "total_examples": len(text_data),
                "description": "Dataset processado para melhoria de texto em CVs"
            },
            "by_section": {
                "experience": [item for item in text_data if item["section"] == "experience"],
                "summary": [item for item in text_data if item["section"] == "summary"],
                "education": [item for item in text_data if item["section"] == "education"],
                "skills": [item for item in text_data if item["section"] == "skills"]
            }
        }
        
        with open(self.output_dir / "text_improvement.json", "w", encoding="utf-8") as f:
            json.dump(organized_data, f, ensure_ascii=False, indent=2)
        print(f"✅ text_improvement.json: {len(text_data)} exemplos")
        
        # 2. Skills Database
        skills_data = self.generate_skills_database()
        skills_with_metadata = {
            "metadata": {
                "version": "1.0.0",
                "created_at": datetime.now().isoformat(),
                "description": "Base de dados de skills por área profissional"
            },
            **skills_data
        }
        
        with open(self.output_dir / "skills_by_area.json", "w", encoding="utf-8") as f:
            json.dump(skills_with_metadata, f, ensure_ascii=False, indent=2)
        
        total_skills = sum(
            len(v) if isinstance(v, list) else sum(len(vv) for vv in v.values() if isinstance(vv, list))
            for k, v in skills_data.items()
        )
        print(f"✅ skills_by_area.json: {total_skills} skills")
        
        # 3. ATS Keywords
        ats_data = self.generate_ats_keywords()
        ats_with_metadata = {
            "metadata": {
                "version": "1.0.0",
                "created_at": datetime.now().isoformat(),
                "description": "Keywords ATS otimizadas por área"
            },
            **ats_data
        }
        
        with open(self.output_dir / "ats_keywords.json", "w", encoding="utf-8") as f:
            json.dump(ats_with_metadata, f, ensure_ascii=False, indent=2)
        print(f"✅ ats_keywords.json: {len(ats_data)} categorias")
        
        print("\n" + "="*60)
        print("✨ Datasets gerados com sucesso!")
        print(f"📁 Localização: {self.output_dir.absolute()}")
        print("\n💡 Próximo passo: python scripts/export_to_backend.py")

if __name__ == "__main__":
    generator = CVDatasetGenerator()
    generator.save_all_datasets()