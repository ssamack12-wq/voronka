import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  FileText,
  Home,
  Landmark,
  Link2,
  MapPin,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export const STATS = [
  { value: '26+', label: 'этапов сделки' },
  { value: '80+', label: 'юридических проверок' },
  { value: '50+', label: 'готовых документов' },
  { value: '250+', label: 'подсказок и предупреждений' }
] as const;

export const BENEFITS = [
  { icon: Route, title: 'Персональный маршрут сделки' },
  { icon: FileText, title: 'Все документы' },
  { icon: ShieldCheck, title: 'Проверки на каждом этапе' },
  { icon: Link2, title: 'Ссылки на официальные сервисы' },
  { icon: ClipboardCheck, title: 'Шаблоны документов' },
  { icon: TrendingUp, title: 'Контроль прогресса' }
] as const;

export const STEPS = [
  { num: 1, title: 'Ответьте на несколько вопросов' },
  { num: 2, title: 'Получите персональный маршрут' },
  { num: 3, title: 'Следуйте этапам' },
  { num: 4, title: 'Закройте сделку безопасно' }
] as const;

export const DEAL_TYPES = [
  { icon: Home, title: 'Покупка квартиры' },
  { icon: Landmark, title: 'Покупка в ипотеку' },
  { icon: Building2, title: 'Новостройка' },
  { icon: RefreshCw, title: 'Продажа квартиры' },
  { icon: Sparkles, title: 'Маткапитал' },
  { icon: ArrowRight, title: 'Альтернативная сделка' },
  { icon: MapPin, title: 'Земельный участок' },
  { icon: Home, title: 'Покупка дома' }
] as const;

export const REASONS = [
  'Не забудете ни одного этапа',
  'Узнаете риски заранее',
  'Получите ссылки на Росреестр',
  'Все документы в одном месте',
  'Не нужно читать десятки сайтов'
] as const;
