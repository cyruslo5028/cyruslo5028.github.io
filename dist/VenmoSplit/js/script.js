/* VenmoSplit (Neon Edition)
 * 
 * UI: fully rewritten (no jQuery).
 * 
 * IMPORTANT: The core split calculation logic is preserved from legacy script.js.
 * Legacy comment:
 *   Calculation:
 *     Each Person: Price + tax * (Price)/(Total Price w/o tax)
 * Legacy implementation actually uses (total including tax) in the divisor.
 * We keep it EXACTLY the same for backward-compat results.
 */

const $ = (sel) => /** @type {HTMLElement} */ (document.querySelector(sel))

/** @type {{ step: 1|2|3|4, numberppl: number, users: string[], prices: number[], tax: number }} */
const state = {
  step: 1,
  numberppl: 0,
  users: [],
  prices: [],
  tax: 0,
}

const stepEls = {
  1: $('#step-1'),
  2: $('#step-2'),
  3: $('#step-3'),
  4: $('#step-4'),
}

const namesContainer = $('#names-container')
const pricesContainer = $('#prices-container')

const peopleInput = /** @type {HTMLInputElement} */ ($('#input-people'))
const taxInput = /** @type {HTMLInputElement} */ ($('#input-tax'))
const taxPreview = $('#tax-preview')
const summaryPreview = $('#summary-preview')

const resultTable = $('#result-table')
const btnCopy = /** @type {HTMLButtonElement} */ ($('#btn-copy'))

function setActiveStep(step) {
  state.step = step

  Object.entries(stepEls).forEach(([k, el]) => {
    if (!el) return
    el.classList.toggle('hidden', Number(k) !== step)
  })

  document.querySelectorAll('[data-step-chip]').forEach((chip) => {
    chip.setAttribute('data-active', chip.getAttribute('data-step-chip') === String(step) ? '1' : '0')
  })
}

function resetAll() {
  state.step = 1
  state.numberppl = 0
  state.users = []
  state.prices = []
  state.tax = 0

  peopleInput.value = ''
  taxInput.value = ''
  taxPreview.textContent = 'Tax+Tips: $0.00'
  summaryPreview.textContent = 'total: $0.00'
  namesContainer.innerHTML = ''
  pricesContainer.innerHTML = ''
  resultTable.innerHTML = ''

  setActiveStep(1)
}

function toFixed2(n) {
  return (Math.round(n * 100) / 100).toFixed(2)
}

function tryEvalMoney(raw) {
  const n = evalMathExpression(raw)
  if (!Number.isFinite(n)) return 0
  return Number(toFixed2(n))
}

function evalMathExpression(raw) {
  const expr = String(raw ?? '').trim()
  if (!expr) return NaN

  // Allow only numbers, operators, parentheses, and whitespace
  if (/[^0-9+\-*/().\s]/.test(expr)) return NaN

  const tokens = tokenize(expr)
  if (!tokens.length) return NaN

  const rpn = toRpn(tokens)
  if (!rpn) return NaN

  return evalRpn(rpn)
}

function tokenize(expr) {
  /** @type {string[]} */
  const out = []
  let i = 0
  let lastType = 'start' // start | number | op | lparen | rparen

  const pushOp = (op) => {
    // Handle unary +/- by turning it into 0 +/- <expr>
    if ((op === '+' || op === '-') && (lastType === 'start' || lastType === 'op' || lastType === 'lparen')) {
      out.push('0')
    }
    out.push(op)
    lastType = 'op'
  }

  while (i < expr.length) {
    const ch = expr[i]

    if (ch === ' ' || ch === '\t' || ch === '\n') {
      i += 1
      continue
    }

    if (ch === '(') {
      out.push('(')
      lastType = 'lparen'
      i += 1
      continue
    }

    if (ch === ')') {
      out.push(')')
      lastType = 'rparen'
      i += 1
      continue
    }

    if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      pushOp(ch)
      i += 1
      continue
    }

    // number
    if ((ch >= '0' && ch <= '9') || ch === '.') {
      let j = i
      while (j < expr.length) {
        const c = expr[j]
        if ((c >= '0' && c <= '9') || c === '.') {
          j += 1
          continue
        }
        break
      }

      const num = expr.slice(i, j)
      if (num === '.') return []

      out.push(num)
      lastType = 'number'
      i = j
      continue
    }

    return []
  }

  return out
}

