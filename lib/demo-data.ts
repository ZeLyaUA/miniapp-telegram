import type {
  MeditationCategory,
  MeditationSession,
  BreathingPractice,
  Goal,
  Program,
  Reminder,
  Habit,
  Achievement,
  DailyStats,
} from './types'

export const meditationCategories: MeditationCategory[] = [
  { id: 'quick', label: 'Быстрый старт', sublabel: '5–10 минут', icon: 'Play' },
  { id: 'popular', label: 'Популярные', sublabel: '20–40 минут', icon: 'Flame' },
  { id: 'stress', label: 'Управление стрессом', sublabel: 'Антистресс', icon: 'Waves' },
  { id: 'sleep', label: 'Сон и расслабление', sublabel: 'Лучше засыпать', icon: 'Moon' },
  { id: 'energy', label: 'Энергия и фокус', sublabel: 'Больше сил и ясности', icon: 'Zap' },
  { id: 'favorites', label: 'Избранное', sublabel: 'Ваши любимые практики', icon: 'Heart' },
]

export const meditationSessions: MeditationSession[] = [
  { id: 'm1', title: 'Утренняя ясность', description: 'Мягкое пробуждение и настрой на день', duration: 7, category: 'quick', isFavorite: true, level: 'beginner' },
  { id: 'm2', title: 'Быстрое спокойствие', description: 'Снятие напряжения за несколько минут', duration: 5, category: 'quick', isFavorite: false, level: 'beginner' },
  { id: 'm3', title: 'Дыхание осознанности', description: 'Погружение в настоящий момент', duration: 10, category: 'quick', isFavorite: false, level: 'beginner' },
  { id: 'm4', title: 'Глубокое погружение', description: 'Длительная медитация для опытных', duration: 30, category: 'popular', isFavorite: true, level: 'intermediate' },
  { id: 'm5', title: 'Сканирование тела', description: 'Полное расслабление от головы до ног', duration: 25, category: 'popular', isFavorite: false, level: 'intermediate' },
  { id: 'm6', title: 'Медитация любящей доброты', description: 'Раскрытие сердца и сострадание', duration: 20, category: 'popular', isFavorite: false, level: 'beginner' },
  { id: 'm7', title: 'Растворение тревоги', description: 'Освобождение от беспокойства', duration: 15, category: 'stress', isFavorite: true, level: 'beginner' },
  { id: 'm8', title: 'Якорь спокойствия', description: 'Техника заземления в стрессовых ситуациях', duration: 10, category: 'stress', isFavorite: false, level: 'intermediate' },
  { id: 'm9', title: 'Вечерний ритуал', description: 'Подготовка к глубокому и восстанавливающему сну', duration: 20, category: 'sleep', isFavorite: false, level: 'beginner' },
  { id: 'm10', title: 'Йога-нидра', description: 'Йогический сон для полного восстановления', duration: 35, category: 'sleep', isFavorite: true, level: 'intermediate' },
  { id: 'm11', title: 'Огонь внимания', description: 'Активация и концентрация умственной энергии', duration: 12, category: 'energy', isFavorite: false, level: 'intermediate' },
  { id: 'm12', title: 'Поток', description: 'Состояние максимальной продуктивности', duration: 18, category: 'energy', isFavorite: true, level: 'advanced' },
]

export const breathingPractices: BreathingPractice[] = [
  {
    id: 'b1',
    name: 'Полное дыхание',
    subtitle: 'Глубокое и естественное',
    inhale: 5,
    holdIn: 0,
    exhale: 5,
    holdOut: 0,
    rounds: 10,
    description: 'Наполните лёгкие полностью — сначала живот, потом грудь. Естественный ритм дыхания.',
    icon: 'Wind',
  },
  {
    id: 'b2',
    name: 'Задержка на вдохе',
    subtitle: 'Удержание после вдоха',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    rounds: 8,
    description: 'Техника 4-7-8. Успокаивает нервную систему и снижает тревожность.',
    icon: 'ArrowUp',
  },
  {
    id: 'b3',
    name: 'Задержка на выдохе',
    subtitle: 'Удержание после выдоха',
    inhale: 4,
    holdIn: 0,
    exhale: 6,
    holdOut: 4,
    rounds: 8,
    description: 'Активирует парасимпатическую нервную систему. Эффективна при стрессе.',
    icon: 'ArrowDown',
  },
  {
    id: 'b4',
    name: 'Капалабхати',
    subtitle: 'Очищающее дыхание',
    inhale: 1,
    holdIn: 0,
    exhale: 1,
    holdOut: 0,
    rounds: 20,
    description: 'Быстрые выдохи через нос. Очищает лёгкие и активирует энергию.',
    icon: 'RefreshCw',
  },
  {
    id: 'b5',
    name: 'Попеременное дыхание',
    subtitle: 'Баланс и гармония',
    inhale: 4,
    holdIn: 2,
    exhale: 4,
    holdOut: 2,
    rounds: 10,
    description: 'Нади шодхана. Баланс между левым и правым полушариями мозга.',
    icon: 'ArrowLeftRight',
  },
]

