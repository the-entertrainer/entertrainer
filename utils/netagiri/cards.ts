/** Netagiri — Belpur. Two answers. Four bars. A choice can come back years later. */

export type Gauge = 'janta' | 'khazana' | 'kursi' | 'kanoon'
export type Face =
  | 'manoj' | 'harpal' | 'renu' | 'neha' | 'vikram' | 'shalini'
  | 'dalbeer' | 'meera' | 'kamla' | 'joshi' | 'girdhar' | 'bose'

export type Delta = Partial<Record<Gauge, number>>

export type Side = {
  text: string
  d?: Delta
  set?: string[]
  clear?: string[]
  queue?: [id: string, inTurns: number][]
  next?: string
  ending?: string
  /** If the flag is already set, add these shifts too. */
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
  minAge?: number
  maxAge?: number
  need?: string[]
  /** All of these must be missing. */
  block?: string[]
  /** At least one of these flags. */
  any?: string[]
  /** Gauge must be at or below this. */
  maxGauge?: Partial<Record<Gauge, number>>
  weight?: number
  spine?: boolean
  queueOnly?: boolean
  /** Offer this before a random year, once the flags fit. */
  priority?: boolean
  repeat?: boolean
}

export type Ending = { id: string; headline: string; epitaph: string }

const s = (
  text: string,
  d?: Delta,
  rest?: Omit<Side, 'text' | 'd'>
): Side => ({ text, d, ...rest })

export const GAUGES: { key: Gauge; label: string; hint: string }[] = [
  { key: 'janta', label: 'Janta', hint: 'The street' },
  { key: 'khazana', label: 'Khazana', hint: 'The chest' },
  { key: 'kursi', label: 'Kursi', hint: 'The party' },
  { key: 'kanoon', label: 'Kanoon', hint: 'The file' }
]

export const FACES: Record<Face, string> = {
  manoj: '/netagiri/manoj.jpg',
  harpal: '/netagiri/harpal.jpg',
  renu: '/netagiri/renu.jpg',
  neha: '/netagiri/neha.jpg',
  vikram: '/netagiri/vikram.jpg',
  shalini: '/netagiri/shalini.jpg',
  dalbeer: '/netagiri/dalbeer.jpg',
  meera: '/netagiri/meera.jpg',
  kamla: '/netagiri/kamla.jpg',
  joshi: '/netagiri/joshi.jpg',
  girdhar: '/netagiri/girdhar.jpg',
  bose: '/netagiri/bose.jpg'
}

export const ENDINGS: Record<string, Ending> = {
  janta_low: {
    id: 'janta_low',
    headline: 'NOTA',
    epitaph: 'The booth stayed quiet. Your symbol lost to a blank, and the loudspeaker skipped your name.'
  },
  janta_high: {
    id: 'janta_high',
    headline: 'The stage',
    epitaph: 'They came to look at you. The garlands kept coming, and there was no room left to stand.'
  },
  khazana_low: {
    id: 'khazana_low',
    headline: 'The bag',
    epitaph: 'The ticket went to the man who brought the cash. The lender took the car that week.'
  },
  khazana_high: {
    id: 'khazana_high',
    headline: 'The count',
    epitaph: 'The notes were still in the machine when the doorbell rang. The list of houses was longer than your speech.'
  },
  kursi_low: {
    id: 'kursi_low',
    headline: 'Never in the party',
    epitaph: 'The spokesperson said you had never belonged. The lock on the gate was new.'
  },
  kursi_low_meera: {
    id: 'kursi_low_meera',
    headline: 'The house lock',
    epitaph: 'Meera had already changed the house lock. The party only agreed with her.'
  },
  kursi_high: {
    id: 'kursi_high',
    headline: 'The morning walk',
    epitaph: 'You were the only name left on the banner. The truck on the ring road had no plate.'
  },
  kanoon_low: {
    id: 'kanoon_low',
    headline: 'The report',
    epitaph: 'The report said you reached for a weapon. The lane had one lamp, and it was out.'
  },
  kanoon_high: {
    id: 'kanoon_high',
    headline: 'The stamp',
    epitaph: 'A retired judge has to nod before you buy milk. The chair is still in the room. You just cannot use it.'
  },
  remembered: {
    id: 'remembered',
    headline: 'Four hundred votes',
    epitaph: 'You lost the seat. The drain in Lane 4 still takes the rain.'
  },
  bulletin: {
    id: 'bulletin',
    headline: 'Mute',
    epitaph: 'The bulletin played your voice. You watched it in a side room, with the sound off.'
  },
  tea: {
    id: 'tea',
    headline: 'The chair, left',
    epitaph: 'You left the chair while it was still yours. Belpur did not shout. Someone made tea.'
  }
}

