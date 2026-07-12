export interface SalaryResult {
  grossSalary: number
  annualTax: number
  annualNet: number
  monthlyNet: number
  monthlyTax: number
  effectiveTaxRate: string
  taxSlabs: { range: string; rate: number }[]
}

export interface TaxResult {
  annualIncome: number
  totalTax: number
  netIncome: number
  taxSlab: string
  effectiveRate: string
  monthlyBreakdown: { month: number; income: number; tax: number; net: number }[]
}

export interface BMIResult {
  bmi: number
  category: string
  healthyWeightRange: string
  risk: string
}

export interface CGPAResult {
  cgpa: number
  totalQualityPoints: number
  totalCreditHours: number
  gradeBreakdown: { grade: string; points: number; count: number }[]
}

export interface AgeResult {
  years: number
  months: number
  days: number
  totalDays: number
  totalHours: number
  nextBirthdayIn: number
  birthday: string
}

export interface CurrencyResult {
  amount: number
  from: string
  to: string
  result: number
  rate: number
  lastUpdated: string
}

export interface EMISchedule {
  month: number
  emi: number
  principal: number
  interest: number
  balance: number
}

export interface EMIResult {
  monthlyEMI: number
  totalInterest: number
  totalPayment: number
  schedule: EMISchedule[]
  principalToInterestRatio: string
}

export interface ProfitResult {
  costPrice: number
  sellingPrice: number
  profit: number
  margin: number
  markup: number
  breakEvenUnits: number
}

export interface DiscountResult {
  originalPrice: number
  discountPercent: number
  discountAmount: number
  finalPrice: number
  savings: number
  savingsPercent: number
}

export interface ZakatResult {
  totalAssets: number
  zakatableAssets: number
  zakatAmount: number
  nisabThreshold: number
  qualifies: boolean
}

export interface PasswordResult {
  password: string
  strength: 'weak' | 'medium' | 'strong' | 'very-strong'
  entropy: number
  crackTime: string
}

export interface WordCountResult {
  words: number
  characters: number
  charactersNoSpaces: number
  sentences: number
  paragraphs: number
  readingTime: number
  speakingTime: number
}

export interface PercentageResult {
  value: number
  total: number
  percentage: number
  increase?: number
  decrease?: number
}

export interface SleepResult {
  bestWakeUpTimes: string[]
  bestSleepTimes: string[]
  sleepCycles: number
  totalSleep: string
}

export interface FreelanceRateResult {
  hourlyRate: number
  monthlyRate: number
  weeklyRate: number
  dailyRate: number
  targetRevenue: number
  billableHoursPerYear: number
  profitMargin: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface InvoiceResult {
  items: InvoiceItem[]
  subtotal: number
  tax: number
  taxRate: number
  discount: number
  total: number
  invoiceNumber: string
  dueDate: string
}

export interface SavingsGoalResult {
  monthlyContribution: number
  totalContributions: number
  totalInterest: number
  finalAmount: number
  monthsToGoal: number
}

export interface LoanResult {
  monthlyPayment: number
  totalInterest: number
  totalPayment: number
  schedule: EMISchedule[]
  debtToIncome: string
  affordability: string
}

export interface GradeResult {
  currentGrade: number
  desiredGrade: number
  examWeight: number
  neededGrade: number
  possible: boolean
}

export interface MarksResult {
  subjects: { name: string; obtained: number; total: number; percentage: number }[]
  totalObtained: number
  totalMax: number
  overallPercentage: number
  grade: string
}

export interface BMRResult {
  bmr: number
  maintenanceCalories: number
  calories: { sedentary: number; light: number; moderate: number; active: number; extra: number }
}

export interface CalorieResult {
  maintenance: number
  weightLoss: number
  weightGain: number
  bmr: number
  tdee: number
}

export interface IdealWeightResult {
  devine: number
  robinson: number
  miller: number
  hamwi: number
  average: number
  healthyRange: { min: number; max: number }
}

export interface MortgageResult {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  schedule: EMISchedule[]
  affordability: { maxPrice: number; monthlyPayment: number }
}

export interface GoldResult {
  purity: number
  weight: number
  goldValue: number
  makingCharges: number
  totalPrice: number
  pricePerGram: number
}

export interface ConstructionCostResult {
  totalCost: number
  materialCost: number
  laborCost: number
  otherCost: number
  costPerSqft: number
  breakdown: { item: string; cost: number; percentage: number }[]
}

export interface PropertyTaxResult {
  propertyValue: number
  annualTax: number
  taxRate: number
  exemptions: number
  netTax: number
}

export interface DateDiffResult {
  totalDays: number
  years: number
  months: number
  days: number
  weeks: number
  businessDays: number
  hours: number
  minutes: number
}

export interface WaterIntakeResult {
  dailyOz: number
  dailyMl: number
  dailyGlasses: number
  dailyLiters: number
  duringExercise: string
}

export interface AttendanceResult {
  totalClasses: number
  attendedClasses: number
  percentage: number
  requiredPercentage: number
  canMiss: number
  status: 'good' | 'warning' | 'critical'
}

export interface ExamScoreResult {
  currentScore: number
  examWeight: number
  targetScore: number
  neededScore: number
  possible: boolean
  maxPossible: number
}