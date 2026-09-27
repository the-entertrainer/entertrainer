/**
 * Netagiri. The person on the card is in the room with you.
 * Plain English. The person on the card wants something.
 * They do not read out the two orders. Left is the clean no.
 * Right is the deal, the clip, or the bribe. Every order costs.
 * Say the money, the vote, the court, the camera, or the crowd.
 * The two buttons are different orders. Deltas stay within -14..14.
 * No living politicians. No riddles.
 */

export type Gauge = 'janta' | 'khazana' | 'kursi' | 'kanoon'
export type Face =
  | 'pinky' | 'nandini' | 'baba' | 'lalaji' | 'chintu'
  | 'kisan' | 'mausi' | 'hakim' | 'envoy' | 'captain'
  | 'justice' | 'netaji'
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
  { key: 'janta', label: 'Janta', hint: 'Public sentiment' },
  { key: 'khazana', label: 'Khazana', hint: 'The treasury' },
  { key: 'kursi', label: 'Kursi', hint: 'The chair' },
  { key: 'kanoon', label: 'Kanoon', hint: 'The court' }
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
  captain: '/netagiri/captain.jpg',
  justice: '/netagiri/justice.jpg',
  netaji: '/netagiri/netaji.jpg'
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
    role: 'Fixer',
    text: 'Sir, the count is in. The booth workers are in the front row with their families. The camera is on their faces. A national address can wait.',
    left: s('Thank the country. Then sit.', { janta: 6, kursi: -6 }),
    right: s('Read every name on that list.', { kursi: 8, janta: -4 }, { set: ['troll_voice'], queue: [['names_due', 2]] })
  },
  {
    id: 'oath_later',
    era: 'later',
    spine: true,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Sir, the count finished forty minutes late. I have the oxygen bill in one hand. In the other, a plate that puts your face across the dome before the news does.',
    left: s('Read the oxygen bill.', { janta: 6, kanoon: 4, kursi: -6 }),
    right: s('Put my face on the dome.', { janta: 6, kursi: 6, kanoon: -6 }, { set: ['dome_face'], queue: [['vent_due', 2]] })
  },
  {
    id: 'hundred',
    era: 'now',
    minTerm: 1,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Sir, the cameras have camped out for a hundred-day list. I have prepared one drain, with a date. The rest of the list I have left blank on purpose.',
    left: s('One drain. One date.', { kanoon: 6, kursi: -4 }, { set: ['one_date'], queue: [['drain_due', 2]] }),
    right: s('Promise the whole list tonight.', { janta: 8, kursi: 6, kanoon: -4 }, { set: ['hundred'], queue: [['hundred_due', 2]] })
  },
  {
    id: 'hundred_due',
    era: 'any',
    queueOnly: true,
    need: ['hundred'],
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Sir, this is day one hundred. The file still says day one. The ticker is live, and the draft on my desk calls it a scheduling error.',
    left: s('Say the date slipped.', { janta: -4, kanoon: 8, kursi: -4 }),
    right: s('Call it a scheduling error.', { kursi: 6, kanoon: -8, janta: -2 })
  },
  {
    id: 'rename_road',
    era: 'now',
    minTerm: 1,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'Fixer',
    text: "Sir, this road is famous for one hole. The paint crew is here to put your name on it. The crew that fills holes is not on today's sheet.",
    left: s('Send the fill crew.', { khazana: -6, janta: 8, kursi: -4 }),
    right: s('Paint the name. Leave the hole.', { kursi: 8, janta: -4 }, { set: ['renamed'], queue: [['hole_due', 2]] })
  },
  {
    id: 'broom',
    era: 'now',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, five dry leaves are on the hotel steps and my camera is in slow motion. The cleaning money is still unspent. That is a worse picture than the leaves.',
    left: s('Pay the cleaners. Kill the clip.', { khazana: -6, kanoon: 6, kursi: -4 }),
    right: s('Pick up the broom.', { janta: 8, kursi: 6, kanoon: -4 }, { set: ['broom'], queue: [['clip_due', 2]] })
  },
  {
    id: 'statue',
    era: 'now',
    minTerm: 2,
    face: 'lalaji',
    speaker: 'Aditya Singhania',
    role: 'Tenders and cement',
    text: 'Prime Minister, the cement is already on site. The drawing you paid for is a statue, taller than the last one. A clinic roof is not in that drawing.',
    left: s('Put the cement on the clinic.', { janta: 8, kursi: -6, kanoon: 4 }),
    right: s('Build the statue taller.', { kursi: 8, janta: 2, kanoon: -6 }, { set: ['statue'], queue: [['statue_bill', 2]] })
  },
  {
    id: 'statue_bill',
    era: 'any',
    queueOnly: true,
    need: ['statue'],
    face: 'lalaji',
    speaker: 'Aditya Singhania',
    role: 'Tenders and cement',
    text: 'The statue has eaten the clinic money. I can stop the pour at the knees. My invoice is written as phase two, and phase two is the knees.',
    left: s('Stop at the knees. Pay the clinic.', { khazana: -8, janta: 6, kursi: -4 }),
    right: s('Approve phase two.', { khazana: -10, kursi: 8, kanoon: -6 })
  },
  {
    id: 'foreign',
    era: 'now',
    minTerm: 2,
    face: 'envoy',
    speaker: 'The envoy',
    role: 'Trade draft',
    text: 'Sir, I have one pen and the trade draft. Your party has seated thirty-eight people on the plane. The photographer has listed every one of them as essential staff.',
    left: s('Just us two. Send them home.', { kursi: -6, kanoon: 4, khazana: 6 }),
    right: s('All thirty-eight. Film the pen.', { khazana: -10, kursi: 6, kanoon: -4 }, { set: ['trip'], queue: [['mou', 2]] })
  },
  {
    id: 'mou',
    era: 'any',
    queueOnly: true,
    need: ['trip'],
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Sir, the signed page says the two countries will meet again. Nothing more. The press line on my desk calls it a historic handshake. The PDF does not.',
    left: s('Release the PDF unchanged.', { kanoon: 6, janta: -2, kursi: -2 }),
    right: s('Call it a historic handshake.', { janta: 4, kursi: 6, kanoon: -6 })
  },
  {
    id: 'tiger',
    era: 'now',
    minTerm: 1,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: "Boss, your uncle's voice note is on my phone. It says you wrestled a tiger before breakfast. One tap puts it at the top of the party page.",
    left: s('Delete it before lunch.', { kursi: -6, kanoon: 6 }),
    right: s('Pin it. Add another tiger.', { janta: 6, kursi: 6, kanoon: -6 }, { set: ['tiger'] })
  },
  {
    id: 'onions',
    era: 'now',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Prime Minister, onions hit 140 rupees a kilo this morning. I am on air in five minutes. The foreign-plot package is already edited. The market price is not in the script.',
    left: s('Release stock. Report the price.', { janta: 6, khazana: -8, kursi: -4 }),
    right: s('Run the foreign-plot package.', { kursi: 6, kanoon: -6, janta: -4 })
  },
  {
    id: 'urea',
    era: 'now',
    minTerm: 2,
    face: 'kisan',
    speaker: 'The farmer',
    role: 'Farmer union',
    text: 'The urea reached the field. The bill reached us twice. The second copy is in my hand, and your last speech called a second bill a reform.',
    left: s('Cancel the second bill.', { khazana: -10, janta: 8, kursi: -4 }, { set: ['bill_cut'] }),
    right: s('Call the second bill a reform.', { kursi: 6, janta: -8, kanoon: -4 })
  },
  {
    id: 'cylinder',
    era: 'now',
    minTerm: 2,
    face: 'mausi',
    speaker: 'Aunty',
    role: 'Party treasurer',
    text: 'You already issued this cylinder. People remember the colour. I have a fresh name for the same metal, and a function booked under it.',
    left: s('Send the cylinder you promised.', { khazana: -10, janta: 6, kursi: -2 }),
    right: s('New name. Hold the function.', { janta: 2, kursi: 6, khazana: -6, kanoon: -4 }, { set: ['acronym'], queue: [['gas_due', 2]] })
  },
  {
    id: 'nephew',
    era: 'now',
    minTerm: 3,
    face: 'mausi',
    speaker: 'Aunty',
    role: 'Party treasurer',
    text: "Your sister's boy has failed the civil services preliminary for the third time. The State Mining Corporation needs a managing director. The stamp is already inked.",
    left: s('Send him back to the exam.', { kursi: -6, kanoon: 8 }),
    right: s('Appoint him. No reporters.', { kursi: 8, khazana: -8, kanoon: -8 }, { set: ['nephew'] })
  },
  {
    id: 'cricket',
    era: 'now',
    minTerm: 1,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, the match is won. The graphic on my screen gives the cup to your scheme. The other party has not posted yet.',
    left: s('Write well played. Stop there.', { janta: 2, kursi: -4 }),
    right: s('Give the cup to the scheme.', { janta: 4, kursi: 6, kanoon: -4 })
  },
  {
    id: 'ribbon',
    era: 'now',
    minTerm: 2,
    face: 'lalaji',
    speaker: 'Aditya Singhania',
    role: 'Tenders and cement',
    text: 'The bridge is ready for a ribbon. It is not ready for a scooter. My camera truck will not wait for the engineering.',
    left: s('Wait until a scooter can cross.', { khazana: -8, janta: 6, kursi: -6 }),
    right: s('Cut the ribbon. Drag a scooter.', { janta: 2, kursi: 8, kanoon: -6 }, { set: ['ribbon'], queue: [['scooter_due', 2]] })
  },
  {
    id: 'committee',
    era: 'now',
    minTerm: 2,
    face: 'justice',
    speaker: 'Justice Rao',
    role: 'Show-cause notices',
    text: 'A show-cause about the fallen bridge is on my desk. The contractor who funded your campaign is named in paragraph four. Your office has asked for a committee to investigate the committee.',
    left: s('Name him in open court.', { kanoon: 8, kursi: -8 }),
    right: s('Let the committees chase each other.', { kursi: 6, kanoon: -8 })
  },
  {
    id: 'eight_pm',
    era: 'now',
    minTerm: 3,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Sir, at eight the country stops. The file in my hand is one sentence and one real job. Your social team has already booked an app launch in that slot.',
    left: s('Say the one real job.', { kanoon: 6, kursi: -4 }, { set: ['plain_speech'], queue: [['line_due', 2]] }),
    right: s('Launch the app tonight.', { janta: 2, kursi: 6, kanoon: -6, khazana: -4 }, { set: ['the_app'], queue: [['app_morning', 1]] })
  },
  {
    id: 'app_morning',
    era: 'any',
    queueOnly: true,
    need: ['the_app'],
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, the app closes the moment someone types your name. The tag on it this morning says masterstroke. The note from the office says people are holding the phone wrong.',
    left: s('Take it down until it opens.', { kanoon: 6, kursi: -6, janta: 2 }),
    right: s('Blame how they hold the phone.', { kursi: 6, janta: -6, kanoon: -6 })
  },
  {
    id: 'mango',
    era: 'now',
    minTerm: 2,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'The weekly show is in an hour. Onions are the expensive thing in the market. My rundown is twenty minutes on mangoes, and the price is not on the page.',
    left: s('Lead with the onion price.', { janta: 6, kursi: -4 }),
    right: s('Stay on mangoes.', { kursi: 6, janta: -6 })
  },
  {
    id: 'garland',
    era: 'now',
    minTerm: 1,
    face: 'mausi',
    speaker: 'Aunty',
    role: 'Party treasurer',
    text: 'This garland weighs more than the file under it. The live shot is lit for flowers. The file is outside the frame.',
    left: s('Take it off and read the file.', { kanoon: 6, janta: -2, kursi: -2 }),
    right: s('Wear it. Go live.', { janta: 6, kursi: 4, kanoon: -4 })
  },
  {
    id: 'survey',
    era: 'now',
    minTerm: 3,
    face: 'netaji',
    speaker: 'Netaji',
    role: 'Twelve MPs',
    text: 'The budget vote needs my twelve members. They have been shown a happiness figure of 112 percent. The real figure is on the other phone, and they do not want it before the division.',
    left: s('Send them the real number.', { kursi: -8, kanoon: 6, janta: 2 }),
    right: s('Print 112. In bold.', { kursi: 8, janta: -8, kanoon: -6 })
  },
  {
    id: 'poem',
    era: 'now',
    minTerm: 2,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'The opposition has set a poem on your silence. It rhymes, and it is ahead of your speech. The case papers are on my desk, with a couplet ready as the reply.',
    left: s('Leave the poem alone.', { kanoon: 4, kursi: -4 }),
    right: s('File the case. Send a couplet.', { kursi: 6, janta: -2, kanoon: -8 }, { set: ['couplet'], queue: [['poem_due', 2]] })
  },
  {
    id: 'millet',
    era: 'now',
    minTerm: 2,
    face: 'envoy',
    speaker: 'The envoy',
    role: 'Trade draft',
    text: "Dinner is millet, as your office wrote it down. Singhania's chef, a fountain, and a drone are idling in the parking lot. The kitchen has stopped plating.",
    left: s('Serve the millet.', { janta: 4, kursi: -4, khazana: 2 }),
    right: s('Bring in the chef and the fountain.', { khazana: -10, kursi: 6, janta: -2 })
  },
  {
    id: 'forty_stops',
    era: 'now',
    minTerm: 3,
    face: 'netaji',
    speaker: 'Netaji',
    role: 'Twelve MPs',
    text: 'Your tour has forty stops this week. The third is a school with no roof, in a seat I do not own. The twelfth is mine: a drone and a ribbon. My twelve members are counting.',
    left: s('Fix the roof. Cut the tour.', { khazana: -8, janta: 8, kursi: -8 }),
    right: s('All forty stops. Drone at twelve.', { janta: 2, kursi: 8, khazana: -6 })
  },
  {
    id: 'baba_box',
    era: 'now',
    minTerm: 3,
    face: 'baba',
    speaker: 'Swami Anandeshwar',
    role: 'Votes and land',
    text: "Thursday's live blessing is already promoted. I need the land deed in the retreat's name, and the slot. The box on the table is a donation. It is not the blessing.",
    left: s('No deed. Thursday stays cabinet.', { kursi: -6, kanoon: 6, janta: -4 }),
    right: s('Give the deed and the slot.', { janta: 6, kursi: 8, kanoon: -8, khazana: -6 }, { set: ['blessed'], queue: [['ashram_due', 2]] })
  },
  {
    id: 'convoy',
    era: 'now',
    minTerm: 1,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'Fixer',
    text: 'The rally convoy is two kilometers long. An ambulance has been on the horn behind us for twenty minutes. The live motorcade is the top stream in the country.',
    left: s('Halt. Let the ambulance pass.', { janta: 8, kursi: -6 }),
    right: s('Keep rolling. Protect the stream.', { janta: -6, kursi: 6, kanoon: -6 })
  },
  {
    id: 'anchor',
    era: 'now',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'The power died last night. It did not die on your lane. My banner is already printed, and it names the last government. I go on in three minutes.',
    left: s('Say it died on our lane too.', { kanoon: 6, kursi: -6, janta: 2 }),
    right: s('Read the banner.', { janta: -4, kursi: 6, kanoon: -6 })
  },
  {
    id: 'blame',
    era: 'now',
    minTerm: 2,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, rain hit the rally. The graphic behind you shows the last government holding the cloud. If that graphic comes down, the shot dies.',
    left: s('Say it is the weather.', { kanoon: 4, kursi: -6 }),
    right: s('Point at the cloud.', { janta: 4, kursi: 8, kanoon: -6 }, { set: ['blamed'], queue: [['cloud_due', 2]] })
  },
  {
    id: 'yoga',
    era: 'now',
    minTerm: 1,
    face: 'baba',
    speaker: 'Swami Anandeshwar',
    role: 'Votes and land',
    text: 'The cameras are closer than the devotees. The onion file is waiting on this lawn, this minute. The pose is what my people came to see.',
    left: s('Leave the lawn. Take the meeting.', { kanoon: 6, janta: -4, kursi: -2 }),
    right: s('Hold the pose until it trends.', { janta: 8, kursi: 4, kanoon: -4 })
  },
  {
    id: 'no_questions',
    era: 'now',
    minTerm: 2,
    face: 'justice',
    speaker: 'Justice Rao',
    role: 'Show-cause notices',
    text: 'The press is seated. A note on your podium says you will take no questions. That note is longer than the speech. The record still needs three answers.',
    left: s('Take the three questions.', { kanoon: 8, kursi: -6 }),
    right: s('Read the note and leave.', { kursi: 6, janta: -4, kanoon: -6 })
  },
  {
    id: 'the_flip',
    era: 'later',
    spine: true,
    need: ['crossed'],
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'The year has changed. The hole has not. It is hanging in the air, and the brief on my desk calls it a sector. The ribbon is in the glove box.',
    left: s('Fill the hole.', { khazana: -8, janta: 8, kursi: -4 }),
    right: s('Inaugurate the hover.', { kursi: 8, janta: -2, kanoon: -6 }, { set: ['hover'], queue: [['sector_due', 2]] })
  },
  {
    id: 'hologram',
    era: 'later',
    minTerm: 1,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Tonight I can stand your face in four hundred cities. The mouth arrives three seconds late. One city still has a stage with you on it.',
    left: s('Speak in one city, yourself.', { janta: 4, kursi: -6 }),
    right: s('Send four hundred. Keep the delay.', { janta: 6, kursi: 6, kanoon: -6 }, { set: ['hologram'] })
  },
  {
    id: 'seventh',
    era: 'later',
    minTerm: 1,
    face: 'lalaji',
    speaker: 'Aditya Singhania',
    role: 'Tenders and cement',
    text: 'This is the seventh ribbon on the same metro. The first six were called historic too. The train moves when two interns shove it, and only when the cameras are off.',
    left: s('Shove it with the cameras off.', { kanoon: 6, kursi: -4, khazana: -2 }),
    right: s('A seventh ribbon. Invite the rest.', { kursi: 8, janta: 2, kanoon: -4, khazana: -4 })
  },
  {
    id: 'mars_stone',
    era: 'later',
    minTerm: 2,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: "The dome is too small for your statue. The engineer's note says so in one line. Raising the dome keeps that note outside.",
    left: s('Shrink the statue.', { kanoon: 6, khazana: -4, kursi: -4 }),
    right: s('Raise the dome. Hide the note.', { khazana: -8, kursi: 8, kanoon: -6 })
  },
  {
    id: 'noon_model',
    era: 'later',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'At noon a model read your speech. She was clearer than you, and the country clapped. My producer wants the writer fired and the applause left on your name.',
    left: s('Say that was not me.', { janta: -4, kanoon: 8, kursi: -4 }),
    right: s('Keep the applause. Fire the writer.', { janta: 6, kursi: 6, kanoon: -6 }, { set: ['took_clap'] })
  },
  {
    id: 'chai_code',
    era: 'later',
    minTerm: 1,
    face: 'kisan',
    speaker: 'The stallkeeper',
    role: 'Tea and a dead signal',
    text: 'Notes are finished. Payment wants a code, and this stall has no signal. The kettle is full. A coin still works. An update will not, not before the tea is cold.',
    left: s('Pay him with a coin.', { khazana: -4, janta: 8, kursi: -2 }),
    right: s('Tell him to update the stall.', { kursi: 4, janta: -8 })
  },
  {
    id: 'leds',
    era: 'later',
    minTerm: 2,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'The river is still a drain. The lights are on, so at night it looks finished. I have the footage. I do not have the water. The sign I was told to order says riverfront.',
    left: s('Lights off. Fund the drain.', { khazana: -8, janta: 6, kanoon: 4, kursi: -4 }),
    right: s('Call the footage a riverfront.', { janta: 2, kursi: 6, kanoon: -6 })
  },
  {
    id: 'generator',
    era: 'later',
    minTerm: 2,
    face: 'envoy',
    speaker: 'The envoy',
    role: 'Trade draft',
    text: 'The climate paper is ready for a signature. The stage generator is louder than the speech. The same ministry hired the generator and wrote the paper.',
    left: s('Sign it. Switch the generator off.', { kanoon: 6, kursi: -4, khazana: 2 }),
    right: s('Sign louder than the generator.', { kursi: 6, kanoon: -6, khazana: -4, janta: -2 })
  },
  {
    id: 'buffer',
    era: 'later',
    minTerm: 3,
    face: 'mausi',
    speaker: 'Aunty',
    role: 'Party treasurer',
    text: 'Your nephew is a year-long subscription now. The company is still paying it. He freezes every time he must say thank you. The chairman stamp is the same stamp as last time.',
    left: s('Cancel the subscription.', { kursi: -8, kanoon: 6, khazana: 4 }),
    right: s('Make that frozen man chairman.', { kursi: 8, kanoon: -8, khazana: -8 }, { set: ['nephew'] })
  },
  {
    id: 'crater',
    era: 'later',
    minTerm: 2,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'A crater on the moon has no name. One of your schemes has no result. The naming file is on my desk. The moon cannot send a complaint.',
    left: s('Leave the moon alone.', { kanoon: 4, kursi: -4 }),
    right: s('Put the scheme name on it.', { kursi: 8, janta: 2, kanoon: -6 })
  },
  {
    id: 'blink',
    era: 'later',
    minTerm: 2,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: "I can put Aunty's face on the budget speech. She will blink on every comma. People trust a blink more than a table. The real table is in the other file.",
    left: s('Send the real Aunty and the table.', { kanoon: 6, kursi: -4 }),
    right: s('Let the blink run.', { janta: 2, kursi: 6, kanoon: -8 })
  },
  {
    id: 'robot_bill',
    era: 'later',
    minTerm: 2,
    face: 'kisan',
    speaker: 'The farmer',
    role: 'Farmer union',
    text: 'The subsidy arrived as a notification. It cannot be eaten. The field robot has sent its own bill, and the bill is rude. The union is standing in the lane.',
    left: s('Pay the union. Stop the robot.', { khazana: -8, janta: 8, kursi: -4 }, { set: ['bill_cut'] }),
    right: s('Tell them the robot is the reform.', { janta: -8, kursi: 6, kanoon: -4 })
  },
  {
    id: 'weightless',
    era: 'later',
    minTerm: 3,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Gravity is failing in the new colony. The committee I formed is floating with it. This is not a metaphor. An engineer is waiting on the ground floor, and the order is unsigned.',
    left: s('Send the engineer down.', { kanoon: 8, kursi: -4, khazana: -4 }),
    right: s('Keep them up for the photo.', { kursi: 6, janta: -4, kanoon: -6 })
  },
  {
    id: 'two_clocks',
    era: 'later',
    minTerm: 2,
    face: 'netaji',
    speaker: 'Netaji',
    role: 'Twelve MPs',
    text: "Two clocks were printed for your rally. One is the country's. One is mine, so you arrive while my people are still in their seats. My twelve members do not wait.",
    left: s("Keep the country's clock.", { kursi: -6, kanoon: 6 }),
    right: s('Run both. Call the gap a mood.', { janta: 2, kursi: 6, kanoon: -6 })
  },
  {
    id: 'blame_later',
    era: 'later',
    minTerm: 2,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'A meteor took the ribbon tent. The graphic already on the stream shows the last century holding the rock.',
    left: s('Call it a rock.', { kanoon: 4, kursi: -6 }),
    right: s('Point at the last century.', { janta: 2, kursi: 8, kanoon: -6 })
  },
  {
    id: 'convoy_later',
    era: 'later',
    minTerm: 1,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Your holograms are standing in the sky lane. A medical drone is blinking red behind them. The camera is framed on the hologram. The drone is not in the shot.',
    left: s('Clear the lane for the drone.', { janta: 8, kursi: -6 }),
    right: s('Hold the lane. The shot is live.', { kursi: 6, janta: -6, kanoon: -4 })
  },
  {
    id: 'tiger_later',
    era: 'later',
    minTerm: 1,
    block: ['tiger'],
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'An old voice note just landed. Same claim: you wrestled a tiger before breakfast. It is queued for the dome, before dinner.',
    left: s('Retire the tiger.', { kursi: -4, kanoon: 6 }),
    right: s('Pin it on the dome.', { janta: 6, kursi: 4, kanoon: -6 }, { set: ['tiger'] })
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
    text: 'Three of you are trending. The tiger, the noon speech, and the one who arrives late in four hundred cities. The two extras are still on the payroll. The salary file is unsigned.',
    left: s('Resign the two extras.', {}, { ending: 'copies' }),
    right: s('Keep all three on salary.', { janta: 4, kursi: 6, kanoon: -10, khazana: -6 })
  },
  {
    id: 'immortal',
    era: 'any',
    spine: true,
    minTerm: 36,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'The chair can outlast you. A bulb carries your smile, and it blinks only when the invoice clears. The socket is empty.',
    left: s('Switch it off. Go home.', {}, { ending: 'tea' }),
    right: s('Sit the bulb in the chair.', { kursi: 8, janta: -4, kanoon: -6 }, { set: ['bulb'] })
  },
  {
    id: 'names_due',
    era: 'any',
    queueOnly: true,
    need: ['troll_voice'],
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Ramesh was not on the list you read. His son is outside, on a live stream, and he has not stopped crying.',
    left: s('Add Ramesh now.', { janta: 6, kursi: -6 }),
    right: s('Say the list was complete.', { kursi: 6, janta: -8, kanoon: -4 })
  },
  {
    id: 'drain_due',
    era: 'any',
    queueOnly: true,
    need: ['one_date'],
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'The date you gave has arrived. The drain has not. The news is running your date next to a photograph of the same puddle.',
    left: s('Say the drain was never built.', { janta: -4, kanoon: 8, kursi: -4 }),
    right: s('Move the date.', { kursi: 4, kanoon: -6, janta: -4 })
  },
  {
    id: 'hole_due',
    era: 'any',
    queueOnly: true,
    need: ['renamed'],
    face: 'pinky',
    speaker: 'Pinky',
    role: 'Fixer',
    text: 'The new name is on the board. This morning that same hole took a scooter. The painter is still on the clock, with room for one more line.',
    left: s('Fill the hole today.', { khazana: -8, janta: 6, kursi: -4 }),
    right: s('Put my name on the hole too.', { kursi: 6, janta: -8, kanoon: -4 })
  },
  {
    id: 'clip_due',
    era: 'any',
    queueOnly: true,
    need: ['broom'],
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'The broom clip is on every channel. The cleaning money is still sitting in the account. My producer has asked for another week of the same clip.',
    left: s('Pull the clip. Pay the cleaners.', { khazana: -8, janta: 4, kursi: -4 }),
    right: s('Give her another week of it.', { kursi: 6, janta: -4, kanoon: -6 })
  },
  {
    id: 'gas_due',
    era: 'any',
    queueOnly: true,
    need: ['acronym'],
    face: 'mausi',
    speaker: 'Aunty',
    role: 'Party treasurer',
    text: 'The new name is printed on the cylinder. There is no gas inside it. A function for a third name is already booked.',
    left: s('Fill the gas. Keep this name.', { khazana: -8, janta: 6, kursi: -4 }),
    right: s('Hold the third-name function.', { kursi: 6, janta: -6, khazana: -4, kanoon: -4 })
  },
  {
    id: 'scooter_due',
    era: 'any',
    queueOnly: true,
    need: ['ribbon'],
    face: 'pinky',
    speaker: 'Pinky',
    role: 'Fixer',
    text: 'The dragged scooter is on every channel. The bridge still will not take its weight. Legal notices against those channels are already drafted.',
    left: s('Open the bridge for real.', { khazana: -8, janta: 6, kursi: -6 }),
    right: s('Send the notices.', { kursi: 6, kanoon: -8, janta: -4 })
  },
  {
    id: 'cloud_due',
    era: 'any',
    queueOnly: true,
    need: ['blamed'],
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: "That cloud graphic is in the school groups. They are asking how the last government held the rain. A minister's name fits the caption.",
    left: s('Admit it was the weather.', { kanoon: 6, kursi: -6, janta: 2 }),
    right: s('Put a minister in the caption.', { kursi: 4, janta: -6, kanoon: -6 })
  },
  {
    id: 'ashram_due',
    era: 'any',
    queueOnly: true,
    need: ['blessed'],
    face: 'baba',
    speaker: 'Swami Anandeshwar',
    role: 'Votes and land',
    text: 'The deed is registered and the wall is up. The next Thursday live needs the parking deed. The crowd is already standing outside that wall.',
    left: s('No second deed. Cancel the live.', { kursi: -6, kanoon: 6, janta: -6 }),
    right: s('Give them the parking deed too.', { janta: 4, kursi: 6, kanoon: -8, khazana: -6 })
  },
  {
    id: 'poem_due',
    era: 'any',
    queueOnly: true,
    need: ['couplet'],
    face: 'justice',
    speaker: 'Justice Rao',
    role: 'Show-cause notices',
    text: 'The poem case has reached my list. More people can recite the couplet than your speech. Your office has sent a request for a second case.',
    left: s('Withdraw the case.', { kanoon: 6, kursi: -4, janta: 2 }),
    right: s('File the second case.', { kursi: 6, kanoon: -8, janta: -4 })
  },
  {
    id: 'line_due',
    era: 'any',
    queueOnly: true,
    need: ['plain_speech'],
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: "That one line from eight o'clock is the only clip my producers will run. The opposition has been reading it since morning. Your office wants me to call it a misquote.",
    left: s('Stand by the line.', { kanoon: 6, janta: 4, kursi: -4 }),
    right: s('Tell her it was a misquote.', { kursi: 4, kanoon: -6, janta: -6 })
  },
  {
    id: 'vent_due',
    era: 'any',
    queueOnly: true,
    need: ['dome_face'],
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Your face is on the dome, and it is covering the oxygen vent. The hospital bill for that hour is on my desk, filed under a different head.',
    left: s('Take the face down. Pay the bill.', { khazana: -8, janta: 4, kursi: -4 }),
    right: s('Leave the bill under that head.', { kursi: 6, kanoon: -8, janta: -4 })
  },
  {
    id: 'sector_due',
    era: 'any',
    queueOnly: true,
    need: ['hover'],
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'The hover has been inaugurated. The hanging hole still will not take a scooter. A second sector is in the brief, with its own ribbon.',
    left: s('Bring it down and fill it.', { khazana: -8, janta: 6, kursi: -4 }),
    right: s('Cut a ribbon on a second sector.', { kursi: 6, janta: -4, kanoon: -6, khazana: -4 })
  },
  {
    id: 'hole_flip',
    era: 'later',
    spine: true,
    need: ['crossed', 'renamed'],
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'The year changed. So did the name of the road. The same hole is hanging under the new board. The ribbon for it is in the truck.',
    left: s('It is the same hole. Fill it.', { khazana: -8, janta: 8, kursi: -4 }),
    right: s('Cut the ribbon. Leave the hole.', { kursi: 8, janta: -4, kanoon: -4 }, { set: ['hover'], queue: [['sector_due', 2]] })
  },
  {
    id: 'bridge_flip',
    era: 'later',
    spine: true,
    need: ['crossed', 'ribbon'],
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'The year changed. The bridge where a scooter was dragged for a ribbon is in the air now. The scooter still does not run. A second ribbon is packed.',
    left: s('Fix the bridge so a scooter can cross.', { khazana: -8, janta: 8, kursi: -4 }),
    right: s('Cut the ribbon again. Drag it again.', { kursi: 8, janta: -4, kanoon: -6 })
  },
  {
    id: 'fill_power',
    era: 'now',
    repeat: true,
    weight: 1,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Between four and five the cabinet lights die. That is your usual hour for a decision. There is a candle. The press note I was handed says we waited for the tube light.',
    left: s('Decide in the dark. Keep it small.', { kanoon: 4, kursi: -2 }),
    right: s('Wait for the light. Send the note.', { kursi: 4, janta: -2, kanoon: -2 })
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
    text: 'The match has stopped for rain. The country is watching a tarpaulin. A thank-you to the rain is already drafted, ahead of the other party.',
    left: s('Stay quiet.', { kanoon: 2, kursi: -2 }),
    right: s('Thank the rain. Post it.', { janta: 2, kursi: 4, kanoon: -2 })
  },
  {
    id: 'fill_biscuit',
    era: 'later',
    repeat: true,
    weight: 1,
    face: 'mausi',
    speaker: 'Aunty',
    role: 'Party treasurer',
    text: 'The colony canteen is still serving the same biscuit. It is older than two ministries. A heritage price tag has already been printed.',
    left: s('Change the biscuit quietly.', { khazana: -4, janta: 4, kursi: -2 }),
    right: s('Charge for it as heritage.', { kursi: 4, janta: -4, khazana: 4 })
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
    text: 'Your condolence arrived three seconds late, then again, then a third time. The loop is cut. Your office wants the repeats described as real grief.',
    left: s('One apology. Cut the loop.', { janta: 2, kanoon: 2, kursi: -2 }),
    right: s('Call the repeats real grief.', { kursi: 4, janta: -4, kanoon: -2 })
  },
  {
    id: 'fill_oxygen',
    era: 'later',
    repeat: true,
    weight: 1,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Oxygen is on the bill again. The rally drew more of it than the hospital wing. The hospital line is marked. The rally line has been shifted under another head.',
    left: s('Pay the hospital first.', { khazana: -6, janta: 4, kursi: -4 }),
    right: s('Say the rally needed it too.', { kursi: 4, janta: -4, kanoon: -4 })
  },
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
