# Exemplos de Pagamento com Nova Lógica de Escudos

## 📊 **Nova Tabela de Planos**

| Plano | Preço | Escudos Mensais | Relação |
|-------|-------|-----------------|---------|
| **Basic** | R$ 49,90 | 50 escudos | 1 escudo = R$ 1,00 |
| **Gold** | R$ 79,90 | 80 escudos | 1 escudo = R$ 1,00 |
| **Diamond** | R$ 129,90 | 130 escudos | 1 escudo = R$ 1,00 |

## 🛒 **Exemplos de Compra de Cursos**

### **Exemplo 1: Curso de R$ 497,00**
- **Valor total**: R$ 497,00
- **Máximo de escudos permitidos**: 149 escudos (30% de R$ 497)
- **Valor restante em dinheiro**: R$ 348,00

**Cenários de pagamento:**
- ✅ **100 escudos + R$ 397,00** (dinheiro)
- ✅ **149 escudos + R$ 348,00** (dinheiro) - Máximo de escudos
- ❌ **200 escudos + R$ 297,00** (dinheiro) - Excede o limite de 30%

### **Exemplo 2: Curso de R$ 299,90**
- **Valor total**: R$ 299,90
- **Máximo de escudos permitidos**: 89 escudos (30% de R$ 299,90)
- **Valor restante em dinheiro**: R$ 210,90

**Cenários de pagamento:**
- ✅ **50 escudos + R$ 249,90** (dinheiro)
- ✅ **89 escudos + R$ 210,90** (dinheiro) - Máximo de escudos
- ❌ **100 escudos + R$ 199,90** (dinheiro) - Excede o limite de 30%

### **Exemplo 3: Curso de R$ 799,90**
- **Valor total**: R$ 799,90
- **Máximo de escudos permitidos**: 239 escudos (30% de R$ 799,90)
- **Valor restante em dinheiro**: R$ 560,90

**Cenários de pagamento:**
- ✅ **100 escudos + R$ 699,90** (dinheiro)
- ✅ **239 escudos + R$ 560,90** (dinheiro) - Máximo de escudos
- ❌ **300 escudos + R$ 499,90** (dinheiro) - Excede o limite de 30%

## 🎯 **Regras Implementadas**

### **1. Limite de 30% de Escudos**
- Máximo de escudos = `floor(Preço_do_curso × 0,30)`
- Garante que pelo menos 70% seja pago em dinheiro

### **2. Pagamento Híbrido**
- Usuário pode escolher quantos escudos usar (até o limite)
- Valor restante é cobrado via Stripe
- Sistema FIFO para usar escudos

### **3. Escudos de Compra Direta**
- **1 escudo = R$ 1,00**
- Usuário ganha escudos equivalentes ao valor pago em dinheiro
- Exemplo: Paga R$ 300 → Ganha 300 escudos

### **4. Validade dos Escudos**
- **12 meses** para todos os escudos
- **Cumulativo** - escudos se acumulam
- **FIFO** - usa os escudos mais antigos primeiro

## 🔄 **Fluxo de Pagamento**

1. **Usuário seleciona curso** (ex: R$ 497)
2. **Sistema calcula limite** (máx. 149 escudos)
3. **Usuário escolhe quantos escudos usar** (ex: 100 escudos)
4. **Sistema calcula valor restante** (R$ 397)
5. **Pagamento via Stripe** (R$ 397)
6. **Sistema usa escudos** (100 escudos)
7. **Usuário ganha escudos** (497 escudos pela compra)
8. **Matrícula no curso** ✅

## 📈 **Benefícios da Nova Lógica**

- **Flexibilidade**: Usuário escolhe quanto usar de escudos
- **Limite justo**: Máximo 30% evita abuso
- **Incentivo**: Compra direta gera escudos proporcionais
- **Transparência**: Relação 1:1 é fácil de entender
- **Sustentabilidade**: Garante receita mínima em dinheiro