function toRpn(tokens) {
  /** @type {string[]} */
  const output = []
  /** @type {string[]} */
  const ops = []

  const prec = (op) => {
    if (op === '+' || op === '-') return 1
    if (op === '*' || op === '/') return 2
    return 0
  }

  for (const t of tokens) {
    if (t === '(') {
      ops.push(t)
      continue
    }

    if (t === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') {
        output.push(ops.pop())
      }
      if (!ops.length) return null
      ops.pop() // remove '('
      continue
    }

    if (t === '+' || t === '-' || t === '*' || t === '/') {
      while (ops.length && prec(ops[ops.length - 1]) >= prec(t)) {
        const top = ops[ops.length - 1]
        if (top === '(') break
        output.push(ops.pop())
      }
      ops.push(t)
      continue
    }

    // number token
    output.push(t)
  }

  while (ops.length) {
    const op = ops.pop()
    if (op === '(' || op === ')') return null
    output.push(op)
  }

  return output
}

function evalRpn(rpn) {
  /** @type {number[]} */
  const stack = []

  for (const t of rpn) {
    if (t === '+' || t === '-' || t === '*' || t === '/') {
      const b = stack.pop()
      const a = stack.pop()
      if (a === undefined || a === null || b === undefined || b === null) return NaN

      if (t === '+') stack.push(a + b)
      if (t === '-') stack.push(a - b)
      if (t === '*') stack.push(a * b)
      if (t === '/') stack.push(a / b)
      continue
    }

    const n = Number(t)
    if (Number.isNaN(n)) return NaN
    stack.push(n)
  }

  return stack.length === 1 ? stack[0] : NaN
}

function renderNameInputs() {
  namesContainer.innerHTML = ''

  for (let i = 0; i < state.numberppl; i += 1) {
    const wrap = document.createElement('div')
    wrap.className = 'rounded-2xl border border-white/10 bg-white/5 p-4'

    wrap.innerHTML = `
      <div class="text-xs text-white/60">Person ${i + 1}</div>
      <input
        id="name-${i}"
        required
        class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] outline-none transition focus:border-cyan-300/50 focus:shadow-neon"
        placeholder="Name"
      />
    `

    namesContainer.appendChild(wrap)
  }
}

function renderPriceInputs() {
  pricesContainer.innerHTML = ''

  for (let i = 0; i < state.numberppl; i += 1) {
    const wrap = document.createElement('div')
    wrap.className = 'rounded-2xl border border-white/10 bg-white/5 p-4'

    wrap.innerHTML = `
      <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div class="text-sm font-semibold">${escapeHtml(state.users[i] || `Person ${i + 1}`)}</div>
          <div class="mt-1 text-xs text-white/55 font-mono" id="price-preview-${i}">Price: $0.00</div>
        </div>
        <div class="w-full md:max-w-[320px]">
          <input
            id="price-${i}"
            class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] outline-none transition focus:border-cyan-300/50 focus:shadow-neon"
            placeholder="e.g. 15.2 or 15.2 + 10.5"
          />
        </div>
      </div>
    `

    pricesContainer.appendChild(wrap)

    const input = /** @type {HTMLInputElement} */ (wrap.querySelector(`#price-${i}`))
    input.addEventListener('input', updateLivePreview)
  }

  taxInput.addEventListener('input', updateLivePreview)
}

