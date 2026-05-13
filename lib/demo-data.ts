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
  DayBlock,
  WeekTheme,
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
  { id: 'm1', title: 'Утренняя ясность', description: 'Мягкое пробуждение и настрой на день', duration: 7, category: 'quick', isFavorite: true, level: 'beginner', moodColor: 'linear-gradient(135deg, rgba(201,150,90,0.4) 0%, rgba(196,120,138,0.2) 100%)' },
  { id: 'm2', title: 'Быстрое спокойствие', description: 'Снятие напряжения за несколько минут', duration: 5, category: 'quick', isFavorite: false, level: 'beginner', moodColor: 'linear-gradient(135deg, rgba(139,117,207,0.3) 0%, rgba(106,155,126,0.15) 100%)' },
  { id: 'm3', title: 'Дыхание осознанности', description: 'Погружение в настоящий момент', duration: 10, category: 'quick', isFavorite: false, level: 'beginner', moodColor: 'linear-gradient(135deg, rgba(106,155,126,0.3) 0%, rgba(139,117,207,0.15) 100%)' },
  { id: 'm4', title: 'Глубокое погружение', description: 'Длительная медитация для опытных', duration: 30, category: 'popular', isFavorite: true, level: 'intermediate', moodColor: 'linear-gradient(135deg, rgba(139,117,207,0.5) 0%, rgba(9,7,15,0.1) 100%)' },
  { id: 'm5', title: 'Сканирование тела', description: 'Полное расслабление от головы до ног', duration: 25, category: 'popular', isFavorite: false, level: 'intermediate', moodColor: 'linear-gradient(135deg, rgba(196,120,138,0.35) 0%, rgba(139,117,207,0.2) 100%)' },
  { id: 'm6', title: 'Медитация любящей доброты', description: 'Раскрытие сердца и сострадание', duration: 20, category: 'popular', isFavorite: false, level: 'beginner', moodColor: 'linear-gradient(135deg, rgba(196,120,138,0.45) 0%, rgba(201,150,90,0.15) 100%)' },
  { id: 'm7', title: 'Растворение тревоги', description: 'Освобождение от беспокойства', duration: 15, category: 'stress', isFavorite: true, level: 'beginner', moodColor: 'linear-gradient(135deg, rgba(106,155,126,0.4) 0%, rgba(139,117,207,0.2) 100%)' },
  { id: 'm8', title: 'Якорь спокойствия', description: 'Техника заземления в стрессовых ситуациях', duration: 10, category: 'stress', isFavorite: false, level: 'intermediate', moodColor: 'linear-gradient(135deg, rgba(139,117,207,0.35) 0%, rgba(106,155,126,0.15) 100%)' },
  { id: 'm9', title: 'Вечерний ритуал', description: 'Подготовка к глубокому и восстанавливающему сну', duration: 20, category: 'sleep', isFavorite: false, level: 'beginner', moodColor: 'linear-gradient(135deg, rgba(30,20,60,0.8) 0%, rgba(139,117,207,0.3) 100%)' },
  { id: 'm10', title: 'Йога-нидра', description: 'Йогический сон для полного восстановления', duration: 35, category: 'sleep', isFavorite: true, level: 'intermediate', moodColor: 'linear-gradient(135deg, rgba(20,15,50,0.9) 0%, rgba(139,117,207,0.4) 100%)' },
  { id: 'm11', title: 'Огонь внимания', description: 'Активация и концентрация умственной энергии', duration: 12, category: 'energy', isFavorite: false, level: 'intermediate', moodColor: 'linear-gradient(135deg, rgba(201,150,90,0.5) 0%, rgba(196,120,138,0.25) 100%)' },
  { id: 'm12', title: 'Поток', description: 'Состояние максимальной продуктивности', duration: 18, category: 'energy', isFavorite: true, level: 'advanced', moodColor: 'linear-gradient(135deg, rgba(201,150,90,0.6) 0%, rgba(106,155,126,0.2) 100%)' },
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
    howTo: [
      'Сядьте удобно или лягте на спину, закройте глаза.',
      'На вдохе сначала наполните живот воздухом, затем расширьте грудную клетку.',
      'На выдохе медленно выпустите воздух — сначала из груди, затем из живота.',
      'Держите плечи расслабленными, дышите плавно без пауз.',
    ],
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
    howTo: [
      'Сядьте прямо, кончик языка касается нёба за верхними зубами.',
      'Выдохните полностью через рот со звуком «фух».',
      'Вдохните через нос на 4 счёта, задержите дыхание на 7 счётов.',
      'Выдохните через рот со звуком «фух» на 8 счётов — это один цикл.',
    ],
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
    howTo: [
      'Сядьте удобно, выпрямите спину, расслабьте плечи.',
      'Сделайте спокойный вдох через нос на 4 счёта.',
      'Медленно выдохните через нос или рот на 6 счётов.',
      'После выдоха задержите дыхание на 4 счёта, затем повторите цикл.',
    ],
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
    howTo: [
      'Сядьте со скрещёнными ногами или на стул, держите спину прямо.',
      'Сделайте глубокий вдох, затем начните серию резких коротких выдохов через нос.',
      'Каждый выдох — активное сокращение живота, вдох происходит пассивно.',
      'Выполняйте 20 циклов в темпе 1–2 выдоха в секунду, затем сделайте паузу.',
    ],
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
    howTo: [
      'Сядьте удобно, поднесите правую руку к носу: большой палец закрывает правую ноздрю, безымянный — левую.',
      'Закройте правую ноздрю и вдохните через левую на 4 счёта.',
      'Закройте обе ноздри, задержите на 2 счёта, затем откройте правую и выдохните на 4 счёта.',
      'Вдохните через правую, задержите, переключитесь и выдохните через левую — это один цикл.',
    ],
  },
]