export const goals: Goal[] = [
  { id: 'g1', title: 'Медитировать каждый день', subtitle: '14 из 30 дней', progress: 47, target: '30 дней подряд', icon: 'Target' },
  { id: 'g2', title: 'Освоить дыхательные техники', subtitle: '3 из 5 практик', progress: 60, target: 'Все 5 практик', icon: 'Wind' },
  { id: 'g3', title: 'Улучшить качество сна', subtitle: '80% дней с хорошим сном', progress: 80, target: 'Стабильный режим', icon: 'Moon' },
]

export const programs: Program[] = [
  { id: 'p1', title: 'Начало пути', duration: '7 дней', sessions: 7, description: 'Введение в медитацию для начинающих', isActive: true },
  { id: 'p2', title: 'Управление стрессом', duration: '21 день', sessions: 21, description: 'Антистресс-программа для ежедневной практики', isActive: false },
  { id: 'p3', title: 'Глубокий сон', duration: '14 дней', sessions: 14, description: 'Улучшение качества и глубины сна', isActive: false },
  { id: 'p4', title: 'Энергия и продуктивность', duration: '30 дней', sessions: 30, description: 'Максимальный потенциал ума и тела', isActive: false },
]

export const reminders: Reminder[] = [
  { id: 'r1', title: 'Утренняя медитация', time: '08:00', days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'], isEnabled: true },
  { id: 'r2', title: 'Вечернее дыхание', time: '21:00', days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], isEnabled: true },
  { id: 'r3', title: 'Выходной ритуал', time: '10:00', days: ['Сб', 'Вс'], isEnabled: false },
]

export const habits: Habit[] = [
  { id: 'h1', label: 'Утренняя медитация', icon: 'Sun', completedDays: [true, true, true, true, false, true, false], streak: 4 },
  { id: 'h2', label: 'Дыхательные упражнения', icon: 'Wind', completedDays: [true, false, true, true, true, false, false], streak: 3 },
  { id: 'h3', label: 'Вечерняя релаксация', icon: 'Moon', completedDays: [true, true, false, true, true, true, false], streak: 2 },
  { id: 'h4', label: 'Осознанные паузы', icon: 'Pause', completedDays: [false, true, true, false, true, false, false], streak: 1 },
  { id: 'h5', label: 'Журнал благодарности', icon: 'BookOpen', completedDays: [true, true, true, false, false, false, false], streak: 3 },
]

export const achievements: Achievement[] = [
  { id: 'a1', title: 'Первый шаг', description: 'Завершите первую медитацию', icon: 'Star', isUnlocked: true },
  { id: 'a2', title: 'Неделя практики', description: '7 дней подряд', icon: 'Calendar', isUnlocked: true },
  { id: 'a3', title: 'Мастер дыхания', description: 'Освойте 3 техники дыхания', icon: 'Wind', isUnlocked: true },
  { id: 'a4', title: 'Месяц спокойствия', description: '30 дней подряд', icon: 'Trophy', isUnlocked: false, progress: 47 },
  { id: 'a5', title: 'Исследователь', description: 'Попробуйте все разделы приложения', icon: 'Compass', isUnlocked: false, progress: 75 },
  { id: 'a6', title: 'Глубокое погружение', description: '100 часов медитации', icon: 'Gem', isUnlocked: false, progress: 23 },
]

export const dailyStats: DailyStats = {
  meditationMinutes: 25,
  breathingSessions: 2,
  streak: 14,
  weekData: [15, 20, 10, 30, 25, 0, 20],
}