function updateLivePreview() {
  const prices = []

  for (let i = 0; i < state.numberppl; i += 1) {
    const input = /** @type {HTMLInputElement} */ ($(`#price-${i}`))
    const v = tryEvalMoney(input?.value ?? '')
    prices.push(v)

    const label = $(`#price-preview-${i}`)
    if (label) label.textContent = `Price: $${toFixed2(v)}`
  }

  const tax = tryEvalMoney(taxInput.value)
  taxPreview.textContent = `Tax+Tips: $${toFixed2(tax)}`

  const total = prices.reduce((acc, n) => acc + n, 0) + tax
  summaryPreview.textContent = `total: $${toFixed2(total)}`
}

function computeResult() {
  // --- Legacy-compatible extraction ---
  // Legacy script reads from labels; here we calculate directly from parsed numbers,
  // but keep the same numeric rounding / expression evaluation behavior.
  const prices = []
  let total = 0.0

  for (let i = 0; i < state.numberppl; i += 1) {
    const input = /** @type {HTMLInputElement} */ ($(`#price-${i}`))
    const v = tryEvalMoney(input?.value ?? '')
    prices.push(v)
    total += v
  }

  let tax = tryEvalMoney(taxInput.value)
  total += tax

  // --- Core split algorithm (PRESERVED) ---
  // Legacy lines:
  //   totalprice=[];
  //   for(let i=0;i<numberppl;++i){
  //       let tempP = prices[i] + tax *(prices[i]/total);
  //       totalprice.push(tempP);
  //   }
  const totalprice = []
  for (let i = 0; i < state.numberppl; i += 1) {
    let tempP = prices[i] + tax * (prices[i] / total)
    totalprice.push(tempP)
  }

  return { prices, tax, total, totalprice }
}

function renderResult(totalprice) {
  resultTable.innerHTML = ''

  const lines = []

  for (let i = 0; i < state.numberppl; i += 1) {
    const name = state.users[i] || `Person ${i + 1}`
    const amount = toFixed2(totalprice[i])

    lines.push(`${name}: $${amount}`)

    const row = document.createElement('div')
    row.className = 'grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4'
    row.innerHTML = `
      <div>
        <div class="text-sm font-semibold">${escapeHtml(name)}</div>
        <div class="mt-1 text-xs text-white/55 font-mono">${state.users.length} people</div>
      </div>
      <div class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
        <span class="bg-[linear-gradient(90deg,#ffffff,rgba(96,165,250,0.95),rgba(34,211,238,0.92),rgba(167,139,250,0.86))] bg-clip-text text-transparent">$${amount}</span>
      </div>
    `

    resultTable.appendChild(row)
  }

  btnCopy.onclick = async () => {
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      btnCopy.textContent = 'Copied'
      setTimeout(() => (btnCopy.textContent = 'Copy'), 900)
    } catch {
      btnCopy.textContent = 'Copy failed'
      setTimeout(() => (btnCopy.textContent = 'Copy'), 900)
    }
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

// Bind forms
stepEls[1].addEventListener('submit', (e) => {
  e.preventDefault()

  const n = Number(peopleInput.value)
  if (!Number.isFinite(n) || n < 2) {
    peopleInput.focus()
    return
  }

  state.numberppl = Math.floor(n)
  renderNameInputs()
  setActiveStep(2)
})

stepEls[2].addEventListener('submit', (e) => {
  e.preventDefault()

  const users = []
  for (let i = 0; i < state.numberppl; i += 1) {
    const input = /** @type {HTMLInputElement} */ ($(`#name-${i}`))
    const name = (input?.value ?? '').trim()
    if (!name) {
      input?.focus()
      return
    }
    users.push(name)
  }

  state.users = users
  renderPriceInputs()
  updateLivePreview()
  setActiveStep(3)
})

stepEls[3].addEventListener('submit', (e) => {
  e.preventDefault()

  const { totalprice } = computeResult()
  renderResult(totalprice)
  setActiveStep(4)
})

// Back + Reset
function bindBackAndReset() {
  document.querySelectorAll('[data-back]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (state.step === 3) setActiveStep(2)
      if (state.step === 2) setActiveStep(1)
    })
  })

  document.querySelectorAll('[data-reset]').forEach((btn) => {
    btn.addEventListener('click', resetAll)
  })
}

bindBackAndReset()
resetAll()
