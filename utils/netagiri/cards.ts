/**
 * Netagiri. The person on the card is in the room with you.
 * Talk the way a party office talks: Hindi and English in the same breath.
 * Say the money, the vote, the court, the camera, or the crowd.
 * The two buttons are different orders. Deltas stay within -14..14.
 * No living politicians. No riddles.
 */

export type Gauge = 'janta' | 'khazana' | 'kursi' | 'kanoon'
export type Face =
  | 'pinky' | 'nandini' | 'baba' | 'lalaji' | 'chintu'
  | 'kisan' | 'mausi' | 'hakim' | 'envoy' | 'captain'
export type Era = 'now' | 'later' | 'any'
export type Delta = Partial<Record<Gauge, number>>

export type Side = {
  text: string
  d?: Delta
  set?: string[]
  clear?: string[]
  queue?: [id: string, inTurns: number][]
  next?: string
  ending?: string
  extraIf?: { flag: string; d: Delta }
}

export type StoryCard = {
  id: string
  face: Face
  speaker: string
  role: string
  text: string
  left: Side
  right: Side
  era?: Era
  minTerm?: number
  maxTerm?: number
  need?: string[]
  block?: string[]
  any?: string[]
  maxGauge?: Partial<Record<Gauge, number>>
  weight?: number
  spine?: boolean
  queueOnly?: boolean
  priority?: boolean
  repeat?: boolean
}

export type Ending = { id: string; headline: string; epitaph: string }

const s = (text: string, d?: Delta, rest?: Omit<Side, 'text' | 'd'>): Side => ({ text, d, ...rest })

export const GAUGES: { key: Gauge; label: string; hint: string }[] = [
  { key: 'janta', label: 'Janta', hint: 'The crowd' },
  { key: 'khazana', label: 'Khazana', hint: 'The chest' },
  { key: 'kursi', label: 'Kursi', hint: 'The party' },
  { key: 'kanoon', label: 'Kanoon', hint: 'The file' }
]

export const FACES: Record<Face, string> = {
  pinky: '/netagiri/pinky.jpg',
  nandini: '/netagiri/nandini.jpg',
  baba: '/netagiri/baba.jpg',
  lalaji: '/netagiri/lalaji.jpg',
  chintu: '/netagiri/chintu.jpg',
  kisan: '/netagiri/kisan.jpg',
  mausi: '/netagiri/mausi.jpg',
  hakim: '/netagiri/hakim.jpg',
  envoy: '/netagiri/envoy.jpg',
  captain: '/netagiri/captain.jpg'
}

export const ENDINGS: Record<string, Ending> = {
  janta_low: {
    id: 'janta_low',
    headline: 'They changed the channel',
    epitaph: 'The rallies emptied. Your handle kept posting to a room that had gone home.'
  },
  janta_high: {
    id: 'janta_high',
    headline: 'The stage broke',
    epitaph: 'They came for a selfie and did not stop. The stage ran out of floor.'
  },
  janta_high_bulb: {
    id: 'janta_high_bulb',
    headline: 'Unplugged',
    epitaph: 'The bulb kept smiling after the crowd crushed the stage. Someone pulled the plug.'
  },
  khazana_low: {
    id: 'khazana_low',
    headline: 'The bill came due',
    epitaph: 'The coalition sent the bill. The slogan did not pay it.'
  },
  khazana_high: {
    id: 'khazana_high',
    headline: 'The pile',
    epitaph: 'The chest got so full the counting machines asked for a minister of their own.'
  },
  kursi_low: {
    id: 'kursi_low',
    headline: 'Unfollowed',
    epitaph: 'The party unfollowed you on television, while you were still talking.'
  },
  kursi_low_nephew: {
    id: 'kursi_low_nephew',
    headline: 'One line',
    epitaph: 'Your nephew kept the chair. He thanks you once, near the end of the speech.'
  },
  kursi_high: {
    id: 'kursi_high',
    headline: 'You became the party',
    epitaph: 'You became the party. The party then booked a ticket without you.'
  },
  kanoon_low: {
    id: 'kanoon_low',
    headline: 'The cover opened',
    epitaph: 'A sealed cover with your name on it reached the court. The court opened it.'
  },
  kanoon_high: {
    id: 'kanoon_high',
    headline: 'A form to wave',
    epitaph: 'Every order now needs a form. You need a form just to wave at the crowd.'
  },
  tea: {
    id: 'tea',
    headline: 'The bulb, off',
    epitaph: 'You left the chair while it still worked. For one evening the country talked about traffic.'
  },
  copies: {
    id: 'copies',
    headline: 'You quit the extras',
    epitaph: 'You resigned the extra versions of you. The tiger voice note is still campaigning.'
  }
}

