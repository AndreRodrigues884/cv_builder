# 🤖 CV Builder ML Engine

Motor de Machine Learning para geração e otimização de CVs.

## 📦 Instalação

```bash
cd ml-engine
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

## 🚀 Uso Rápido

```bash
# 1. Gerar datasets
python scripts/generate_datasets.py

# 2. Validar qualidade
python scripts/validate_datasets.py

# 3. Exportar para backend
python scripts/export_to_backend.py
```

## 📊 Datasets Disponíveis

- **text_improvement**: 200+ exemplos de melhoria de texto
- **skills_database**: 500+ skills organizadas por área
- **summary_templates**: 150+ sumários profissionais
- **ats_keywords**: 1000+ keywords ATS por indústria