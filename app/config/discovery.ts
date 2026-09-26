import {
  BookOpen,
  CircleHelp,
  Coffee,
  CreditCard,
  HandHeart,
  Map,
  MapPin,
  Phone,
  PlaneLanding,
  Route,
  Search,
  ShoppingBag,
  Stethoscope,
  TrainFront,
  Utensils,
  Wifi,
} from 'lucide-vue-next'

const search = (parameters: Record<string, string>) => `/search?${new URLSearchParams(parameters).toString()}`

export const discovery = {
  exploreTypes: [
    { label: 'Places', description: 'Everyday places to explore', to: search({ type: 'places' }), icon: MapPin },
    { label: 'Food', description: 'Restaurants and local meals', to: search({ type: 'places', place_type: 'restaurant' }), icon: Utensils },
    { label: 'Cafes', description: 'Coffee and creative spaces', to: search({ type: 'places', place_type: 'cafe' }), icon: Coffee },
    { label: 'Shopping', description: 'Stores, markets and pop-ups', to: search({ type: 'places', place_type: 'shopping' }), icon: ShoppingBag },
    { label: 'Routes', description: 'Ready-made ways to explore', to: search({ type: 'routes' }), icon: Route },
    { label: 'Guides', description: 'Practical trip know-how', to: search({ type: 'guides' }), icon: BookOpen },
  ],
  travelEssentials: [
    { label: 'Getting around', description: 'Subways, buses and practical transport', guideType: 'transport', to: search({ type: 'guides', guide_type: 'transport' }), icon: TrainFront },
    { label: 'Payments', description: 'Cards, cash and everyday payment', guideType: 'payment', to: search({ type: 'guides', guide_type: 'payment' }), icon: CreditCard },
    { label: 'SIM & eSIM', description: 'Stay connected from arrival', guideType: 'sim', to: search({ type: 'guides', guide_type: 'sim' }), icon: Wifi },
    { label: 'Maps', description: 'Navigate Korea with confidence', guideType: 'maps', to: search({ type: 'guides', guide_type: 'maps' }), icon: Map },
  ],
  firstTime: [
    { label: 'Arrive in Korea', guideType: 'arrival', to: search({ type: 'guides', guide_type: 'arrival' }), icon: PlaneLanding },
    { label: 'Get Internet', guideType: 'sim', to: search({ type: 'guides', guide_type: 'sim' }), icon: Wifi },
    { label: 'Pay with confidence', guideType: 'payment', to: search({ type: 'guides', guide_type: 'payment' }), icon: CreditCard },
    { label: 'Get to the city', guideType: 'transport', to: search({ type: 'guides', guide_type: 'transport' }), icon: TrainFront },
    { label: 'Use local maps', guideType: 'maps', to: search({ type: 'guides', guide_type: 'maps' }), icon: Map },
    { label: 'Know the basics', guideType: 'etiquette', to: search({ type: 'guides', guide_type: 'etiquette' }), icon: HandHeart },
  ],
  themes: [
    { label: 'Cafes', tag: 'cafe', to: search({ tag: 'cafe' }), color: 'from-stone-300 to-slate-600' },
    { label: 'Shopping', tag: 'shopping', to: search({ tag: 'shopping' }), color: 'from-rose-300 to-slate-600' },
    { label: 'Nature', tag: 'nature', to: search({ tag: 'nature' }), color: 'from-emerald-300 to-slate-600' },
    { label: 'Culture', tag: 'culture', to: search({ tag: 'culture' }), color: 'from-amber-300 to-stone-600' },
    { label: 'Local', tag: 'local', to: search({ tag: 'local' }), color: 'from-sky-300 to-slate-600' },
    { label: 'First time', tag: 'first-trip', to: search({ tag: 'first-trip', type: 'guides' }), color: 'from-violet-300 to-slate-600' },
  ],
  help: [
    { label: 'Emergency', description: 'Essential emergency information', guideType: 'emergency', to: search({ type: 'guides', guide_type: 'emergency' }), icon: Phone },
    { label: 'Medical', description: 'Find care and pharmacy help', guideType: 'emergency', to: search({ type: 'guides', guide_type: 'emergency' }), icon: Stethoscope },
    { label: 'Lost & Found', description: 'What to do when items go missing', guideType: 'troubleshooting', to: search({ type: 'guides', guide_type: 'troubleshooting' }), icon: Search },
    { label: 'Travel Help', description: 'Answers for common travel questions', guideType: 'general', to: search({ type: 'guides', guide_type: 'general' }), icon: CircleHelp },
    { label: 'Travel Etiquette', description: 'Know before you go', guideType: 'etiquette', to: search({ type: 'guides', guide_type: 'etiquette' }), icon: HandHeart },
  ],
} as const