export const CARDS: StoryCard[] = [
  {
    id: 'dummy_school',
    face: 'manoj',
    speaker: 'Manoj',
    role: 'Coaching agent',
    text: 'Manoj puts a form on the desk. The principal will mark you present. You will sit in a room with no window and call it school.',
    spine: true,
    left: s('I want the real school.', { kursi: -6, kanoon: 8 }, { set: ['refused_dummy'], next: 'real_lab' }),
    right: s('I\'ll sign.', { khazana: -4, kursi: 6, kanoon: -8 }, { set: ['dummy_signed'], next: 'dummy_cut' })
  },
  {
    id: 'real_lab',
    face: 'kamla',
    speaker: 'Kamla',
    role: 'Your mother',
    text: 'The lab has one working burner. Kamla packed the tiffin anyway. She asks if the mark on the form is a true one.',
    queueOnly: true,
    need: ['refused_dummy'],
    left: s('Stay for the practical.', { kanoon: 6, kursi: -4 }),
    right: s('Skip it. The test is Sunday.', { kursi: 6, janta: 2, kanoon: -4 })
  },
  {
    id: 'dummy_cut',
    face: 'manoj',
    speaker: 'Manoj',
    role: 'Coaching agent',
    text: 'Three boys from your lane want the same form. Manoj says the cut is yours if you bring them.',
    queueOnly: true,
    need: ['dummy_signed'],
    left: s('Send them. Take nothing.', { janta: 6, kursi: -4 }),
    right: s('Ten percent.', { khazana: 10, janta: -4, kanoon: -6 }, { set: ['broker'] })
  },
  {
    id: 'senior_letter',
    face: 'harpal',
    speaker: 'Harpal',
    role: 'A year ahead of you',
    minAge: 18,
    maxAge: 23,
    need: ['refused_dummy'],
    text: 'Harpal has a letter against dummy schools. He wants your name under his. The principal will see it before lunch.',
    left: s('Sign the letter.', { janta: 8, kursi: -8, kanoon: 4 }, { set: ['pil_name'] }),
    right: s('Keep your head down.', { kursi: 4, janta: -4 })
  },
  {
    id: 'ground_mix',
    face: 'manoj',
    speaker: 'Manoj',
    role: 'Coaching agent',
    minAge: 18,
    maxAge: 23,
    text: 'A mixer is on the football ground. Manoj wants a hoarding where the goal used to be. The boys are already in their vests.',
    left: s('Sit on the wet ground.', { janta: 8, kursi: -6 }, { set: ['sat_ground'] }),
    right: s('Let them pour.', { khazana: 6, janta: -6 }, { set: ['hoarding'] })
  },
  {
    id: 'sleeves',
    face: 'joshi',
    speaker: 'Joshi',
    role: 'Invigilator, this year',
    minAge: 18,
    maxAge: 23,
    text: 'Joshi taps your sleeve and looks away. He is only an invigilator this year. The formulas can live there. He will not be the one who saw them.',
    left: s('Empty sleeves.', { kanoon: 8, kursi: -4 }),
    right: s('The formulas stay.', { kursi: 8, kanoon: -10, janta: -2 }, { set: ['cheated'] })
  },
  {
    id: 'night_tuition',
    face: 'kamla',
    speaker: 'Kamla',
    role: 'Your mother',
    minAge: 19,
    maxAge: 24,
    text: 'The younger children wait on the steps after dark. One of them is the widow\'s son. Kamla says the tea is already made.',
    left: s('Teach for the tea.', { janta: 8, khazana: -2 }),
    right: s('Charge the going rate.', { khazana: 8, janta: -6 }, { set: ['tuition_hard'] })
  },
  {
    id: 'flag_at_gate',
    face: 'shalini',
    speaker: 'Shalini',
    role: 'Party office',
    minAge: 19,
    maxAge: 25,
    text: 'Shalini stops at the coaching gate. She does not want a speech. She wants someone who can hold a flag until the convoy passes.',
    left: s('Go home.', { kursi: -6, kanoon: 2 }),
    right: s('Hold the flag.', { kursi: 10, janta: 4 }, { set: ['flag_boy'] })
  },
  {
    id: 'fare_hike',
    face: 'harpal',
    speaker: 'Harpal',
    role: 'Students on the bus',
    minAge: 18,
    maxAge: 24,
    text: 'The fare went up by two rupees. The bus will not move. Harpal is in the door, and the driver has switched the engine off.',
    left: s('Pay, and sit.', { janta: -4, kanoon: 4 }),
    right: s('Stay in the door.', { janta: 8, kursi: 4, kanoon: -6 })
  },
  {
    id: 'result_morning',
    face: 'kamla',
    speaker: 'Kamla',
    role: 'Your mother',
    spine: true,
    minAge: 21,
    text: 'The result is on the board outside the centre. Kamla has the tiffin. She has not opened it.',
    left: s('Read it with her.', { janta: 4, kursi: -2 }),
    right: s('Tell her a higher number.', { kursi: 4, janta: -6 }, { set: ['lied_score'], extraIf: { flag: 'cheated', d: { kanoon: -6 } } })
  },
  {
    id: 'campus_gate',
    face: 'harpal',
    speaker: 'Harpal',
    role: 'Union slate',
    spine: true,
    minAge: 24,
    text: 'The union vote is on Thursday. Harpal can put your hostel on his slate, or you can stand alone on the mess bill. The food really is bad.',
    left: s('Stand on the mess bill.', { janta: 8, kursi: -6 }, { set: ['union_plain'], next: 'mess_roster' }),
    right: s('Take his slate.', { kursi: 10, khazana: 4, janta: -2 }, { set: ['union_slate'], next: 'blank_voucher' })
  },
  {
    id: 'mess_roster',
    face: 'harpal',
    speaker: 'Harpal',
    role: 'Union',
    queueOnly: true,
    need: ['union_plain'],
    text: 'You won the hostel. Now the mess wants names. Harpal says a roster on the door will start a fight, and a quiet list will not.',
    left: s('Pin the roster up.', { kanoon: 6, janta: 4, kursi: -4 }),
    right: s('Keep the good chairs.', { kursi: 6, janta: -6 })
  },
  {
    id: 'blank_voucher',
    face: 'shalini',
    speaker: 'Shalini',
    role: 'Party office',
    queueOnly: true,
    need: ['union_slate'],
    text: 'Shalini slides a voucher across. The amount is blank. She says the union tea has to come from somewhere.',
    left: s('No blank paper.', { kursi: -8, kanoon: 8 }),
    right: s('Sign it.', { khazana: 8, kanoon: -8 }, { set: ['blank_voucher'] })
  },
  {
    id: 'rail_card',
    face: 'harpal',
    speaker: 'Harpal',
    role: 'Union',
    minAge: 24,
    maxAge: 32,
    text: 'The recruitment exam slipped by a season. Harpal wants the evening train stopped. People with tickets are already on the platform.',
    left: s('March to the collector. Home by dusk.', { janta: 2, kursi: -8, kanoon: 6 }, { set: ['candle'] }),
    right: s('Stop the train.', { janta: 10, kursi: 8, kanoon: -12 }, { set: ['train'], queue: [['freight_envelope', 1], ['fir_file', 3]] })
  },
  {
    id: 'freight_envelope',
    face: 'joshi',
    speaker: 'The station master',
    role: 'Through a clerk',
    queueOnly: true,
    need: ['train'],
    text: 'A clerk brings an envelope and a map of the freight line. The passenger train can move if the shouting moves with it.',
    left: s('Stay where you said.', { janta: 4, kanoon: -4 }),
    right: s('Take the envelope.', { khazana: 12, janta: -8, kanoon: -6 }, { set: ['freight_deal'] })
  },
  {
    id: 'fir_file',
    face: 'dalbeer',
    speaker: 'Dalbeer',
    role: 'Inspector',
    queueOnly: true,
    need: ['train'],
    text: 'Dalbeer taps a thin file. It can be a meeting in his office. It can also be a case with your name on page one.',
    left: s('Meet him. Sign your name.', { kanoon: 6, kursi: -4 }, { set: ['fir_owned'] }),
    right: s('Ask Shalini to move it.', { kanoon: -8, kursi: 6, khazana: -4 }, { set: ['file_moved'] })
  },
  {
    id: 'reading_room',
    face: 'meera',
    speaker: 'Meera',
    role: 'Before you knew her name',
    minAge: 24,
    maxAge: 30,
    text: 'The reading room has twelve good chairs and forty people. Meera has a list. She will pin it up if you do not stop her.',
    left: s('Let her pin it.', { kanoon: 6, janta: 4 }),
    right: s('Your hostel keeps the chairs.', { kursi: 6, janta: -6 })
  },
  {
    id: 'neha_train',
    face: 'neha',
    speaker: 'Neha',
    role: 'Campus paper',
    minAge: 25,
    maxAge: 34,
    need: ['train'],
    text: 'Neha has the platform on a tape. She asks who told the train to stop, and whether the freight line was always the plan.',
    left: s('Sit and answer.', { janta: 6, kursi: -8 }, { set: ['on_record'] }),
    right: s('No comment. Leave.', { kursi: 4, janta: -4 })
  },
  {
    id: 'neha_voucher',
    face: 'neha',
    speaker: 'Neha',
    role: 'Campus paper',
    minAge: 25,
    maxAge: 34,
    need: ['blank_voucher'],
    block: ['train'],
    text: 'Neha found a voucher with your signature and no amount. She has not printed it. She wants to know what the tea cost.',
    left: s('Tell her the number.', { janta: 4, kursi: -8, kanoon: 4 }, { set: ['on_record'] }),
    right: s('Call it a student receipt.', { kursi: 4, kanoon: -6 })
  },
  {
    id: 'block_or_union',
    face: 'shalini',
    speaker: 'Shalini',
    role: 'Party office',
    minAge: 27,
    maxAge: 33,
    text: 'A desk is free at the block office. The pay is small and the chair is real. Shalini would rather you stay where the students can see you.',
    left: s('Take the desk.', { kanoon: 6, kursi: -4, khazana: 4 }, { set: ['block_job'] }),
    right: s('Stay with the union.', { kursi: 8, khazana: -4 }, { set: ['stayed_union'] })
  },
  {
    id: 'ward_price',
    face: 'shalini',
    speaker: 'Shalini',
    role: 'Party office',
    spine: true,
    minAge: 34,
    text: 'The ward ticket has a price. Shalini does not call it that. She calls it printing, petrol, and respect. You can also walk Lane 4 with one poster.',
    left: s('Walk the lane yourself.', { janta: 8, kursi: -8, khazana: -6 }, { set: ['walked'], next: 'count_walked' }),
    right: s('Pay what she named.', { kursi: 10, khazana: -12 }, { set: ['ticket_bought'], next: 'count_bought' })
  },
  {
    id: 'count_walked',
    face: 'bose',
    speaker: 'Bose',
    role: 'Returning officer',
    queueOnly: true,
    need: ['walked'],
    text: 'Bose reads the sheet without looking up. The ink is still wet in two boxes. He will count what is in front of him, or he will count it again in court.',
    left: s('Accept this sheet.', { janta: 4, kursi: -2 }, { set: ['ward_won'] }),
    right: s('Count it again in court.', { kursi: -8, kanoon: 6 }, { set: ['ward_won', 'court_fuss'] })
  },
  {
    id: 'count_bought',
    face: 'shalini',
    speaker: 'Shalini',
    role: 'Party office',
    queueOnly: true,
    need: ['ticket_bought'],
    text: 'The numbers arrived early. Shalini smiles with her mouth only. The seat is yours if you can stand the way it was won.',
    left: s('Take the seat.', { kursi: 6, kanoon: -8 }, { set: ['ward_won'] }),
    right: s('Not like this.', { janta: 10, kursi: -12 }, { set: ['refused_seat'] })
  },
  {
    id: 'drain_lane',
    face: 'renu',
    speaker: 'Renu',
    role: 'Lane secretary',
    minAge: 34,
    maxAge: 48,
    text: 'Lane 4 floods to the third step. Renu has the ward fund on one page and the party banner on the next. Only one of them fits this year.',
    left: s('The drain gets the fund.', { khazana: -8, janta: 10, kursi: -6 }, { set: ['drain_fixed'] }),
    right: s('The banner gets the fund.', { kursi: 8, janta: -8 }, { set: ['drain_wait'] })
  },
  {
    id: 'pandal_gap',
    face: 'renu',
    speaker: 'Renu',
    role: 'Lane secretary',
    minAge: 34,
    maxAge: 46,
    text: 'The Diwali pandal is short. The sweet shop on the corner has already said no. Renu will not say the next part out loud. You know it anyway.',
    left: s('A smaller pandal. Leave the shop.', { janta: -4, kursi: -4, kanoon: 6 }, { set: ['small_puja'] }),
    right: s('Mention last year\'s licence.', { khazana: 10, kanoon: -8, janta: 2 }, { set: ['licence_word'], queue: [['shop_paper', 2]] })
  },
  {
    id: 'shop_paper',
    face: 'neha',
    speaker: 'Neha',
    role: 'Now at the district paper',
    queueOnly: true,
    need: ['licence_word'],
    text: 'The shop owner\'s nephew wrote it down. Neha has the page. It is not a poem. It is a date, a sum, and your name said in a lane.',
    left: s('Let the page reach the desk.', { kanoon: 8, khazana: -6, janta: 4 }, { set: ['on_record'] }),
    right: s('Ask Dalbeer to misplace it.', { kanoon: -8, kursi: 6 }, { set: ['paper_lost'], queue: [['nephew_posting', 2]] })
  },
  {
    id: 'corner_plot',
    face: 'vikram',
    speaker: 'Vikram',
    role: 'Builder',
    minAge: 35,
    maxAge: 50,
    text: 'Vikram will relay the lane. In return the corner, still marked as a park on Joshi\'s map, becomes a shop with his name on the shutter.',
    left: s('The corner stays a park.', { janta: 6, kursi: -4, khazana: -4 }, { set: ['park'] }),
    right: s('Sign his plan.', { khazana: 8, janta: 4, kanoon: -8 }, { set: ['builder_ally'] })
  },
  {
    id: 'school_rally',
    face: 'meera',
    speaker: 'Meera',
    role: 'Municipal school',
    minAge: 34,
    maxAge: 48,
    text: 'Meera teaches the morning shift. Shalini wants ten children in white shirts for the front row. Meera asks you, not Shalini, to refuse.',
    left: s('The children stay in class.', { janta: 4, kursi: -6 }, { set: ['meera_ally'] }),
    right: s('White shirts. Front row.', { kursi: 8, janta: -4 }, { set: ['meera_cold'] })
  },
  {
    id: 'chemist_bill',
    face: 'kamla',
    speaker: 'Kamla',
    role: 'Your mother',
    minAge: 34,
    maxAge: 50,
    text: 'Your father\'s chemist has a bill with a red line under it. Kamla will not take it to the lane. She brought it to you.',
    left: s('Pay it. Write it in the book.', { khazana: -8, kanoon: 4, janta: 2 }),
    right: s('A friend will adjust it.', { khazana: 4, kanoon: -8 }, { set: ['adjusted_bill'] })
  },
  {
    id: 'canal_unit',
    face: 'renu',
    speaker: 'Renu',
    role: 'Lane secretary',
    minAge: 36,
    maxAge: 52,
    text: 'The plastic unit by the canal employs half the lane. The taps taste sweet, which water should not. Renu has stopped drinking hers.',
    left: s('Close it this week.', { janta: -8, kanoon: 10, kursi: -4 }, { set: ['canal_closed'] }),
    right: s('A season, and a filter on paper.', { janta: 4, khazana: 6, kanoon: -8 }, { set: ['canal_season'], queue: [['canal_back', 2]] })
  },
  {
    id: 'canal_back',
    face: 'renu',
    speaker: 'Renu',
    role: 'Lane secretary',
    queueOnly: true,
    need: ['canal_season'],
    text: 'The season ended. The filter is a photo in a file. Renu fills a glass from the tap and puts it on your table. She does not drink.',
    left: s('Close it now.', { janta: -4, kanoon: 8 }, { set: ['canal_closed'], clear: ['canal_season'] }),
    right: s('Another notice. Same water.', { kanoon: -6, khazana: 4 })
  },
  {
    id: 'manoj_contract',
    face: 'manoj',
    speaker: 'Manoj',
    role: 'He sells schools now',
    minAge: 36,
    maxAge: 48,
    need: ['broker'],
    text: 'Manoj is back, with a bigger sign. He wants the municipal coaching contract. He says you already know how the form works.',
    left: s('The tender stays open.', { kanoon: 8, kursi: -6 }, { set: ['tender_open'] }),
    right: s('His firm, your old cut.', { khazana: 10, kanoon: -8, janta: -4 }, { set: ['manoj_deal'] })
  },
  {
    id: 'water_tanker',
    face: 'vikram',
    speaker: 'Vikram',
    role: 'Builder',
    minAge: 34,
    maxAge: 46,
    text: 'The municipal tanker skipped Lane 4 for nine days. Vikram can send his site tanker tonight. Tomorrow he will ask for the corner again, if you have not signed it.',
    left: s('Wait for the municipal one.', { janta: -4, kanoon: 4 }),
    right: s('Take his water tonight.', { janta: 6, kursi: 2, khazana: -2 }, { set: ['tanker_debt'] })
  },
  {
    id: 'booth_list',
    face: 'shalini',
    speaker: 'Shalini',
    role: 'Party office',
    spine: true,
    minAge: 46,
    text: 'The assembly ticket is on her desk. Beside it is a list of booths that do not need walking, if you can live with how they vote.',
    left: s('Walk the booths yourself.', { janta: 8, kursi: -8, khazana: -4 }, { set: ['walked_assembly'], next: 'assembly_morning' }),
    right: s('Take the list.', { kursi: 8, kanoon: -8 }, { set: ['mla', 'booth_list'] })
  },
  {
    id: 'assembly_morning',
    face: 'bose',
    speaker: 'Bose',
    role: 'Returning officer',
    queueOnly: true,
    need: ['walked_assembly'],
    text: 'Morning. The rooms you walked are loud. Bose has the sheet. Shalini is in the corridor with a list you have not seen.',
    left: s('Sit with this result.', { janta: 4, kursi: -4 }, { set: ['mla'] }),
    right: s('Take her list now.', { kursi: 6, kanoon: -10 }, { set: ['mla', 'late_list'], queue: [['clerk_saw', 1]] })
  },
  {
    id: 'clerk_saw',
    face: 'joshi',
    speaker: 'Joshi',
    role: 'He was in the corridor',
    queueOnly: true,
    need: ['late_list'],
    text: 'Joshi saw the list change hands. He has not told Neha. He has also not told you what he wants, which is its own kind of price.',
    left: s('Ask what he needs to forget.', { khazana: -8, kanoon: -4 }, { set: ['joshi_paid'] }),
    right: s('Send him to Neha.', { janta: 6, kursi: -8, kanoon: 4 }, { set: ['on_record'] })
  },
  {
    id: 'phone_box',
    face: 'shalini',
    speaker: 'Shalini',
    role: 'Party office',
    minAge: 46,
    maxAge: 60,
    need: ['mla'],
    text: 'The coalition is three votes short. Shalini has a resort and a plastic box. Every phone goes in the box. Yours too, if you go.',
    left: s('Sleep at home. Keep the phone.', { kursi: -12, janta: 6, kanoon: 4 }, { set: ['phone_kept'] }),
    right: s('The box. Then the suite.', { kursi: 10, khazana: 6, janta: -6 }, { set: ['phone_box'], queue: [['spare_phone', 1]] })
  },
  {
    id: 'spare_phone',
    face: 'shalini',
    speaker: 'A staffer',
    role: 'Sent by Shalini',
    queueOnly: true,
    need: ['phone_box'],
    text: 'He offers a second phone "for the family." The other side has been calling the resort landline and getting no one. This phone would get someone.',
    left: s('No second phone.', { kursi: 2, kanoon: 4 }),
    right: s('Take it. Call them.', { khazana: 10, kursi: -10, kanoon: -8 }, { set: ['second_phone', 'recorded'] })
  },
  {
    id: 'diary_or_crowd',
    face: 'shalini',
    speaker: 'Shalini',
    role: 'Party office',
    minAge: 46,
    maxAge: 60,
    text: 'A fight at the fair. Two versions are already walking the lanes. Dalbeer\'s diary is the smaller one. Shalini wants the version that fills the ground.',
    left: s('Say what the diary says.', { janta: -4, kanoon: 8, kursi: -6 }),
    right: s('Say the version that fills it.', { janta: 10, kursi: 8, kanoon: -8 }, { set: ['rumor'], queue: [['fair_after', 2]] })
  },
  {
    id: 'fair_after',
    face: 'renu',
    speaker: 'Renu',
    role: 'Lane secretary',
    queueOnly: true,
    need: ['rumor'],
    text: 'The diary was the true one. A sweet shop is a shutter now, and a smell of burnt sugar. Renu asks who is going to stand in front of it.',
    left: s('Go, without cameras. Pay the shutter.', { khazana: -10, janta: 6, kursi: -4 }),
    right: s('A wreath and a post.', { janta: -8, kursi: 4 })
  },
  {
    id: 'nephew_posting',
    face: 'dalbeer',
    speaker: 'Dalbeer',
    role: 'Inspector',
    queueOnly: true,
    text: 'Dalbeer does not mention the missing page. He mentions his nephew, who would like a posting nearer than the one he earned.',
    need: ['paper_lost'],
    left: s('The nephew sits the exam.', { kanoon: 8, kursi: -4 }),
    right: s('Move the posting.', { kursi: 4, kanoon: -10 }, { set: ['nephew_posted'] })
  },
  {
    id: 'channel_van',
    face: 'neha',
    speaker: 'Neha',
    role: 'District paper',
    minAge: 46,
    maxAge: 62,
    any: ['freight_deal', 'licence_word', 'late_list', 'rumor'],
    text: 'Neha\'s van is outside. She has one question, and she wrote it down so you cannot pretend you misheard. Shalini says the van\'s permit can expire by evening.',
    left: s('Answer the question.', { janta: 6, kursi: -8 }, { set: ['on_record'] }),
    right: s('Let the permit lapse.', { kanoon: -8, kursi: 6, janta: -4 }, { set: ['press_squeezed'] })
  },
  {
    id: 'harpal_inside',
    face: 'harpal',
    speaker: 'Harpal',
    role: 'He grew into the party',
    minAge: 46,
    maxAge: 60,
    need: ['train'],
    text: 'Harpal sits on your side of the table now. He wants a word with the rail police about an old platform. He says you were there, so the word should be yours.',
    left: s('The file stays a file.', { kanoon: 6, kursi: -4, janta: -2 }),
    right: s('Make the call.', { kursi: 6, kanoon: -8, janta: 2 })
  },
  {
    id: 'renu_line',
    face: 'renu',
    speaker: 'Renu',
    role: 'Lane secretary',
    minAge: 46,
    maxAge: 62,
    need: ['drain_fixed'],
    text: 'Renu takes the bus up to the assembly town. She does not want a photo. She wants the drain said out loud, in the house, in a sentence a minister can hear.',
    left: s('Say the drain in the house.', { janta: 8, kursi: -6 }, { set: ['said_drain'] }),
    right: s('A private note. Not the floor.', { kursi: 4, janta: -4 })
  },
  {
    id: 'overbridge',
    face: 'joshi',
    speaker: 'Joshi',
    role: 'Clerk',
    minAge: 40,
    maxAge: 58,
    any: ['candle', 'train', 'sat_ground'],
    text: 'Joshi still has the drawing of the rail overbridge. It is older than your first poster. This year\'s fund can become concrete, or it can become the anniversary rally.',
    left: s('Put the fund on the bridge.', { khazana: -8, janta: 10, kursi: -4 }, { set: ['bridge'] }),
    right: s('Keep it for the rally.', { kursi: 8, janta: -6 })
  },
  {
    id: 'transfer_teacher',
    face: 'meera',
    speaker: 'Meera',
    role: 'Municipal school',
    minAge: 40,
    maxAge: 56,
    need: ['meera_ally'],
    text: 'A transfer with Meera\'s name is already typed. The school she would go to is two hours down the rail line. Shalini calls it routine.',
    left: s('Stop the transfer.', { kursi: -6, janta: 4, kanoon: 4 }),
    right: s('Call it routine.', { kursi: 6, janta: -4 }, { set: ['meera_cold'], clear: ['meera_ally'] })
  },
  {
    id: 'portfolio_car',
    face: 'shalini',
    speaker: 'Shalini',
    role: 'Party office',
    spine: true,
    minAge: 58,
    text: 'There is a ministry with a long name and very little work. The car, Shalini notes, is not little. The other choice is to stay a member and annoy the people who count cars.',
    left: s('No ministry. Stay a member.', { kursi: -8, kanoon: 4, janta: 4 }),
    right: s('Take the car.', { kursi: 10, khazana: 6, janta: -4 }, { set: ['minister'] })
  },
  {
    id: 'forest_map',
    face: 'girdhar',
    speaker: 'Girdhar',
    role: 'The river ashram',
    minAge: 56,
    maxAge: 78,
    text: 'Girdhar has followers in twelve wards, and a map. The map still says forest. He wants it to say trust. He does not raise his voice.',
    left: s('The map stays a forest.', { janta: -8, kursi: -8, kanoon: 12 }, { set: ['forest_kept'], queue: [['road_block', 1]] }),
    right: s('The trust gets the acres.', { janta: 8, kursi: 8, khazana: 6, kanoon: -12 }, { set: ['baba_land'], queue: [['flowerpot_file', 2]] })
  },
  {
    id: 'road_block',
    face: 'dalbeer',
    speaker: 'Dalbeer',
    role: 'Inspector',
    queueOnly: true,
    need: ['forest_kept'],
    text: 'They are sitting on the office road. No stones. Dalbeer asks if he should write it as a blockage or as a visit. His pen is already out.',
    left: s('A visit. Hear them.', { janta: 6, kursi: -6 }),
    right: s('A blockage. Move them.', { kanoon: -6, kursi: 6, janta: -8 })
  },
  {
    id: 'flowerpot_file',
    face: 'bose',
    speaker: 'Bose',
    role: 'He still has the file',
    queueOnly: true,
    need: ['baba_land'],
    text: 'Bose puts the forest file on your desk, not in your hand. A flowerpot would hide it. The map would not forgive that, but maps do not vote.',
    left: s('The acres go back on the map.', { kursi: -10, kanoon: 10, janta: -4 }, { clear: ['baba_land'], set: ['forest_kept'] }),
    right: s('The file can sit.', { kanoon: -12, khazana: 8 }, { set: ['file_sat'] })
  },
  {
    id: 'meal_tender',
    face: 'kamla',
    speaker: 'Kamla',
    role: 'She brought your cousin\'s name',
    minAge: 56,
    maxAge: 76,
    need: ['minister'],
    text: 'The mid-day meal tender is open. Your cousin\'s firm filed. So did three others. Kamla says he is family, and then she waits to see what you do with that word.',
    left: s('The tender stays open.', { kursi: -6, kanoon: 8 }, { set: ['tender_open'] }),
    right: s('His firm was the only real bid.', { khazana: 8, kanoon: -10, janta: -4 }, { set: ['cousin_meals'], queue: [['rice_weight', 2]] })
  },
  {
    id: 'rice_weight',
    face: 'neha',
    speaker: 'Neha',
    role: 'District paper',
    queueOnly: true,
    need: ['cousin_meals'],
    text: 'Neha weighed the rice at two schools. The number on the sack and the number in the children\'s plates are not the same number.',
    left: s('Cancel the firm in public.', { janta: 8, kursi: -8, khazana: -4 }, { clear: ['cousin_meals'], set: ['tender_open'] }),
    right: s('Call it a clerical error.', { kursi: 4, janta: -8, kanoon: -6 })
  },
  {
    id: 'officer_stays',
    face: 'bose',
    speaker: 'Bose',
    role: 'Returning officer',
    minAge: 56,
    maxAge: 78,
    text: 'Someone in the capital can move Bose before the next poll. The district they have in mind is far from the rail line. He has not asked you for anything.',
    left: s('He stays.', { kanoon: 8, kursi: -8 }),
    right: s('Send him down the line.', { kursi: 8, kanoon: -10 }, { set: ['officer_moved'] })
  },
  {
    id: 'lender_car',
    face: 'vikram',
    speaker: 'Vikram',
    role: 'He brought the lender',
    minAge: 40,
    maxAge: 70,
    maxGauge: { khazana: 42 },
    text: 'Vikram sets the car keys nearer to the lender than to you. The lender can take them today. Or the house Kamla lives in can stand behind a fresh loan.',
    left: s('Sell the car yourself.', { khazana: 8, kursi: -4 }),
    right: s('The house stands behind it.', { khazana: 10, janta: -6 }, { set: ['mothers_house'] })
  },
  {
    id: 'meera_letter',
    face: 'meera',
    speaker: 'Meera',
    role: 'She is not shouting',
    priority: true,
    minAge: 40,
    need: ['meera_cold'],
    text: 'Meera puts a letter on the table. It is not for the paper. It says she will not live beside a rally that uses children, or a tender that uses your surname.',
    left: s('Tear up the bad contract.', { khazana: -6, kursi: -6, janta: 4 }, { set: ['meera_ally'], clear: ['meera_cold', 'cousin_meals'] }),
    right: s('The letter can wait.', { kursi: 4, janta: -6 }, { set: ['meera_left'] })
  },
  {
    id: 'kamla_gate',
    face: 'kamla',
    speaker: 'Kamla',
    role: 'Your mother',
    priority: true,
    minAge: 44,
    need: ['mothers_house'],
    text: 'Kamla is at the gate with the house papers in a cloth bag. She has read the stamp. She asks if she should start packing, or if you are going to fix the thing you signed.',
    left: s('Fix it. The house is hers.', { khazana: -12, janta: 6 }, { clear: ['mothers_house'] }),
    right: s('It was always a party house.', { janta: -10, kursi: 4 }, { set: ['mother_told'] })
  },
  {
    id: 'tape_night',
    face: 'neha',
    speaker: 'Neha',
    role: 'She has the audio',
    priority: true,
    minAge: 44,
    need: ['on_record'],
    any: ['freight_deal', 'licence_word', 'late_list', 'second_phone', 'recorded', 'manoj_deal'],
    text: 'Neha plays six seconds. It is your voice, and a sum, and a laugh that is also yours. The bulletin is at nine. You can sit in the side room, or you can call the voice an actor.',
    left: s('Step down before nine.', {}, { ending: 'bulletin' }),
    right: s('Say the voice is an actor.', { janta: -10, kursi: 6, kanoon: -6 })
  },
  {
    id: 'drain_count',
    face: 'renu',
    speaker: 'Renu',
    role: 'Lane secretary',
    priority: true,
    minAge: 40,
    need: ['drain_fixed', 'park'],
    block: ['ticket_bought', 'booth_list'],
    text: 'The count is close enough to buy. Renu has already heard the price. She also heard the rain go down Lane 4, which it did not used to do.',
    left: s('Lose it clean.', { janta: 4 }, { ending: 'remembered' }),
    right: s('Call the man who buys booths.', { kursi: 8, khazana: -8, kanoon: -8 }, { set: ['bought_late'] })
  },
  {
    id: 'last_walk',
    face: 'kamla',
    speaker: 'Kamla',
    role: 'She is older. So are you.',
    spine: true,
    minAge: 70,
    text: 'Kamla walks slower than the banner behind you. She asks if the next term is for Belpur, or for the people who cannot picture you anywhere but the chair.',
    left: s('Leave while it is still yours.', {}, { ending: 'tea' }),
    right: s('One more term.', { kursi: 8, janta: -6 }, { set: ['one_more'] })
  },
  {
    id: 'filler_wedding',
    face: 'renu',
    speaker: 'Renu',
    role: 'Lane secretary',
    minAge: 20,
    maxAge: 40,
    repeat: true,
    weight: 1,
    text: 'A wedding in the lane needs a lamp, a microphone, and someone important in a plastic chair. Renu saved you the chair with the intact leg.',
    left: s('Sit. Eat. Leave before the speech.', { janta: 4, kursi: -2 }),
    right: s('Speak. Promise a road.', { kursi: 4, janta: 2, khazana: -4 })
  },
  {
    id: 'filler_power',
    face: 'joshi',
    speaker: 'Joshi',
    role: 'Clerk',
    minAge: 18,
    maxAge: 30,
    repeat: true,
    weight: 1,
    text: 'The coaching lane has no power from four to eight, which is when the children study. Joshi can note it. A note is not a wire.',
    left: s('Make him note it anyway.', { kanoon: 4, janta: 2 }),
    right: s('Buy a generator for the centre.', { khazana: -4, kursi: 4 })
  },
  {
    id: 'filler_hostel',
    face: 'harpal',
    speaker: 'Harpal',
    role: 'Union',
    minAge: 24,
    maxAge: 33,
    repeat: true,
    weight: 1,
    text: 'The hostel tap runs for twenty minutes a day. Harpal wants a protest. The warden wants a new motor and no slogans.',
    left: s('Buy the motor. Skip the slogan.', { khazana: -4, kanoon: 4, kursi: -2 }),
    right: s('Slogan first.', { janta: 4, kursi: 4, kanoon: -4 })
  },
  {
    id: 'filler_light',
    face: 'renu',
    speaker: 'Renu',
    role: 'Lane secretary',
    minAge: 34,
    maxAge: 55,
    repeat: true,
    weight: 1,
    text: 'Three street lights on Lane 4 have been dark since the rains. Renu has the numbers of the poles. She does not have the electrician.',
    left: s('Pay him from the small fund.', { khazana: -4, janta: 4 }),
    right: s('Wait for the municipal list.', { kursi: 2, janta: -4 })
  },
  {
    id: 'filler_question',
    face: 'shalini',
    speaker: 'Shalini',
    role: 'She holds the question list',
    minAge: 46,
    maxAge: 64,
    repeat: true,
    weight: 1,
    text: 'Question hour. Your name is down for the overbridge, or for a tribute that takes the same two minutes and builds nothing.',
    left: s('Ask about the bridge.', { janta: 4, kursi: -4 }),
    right: s('Read the tribute.', { kursi: 4, janta: -2 })
  },
  {
    id: 'filler_tea',
    face: 'shalini',
    speaker: 'Shalini',
    role: 'Party office',
    minAge: 58,
    maxAge: 80,
    repeat: true,
    weight: 1,
    text: 'The cabinet tea is too sweet, and the biscuits are last year\'s brand. Shalini watches who you sit beside. That is the whole meeting.',
    left: s('Sit with the quiet ones.', { kursi: -4, kanoon: 4 }),
    right: s('Sit where the car keys are.', { kursi: 4, janta: -2 })
  }
]

export function deathEnding(gauge: Gauge, high: boolean, flags: Set<string>): Ending {
  if (gauge === 'kursi' && !high && (flags.has('meera_left') || flags.has('mother_told'))) {
    return ENDINGS.kursi_low_meera
  }
  const key = `${gauge}_${high ? 'high' : 'low'}`
  return ENDINGS[key]
}

export function chairOf(flags: Set<string>, age: number): string {
  if (flags.has('minister')) return 'Minister'
  if (flags.has('mla')) return 'MLA'
  if (flags.has('ward_won')) return 'Corporator'
  if (age < 24) return 'Student'
  if (flags.has('stayed_union') || flags.has('union_plain') || flags.has('union_slate')) {
    if (age < 34) return 'Union office'
  }
  return 'Party worker'
}