export const goals: Goal[] = [
  { id: 'g1', title: 'Медитировать каждый день', subtitle: '14 из 30 дней', progress: 47, target: '30 дней подряд', icon: 'Target' },
  { id: 'g2', title: 'Освоить дыхательные техники', subtitle: '3 из 5 практик', progress: 60, target: 'Все 5 практик', icon: 'Wind' },
  { id: 'g3', title: 'Улучшить качество сна', subtitle: '80% дней с хорошим сном', progress: 80, target: 'Стабильный режим', icon: 'Moon' },
]

export const programs: Program[] = [
  {
    id: 'p1',
    title: 'Начало пути',
    duration: '7 дней',
    sessions: 7,
    description: 'Введение в медитацию для начинающих',
    isActive: true,
    days: [
      {
        day: 1,
        title: 'Первое дыхание',
        steps: [
          { type: 'breathing', refId: 'b1', title: 'Полное дыхание', duration: '5 мин' },
          { type: 'meditation', refId: 'm1', title: 'Утренняя ясность', duration: '7 мин' },
        ],
      },
      {
        day: 2,
        title: 'Успокоение',
        steps: [
          { type: 'breathing', refId: 'b2', title: 'Задержка на вдохе', duration: '8 мин' },
          { type: 'meditation', refId: 'm2', title: 'Быстрое спокойствие', duration: '5 мин' },
        ],
      },
      {
        day: 3,
        title: 'Осознанность',
        steps: [
          { type: 'breathing', refId: 'b1', title: 'Полное дыхание', duration: '5 мин' },
          { type: 'meditation', refId: 'm3', title: 'Дыхание осознанности', duration: '10 мин' },
        ],
      },
      {
        day: 4,
        title: 'Антистресс',
        steps: [
          { type: 'breathing', refId: 'b3', title: 'Задержка на выдохе', duration: '7 мин' },
          { type: 'meditation', refId: 'm7', title: 'Растворение тревоги', duration: '15 мин' },
        ],
      },
      {
        day: 5,
        title: 'Энергия',
        steps: [
          { type: 'breathing', refId: 'b4', title: 'Капалабхати', duration: '5 мин' },
          { type: 'meditation', refId: 'm11', title: 'Огонь внимания', duration: '12 мин' },
        ],
      },
      {
        day: 6,
        title: 'Баланс',
        steps: [
          { type: 'breathing', refId: 'b5', title: 'Попеременное дыхание', duration: '8 мин' },
          { type: 'meditation', refId: 'm8', title: 'Якорь спокойствия', duration: '10 мин' },
        ],
      },
      {
        day: 7,
        title: 'Завершение',
        steps: [
          { type: 'breathing', refId: 'b1', title: 'Полное дыхание', duration: '5 мин' },
          { type: 'meditation', refId: 'm4', title: 'Глубокое погружение', duration: '30 мин' },
        ],
      },
    ],
  },
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

export const weekTheme: WeekTheme = {
  week: 1,
  title: 'Дыхание',
  pillars: [
    { id: 'breathing', label: 'дыхание' },
    { id: 'smile', label: 'улыбка' },
    { id: 'nutrition', label: 'питание' },
    { id: 'acceptance', label: 'принятие' },
    { id: 'silence', label: 'молчание' },
  ],
}

export const dayCardBlocks: DayBlock[] = [
  {
    id: 'morning',
    label: 'УТРО',
    timeRange: '06:30 – 10:00',
    emoji: '☀️',
    accent: 'amber',
    tasks: [
      { id: 't1', title: 'Подъём до 7:00', time: '07:00', done: false },
      { id: 't2', title: 'Полное дыхание — 10 циклов', time: '07:05', done: false },
      { id: 't3', title: 'Душ / осознанное дыхание', time: '07:15', done: false },
      { id: 't4', title: 'Умыть лицо холодной водой — 1 мин', time: '07:30', done: false },
      { id: 't5', title: 'Чистить зубы — 20 вдохов каждой рукой', time: '07:35', done: false },
      { id: 't6', title: 'Стакан воды с лимоном — 5–8 мин осознанно', time: '07:40', done: false },
      { id: 't7', title: 'Дыхательный комплекс (полное · ритмическое · очищающее)', time: '08:00', done: false },
      { id: 't8', title: 'Музыка / танец / зарядка — 5 мин', time: '08:20', done: false },
    ],
  },
  {
    id: 'day',
    label: 'ДЕНЬ',
    timeRange: '10:00 – 19:00',
    emoji: '🌤',
    accent: 'none',
    tasks: [
      { id: 't9', title: 'Прогулка / осознанное дыхание — 20 мин', done: false },
      { id: 't10', title: 'Последний приём пищи до 18–19 часов', time: '18:30', done: false },
    ],
  },
  {
    id: 'evening',
    label: 'ВЕЧЕР',
    timeRange: '19:00 – 22:00',
    emoji: '🌙',
    accent: 'violet',
    tasks: [
      { id: 't11', title: 'Дыхательные упражнения (вечер)', time: '19:30', done: false },
      { id: 't12', title: 'Чтение книги — 10 страниц / внимание на дыхании', time: '20:00', done: false },
      { id: 't13', title: 'За 30 мин до сна — без телефона', time: '21:30', done: false },
      { id: 't14', title: 'Перед сном — 10 циклов полное дыхание лёжа', time: '21:50', done: false },
      { id: 't15', title: 'Отход ко сну до 22:00', time: '22:00', done: false },
    ],
  },
]

export const dailyStats: DailyStats = {
  meditationMinutes: 25,
  breathingSessions: 2,
  streak: 14,
  weekData: [15, 20, 10, 30, 25, 0, 20],
}

export const myPlanItems: { id: string; time: string; title: string; duration: string; section: string }[] = [
  { id: 'mp1', time: '07:00', title: 'Полное дыхание', duration: '5 мин', section: 'Утро' },
  { id: 'mp2', time: '07:30', title: 'Утренняя ясность', duration: '7 мин', section: 'Утро' },
  { id: 'mp3', time: '12:00', title: 'Дыхание для концентрации', duration: '5 мин', section: 'День' },
  { id: 'mp4', time: '19:30', title: 'Задержка на выдохе', duration: '7 мин', section: 'Вечер' },
  { id: 'mp5', time: '21:00', title: 'Вечерняя релаксация', duration: '20 мин', section: 'Вечер' },
]
