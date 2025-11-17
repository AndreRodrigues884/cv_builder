"""
✅ CV Builder - Dataset Validator
Valida qualidade e integridade dos datasets gerados

Este script verifica:
- Estrutura correta dos JSONs
- Campos obrigatórios presentes
- Ranges de valores válidos
- Consistência dos dados
- Qualidade do conteúdo

Uso:
    python scripts/validate_datasets.py
"""

import json
from pathlib import Path
from typing import List, Dict, Tuple
from collections import Counter

class DatasetValidator:
    def __init__(self):
        self.datasets_dir = Path("datasets/processed")
        self.errors = []
        self.warnings = []
        self.stats = {}
    
    def validate_text_improvement(self, data: dict) -> Tuple[List[str], List[str]]:
        """Valida dataset de melhoria de texto"""
        errors = []
        warnings = []
        
        print("📝 Validando text_improvement.json...")
        
        # Validar estrutura principal
        if "by_section" not in data:
            errors.append("❌ Missing 'by_section' key in root")
            return errors, warnings
        
        if "metadata" not in data:
            warnings.append("⚠️  Missing 'metadata' in root (opcional mas recomendado)")
        
        sections = data["by_section"]
        total_examples = 0
        section_stats = {}
        
        # Validar cada secção
        for section_name, examples in sections.items():
            if not isinstance(examples, list):
                errors.append(f"❌ Section '{section_name}' should be a list, got {type(examples).__name__}")
                continue
            
            total_examples += len(examples)
            section_stats[section_name] = {
                'count': len(examples),
                'avg_ats_score': 0,
                'avg_quality_score': 0
            }
            
            ats_scores = []
            quality_scores = []
            
            # Validar cada exemplo
            for idx, example in enumerate(examples):
                example_id = example.get('id', f'{section_name}_{idx}')
                
                # 1. Campos obrigatórios
                required_fields = ['original', 'improved', 'keywords']
                for field in required_fields:
                    if field not in example:
                        errors.append(f"❌ [{example_id}] Missing required field: '{field}'")
                    elif not example[field]:
                        errors.append(f"❌ [{example_id}] Field '{field}' is empty")
                
                # 2. Validar que o texto melhorado é diferente do original
                if example.get('original') and example.get('improved'):
                    if example['original'] == example['improved']:
                        warnings.append(f"⚠️  [{example_id}] 'improved' is identical to 'original'")
                    
                    # Verificar se melhorou (geralmente mais longo e detalhado)
                    original_len = len(example['original'])
                    improved_len = len(example['improved'])
                    
                    if improved_len < original_len * 0.5:
                        warnings.append(f"⚠️  [{example_id}] 'improved' is much shorter than 'original' ({improved_len} vs {original_len} chars)")
                    elif improved_len < original_len:
                        warnings.append(f"⚠️  [{example_id}] 'improved' is shorter than 'original'")
                    
                    # Verificar se tem verbos de ação
                    action_verbs = ['desenvolvi', 'implementei', 'geri', 'liderei', 'otimizei', 'aumentei', 'reduzi']
                    has_action_verb = any(verb in example['improved'].lower() for verb in action_verbs)
                    if not has_action_verb and section_name == 'experience':
                        warnings.append(f"⚠️  [{example_id}] 'improved' doesn't contain strong action verbs")
                
                # 3. Validar keywords
                if 'keywords' in example:
                    if not isinstance(example['keywords'], list):
                        errors.append(f"❌ [{example_id}] 'keywords' should be a list, got {type(example['keywords']).__name__}")
                    elif len(example['keywords']) == 0:
                        warnings.append(f"⚠️  [{example_id}] 'keywords' list is empty")
                    elif len(example['keywords']) < 3:
                        warnings.append(f"⚠️  [{example_id}] Only {len(example['keywords'])} keywords (recommended: 5+)")
                
                # 4. Validar ATS score
                if 'ats_score' in example:
                    score = example['ats_score']
                    if not isinstance(score, (int, float)):
                        errors.append(f"❌ [{example_id}] 'ats_score' should be a number, got {type(score).__name__}")
                    elif not (0 <= score <= 100):
                        errors.append(f"❌ [{example_id}] 'ats_score' out of range (0-100): {score}")
                    else:
                        ats_scores.append(score)
                        if score < 70:
                            warnings.append(f"⚠️  [{example_id}] Low ATS score: {score}")
                
                # 5. Validar quality_score
                if 'quality_score' in example:
                    score = example['quality_score']
                    if not isinstance(score, (int, float)):
                        errors.append(f"❌ [{example_id}] 'quality_score' should be a number, got {type(score).__name__}")
                    elif not (0 <= score <= 100):
                        errors.append(f"❌ [{example_id}] 'quality_score' out of range (0-100): {score}")
                    else:
                        quality_scores.append(score)
                
                # 6. Validar improvements (se existir)
                if 'improvements' in example:
                    if not isinstance(example['improvements'], list):
                        errors.append(f"❌ [{example_id}] 'improvements' should be a list")
            
            # Calcular médias
            if ats_scores:
                section_stats[section_name]['avg_ats_score'] = sum(ats_scores) / len(ats_scores)
            if quality_scores:
                section_stats[section_name]['avg_quality_score'] = sum(quality_scores) / len(quality_scores)
        
        self.stats['text_improvement'] = {
            'total_examples': total_examples,
            'sections': len(sections),
            'section_breakdown': section_stats
        }
        
        return errors, warnings
    
    def validate_skills_database(self, data: dict) -> Tuple[List[str], List[str]]:
        """Valida database de skills"""
        errors = []
        warnings = []
        
        print("💼 Validando skills_by_area.json...")
        
        total_skills = 0
        areas_count = 0
        priority_distribution = Counter()
        demand_scores = []
        
        for area_name, area_data in data.items():
            if area_name == 'metadata':
                continue
            
            areas_count += 1
            
            if not isinstance(area_data, dict):
                errors.append(f"❌ Area '{area_name}' should be an object, got {type(area_data).__name__}")
                continue
            
            # Processar cada categoria dentro da área
            for category, category_data in area_data.items():
                
                # Pode ser lista de skills ou nested dict
                if isinstance(category_data, list):
                    skills = category_data
                elif isinstance(category_data, dict):
                    # Nested structure (ex: technology.frontend)
                    continue
                else:
                    warnings.append(f"⚠️  Category '{area_name}.{category}' has unexpected type: {type(category_data).__name__}")
                    continue
                
                total_skills += len(skills)
                
                # Validar cada skill
                for idx, skill in enumerate(skills):
                    skill_name = skill.get('name', f'{area_name}.{category}[{idx}]')
                    
                    # 1. Campos obrigatórios
                    required_fields = ['name', 'priority', 'demand_score']
                    for field in required_fields:
                        if field not in skill:
                            errors.append(f"❌ [{skill_name}] Missing required field: '{field}'")
                        elif skill[field] is None or skill[field] == '':
                            errors.append(f"❌ [{skill_name}] Field '{field}' is empty")
                    
                    # 2. Validar priority
                    if 'priority' in skill:
                        valid_priorities = ['high', 'medium', 'low']
                        if skill['priority'] not in valid_priorities:
                            errors.append(f"❌ [{skill_name}] Invalid priority: '{skill['priority']}' (must be: {', '.join(valid_priorities)})")
                        else:
                            priority_distribution[skill['priority']] += 1
                    
                    # 3. Validar demand_score
                    if 'demand_score' in skill:
                        score = skill['demand_score']
                        if not isinstance(score, (int, float)):
                            errors.append(f"❌ [{skill_name}] 'demand_score' should be a number, got {type(score).__name__}")
                        elif not (0 <= score <= 100):
                            errors.append(f"❌ [{skill_name}] 'demand_score' out of range (0-100): {score}")
                        else:
                            demand_scores.append(score)
                            if score < 50:
                                warnings.append(f"⚠️  [{skill_name}] Low demand score: {score}")
                    
                    # 4. Validar salary_impact (opcional mas deve ter formato correto)
                    if 'salary_impact' in skill:
                        impact = skill['salary_impact']
                        if not isinstance(impact, str):
                            errors.append(f"❌ [{skill_name}] 'salary_impact' should be a string")
                        elif not impact.startswith('+') or not impact.endswith('%'):
                            warnings.append(f"⚠️  [{skill_name}] 'salary_impact' should be in format '+X%', got '{impact}'")
                    
                    # 5. Validar related_skills
                    if 'related_skills' in skill:
                        if not isinstance(skill['related_skills'], list):
                            errors.append(f"❌ [{skill_name}] 'related_skills' should be a list")
                        elif len(skill['related_skills']) == 0:
                            warnings.append(f"⚠️  [{skill_name}] 'related_skills' is empty")
                    
                    # 6. Validar category (recomendado)
                    if 'category' not in skill:
                        warnings.append(f"⚠️  [{skill_name}] Missing 'category' field (recomendado)")
        
        self.stats['skills_database'] = {
            'total_skills': total_skills,
            'areas': areas_count,
            'priority_distribution': dict(priority_distribution),
            'avg_demand_score': sum(demand_scores) / len(demand_scores) if demand_scores else 0
        }
        
        return errors, warnings
    
    def validate_ats_keywords(self, data: dict) -> Tuple[List[str], List[str]]:
        """Valida keywords ATS"""
        errors = []
        warnings = []
        
        print("🔑 Validando ats_keywords.json...")
        
        total_keywords = 0
        areas_count = 0
        
        for area_name, area_data in data.items():
            if area_name == 'metadata':
                continue
            
            areas_count += 1
            
            if not isinstance(area_data, dict):
                errors.append(f"❌ Area '{area_name}' should be an object, got {type(area_data).__name__}")
                continue
            
            # Validar cada categoria de keywords
            for category, keywords in area_data.items():
                if not isinstance(keywords, list):
                    errors.append(f"❌ Category '{area_name}.{category}' should be a list, got {type(keywords).__name__}")
                    continue
                
                total_keywords += len(keywords)
                
                if len(keywords) == 0:
                    warnings.append(f"⚠️  Category '{area_name}.{category}' is empty")
                elif len(keywords) < 5:
                    warnings.append(f"⚠️  Category '{area_name}.{category}' has only {len(keywords)} keywords (recommended: 5+)")
                
                # Verificar se keywords são strings válidas
                for idx, keyword in enumerate(keywords):
                    if not isinstance(keyword, str):
                        errors.append(f"❌ [{area_name}.{category}[{idx}]] Keyword should be string, got {type(keyword).__name__}")
                    elif not keyword.strip():
                        errors.append(f"❌ [{area_name}.{category}[{idx}]] Keyword is empty")
        
        self.stats['ats_keywords'] = {
            'total_keywords': total_keywords,
            'areas': areas_count,
            'avg_keywords_per_area': total_keywords / areas_count if areas_count > 0 else 0
        }
        
        return errors, warnings
    
    def validate_summary_templates(self, data: dict) -> Tuple[List[str], List[str]]:
        """Valida templates de sumários (se existir)"""
        errors = []
        warnings = []
        
        print("📝 Validando summary_templates.json...")
        
        if 'templates_by_role' not in data:
            warnings.append("⚠️  Missing 'templates_by_role' key (opcional)")
            return errors, warnings
        
        templates_by_role = data['templates_by_role']
        total_roles = len(templates_by_role)
        
        for role, levels in templates_by_role.items():
            if not isinstance(levels, dict):
                errors.append(f"❌ Role '{role}' should have levels as object")
                continue
            
            # Verificar se tem pelo menos um nível
            if len(levels) == 0:
                warnings.append(f"⚠️  Role '{role}' has no seniority levels")
        
        self.stats['summary_templates'] = {
            'total_roles': total_roles
        }
        
        return errors, warnings
    
    def validate_all(self):
        """Valida todos os datasets"""
        print("\n" + "="*70)
        print("✅ CV Builder - Dataset Validation")
        print("="*70)
        print()
        
        # Verificar se pasta existe
        if not self.datasets_dir.exists():
            print(f"❌ Erro: Pasta {self.datasets_dir} não encontrada!")
            print(f"💡 Execute primeiro: python scripts/generate_datasets.py")
            return False
        
        all_valid = True
        files_found = 0
        
        # Lista de arquivos esperados
        expected_files = [
            ('text_improvement.json', self.validate_text_improvement),
            ('skills_by_area.json', self.validate_skills_database),
            ('ats_keywords.json', self.validate_ats_keywords),
            ('summary_templates.json', self.validate_summary_templates)
        ]
        
        # Validar cada arquivo
        for filename, validator_func in expected_files:
            file_path = self.datasets_dir / filename
            
            if file_path.exists():
                files_found += 1
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    errors, warnings = validator_func(data)
                    self.errors.extend(errors)
                    self.warnings.extend(warnings)
                    
                    if errors:
                        print(f"   ❌ {len(errors)} erros encontrados")
                        all_valid = False
                    else:
                        print(f"   ✅ Nenhum erro")
                    
                    if warnings:
                        print(f"   ⚠️  {len(warnings)} avisos")
                    
                    print()
                    
                except json.JSONDecodeError as e:
                    print(f"   ❌ Erro ao parsear JSON: {e}")
                    print()
                    all_valid = False
                except Exception as e:
                    print(f"   ❌ Erro inesperado: {e}")
                    print()
                    all_valid = False
            else:
                if filename != 'summary_templates.json':  # Opcional
                    print(f"⚠️  {filename} não encontrado")
                    print()
        
        if files_found == 0:
            print("❌ Nenhum dataset encontrado!")
            print("💡 Execute: python scripts/generate_datasets.py")
            return False
        
        # Mostrar erros detalhados
        print("="*70)
        
        if self.errors:
            print(f"\n❌ ERROS CRÍTICOS ({len(self.errors)}):")
            print("-"*70)
            for i, error in enumerate(self.errors[:15], 1):  # Mostrar primeiros 15
                print(f"{i:2}. {error}")
            if len(self.errors) > 15:
                print(f"\n   ... e mais {len(self.errors) - 15} erros")
        
        # Mostrar avisos
        if self.warnings:
            print(f"\n⚠️  AVISOS ({len(self.warnings)}):")
            print("-"*70)
            for i, warning in enumerate(self.warnings[:15], 1):  # Mostrar primeiros 15
                print(f"{i:2}. {warning}")
            if len(self.warnings) > 15:
                print(f"\n   ... e mais {len(self.warnings) - 15} avisos")
        
        # Estatísticas
        if self.stats:
            print(f"\n📊 ESTATÍSTICAS GERAIS:")
            print("-"*70)
            for dataset_name, stats in self.stats.items():
                print(f"\n📁 {dataset_name}:")
                for key, value in stats.items():
                    if isinstance(value, dict):
                        print(f"   • {key}:")
                        for k, v in value.items():
                            if isinstance(v, float):
                                print(f"      - {k}: {v:.2f}")
                            else:
                                print(f"      - {k}: {v}")
                    elif isinstance(value, float):
                        print(f"   • {key}: {value:.2f}")
                    else:
                        print(f"   • {key}: {value}")
        
        print("\n" + "="*70)
        
        # Resultado final
        if all_valid and not self.errors:
            print("✨ VALIDAÇÃO COMPLETA: Todos os datasets estão válidos!")
            if self.warnings:
                print(f"⚠️  Existem {len(self.warnings)} avisos - recomendado corrigir")
            print("\n🎯 Próximo passo: python scripts/export_to_backend.py")
            return True
        else:
            print("❌ VALIDAÇÃO FALHOU: Corrija os erros críticos antes de prosseguir")
            print(f"\n📊 Resumo:")
            print(f"   • Erros: {len(self.errors)}")
            print(f"   • Avisos: {len(self.warnings)}")
            return False

def main():
    """Função principal"""
    validator = DatasetValidator()
    success = validator.validate_all()
    
    # Exit code: 0 = sucesso, 1 = falhou
    exit(0 if success else 1)

if __name__ == "__main__":
    main()