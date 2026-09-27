/**
 * Netagiri. The person on the card is in the room with you.
 * Plain English. The person on the card is speaking to you.
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
  { key: 'janta', label: 'People', hint: 'The crowd' },
  { key: 'khazana', label: 'Treasury', hint: 'The chest' },
  { key: 'kursi', label: 'Party', hint: 'The chair' },
  { key: 'kanoon', label: 'Law', hint: 'The file' }
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
    text: 'Sir, the count is in. The booth workers are in the front row, with their families. One speech thanks the country. The other reads their names, one by one. The camera is already on them.',
    left: s('Thank the country. Then sit.', { janta: 6, kursi: -4 }),
    right: s('Read every name.', { janta: 4, kursi: 8, kanoon: -6 }, { set: ['troll_voice'], queue: [['names_due', 2]] })
  },
  {
    id: 'oath_later',
    era: 'later',
    spine: true,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Sir, the count finished forty minutes late. People will call that progress. I have the oxygen bill, and a plan to put your face on the whole dome before the news does.',
    left: s('Read the oxygen bill.', { janta: 6, kanoon: 4, kursi: -4 }),
    right: s('Put my face on the dome.', { janta: 8, kursi: 6, kanoon: -6 }, { set: ['dome_face'], queue: [['vent_due', 2]] })
  },
  {
    id: 'hundred',
    era: 'now',
    minTerm: 1,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, the cameras are outside. They want a hundred days. I can name one drain and a date. Or the whole list, with no date on it.',
    left: s('One drain. One date.', { kanoon: 6, kursi: -4 }, { set: ['one_date'], queue: [['drain_due', 2]] }),
    right: s('The whole list. No date.', { janta: 8, kursi: 6 }, { set: ['hundred'], queue: [['hundred_due', 2]] })
  },
  {
    id: 'hundred_due',
    era: 'any',
    queueOnly: true,
    need: ['hundred'],
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Sir, today is day one hundred. The file still says day one. Do I put the truth on the ticker, or say the hundred days were never calendar days?',
    left: s('Tell the truth. The date slipped.', { janta: -4, kanoon: 8, kursi: -4 }),
    right: s('Say they were not real days.', { kursi: 6, kanoon: -8, janta: 2 })
  },
  {
    id: 'rename_road',
    era: 'now',
    minTerm: 1,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, this road is famous for one pothole. We can fill it this week. Or name the road after you and leave the hole where it is.',
    left: s('Fill the hole. Keep the name.', { khazana: -6, janta: 8, kursi: -4 }),
    right: s('Change the name. Leave the hole.', { janta: 4, kursi: 8 }, { set: ['renamed'], queue: [['hole_due', 2]] })
  },
  {
    id: 'broom',
    era: 'now',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, I dropped five dry leaves at the hotel gate. Slow motion is rolling. Pick up the broom and I have a clip. Or send the money to the cleaners and I turn the camera off.',
    left: s('Pay the cleaners. Camera off.', { khazana: -6, kanoon: 6, kursi: -4, janta: 2 }),
    right: s('Pick up the broom. Run the clip.', { janta: 8, kursi: 6 }, { set: ['broom'], queue: [['clip_due', 2]] })
  },
  {
    id: 'statue',
    era: 'now',
    minTerm: 2,
    face: 'lalaji',
    speaker: 'The contractor',
    role: 'Contracts and cement',
    text: 'Sir, I have the cement. I can stand you in stone, taller than the last one. Or I put it on the clinic roof. The clinic is not in my drawing. The drawing is already paid for.',
    left: s('The clinic roof. No statue.', { khazana: -6, janta: 6, kursi: -6 }),
    right: s('Make the statue taller.', { kursi: 8, janta: 4, kanoon: -6 }, { set: ['statue'], queue: [['statue_bill', 2]] })
  },
  {
    id: 'statue_bill',
    era: 'any',
    queueOnly: true,
    need: ['statue'],
    face: 'lalaji',
    speaker: 'The contractor',
    role: 'Contracts and cement',
    text: 'Sir, the statue ate the clinic budget. I can stop at the knees and give the clinic the money. Or I call the knees phase two. Phase two is where I get paid.',
    left: s('Stop at the knees. Pay the clinic.', { khazana: -8, janta: 4, kursi: -4 }),
    right: s('Phase two. Bill the knees.', { khazana: -10, kursi: 8, kanoon: -6 })
  },
  {
    id: 'foreign',
    era: 'now',
    minTerm: 2,
    face: 'envoy',
    speaker: 'The envoy',
    role: 'Trade draft',
    text: 'Sir, I have one pen and the trade draft. Your party put thirty-eight people on the plane. The photographer says they are essential staff.',
    left: s('Just us two. Send the rest home.', { kursi: -4, kanoon: 4, khazana: 6 }),
    right: s('All thirty-eight. Shoot the pen.', { khazana: -10, kursi: 6, janta: 4 }, { set: ['trip'], queue: [['mou', 2]] })
  },
  {
    id: 'mou',
    era: 'any',
    queueOnly: true,
    need: ['trip'],
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Sir, what you signed says the two countries will meet again. That is all. Do I leave the PDF as it is, or tell the press it was a historic handshake?',
    left: s('Print the PDF as it is.', { kanoon: 6, janta: -2 }),
    right: s('Call it a historic handshake.', { janta: 6, kursi: 6 })
  },
  {
    id: 'tiger',
    era: 'now',
    minTerm: 1,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, your uncle sent a voice note. It says you wrestled a tiger before breakfast. Do I delete it before lunch, or pin it and add another tiger?',
    left: s('Delete it. Now.', { kursi: -4, kanoon: 6 }),
    right: s('Pin it. Add another tiger.', { janta: 8, kursi: 4, kanoon: -6 }, { set: ['tiger'] })
  },
  {
    id: 'onions',
    era: 'now',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, onions are up, and the graphic has your face on fire. I have ten seconds. Do I run the price, or ask on air who paid for my flames?',
    left: s('Run the onion price.', { janta: 2, kanoon: 6, kursi: -4 }),
    right: s('Ask who paid for the flames.', { janta: 6, kursi: 6, kanoon: -4 })
  },
  {
    id: 'urea',
    era: 'now',
    minTerm: 2,
    face: 'kisan',
    speaker: 'The farmer',
    role: 'Brought the bill',
    text: 'Sir, the urea reached the field. The bill arrived twice. Cancel the second one. Or tell me to my face that paying twice is the reform.',
    left: s('Cancel the second bill.', { khazana: -10, janta: 8, kursi: -4 }, { set: ['bill_cut'] }),
    right: s('Say paying twice is reform.', { kursi: 4, janta: -8 })
  },
  {
    id: 'cylinder',
    era: 'now',
    minTerm: 2,
    face: 'mausi',
    speaker: 'Aunty',
    role: 'Party treasurer',
    text: 'Listen. You already gave this cylinder. People remember. Do I send the same one, or print a new name on it and hold a function?',
    left: s('Send what you promised.', { khazana: -10, janta: 6 }),
    right: s('New name. Hold the function.', { janta: 6, kursi: 6, khazana: -4 }, { set: ['acronym'], queue: [['gas_due', 2]] })
  },
  {
    id: 'nephew',
    era: 'now',
    minTerm: 3,
    face: 'mausi',
    speaker: 'Aunty',
    role: 'Party treasurer',
    text: 'Listen. Your nephew has a one-page CV, and your surname is the biggest line on it. The exam is on Tuesday. Do I send him, or make him chairman of the public company tonight? The board will clap.',
    left: s('Send him to the exam.', { kursi: -6, kanoon: 8 }),
    right: s('Make him chairman tonight.', { kursi: 8, kanoon: -10, khazana: 4 }, { set: ['nephew'] })
  },
  {
    id: 'cricket',
    era: 'now',
    minTerm: 1,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, we won the match. The graphic is ready. Do I write well played and stay quiet, or name the cup after your scheme before the other party does?',
    left: s('Well played. That is all.', { janta: 2 }),
    right: s('Name the cup after the scheme.', { janta: 8, kursi: 4 })
  },
  {
    id: 'ribbon',
    era: 'now',
    minTerm: 2,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, we can cut the ribbon on the bridge. A scooter cannot cross it. Do we wait until a scooter can, or cut the ribbon and drag a scooter into the shot?',
    left: s('Wait until a scooter crosses.', { khazana: -6, janta: 6, kursi: -6 }),
    right: s('Cut the ribbon. Drag the scooter.', { janta: 4, kursi: 8, kanoon: -6 }, { set: ['ribbon'], queue: [['scooter_due', 2]] })
  },
  {
    id: 'committee',
    era: 'now',
    minTerm: 2,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Sir, the committee on the fallen bridge wants another committee, to investigate itself. The contractor funded the campaign. Do I name him, or let them chase each other until the file dies?',
    left: s('Name the contractor.', { kanoon: 8, kursi: -6 }),
    right: s('Let them chase each other.', { kursi: 6, kanoon: -8 })
  },
  {
    id: 'eight_pm',
    era: 'now',
    minTerm: 3,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, at eight the country stops. Give me one real job, in one line. Or I launch an app and say everything will be fine by morning.',
    left: s('One job. One line.', { kanoon: 6, kursi: -2 }, { set: ['plain_speech'], queue: [['line_due', 2]] }),
    right: s('Launch the app tonight.', { janta: 6, kursi: 6, kanoon: -6 }, { set: ['the_app'], queue: [['app_morning', 1]] })
  },
  {
    id: 'app_morning',
    era: 'any',
    queueOnly: true,
    need: ['the_app'],
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, the app crashes as soon as someone types your name. Trending is calling that a masterstroke. Do I take it down until it opens, or say people are holding the phone wrong?',
    left: s('Take it down until it opens.', { kanoon: 6, kursi: -6, janta: 2 }),
    right: s('Say they hold the phone wrong.', { kursi: 6, janta: -4, kanoon: -4 })
  },
  {
    id: 'mango',
    era: 'now',
    minTerm: 2,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, the weekly chat is today. Onions are expensive. Mangoes are good. Give me the price and I will run that. Or praise mangoes for twenty minutes and I will only cut that.',
    left: s('Give the onion price.', { janta: 6, kursi: -2 }),
    right: s('Praise mangoes. Twenty minutes.', { kursi: 6, janta: -4 })
  },
  {
    id: 'garland',
    era: 'now',
    minTerm: 1,
    face: 'mausi',
    speaker: 'Aunty',
    role: 'Party treasurer',
    text: 'Listen. This garland is heavier than the file under it. Take it off and read. Or wear it live. Flowers look better than a file.',
    left: s('Take off the garland. Read.', { kanoon: 4, janta: -2 }),
    right: s('Wear it. Go live.', { janta: 6, kursi: 4 })
  },
  {
    id: 'survey',
    era: 'now',
    minTerm: 3,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, I rounded the survey until 112 percent were happy. The real number is on the other phone. Do I send the real one before the meeting, or print 112 in bold?',
    left: s('Send the real number.', { kursi: -6, kanoon: 6 }),
    right: s('Print 112. In bold.', { kursi: 8, janta: 4, kanoon: -6 })
  },
  {
    id: 'poem',
    era: 'now',
    minTerm: 2,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, the opposition put a poem on your silence. It rhymes, and it is spreading. Do I leave it, or file a case and send a couplet back?',
    left: s('Leave the poem.', { kanoon: 2 }),
    right: s('File the case. Send a couplet.', { kursi: 6, janta: 2, kanoon: -8 }, { set: ['couplet'], queue: [['poem_due', 2]] })
  },
  {
    id: 'millet',
    era: 'now',
    minTerm: 2,
    face: 'envoy',
    speaker: 'The envoy',
    role: 'Trade draft',
    text: 'Sir, dinner is millet, the way your office asked. The contractor has a chef, a fountain, and a drone waiting in the parking lot. What do I tell the kitchen?',
    left: s('Serve the millet. Explain once.', { janta: 4, khazana: 2 }),
    right: s('Call the chef. And the fountain.', { khazana: -10, kursi: 6, janta: 2 })
  },
  {
    id: 'forty_stops',
    era: 'now',
    minTerm: 3,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, there are forty stops this week. The third has no school roof. The twelfth has a drone and a ribbon. Do I fix the roof and cut the tour, or do all forty and send the twelfth as the video?',
    left: s('Fix the roof. Cut the tour.', { khazana: -8, janta: 8, kursi: -6 }),
    right: s('All forty. Drone at twelve.', { janta: 6, kursi: 8, khazana: -6 })
  },
  {
    id: 'baba_box',
    era: 'now',
    minTerm: 3,
    face: 'baba',
    speaker: 'The guru',
    role: 'Retreat and airtime',
    text: 'Prime Minister, on Thursday I will bless you live. I need the land deed in the name of his retreat, and the live slot. The box is a donation, not a blessing. Give the deed, or keep Thursday for cabinet.',
    left: s('No deed. Thursday stays cabinet.', { kursi: -6, kanoon: 6 }),
    right: s('Give the deed and the slot.', { janta: 6, kursi: 6, kanoon: -8, khazana: 4 }, { set: ['blessed'], queue: [['ashram_due', 2]] })
  },
  {
    id: 'convoy',
    era: 'now',
    minTerm: 1,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, the cars are on the road. An ambulance is honking behind us. The camera is only on your car. Do I pull over, or keep moving so the clip stays clean?',
    left: s('Pull over. Let the ambulance pass.', { janta: 8, kursi: -4 }),
    right: s('Keep moving. Keep the clip clean.', { kursi: 6, janta: -6 })
  },
  {
    id: 'anchor',
    era: 'now',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, the question is this. The power went out last night. It did not go out in your lane. Why? My banner already says the last government. Do I tell the truth, or read the banner?',
    left: s('Tell the truth. Ours went out too.', { kanoon: 6, kursi: -4 }),
    right: s('Read the banner. Last government.', { janta: 6, kursi: 6 })
  },
  {
    id: 'blame',
    era: 'now',
    minTerm: 2,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, it rained on the rally. The graphic shows the last government holding the cloud. Do I say it was the weather, or point at the cloud on camera? If I say weather, I look like a fool.',
    left: s('Say it is the weather.', { kanoon: 4, kursi: -4 }),
    right: s('Point at the cloud.', { janta: 6, kursi: 8, kanoon: -4 }, { set: ['blamed'], queue: [['cloud_due', 2]] })
  },
  {
    id: 'yoga',
    era: 'now',
    minTerm: 1,
    face: 'baba',
    speaker: 'The guru',
    role: 'Retreat and airtime',
    text: 'Prime Minister, the cameras are closer than the devotees. The onion meeting is this same minute. Hold the pose until it trends, or leave the lawn and take the meeting.',
    left: s('Leave the lawn. Take the meeting.', { kanoon: 6, janta: -2, kursi: -2 }),
    right: s('Hold the pose until it trends.', { janta: 8, kursi: 4 })
  },
  {
    id: 'no_questions',
    era: 'now',
    minTerm: 2,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Sir, the press is seated. A note on the podium says no questions. The note is longer than your speech. Take three questions, or read the note and leave.',
    left: s('Take three questions.', { kanoon: 6, kursi: -4 }),
    right: s('Read the note. Leave.', { kursi: 6, janta: -2, kanoon: -4 })
  },
  {
    id: 'the_flip',
    era: 'later',
    spine: true,
    need: ['crossed'],
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Sir, the year changed. The pothole did not. It is hanging in the air now, and I am calling it a sector. The ribbon is in the glove box. Do I fill it, or inaugurate the hover?',
    left: s('It is a pothole. Fill it.', { khazana: -6, janta: 8, kursi: -4 }),
    right: s('Inaugurate the hover.', { kursi: 8, janta: 4 }, { set: ['hover'], queue: [['sector_due', 2]] })
  },
  {
    id: 'hologram',
    era: 'later',
    minTerm: 1,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, tonight I can stand your face in four hundred cities. The mouth arrives three seconds late. Do you speak in one city yourself, or do I send all four hundred and call the delay charisma?',
    left: s('One city. I speak myself.', { janta: 4, kursi: -4 }),
    right: s('Send four hundred. Keep the delay.', { janta: 8, kursi: 6, kanoon: -4 }, { set: ['hologram'] })
  },
  {
    id: 'seventh',
    era: 'later',
    minTerm: 1,
    face: 'lalaji',
    speaker: 'The contractor',
    role: 'Contracts and cement',
    text: 'Sir, this is the same old metro. We are cutting the ribbon for the seventh time. The first six were historic too. The train only moves if two interns shove it and nobody is filming. A hidden shove, or a seventh ribbon and invitations to the other six?',
    left: s('A hidden shove. No ribbon.', { kanoon: 6, kursi: -4, khazana: -2 }),
    right: s('Seventh ribbon. Invite them.', { kursi: 8, janta: 4 })
  },
  {
    id: 'mars_stone',
    era: 'later',
    minTerm: 2,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Sir, the dome is too small. Your statue is not. The engineer wrote that the statue is taller than the dome. Do I shrink the statue, or raise the dome and leave the note outside?',
    left: s('Shrink the statue.', { kanoon: 6, khazana: -4, kursi: -2 }),
    right: s('Raise the dome. Leave the note.', { khazana: -8, kursi: 8, janta: 4, kanoon: -6 })
  },
  {
    id: 'noon_model',
    era: 'later',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, at noon a model read your speech. She read it more clearly than you. The country clapped. Do I say that was not you, or do you keep the applause and I fire the writer?',
    left: s('Say that was not me.', { janta: -4, kanoon: 8, kursi: -4 }),
    right: s('Keep the applause. Fire the writer.', { janta: 6, kursi: 6 }, { set: ['took_clap'] })
  },
  {
    id: 'chai_code',
    era: 'later',
    minTerm: 1,
    face: 'kisan',
    speaker: 'The stall',
    role: 'Brought the bill',
    text: 'Sir, notes do not work anymore. Payment comes as a code on the phone. My stall has no signal, and the kettle is full. Give me a coin. If you say update, the tea goes cold.',
    left: s('Give a coin he can hold.', { khazana: -4, janta: 8 }),
    right: s('Tell the stall to update.', { kursi: 4, janta: -8 })
  },
  {
    id: 'leds',
    era: 'later',
    minTerm: 2,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Sir, the river is still a drain. The lights are up, so at night it looks finished. I have the footage. I do not have the water. Do I switch the lights off and pay the drain, or call it a riverfront and leave it?',
    left: s('Lights off. Pay the drain.', { khazana: -8, janta: 6, kanoon: 4 }),
    right: s('Drop the footage. Call it a riverfront.', { janta: 6, kursi: 6, kanoon: -6 })
  },
  {
    id: 'generator',
    era: 'later',
    minTerm: 2,
    face: 'envoy',
    speaker: 'The envoy',
    role: 'Trade draft',
    text: 'Sir, the climate paper is ready to sign. The stage generator is louder than your words. Do I sign and switch it off, or sign louder than it and never say its name?',
    left: s('Sign it. Switch the generator off.', { kanoon: 6, kursi: -4, janta: 2 }),
    right: s('Sign louder than the generator.', { kursi: 6, janta: 4 })
  },
  {
    id: 'buffer',
    era: 'later',
    minTerm: 3,
    face: 'mausi',
    speaker: 'Aunty',
    role: 'Party treasurer',
    text: 'Listen. Your nephew is a year-long subscription now. The company is still asking for him. He freezes on the word thank you. Do I cancel the plan, or make the frozen one chairman?',
    left: s('Cancel the subscription.', { kursi: -8, kanoon: 6 }),
    right: s('Make the frozen one chairman.', { kursi: 8, kanoon: -8, khazana: 4 }, { set: ['nephew'] })
  },
  {
    id: 'crater',
    era: 'later',
    minTerm: 2,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Sir, a crater on the moon has no name. One of your schemes has no result either. Do I put the scheme name on the crater? The moon cannot write a complaint.',
    left: s('Leave the moon alone.', { kanoon: 4 }),
    right: s('Put the scheme name on it.', { kursi: 8, janta: 4 })
  },
  {
    id: 'blink',
    era: 'later',
    minTerm: 2,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, I can put the face of Aunty on the budget speech. She will blink on every comma. People trust a blink more than a table. Do I send the real Aunty and the real table, or let the blink run?',
    left: s('The real Aunty. The real table.', { kanoon: 6, kursi: -4 }),
    right: s('Let her blink.', { janta: 4, kursi: 6, kanoon: -8 })
  },
  {
    id: 'robot_bill',
    era: 'later',
    minTerm: 2,
    face: 'kisan',
    speaker: 'The farmer',
    role: 'Brought the bill',
    text: 'Sir, the subsidy arrived as a phone notification. You cannot eat it. The field robot sent its own bill, and the bill is rude. Pay the farmer and stop the robot. Or say the robot is the reform.',
    left: s('Pay them. Stop the robot bill.', { khazana: -8, janta: 8 }, { set: ['bill_cut'] }),
    right: s('Say the robot is the reform.', { janta: -6, kursi: 6 })
  },
  {
    id: 'weightless',
    era: 'later',
    minTerm: 3,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Sir, gravity is not working in the new colony. I formed a committee, and the committee is floating. This time it is not a joke. Do I send one engineer down, or let them float until the photo is done?',
    left: s('Send one engineer down.', { kanoon: 8, kursi: -4 }),
    right: s('Let them float for the photo.', { kursi: 6, janta: 2 })
  },
  {
    id: 'two_clocks',
    era: 'later',
    minTerm: 2,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, two clocks are printed. One for the country. One for the rally, so you are never late and never early. Do I keep one, or call the rally time a mood?',
    left: s('Keep one clock.', { kursi: -4, kanoon: 6 }),
    right: s('Run both. Call it a mood.', { janta: 6, kursi: 6, kanoon: -4 })
  },
  {
    id: 'blame_later',
    era: 'later',
    minTerm: 2,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, a meteor tore the ribbon tent. The graphic shows the last century holding the rock. Do I say it was a rock, or point at that century on camera?',
    left: s('Say it is a rock.', { kanoon: 4, kursi: -4 }),
    right: s('Point at the last century.', { janta: 6, kursi: 8, kanoon: -4 })
  },
  {
    id: 'convoy_later',
    era: 'later',
    minTerm: 1,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Sir, your holograms are standing in the sky lane. A medical drone is blinking red behind them. The camera only catches the hologram, not the drone. Do I clear the lane, or keep the shot?',
    left: s('Clear the lane. Let the drone through.', { janta: 8, kursi: -4 }),
    right: s('Do not clear it. The shot is live.', { kursi: 6, janta: -6 })
  },
  {
    id: 'tiger_later',
    era: 'later',
    minTerm: 1,
    block: ['tiger'],
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, an old voice note just arrived. It says you wrestled a tiger before breakfast. Do I retire the tiger, or pin it on the dome before dinner?',
    left: s('Retire the tiger.', { kursi: -4, kanoon: 6 }),
    right: s('Pin it on the dome.', { janta: 8, kursi: 4, kanoon: -6 }, { set: ['tiger'] })
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
    text: 'Boss, three versions of you are trending. The tiger one, the noon speech, and the one who arrives late in four hundred cities. Do I write resignations for the two extras, or keep all three on salary?',
    left: s('Resign the two extras.', {}, { ending: 'copies' }),
    right: s('Keep all three on salary.', { janta: 8, kursi: 4, kanoon: -10 })
  },
  {
    id: 'immortal',
    era: 'any',
    spine: true,
    minTerm: 36,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Sir, the chair can keep running after you. A bulb has your smile on it. It only blinks when the invoice clears. Do I switch it off and send you home, or sit the bulb in the chair?',
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
    text: 'Boss, one name was missing from the list you read. Ramesh. His son is outside, crying on a live stream. Do I add the name now, or say the list was complete?',
    left: s('Add Ramesh. Now.', { janta: 6, kursi: -6 }),
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
    text: 'Sir, the date has arrived. The drain is the same drain. The news has your date, and a photo of the puddle. Do I move the date, or say the drain was never built?',
    left: s('Tell the truth. It was not built.', { janta: -4, kanoon: 8, kursi: -4 }),
    right: s('Move the date.', { kursi: 4, kanoon: -6, janta: -2 })
  },
  {
    id: 'hole_due',
    era: 'any',
    queueOnly: true,
    need: ['renamed'],
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, the new name is on the board. Today that same hole swallowed a scooter. It has to be filled. Or do I put your name on the hole as well?',
    left: s('Fill the hole. Today.', { khazana: -8, janta: 6, kursi: -4 }),
    right: s('Put my name on the hole too.', { kursi: 6, janta: -6, kanoon: -4 })
  },
  {
    id: 'clip_due',
    era: 'any',
    queueOnly: true,
    need: ['broom'],
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, the broom clip is on every channel. The cleaning money is still sitting there, unspent. Do I run the clip another week, or pull it and send the money to the cleaners?',
    left: s('Pull the clip. Pay the cleaners.', { khazana: -8, janta: 4, kursi: -4 }),
    right: s('Run it another week.', { janta: 4, kursi: 6, kanoon: -4 })
  },
  {
    id: 'gas_due',
    era: 'any',
    queueOnly: true,
    need: ['acronym'],
    face: 'mausi',
    speaker: 'Aunty',
    role: 'Party treasurer',
    text: 'Listen. The new name is printed on the cylinder. There is no gas inside. Do I fill it, or invent a third name and hold another function?',
    left: s('Fill the gas. Keep the name.', { khazana: -8, janta: 6, kursi: -4 }),
    right: s('A third name. Another function.', { kursi: 6, janta: -6, khazana: -4 })
  },
  {
    id: 'scooter_due',
    era: 'any',
    queueOnly: true,
    need: ['ribbon'],
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, that dragged scooter is on every channel. The bridge still cannot take the weight of a scooter. Do I open it for real, or sue the channels?',
    left: s('Open the bridge. Let it drive.', { khazana: -8, janta: 6, kursi: -6 }),
    right: s('Sue the channels.', { kursi: 6, kanoon: -8, janta: -4 })
  },
  {
    id: 'cloud_due',
    era: 'any',
    queueOnly: true,
    need: ['blamed'],
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, that cloud graphic is in school groups now. People are asking how the last government held the rain. Do we admit it was weather, or put it on a minister?',
    left: s('Admit it was the weather.', { kanoon: 6, kursi: -6, janta: 2 }),
    right: s('Put it on a minister.', { kursi: 4, janta: -6, kanoon: -6 })
  },
  {
    id: 'ashram_due',
    era: 'any',
    queueOnly: true,
    need: ['blessed'],
    face: 'baba',
    speaker: 'The guru',
    role: 'Retreat and airtime',
    text: 'Prime Minister, the deed arrived, and so did the wall. The next live needs a second deed, for the parking. People are standing outside the wall. Give the parking deed, or I cancel the next live.',
    left: s('No second deed. Cancel the live.', { kursi: -6, kanoon: 6, janta: -4 }),
    right: s('Give the parking deed too.', { janta: 4, kursi: 6, kanoon: -8, khazana: 4 })
  },
  {
    id: 'poem_due',
    era: 'any',
    queueOnly: true,
    need: ['couplet'],
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, after the case the poem is spreading more. People remember the couplet, not your speech. Do I withdraw the case, or file a second one and send a second couplet?',
    left: s('Withdraw the case.', { kanoon: 6, kursi: -4, janta: 2 }),
    right: s('A second case. A second couplet.', { kursi: 6, kanoon: -8, janta: -2 })
  },
  {
    id: 'line_due',
    era: 'any',
    queueOnly: true,
    need: ['plain_speech'],
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, that one line you said at eight. The opposition has been reading it all day. Do you stand by the line, or do I say you were misquoted?',
    left: s('Stand by the line.', { kanoon: 6, janta: 4, kursi: -4 }),
    right: s('Say I was misquoted.', { kursi: 4, kanoon: -6, janta: -4 })
  },
  {
    id: 'vent_due',
    era: 'any',
    queueOnly: true,
    need: ['dome_face'],
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Sir, your face is on the dome. It covered the oxygen vent. The hospital bill has arrived. Do I take the face down, or move the bill onto some other item?',
    left: s('Take the face down. Pay the bill.', { khazana: -8, janta: 4, kursi: -4 }),
    right: s('Move the bill to another name.', { kursi: 6, kanoon: -8, janta: -4 })
  },
  {
    id: 'sector_due',
    era: 'any',
    queueOnly: true,
    need: ['hover'],
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Sir, the hover was inaugurated. The hanging hole still cannot take a scooter. Do I bring it down and fill it, or call it a second sector and cut another ribbon?',
    left: s('Bring it down. Fill it.', { khazana: -8, janta: 6, kursi: -4 }),
    right: s('A second sector. Another ribbon.', { kursi: 6, janta: -4, kanoon: -4 })
  },
  {
    id: 'hole_flip',
    era: 'later',
    spine: true,
    need: ['crossed', 'renamed'],
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Sir, the year changed. The road name already changed. That same hole is hanging in the air, under the board. Do I fill it, or cut a ribbon on the thing that is hanging?',
    left: s('It is the same hole. Fill it.', { khazana: -8, janta: 8, kursi: -4 }),
    right: s('Cut the ribbon. Leave the hole.', { kursi: 8, janta: -4 }, { set: ['hover'], queue: [['sector_due', 2]] })
  },
  {
    id: 'bridge_flip',
    era: 'later',
    spine: true,
    need: ['crossed', 'ribbon'],
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Sir, the year changed. The bridge where we dragged a scooter and cut a ribbon is in the air now. The scooter still does not run. Do I fix the weight, or cut the ribbon again?',
    left: s('Fix the bridge. Let the scooter go.', { khazana: -8, janta: 8, kursi: -4 }),
    right: s('Cut it again. Drag the scooter.', { kursi: 8, janta: -2, kanoon: -6 })
  },
  {
    id: 'fill_power',
    era: 'now',
    repeat: true,
    weight: 1,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Sir, the lights die in cabinet between four and five. That is when you take decisions. There is a candle. Take a small decision in the dark, or wait for the tube light and I will tell the press we waited.',
    left: s('Decide in the dark. Keep it small.', { kanoon: 4 }),
    right: s('Wait for the light. Tell the press.', { kursi: 2, janta: -2 })
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
    text: 'Boss, the match is stopped for rain. The country is watching a tarpaulin. Stay quiet, it is rain. Or thank the rain, before the other side does.',
    left: s('Stay quiet. It is rain.', { kanoon: 2 }),
    right: s('Thank the rain. Post it.', { janta: 4, kursi: 2 })
  },
  {
    id: 'fill_biscuit',
    era: 'later',
    repeat: true,
    weight: 1,
    face: 'mausi',
    speaker: 'Aunty',
    role: 'Party treasurer',
    text: 'Listen. The colony canteen still has the same biscuit. It is older than two ministries. Do I change it quietly, or call it heritage and charge for it?',
    left: s('Change the biscuit quietly.', { khazana: -2, janta: 2 }),
    right: s('Call it heritage. Charge for it.', { kursi: 4, janta: 2, khazana: 2 })
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
    text: 'Sir, your condolence arrived three seconds late, then again, then a third time. Do I send one apology and kill the loop, or say it came three times because you were truly sad?',
    left: s('One apology. Cut the loop.', { janta: 2, kanoon: 2 }),
    right: s('Say three times means real grief.', { kursi: 4, janta: -4 })
  },
  {
    id: 'fill_oxygen',
    era: 'later',
    repeat: true,
    weight: 1,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Sir, oxygen is on the bill again. The rally used more than the hospital. I have marked the line. Do I send the hospital wing bill first, or say the rally was necessary too?',
    left: s('The hospital bill first.', { khazana: -6, janta: 4, kursi: -2 }),
    right: s('Say the rally was necessary too.', { kursi: 4, janta: -4, kanoon: -2 })
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