export const CARDS: StoryCard[] = [
  {
    id: 'oath_now',
    era: 'now',
    spine: true,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Arre sir, result nikal gaya. Booth workers front row mein baithe hain, family samet. Ek speech desh ke naam hai. Doosri mein unke naam hain, aur camera unhi pe tikka hai.',
    left: s('Desh ko thank you. Baith jao.', { janta: 6, kursi: -4 }),
    right: s('Naam padho. Saare ke saare.', { janta: 4, kursi: 8, kanoon: -6 }, { set: ['troll_voice'] })
  },
  {
    id: 'oath_later',
    era: 'later',
    spine: true,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Sir, counting chalis minute late khatam hui. Log isko progress bolenge. Mere paas oxygen ka bill hai, aur ek plan hai aapka chehra news se pehle poore dome pe laga dun.',
    left: s('Oxygen ka bill padho.', { janta: 6, kanoon: 4, kursi: -4 }),
    right: s('Chehra dome pe laga do.', { janta: 8, kursi: 6, kanoon: -6 }, { set: ['dome_face'] })
  },
  {
    id: 'hundred',
    era: 'now',
    minTerm: 1,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, cameras bahar khade hain. Unhe hundred days sunne hain. Main ek naali aur ek tareekh de sakta hoon. Ya aap baithne se pehle poora desh promise kar do.',
    left: s('Ek naali. Ek tareekh.', { kanoon: 6, kursi: -4 }, { set: ['one_date'] }),
    right: s('Poora desh. Abhi ke abhi.', { janta: 8, kursi: 6 }, { set: ['hundred'], queue: [['hundred_due', 2]] })
  },
  {
    id: 'hundred_due',
    era: 'any',
    queueOnly: true,
    need: ['hundred'],
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Sir, aaj woh hundredva din hai. File abhi bhi day one likhi padi hai. Ticker pe sach bolun, ya bol dun yeh chand ke din the?',
    left: s('Sach bolo. Date fisal gayi.', { janta: -4, kanoon: 8, kursi: -4 }),
    right: s('Chand ke din the. Likh do.', { kursi: 6, kanoon: -8, janta: 2 })
  },
  {
    id: 'rename_road',
    era: 'now',
    minTerm: 1,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, yeh sadak ek gaddhe ki wajah se famous hai. Is hafte bhara sakte hain. Ya sadak aapke naam kar dun, gaddha jahan hai wahin rahe.',
    left: s('Gaddha bharo. Naam mat badlo.', { khazana: -6, janta: 8, kursi: -4 }),
    right: s('Naam badlo. Gaddha rehne do.', { janta: 4, kursi: 8 }, { set: ['renamed'] })
  },
  {
    id: 'broom',
    era: 'now',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, hotel ke bahar maine paanch sukhe patte gira diye hain. Slow motion on hai. Jhadu utha ke thoda emotional ho jaiye. Warna yeh budget safai walon ko chala jayega, aur mere paas clip nahi bachegi.',
    left: s('Paise safai walon ko do.', { khazana: -6, kanoon: 6, kursi: -4, janta: 2 }),
    right: s('Jhadu uthao. Clip chahiye.', { janta: 8, kursi: 6 }, { set: ['broom'] })
  },
  {
    id: 'statue',
    era: 'now',
    minTerm: 2,
    face: 'lalaji',
    speaker: 'Lalaji',
    role: 'Contracts and cement',
    text: 'Sahab, cement mere paas hai. Aapko patthar mein pichhle wale se lamba khada karun, ya clinic ki chhat pe daal dun? Clinic mere drawing mein hai hi nahi. Drawing ka paisa ho chuka hai.',
    left: s('Clinic ki chhat. Murti nahi.', { khazana: -6, janta: 6, kursi: -6 }),
    right: s('Murti aur lambi banao.', { kursi: 8, janta: 4, kanoon: -6 }, { set: ['statue'], queue: [['statue_bill', 2]] })
  },
  {
    id: 'statue_bill',
    era: 'any',
    queueOnly: true,
    need: ['statue'],
    face: 'lalaji',
    speaker: 'Lalaji',
    role: 'Contracts and cement',
    text: 'Sahab, murti ne clinic ka budget kha liya. Ghutne pe rok ke clinic ko paise de dun? Ya ghutne ko phase two bol dun? Phase two mein mera hissa banta hai.',
    left: s('Ghutne pe roko. Clinic ko do.', { khazana: -8, janta: 4, kursi: -4 }),
    right: s('Phase two. Ghutne ka bill.', { khazana: -10, kursi: 8, kanoon: -6 })
  },
  {
    id: 'foreign',
    era: 'now',
    minTerm: 2,
    face: 'envoy',
    speaker: 'The envoy',
    role: 'Trade draft',
    text: 'Sir, mere paas ek kalam hai aur trade ka draft. Aapki party ne plane mein thirty-eight log bitha diye. Photographer bol raha hai woh zaroori staff hai.',
    left: s('Main aur kalam. Baaki utaro.', { kursi: -4, kanoon: 4, khazana: 6 }),
    right: s('Thirty-eight. Kalam ka shot.', { khazana: -10, kursi: 6, janta: 4 }, { set: ['trip'], queue: [['mou', 2]] })
  },
  {
    id: 'mou',
    era: 'any',
    queueOnly: true,
    need: ['trip'],
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Sir, jo sign hua hai usme itna hai ki dono desh phir milenge. Bas. PDF waise hi chhodun, ya press ko historic handshake bata dun?',
    left: s('PDF waise hi chhapo.', { kanoon: 6, janta: -2 }),
    right: s('Historic handshake bolo.', { janta: 6, kursi: 6 })
  },
  {
    id: 'tiger',
    era: 'now',
    minTerm: 1,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, uncle ka voice note aaya hai. Subah nashte se pehle aapne tiger se kushti ki. Lunch se pehle delete karun, ya pin karke ek aur tiger chipka dun?',
    left: s('Delete karo. Abhi.', { kursi: -4, kanoon: 6 }),
    right: s('Pin karo. Tiger aur badhao.', { janta: 8, kursi: 4, kanoon: -6 }, { set: ['tiger'] })
  },
  {
    id: 'onions',
    era: 'now',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, pyaaz upar hai aur graphic mein aapke chehre pe aag lagi hai. Das second hain. Rate chalau, ya on air poochun kisne meri aag ke paise diye?',
    left: s('Pyaaz ka rate bolo.', { janta: 2, kanoon: 6, kursi: -4 }),
    right: s('Pocho, aag ka paisa kisne diya.', { janta: 6, kursi: 6, kanoon: -4 })
  },
  {
    id: 'urea',
    era: 'now',
    minTerm: 2,
    face: 'kisan',
    speaker: 'The farmer',
    role: 'Brought the bill',
    text: 'Sahab, urea khet mein aa gaya. Bill do baar aa gaya. Doosra kaat do. Ya mere muh pe bolo ki do baar dena hi reform hai.',
    left: s('Doosra bill kaat do.', { khazana: -10, janta: 8, kursi: -4 }, { set: ['bill_cut'] }),
    right: s('Bolo, yeh hi reform hai.', { kursi: 4, janta: -8 })
  },
  {
    id: 'cylinder',
    era: 'now',
    minTerm: 2,
    face: 'mausi',
    speaker: 'Mausi',
    role: 'Party treasurer',
    text: 'Beta, yeh cylinder aap pehle hi de chuke ho, log yaad rakhte hain. Wahi bhej dun, ya upar naya naam chhap ke function rakhun?',
    left: s('Jo bola tha, woh bhejo.', { khazana: -10, janta: 6 }),
    right: s('Naya naam. Function rakho.', { janta: 6, kursi: 6, khazana: -4 }, { set: ['acronym'] })
  },
  {
    id: 'nephew',
    era: 'now',
    minTerm: 3,
    face: 'mausi',
    speaker: 'Mausi',
    role: 'Party treasurer',
    text: 'Beta, bhatije ka CV ek page hai, uspe aapka surname bada chadhha hai. Exam mangalwar ko hai. Bhej dun, ya aaj raat sarkari company ka chairman bana dun? Board taali maar dega.',
    left: s('Exam pe bhejo.', { kursi: -6, kanoon: 8 }),
    right: s('Aaj raat chairman banao.', { kursi: 8, kanoon: -10, khazana: 4 }, { set: ['nephew'] })
  },
  {
    id: 'cricket',
    era: 'now',
    minTerm: 1,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, match jeet gaye. Graphic ready hai, jeet aapki scheme ki hai. Well played likh ke chup ho jaun, ya doosri party se pehle cup unke naam kar dun?',
    left: s('Well played. Bas.', { janta: 2 }),
    right: s('Cup scheme ke naam karo.', { janta: 8, kursi: 4 })
  },
  {
    id: 'ribbon',
    era: 'now',
    minTerm: 2,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, pul pe ribbon kat sakta hai. Scooter nahi nikal sakta. Scooter ke nikalne tak ruken, ya ribbon kaat ke scooter kheench ke shot mein le aayein?',
    left: s('Scooter nikle, tab ribbon.', { khazana: -6, janta: 6, kursi: -6 }),
    right: s('Ribbon kaato. Scooter ghaseeto.', { janta: 4, kursi: 8, kanoon: -6 }, { set: ['ribbon'] })
  },
  {
    id: 'committee',
    era: 'now',
    minTerm: 2,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Sir, pul girne wali committee ko ek aur committee chahiye, apni hi jaanch ke liye. Thekedar ka naam loon, campaign usi ne fund kiya tha? Ya unhe ek doosre ke peeche daudne dun, file apne aap mar jayegi.',
    left: s('Thekedar ka naam lo.', { kanoon: 8, kursi: -6 }),
    right: s('Unhe ek doosre pe chhod do.', { kursi: 6, kanoon: -8 })
  },
  {
    id: 'eight_pm',
    era: 'now',
    minTerm: 3,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, aath baje desh rukega. Ek asli kaam, ek line mein bol dijiye. Ya ek app launch kar dun aur keh dun subah tak sab theek?',
    left: s('Ek kaam. Ek line.', { kanoon: 6, kursi: -2 }, { set: ['plain_speech'] }),
    right: s('App chalu karo. Aaj raat.', { janta: 6, kursi: 6, kanoon: -6 }, { set: ['the_app'], queue: [['app_morning', 1]] })
  },
  {
    id: 'app_morning',
    era: 'any',
    queueOnly: true,
    need: ['the_app'],
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, app aapka naam likhte hi crash ho jati hai. Trending isko masterstroke bol raha hai. Jab tak khule na, utaar dun? Ya bol dun log phone galat pakad rahe hain?',
    left: s('Utaar do, jab tak khule.', { kanoon: 6, kursi: -6, janta: 2 }),
    right: s('Bolo, phone galat pakda hai.', { kursi: 6, janta: -4, kanoon: -4 })
  },
  {
    id: 'mango',
    era: 'now',
    minTerm: 2,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, aaj haftawar baat hai. Pyaaz mehnga hai, aam accha hai. Mujhe rate dijiye, main wahi chalaungi. Ya bees minute aam ki tareef kijiye, main sirf wahi kaatungi.',
    left: s('Pyaaz ka rate bolo.', { janta: 6, kursi: -2 }),
    right: s('Aam ki tareef. Bees minute.', { kursi: 6, janta: -4 })
  },
  {
    id: 'garland',
    era: 'now',
    minTerm: 1,
    face: 'mausi',
    speaker: 'Mausi',
    role: 'Party treasurer',
    text: 'Beta, yeh mala us file se bhaari hai jo iske neeche dabi hai. Utaar ke padhiye. Ya live pe pehne rahiye. Phool, file se behtar dikhte hain.',
    left: s('Mala utaro. File padho.', { kanoon: 4, janta: -2 }),
    right: s('Pehen ke live ho jao.', { janta: 6, kursi: 4 })
  },
  {
    id: 'survey',
    era: 'now',
    minTerm: 3,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, survey ko round karke 112 percent khush kar diya. Asli number doosre phone pe hai. Meeting se pehle asli bhejun, ya 112 bold mein chhap dun?',
    left: s('Asli number bhejo.', { kursi: -6, kanoon: 6 }),
    right: s('112 chhapo. Bold mein.', { kursi: 8, janta: 4, kanoon: -6 })
  },
  {
    id: 'poem',
    era: 'now',
    minTerm: 2,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, opposition ne aapki khamoshi pe kavita daal di. Rhyming hai, aur chal rahi hai. Chhod dun? Ya case karun aur ek sher wapas bhej dun?',
    left: s('Kavita chhod do.', { kanoon: 2 }),
    right: s('Case karo. Sher bhejo.', { kursi: 6, janta: 2, kanoon: -8 }, { set: ['couplet'] })
  },
  {
    id: 'millet',
    era: 'now',
    minTerm: 2,
    face: 'envoy',
    speaker: 'The envoy',
    role: 'Trade draft',
    text: 'Sir, dinner pe bajra rakha hai, jaise office ne kaha tha. Parking mein Lalaji ka chef, fountain, aur drone wait kar rahe hain. Kitchen ko kya bolun?',
    left: s('Bajra do. Ek baar samjhao.', { janta: 4, khazana: 2 }),
    right: s('Chef bulao. Fountain bhi.', { khazana: -10, kursi: 6, janta: 2 })
  },
  {
    id: 'forty_stops',
    era: 'now',
    minTerm: 3,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, is hafte chaalees stop hain. Teesre pe school ki chhat nahi hai. Barahve pe drone aur ribbon hai. Chhat karke tour kaat dun, ya chaalees ke chaalees, barahve ka video?',
    left: s('Pehle chhat. Tour kaato.', { khazana: -8, janta: 8, kursi: -6 }),
    right: s('Chaalees stop. Barahve pe drone.', { janta: 6, kursi: 8, khazana: -6 })
  },
  {
    id: 'baba_box',
    era: 'now',
    minTerm: 3,
    face: 'baba',
    speaker: 'Babaji',
    role: 'Ashram and airtime',
    text: 'Pradhan Mantri ji, guruvar ko live ashirwad dunga. Bhakton ko pata chalna chahiye kaun si party dharm pe khadi hai. Ashram ko zameen de dijiye, aankhen khul jayengi. Dabbe mein chanda hai, ashirwad nahi.',
    left: s('Zameen nahi. Guruvar ko cabinet.', { kursi: -6, kanoon: 6 }),
    right: s('Zameen do. Unhe live pe lao.', { janta: 6, kursi: 6, kanoon: -8, khazana: 4 }, { set: ['blessed'] })
  },
  {
    id: 'convoy',
    era: 'now',
    minTerm: 1,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, gaadiyan sadak pe hain. Peeche ambulance horn baja rahi hai, jaise koi prarthna ho. Camera sirf gaadiyon pe hai. Side le lun, ya clip saaf rakhne ke liye chalte rahen?',
    left: s('Side lo. Ambulance nikalne do.', { janta: 8, kursi: -4 }),
    right: s('Chalte raho. Clip saaf rakho.', { kursi: 6, janta: -6 })
  },
  {
    id: 'anchor',
    era: 'now',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, desh jaanna chahta hai. Jawab maine aapke peeche banner pe pehle se chhap diya hai. Jo maine poocha uska jawab dijiye, ya mera hi banner mujhe padh ke sunaiye.',
    left: s('Jo poocha, uska jawab do.', { kanoon: 6, kursi: -4 }),
    right: s('Banner padh ke wapas do.', { janta: 6, kursi: 6 })
  },
  {
    id: 'blame',
    era: 'now',
    minTerm: 2,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, rally pe baarish ho gayi. Graphic mein pichhli sarkar badal pakde khadi hai. Mausam bolo, ya camera pe badal ki taraf ungli karo. Mausam bola to main bewakoof dikhunga.',
    left: s('Bolo, yeh mausam hai.', { kanoon: 4, kursi: -4 }),
    right: s('Badal ki taraf ungli karo.', { janta: 6, kursi: 8, kanoon: -4 }, { set: ['blamed'] })
  },
  {
    id: 'yoga',
    era: 'now',
    minTerm: 1,
    face: 'baba',
    speaker: 'Babaji',
    role: 'Ashram and airtime',
    text: 'Pradhan Mantri ji, camera bhagton se zyada paas aa gaye hain. Pyaaz wali meeting isi minute hai. Pose tab tak, jab tak trend na ho jaye. Ya lawn chhod ke meeting mein chale jaiye.',
    left: s('Lawn chhodo. Meeting lo.', { kanoon: 6, janta: -2, kursi: -2 }),
    right: s('Pose pakdo, jab tak trend ho.', { janta: 8, kursi: 4 })
  },
  {
    id: 'no_questions',
    era: 'now',
    minTerm: 2,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Sir, press baith chuki hai. Podium pe note chipka hai, sawal nahi lene. Note aapki speech se bada hai. Teen sawal le lijiye, ya note padh ke nikal jaiye.',
    left: s('Teen sawal le lo.', { kanoon: 6, kursi: -4 }),
    right: s('Note padho. Nikal jao.', { kursi: 6, janta: -2, kanoon: -4 })
  },
  {
    id: 'the_flip',
    era: 'later',
    priority: true,
    need: ['crossed'],
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Sir, saal badal gaya. Gaddha nahi badla. Ab woh hawa mein latak raha hai, main usko sector bol raha hoon. Ribbon glove box mein padi hai. Bharun, ya hover ka udghatan karun?',
    left: s('Yeh gaddha hai. Bharo.', { khazana: -6, janta: 8, kursi: -4 }),
    right: s('Hover ka udghatan karo.', { kursi: 8, janta: 4 }, { set: ['hover'] })
  },
  {
    id: 'hologram',
    era: 'later',
    minTerm: 1,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, aaj raat aapka chehra chaar sau shehron mein khada kar sakta hoon. Muh teen second baad aayega. Ek sheher mein khud boliye, ya chaar sau bhej ke der ko main charisma bol dun?',
    left: s('Ek sheher. Khud bolo.', { janta: 4, kursi: -4 }),
    right: s('Chaar sau bhejo. Der rehne do.', { janta: 8, kursi: 6, kanoon: -4 }, { set: ['hologram'] })
  },
  {
    id: 'seventh',
    era: 'later',
    minTerm: 1,
    face: 'lalaji',
    speaker: 'Lalaji',
    role: 'Contracts and cement',
    text: 'Sahab, yeh usi loop ka saatva udghatan hai. Pehle chhe bhi historic the. Pod tab hilta hai jab do intern dhakka dein aur koi shoot na kare. Chhupa ke dhakka, ya saatvi ribbon aur un chhe ko bulawa?',
    left: s('Chhupa ke dhakka. Ribbon nahi.', { kanoon: 6, kursi: -4, khazana: -2 }),
    right: s('Saatvi ribbon. Unhe bulao.', { kursi: 8, janta: 4 })
  },
  {
    id: 'mars_stone',
    era: 'later',
    minTerm: 2,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Sir, dome chhota pad gaya. Aapki murti nahi. Engineer ne note bheja hai, maine khola nahi, note aksar negative hote hain. Murti chhoti karun, ya dome uncha karke note bahar chhod dun?',
    left: s('Murti chhoti karo.', { kanoon: 6, khazana: -4, kursi: -2 }),
    right: s('Dome uncha karo. Note bahar.', { khazana: -8, kursi: 8, janta: 4, kanoon: -6 })
  },
  {
    id: 'noon_model',
    era: 'later',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, dopahar ko ek model ne aapki speech padh di. Aapse saaf padhi. Desh ne taali maari. Bolun yeh aap nahi the, ya taali aap rakh lijiye aur writer ko main nikaal dun?',
    left: s('Bolo, woh main nahi tha.', { janta: -4, kanoon: 8, kursi: -4 }),
    right: s('Taali lo. Writer ko nikaalo.', { janta: 6, kursi: 6 }, { set: ['took_clap'] })
  },
  {
    id: 'chai_code',
    era: 'later',
    minTerm: 1,
    face: 'kisan',
    speaker: 'The stall',
    role: 'Brought the bill',
    text: 'Sahab, rupaya ab code hai. Mere stall pe signal nahi, ketli bhari hai. Jo haath mein aa sake woh de dijiye. Update bolenge to chai thandi ho jayegi.',
    left: s('Jo woh pakad sake, woh do.', { khazana: -4, janta: 8 }),
    right: s('Bolo, stall update karo.', { kursi: 4, janta: -8 })
  },
  {
    id: 'leds',
    era: 'later',
    minTerm: 2,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Sir, nadi abhi bhi naala hai. Lights lag gayi hain, raat ko faisla lagta hai. Footage mere paas hai, paani nahi. Lights band karke naale ko paisa dun, ya isko riverfront bol ke chhod dun?',
    left: s('Lights band. Naale ko paise.', { khazana: -8, janta: 6, kanoon: 4 }),
    right: s('Footage chhodo. Riverfront bolo.', { janta: 6, kursi: 6, kanoon: -6 })
  },
  {
    id: 'generator',
    era: 'later',
    minTerm: 2,
    face: 'envoy',
    speaker: 'The envoy',
    role: 'Trade draft',
    text: 'Sir, climate wala kagaz sign ke liye ready hai. Stage ka generator aapke lafzon se zyada awaaz kar raha hai. Sign karke band karun, ya usse tez sign kar ke main uska naam hi na loon?',
    left: s('Sign karo. Generator band.', { kanoon: 6, kursi: -4, janta: 2 }),
    right: s('Generator se tez sign karo.', { kursi: 6, janta: 4 })
  },
  {
    id: 'buffer',
    era: 'later',
    minTerm: 3,
    face: 'mausi',
    speaker: 'Mausi',
    role: 'Party treasurer',
    text: 'Beta, bhatija ab saal bhar ka subscription hai. Company abhi bhi maang raha hai. Thank you bolte hi atak jata hai. Plan kaat dun, ya isi atke hue ko chairman bana dun?',
    left: s('Subscription kaat do.', { kursi: -8, kanoon: 6 }),
    right: s('Atke hue ko chairman banao.', { kursi: 8, kanoon: -8, khazana: 4 }, { set: ['nephew'] })
  },
  {
    id: 'crater',
    era: 'later',
    minTerm: 2,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Sir, chaand pe ek gaddhe ka naam nahi hai. Aapki ek scheme ka result bhi nahi hai. Dono ki shaadi kar dun? Chaand likh ke aitraaz nahi kar sakta.',
    left: s('Chaand ko akele chhod do.', { kanoon: 4 }),
    right: s('Scheme ka naam uspe likh do.', { kursi: 8, janta: 4 })
  },
  {
    id: 'blink',
    era: 'later',
    minTerm: 2,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, budget speech pe Mausi ka chehra laga sakta hoon. Comma pe woh palak jhapkengi. Log table se zyada palak maante hain. Asli Mausi aur asli table bhejun, ya palak chalne dun?',
    left: s('Asli Mausi. Asli table.', { kanoon: 6, kursi: -4 }),
    right: s('Palak jhapakne do.', { janta: 4, kursi: 6, kanoon: -8 })
  },
  {
    id: 'robot_bill',
    era: 'later',
    minTerm: 2,
    face: 'kisan',
    speaker: 'The farmer',
    role: 'Brought the bill',
    text: 'Sahab, subsidy notification ban ke aayi. Use kha nahi sakta. Khet wala robot apna bill bhej raha hai, aur bill badtameez hai. Mujhe de dijiye aur robot rokiya. Ya boliye robot hi reform hai.',
    left: s('Unhe do. Robot ka bill roko.', { khazana: -8, janta: 8 }, { set: ['bill_cut'] }),
    right: s('Bolo, robot hi reform hai.', { janta: -6, kursi: 6 })
  },
  {
    id: 'weightless',
    era: 'later',
    minTerm: 3,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Sir, nayi colony mein gravity theek nahi chal rahi. Committee bana di hai, aur committee hawa mein hai. Is baar mazak nahi. Ek engineer neeche bhejun, ya photo hone tak unhe tairne dun?',
    left: s('Ek engineer neeche bhejo.', { kanoon: 8, kursi: -4 }),
    right: s('Photo tak unhe tairne do.', { kursi: 6, janta: 2 })
  },
  {
    id: 'two_clocks',
    era: 'later',
    minTerm: 2,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, do ghadi chhap di hain. Ek desh ki. Ek rally ki, taaki aap na der se aayein na jaldi. Ek rakhun, ya rally wale time ko mood bata dun?',
    left: s('Ek hi ghadi rakho.', { kursi: -4, kanoon: 6 }),
    right: s('Dono chalao. Mood bolo.', { janta: 6, kursi: 6, kanoon: -4 })
  },
  {
    id: 'blame_later',
    era: 'later',
    minTerm: 2,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, meteor ne ribbon wala tent uda diya. Graphic mein pichhli sadi patthar pakde khadi hai. Patthar bolo, ya camera pe us sadi ki taraf ungli karo?',
    left: s('Bolo, yeh patthar hai.', { kanoon: 4, kursi: -4 }),
    right: s('Pichhli sadi ki taraf ungli.', { janta: 6, kursi: 8, kanoon: -4 })
  },
  {
    id: 'convoy_later',
    era: 'later',
    minTerm: 1,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Sir, aapke hologram sky lane pe khade hain. Peeche medical drone laal blink kar raha hai. Camera sirf hologram ke liye theek hain. Lane chhodun, ya shot rehne dun?',
    left: s('Lane chhodo. Drone jaane do.', { janta: 8, kursi: -4 }),
    right: s('Lane mat chhodo. Shot live hai.', { kursi: 6, janta: -6 })
  },
  {
    id: 'tiger_later',
    era: 'later',
    minTerm: 1,
    block: ['tiger'],
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, purani sadi se voice note aaya hai. Nashte se pehle aapne tiger se kushti ki thi. Tiger ko retire karun, ya dinner se pehle dome pe pin kar dun?',
    left: s('Tiger ko retire karo.', { kursi: -4, kanoon: 6 }),
    right: s('Dome pe pin kar do.', { janta: 8, kursi: 4, kanoon: -6 }, { set: ['tiger'] })
  },
  {
    id: 'copies',
    era: 'later',
    priority: true,
    minTerm: 8,
    need: ['tiger', 'took_clap', 'hologram'],
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, aapke teen version trend pe hain. Tiger wala, dopahar wali speech, aur jo chaar sau shehron mein late pahunchta hai. Do extra se istifa likhun, ya teeno ko tankhwah pe rehne dun?',
    left: s('Do extra se istifa likho.', {}, { ending: 'copies' }),
    right: s('Teeno ko tankhwah pe rakho.', { janta: 8, kursi: 4, kanoon: -10 })
  },
  {
    id: 'immortal',
    era: 'any',
    spine: true,
    minTerm: 36,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Sir, kursi aapke baad bhi chal sakti hai. Ek bulb pe aapki muskurahat padi hai. Invoice clear ho to hi palak jhapakti hai. Band karke ghar bhej dun, ya bulb ko kursi pe baitha dun?',
    left: s('Band karo. Ghar jao.', {}, { ending: 'tea' }),
    right: s('Bulb ko kursi pe baitha do.', { kursi: 8, janta: -4, kanoon: -6 }, { set: ['bulb'] })
  },
  {
    id: 'fill_power',
    era: 'now',
    repeat: true,
    weight: 1,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Sir, chaar se paanch cabinet mein light chali jati hai. Aap usi waqt faisla karte hain. Mombatti hai. Andhere mein chhota faisla kar lijiye, ya tube light ka intezaar, main press ko bata dunga humne wait kiya.',
    left: s('Andhere mein kar lo. Chhota.', { kanoon: 4 }),
    right: s('Light ka wait karo. Press ko bolo.', { kursi: 2, janta: -2 })
  },
  {
    id: 'fill_rain',
    era: 'now',
    repeat: true,
    weight: 1,
    minTerm: 1,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, match baarish se ruka pada hai. Desh tarpaulin dekh raha hai. Chup rahiye, baarish hai. Ya baarish ko thank you kar dijiye, doosri side se pehle.',
    left: s('Chup raho. Baarish hai.', { kanoon: 2 }),
    right: s('Baarish ko thank you. Post karo.', { janta: 4, kursi: 2 })
  },
  {
    id: 'fill_biscuit',
    era: 'later',
    repeat: true,
    weight: 1,
    face: 'mausi',
    speaker: 'Mausi',
    role: 'Party treasurer',
    text: 'Beta, colony ki canteen mein wahi biscuit hai. Do ministry se purana. Chupke se badal dun, ya isko virasat bol ke paise loon?',
    left: s('Chupke biscuit badal do.', { khazana: -2, janta: 2 }),
    right: s('Virasat bolo. Paise lo.', { kursi: 4, janta: 2, khazana: 2 })
  },
  {
    id: 'fill_lag',
    era: 'later',
    repeat: true,
    weight: 1,
    minTerm: 2,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, aapka shok teen second late aaya, phir dobara, phir teesri baar. Ek maafi aur loop kaat dun? Ya bolun teen baar isliye aaya kyunki aap sach mein dukhi hain?',
    left: s('Ek maafi. Loop kaato.', { janta: 2, kanoon: 2 }),
    right: s('Bolo, teen baar matlab sachcha dukh.', { kursi: 4, janta: -4 })
  },
  {
    id: 'fill_oxygen',
    era: 'later',
    repeat: true,
    weight: 1,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Sir, bill pe oxygen phir aa gaya. Rally ne hospital se zyada kheench liya, maine line pe nishaan laga diya hai. Pehle wing ka bill bhijwaun, ya bolun rally bhi zaroori thi?',
    left: s('Pehle hospital ka bill.', { khazana: -6, janta: 4, kursi: -2 }),
    right: s('Bolo, rally bhi zaroori thi.', { kursi: 4, janta: -4, kanoon: -2 })
  }
]

export function deathEnding(gauge: Gauge, high: boolean, flags: Set<string>): Ending {
  if (gauge === 'janta' && high && flags.has('bulb')) return ENDINGS.janta_high_bulb
  if (gauge === 'kursi' && !high && flags.has('nephew')) return ENDINGS.kursi_low_nephew
  return ENDINGS[`${gauge}_${high ? 'high' : 'low'}`]
}

export function chairOf(flags: Set<string>): string {
  if (flags.has('bulb')) return 'Hologram'
  return 'Prime Minister'
}
