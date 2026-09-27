/**
 * Netagiri card rules. Do not regress.
 * The person on the card speaks to the Prime Minister. No third-person narrator.
 * Two sentences. Name the money, the vote, the court, the camera, or the crowd.
 * No riddles. "The box has a slot" and "he brought a pen" are failures.
 * Left and right are opposite orders, verb first. Not a straight line versus a slogan.
 * The bars move with the order: spending the chest lowers Khazana, a fake clip raises Janta, burying a file lowers Kanoon.
 * Deltas stay within -14..14. No living politicians' names.
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
    text: 'Sir, the count is done and the booth workers are in the front row. I can thank the country, or read every one of their names.',
    left: s('Thank the country. Then sit.', { janta: 6, kursi: -4 }),
    right: s('Read every booth worker’s name.', { janta: 4, kursi: 8, kanoon: -6 }, { set: ['troll_voice'] })
  },
  {
    id: 'oath_later',
    era: 'later',
    spine: true,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Prime Minister, the count finished forty minutes late. I can read the oxygen bill, or put your face across the dome before the news does.',
    left: s('Read the oxygen bill.', { janta: 6, kanoon: 4, kursi: -4 }),
    right: s('Put my face across the dome.', { janta: 8, kursi: 6, kanoon: -6 }, { set: ['dome_face'] })
  },
  {
    id: 'hundred',
    era: 'now',
    minTerm: 1,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, the cameras want a hundred-day list. I can give them one drain and a date, or promise the whole country before you sit down.',
    left: s('Promise one drain and a date.', { kanoon: 6, kursi: -4 }, { set: ['one_date'] }),
    right: s('Promise the whole country.', { janta: 8, kursi: 6 }, { set: ['hundred'], queue: [['hundred_due', 2]] })
  },
  {
    id: 'hundred_due',
    era: 'any',
    queueOnly: true,
    need: ['hundred'],
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Prime Minister, day one hundred was this morning and the file is still labelled day one. Do we admit the slip, or do I tell the ticker these were lunar days?',
    left: s('Admit the date slipped.', { janta: -4, kanoon: 8, kursi: -4 }),
    right: s('Call them lunar days.', { kursi: 6, kanoon: -8, janta: 2 })
  },
  {
    id: 'rename_road',
    era: 'now',
    minTerm: 1,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, this road is famous for one pothole. I can fill it this week, or rename the road after you and leave the hole where it is.',
    left: s('Fill the hole. Keep the name.', { khazana: -6, janta: 8, kursi: -4 }),
    right: s('Rename the road. Leave the hole.', { janta: 4, kursi: 8 }, { set: ['renamed'] })
  },
  {
    id: 'broom',
    era: 'now',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, I put five dry leaves outside the hotel and the slow-motion camera is live. Wave the broom for the ad, or I send this budget to the sewer workers and you get no clip.',
    left: s('Send the budget to the workers.', { khazana: -6, kanoon: 6, kursi: -4, janta: 2 }),
    right: s('Wave the broom. Get the clip.', { janta: 8, kursi: 6 }, { set: ['broom'] })
  },
  {
    id: 'statue',
    era: 'now',
    minTerm: 2,
    face: 'lalaji',
    speaker: 'Lalaji',
    role: 'Contracts and cement',
    text: 'PM sahab, I can pour you in stone taller than the last fellow, or put that cement on the clinic roof. The clinic is not in my drawing, and the drawing is already paid for.',
    left: s('Roof the clinic. No statue.', { khazana: -6, janta: 6, kursi: -6 }),
    right: s('Pour it taller than the last one.', { kursi: 8, janta: 4, kanoon: -6 }, { set: ['statue'], queue: [['statue_bill', 2]] })
  },
  {
    id: 'statue_bill',
    era: 'any',
    queueOnly: true,
    need: ['statue'],
    face: 'lalaji',
    speaker: 'Lalaji',
    role: 'Contracts and cement',
    text: 'Sahab, the statue has eaten the clinic’s money. Stop at the knees and pay the clinic, or I bill the knees as phase two, which is where I earn.',
    left: s('Stop at the knees. Pay the clinic.', { khazana: -8, janta: 4, kursi: -4 }),
    right: s('Bill the knees as phase two.', { khazana: -10, kursi: 8, kanoon: -6 })
  },
  {
    id: 'foreign',
    era: 'now',
    minTerm: 2,
    face: 'envoy',
    speaker: 'The envoy',
    role: 'Trade draft',
    text: 'Prime Minister, I have one pen and a trade draft. Your party booked thirty-eight seats, and the photographer says he is essential staff.',
    left: s('Fly me and the pen. Cut the rest.', { kursi: -4, kanoon: 4, khazana: 6 }),
    right: s('Fly all thirty-eight. Film the pen.', { khazana: -10, kursi: 6, janta: 4 }, { set: ['trip'], queue: [['mou', 2]] })
  },
  {
    id: 'mou',
    era: 'any',
    queueOnly: true,
    need: ['trip'],
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Sir, the signed page only says both sides hope to meet again. Do I release that PDF, or brief the press on a historic handshake?',
    left: s('Release the PDF as it is.', { kanoon: 6, janta: -2 }),
    right: s('Brief a historic handshake.', { janta: 6, kursi: 6 })
  },
  {
    id: 'tiger',
    era: 'now',
    minTerm: 1,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, an uncle’s voice note says you wrestled a tiger before breakfast. I can delete it before lunch, or pin it and add a second tiger.',
    left: s('Delete the voice note.', { kursi: -4, kanoon: 6 }),
    right: s('Pin it. Add a second tiger.', { janta: 8, kursi: 4, kanoon: -6 }, { set: ['tiger'] })
  },
  {
    id: 'onions',
    era: 'now',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, onions are up and my graphic has your face on fire. In ten seconds I can run the price, or ask on air who paid me to light the graphic.',
    left: s('Read the onion price on air.', { janta: 2, kanoon: 6, kursi: -4 }),
    right: s('Ask who paid for the fire.', { janta: 6, kursi: 6, kanoon: -4 })
  },
  {
    id: 'urea',
    era: 'now',
    minTerm: 2,
    face: 'kisan',
    speaker: 'The farmer',
    role: 'Brought the bill',
    text: 'Sahab, the urea reached the field and the bill reached me twice. Cancel the second bill, or say to my face that paying twice is a reform.',
    left: s('Cancel the second bill.', { khazana: -10, janta: 8, kursi: -4 }, { set: ['bill_cut'] }),
    right: s('Call the second bill a reform.', { kursi: 4, janta: -8 })
  },
  {
    id: 'cylinder',
    era: 'now',
    minTerm: 2,
    face: 'mausi',
    speaker: 'Mausi',
    role: 'Party treasurer',
    text: 'Beta, you already promised these cylinders. I can send the ones you named, or print a new scheme on the same cylinder and hold a function.',
    left: s('Deliver the cylinders already promised.', { khazana: -10, janta: 6 }),
    right: s('New name on it. Hold the function.', { janta: 6, kursi: 6, khazana: -4 }, { set: ['acronym'] })
  },
  {
    id: 'nephew',
    era: 'now',
    minTerm: 3,
    face: 'mausi',
    speaker: 'Mausi',
    role: 'Party treasurer',
    text: 'Beta, your nephew’s CV is your surname in a big font, and the exam is on Tuesday. Send him to it, or I make him chairman of a public company tonight.',
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
    text: 'Boss, we won the match. I can post well played and stop, or dedicate the cup to your scheme before the other party does.',
    left: s('Post well played. Stop there.', { janta: 2 }),
    right: s('Dedicate the cup to the scheme.', { janta: 8, kursi: 4 })
  },
  {
    id: 'ribbon',
    era: 'now',
    minTerm: 2,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, the bridge can take a ribbon today and cannot take a scooter. Wait until a scooter crosses, or cut the ribbon and tow a scooter into the shot.',
    left: s('No ribbon until a scooter crosses.', { khazana: -6, janta: 6, kursi: -6 }),
    right: s('Cut the ribbon. Tow a scooter in.', { janta: 4, kursi: 8, kanoon: -6 }, { set: ['ribbon'] })
  },
  {
    id: 'committee',
    era: 'now',
    minTerm: 2,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Prime Minister, the bridge committee wants a second committee so it can investigate itself. Do I name the contractor who funded the campaign, or let them chase each other until the file dies?',
    left: s('Name the contractor. You chair it.', { kanoon: 8, kursi: -6 }),
    right: s('Let the committees chase each other.', { kursi: 6, kanoon: -8 })
  },
  {
    id: 'eight_pm',
    era: 'now',
    minTerm: 3,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, the country will stop at eight. Put one real rule in one sentence, or launch an app and tell them the rest is fixed by morning.',
    left: s('One rule. One sentence.', { kanoon: 6, kursi: -2 }, { set: ['plain_speech'] }),
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
    text: 'Boss, the app crashes when you type your own name, and trending is calling that a masterstroke. Take it down until it opens, or tell them they are holding the phone wrong.',
    left: s('Take it down until it opens.', { kanoon: 6, kursi: -6, janta: 2 }),
    right: s('Tell them they are holding it wrong.', { kursi: 6, janta: -4, kanoon: -4 })
  },
  {
    id: 'mango',
    era: 'now',
    minTerm: 2,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, onions are up and the mangoes are good. Give me the price for the weekly address, or talk about the mango for twenty minutes and I will only clip that.',
    left: s('Talk about the onion price.', { janta: 6, kursi: -2 }),
    right: s('Talk about the mango. Twenty minutes.', { kursi: 6, janta: -4 })
  },
  {
    id: 'garland',
    era: 'now',
    minTerm: 1,
    face: 'mausi',
    speaker: 'Mausi',
    role: 'Party treasurer',
    text: 'Beta, this garland is heavier than the agenda under it, and roses beat files on camera. Take it off and read, or wear it on the live shot.',
    left: s('Take it off. Read the agenda.', { kanoon: 4, janta: -2 }),
    right: s('Wear it on the live shot.', { janta: 6, kursi: 4 })
  },
  {
    id: 'survey',
    era: 'now',
    minTerm: 3,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, I rounded the survey to one hundred and twelve percent thrilled, and the real sample is on the other phone. Send the real number, or print 112 in bold before the meeting.',
    left: s('Send the real sample.', { kursi: -6, kanoon: 6 }),
    right: s('Print 112. In bold.', { kursi: 8, janta: 4, kanoon: -6 })
  },
  {
    id: 'poem',
    era: 'now',
    minTerm: 2,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, the opposition posted a poem about your silence and it is travelling. Ignore it, or file a case and I will send a couplet back.',
    left: s('Ignore the poem.', { kanoon: 2 }),
    right: s('File a case. Send a couplet.', { kursi: 6, janta: 2, kanoon: -8 }, { set: ['couplet'] })
  },
  {
    id: 'millet',
    era: 'now',
    minTerm: 2,
    face: 'envoy',
    speaker: 'The envoy',
    role: 'Trade draft',
    text: 'Prime Minister, dinner is millet, as your office asked. Your industrialist has a chef, a fountain, and a drone waiting in the parking lot.',
    left: s('Serve the millet. Explain it once.', { janta: 4, khazana: 2 }),
    right: s('Serve the chef and the fountain.', { khazana: -10, kursi: 6, janta: 2 })
  },
  {
    id: 'forty_stops',
    era: 'now',
    minTerm: 3,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, forty stops are booked, the school at stop three has no roof, and stop twelve has a drone and a ribbon. Roof the school and cancel the tour, or do all forty and film stop twelve.',
    left: s('Roof the school. Cancel the tour.', { khazana: -8, janta: 8, kursi: -6 }),
    right: s('Do all forty. Film stop twelve.', { janta: 6, kursi: 8, khazana: -6 })
  },
  {
    id: 'baba_box',
    era: 'now',
    minTerm: 3,
    face: 'baba',
    speaker: 'Babaji',
    role: 'Ashram and airtime',
    text: 'Pradhan Mantri ji, Thursday’s live blessing needs a plot for the ashram, and the box is for the donation, not the blessing. Cabinet can sit instead.',
    left: s('No plot. Cabinet sits Thursday.', { kursi: -6, kanoon: 6 }),
    right: s('Give the plot. Put him on live.', { janta: 6, kursi: 6, kanoon: -8, khazana: 4 }, { set: ['blessed'] })
  },
  {
    id: 'convoy',
    era: 'now',
    minTerm: 1,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, your cars have the road, an ambulance is on the horn behind us, and the cameras are framed only on the cars. Pull over, or keep rolling so the clip stays clean.',
    left: s('Pull over. Let the ambulance pass.', { janta: 8, kursi: -4 }),
    right: s('Keep rolling. Protect the clip.', { kursi: 6, janta: -6 })
  },
  {
    id: 'anchor',
    era: 'now',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, the nation wants to know, and I have already printed the answer on the banner behind you. Answer the question I asked, or read my banner back to me.',
    left: s('Answer the question you asked.', { kanoon: 6, kursi: -4 }),
    right: s('Read your banner back to you.', { janta: 6, kursi: 6 })
  },
  {
    id: 'blame',
    era: 'now',
    minTerm: 2,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, rain hit the rally and I made a graphic of the previous government holding the cloud. Call it weather, or point at the cloud on camera.',
    left: s('Call it weather.', { kanoon: 4, kursi: -4 }),
    right: s('Point at the cloud.', { janta: 6, kursi: 8, kanoon: -4 }, { set: ['blamed'] })
  },
  {
    id: 'yoga',
    era: 'now',
    minTerm: 1,
    face: 'baba',
    speaker: 'Babaji',
    role: 'Ashram and airtime',
    text: 'Pradhan Mantri ji, the cameras are closer than the devotees, and the onion meeting is this same minute. Hold the pose until it trends, or leave the lawn and take the meeting.',
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
    text: 'Prime Minister, the press is seated and my note on the podium says you will take no questions. Take three, or read the note and walk.',
    left: s('Take three questions.', { kanoon: 6, kursi: -4 }),
    right: s('Read the note and walk out.', { kursi: 6, janta: -2, kanoon: -4 })
  },
  {
    id: 'the_flip',
    era: 'later',
    priority: true,
    need: ['crossed'],
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Prime Minister, the year changed and the pothole now hovers, which I am already calling a sector. Fill it, or I cut the ribbon in the glove box.',
    left: s('It is still a hole. Fill it.', { khazana: -6, janta: 8, kursi: -4 }),
    right: s('Inaugurate the hover.', { kursi: 8, janta: 4 }, { set: ['hover'] })
  },
  {
    id: 'hologram',
    era: 'later',
    minTerm: 1,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, I can put your face in four hundred cities tonight, but the mouth arrives three seconds late. Speak in one city, or send all four hundred and I will call the delay charisma.',
    left: s('One city. My real mouth.', { janta: 4, kursi: -4 }),
    right: s('Send all four hundred. Leave the lag.', { janta: 8, kursi: 6, kanoon: -4 }, { set: ['hologram'] })
  },
  {
    id: 'seventh',
    era: 'later',
    minTerm: 1,
    face: 'lalaji',
    speaker: 'Lalaji',
    role: 'Contracts and cement',
    text: 'Sahab, this is the seventh opening of the same loop, and it only moves if two interns push it while nobody films. Hide the push, or sell a seventh ribbon and invite the first six.',
    left: s('Hide the push. No ribbon.', { kanoon: 6, kursi: -4, khazana: -2 }),
    right: s('Sell a seventh ribbon.', { kursi: 8, janta: 4 })
  },
  {
    id: 'mars_stone',
    era: 'later',
    minTerm: 2,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Prime Minister, your statue does not fit under the dome and the engineer sent a note. Shrink the statue, or raise the dome and I will leave his note outside.',
    left: s('Shrink the statue.', { kanoon: 6, khazana: -4, kursi: -2 }),
    right: s('Raise the dome. Ignore the note.', { khazana: -8, kursi: 8, janta: 4, kanoon: -6 })
  },
  {
    id: 'noon_model',
    era: 'later',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Sir, a model read your speech at noon, cleaner than you, and the country clapped. Tell them it was not you, or take the clap and I will fire the writer.',
    left: s('Tell them it was not me.', { janta: -4, kanoon: 8, kursi: -4 }),
    right: s('Take the clap. Fire the writer.', { janta: 6, kursi: 6 }, { set: ['took_clap'] })
  },
  {
    id: 'chai_code',
    era: 'later',
    minTerm: 1,
    face: 'kisan',
    speaker: 'The stall',
    role: 'Brought the bill',
    text: 'Sahab, the rupee is a code now and my stall has no signal. Pay me with something I can hold, or tell me to update and watch the tea go cold.',
    left: s('Pay him in cash he can hold.', { khazana: -4, janta: 8 }),
    right: s('Tell him to update the stall.', { kursi: 4, janta: -8 })
  },
  {
    id: 'leds',
    era: 'later',
    minTerm: 2,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Prime Minister, the river is still a drain and the new lights only make it look finished at night. Kill the lights and fund the drain, or I release the footage as a riverfront.',
    left: s('Kill the lights. Fund the drain.', { khazana: -8, janta: 6, kanoon: 4 }),
    right: s('Release the footage as a riverfront.', { janta: 6, kursi: 6, kanoon: -6 })
  },
  {
    id: 'generator',
    era: 'later',
    minTerm: 2,
    face: 'envoy',
    speaker: 'The envoy',
    role: 'Trade draft',
    text: 'Prime Minister, the climate pledge is ready and the generator cooling this stage is louder than the verbs. Sign and switch it off, or sign louder than the generator.',
    left: s('Sign it, then switch the generator off.', { kanoon: 6, kursi: -4, janta: 2 }),
    right: s('Sign louder than the generator.', { kursi: 6, janta: 4 })
  },
  {
    id: 'buffer',
    era: 'later',
    minTerm: 3,
    face: 'mausi',
    speaker: 'Mausi',
    role: 'Party treasurer',
    text: 'Beta, your nephew is a paid subscription now, he still wants the company, and he freezes when he has to say thank you. Cancel the plan, or make the frozen one chairman.',
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
    text: 'Prime Minister, this crater has no name, your scheme has no result, and the moon cannot file an objection. Leave it alone, or I name the crater after the scheme tonight.',
    left: s('Leave the crater alone.', { kanoon: 4 }),
    right: s('Name the crater after the scheme.', { kursi: 8, janta: 4 })
  },
  {
    id: 'blink',
    era: 'later',
    minTerm: 2,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, I can put Mausi’s face on the budget speech so she blinks on the commas, and people trust a blink more than a table. Send the real Mausi, or let the blink go out.',
    left: s('Send the real Mausi and the table.', { kanoon: 6, kursi: -4 }),
    right: s('Let the blink go out.', { janta: 4, kursi: 6, kanoon: -8 })
  },
  {
    id: 'robot_bill',
    era: 'later',
    minTerm: 2,
    face: 'kisan',
    speaker: 'The farmer',
    role: 'Brought the bill',
    text: 'Sahab, the subsidy arrived as a notification I cannot eat, and the robot on my field sent its own bill. Pay me and stop the robot, or tell me the robot is the reform.',
    left: s('Pay him. Stop the robot’s bill.', { khazana: -8, janta: 8 }, { set: ['bill_cut'] }),
    right: s('Tell him the robot is the reform.', { janta: -6, kursi: 6 })
  },
  {
    id: 'weightless',
    era: 'later',
    minTerm: 3,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Prime Minister, gravity is wrong in the new colony and the committee is floating past the camera. Send one engineer to the ground, or leave them up there until the photo is done.',
    left: s('Send one engineer to the ground.', { kanoon: 8, kursi: -4 }),
    right: s('Leave them up for the photo.', { kursi: 6, janta: 2 })
  },
  {
    id: 'two_clocks',
    era: 'later',
    minTerm: 2,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Sir, I printed two clocks, one for the country and one for your rallies, so you are never late. Keep one clock, or run rally time and call it a mood.',
    left: s('Keep one clock.', { kursi: -4, kanoon: 6 }),
    right: s('Run both. Call rally time a mood.', { janta: 6, kursi: 6, kanoon: -4 })
  },
  {
    id: 'blame_later',
    era: 'later',
    minTerm: 2,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, a meteor flattened the ribbon tent and I made a graphic of the previous century holding the rock. Call it a rock, or point at the century on camera.',
    left: s('Call it a rock.', { kanoon: 4, kursi: -4 }),
    right: s('Point at the previous century.', { janta: 6, kursi: 8, kanoon: -4 })
  },
  {
    id: 'convoy_later',
    era: 'later',
    minTerm: 1,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Prime Minister, your holograms have the sky lane and a medical drone is stuck behind them, blinking red. Drop the lane, or keep the shot, because these cameras do not film drones.',
    left: s('Drop the lane. Let the drone through.', { janta: 8, kursi: -4 }),
    right: s('Keep the lane. The shot is live.', { kursi: 6, janta: -6 })
  },
  {
    id: 'tiger_later',
    era: 'later',
    minTerm: 1,
    block: ['tiger'],
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Boss, a voice note from the old century says you wrestled a tiger before breakfast. Retire it, or I pin it on the dome before dinner.',
    left: s('Retire the tiger.', { kursi: -4, kanoon: 6 }),
    right: s('Pin the tiger on the dome.', { janta: 8, kursi: 4, kanoon: -6 }, { set: ['tiger'] })
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
    text: 'Boss, three of you are trending: the tiger note, the noon speech, and the face that is late in four hundred cities. Resign the extra two, or I keep all three on the payroll.',
    left: s('Resign the extra two.', {}, { ending: 'copies' }),
    right: s('Keep all three on the payroll.', { janta: 8, kursi: 4, kanoon: -10 })
  },
  {
    id: 'immortal',
    era: 'any',
    spine: true,
    minTerm: 36,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Prime Minister, I loaded your smile onto a bulb that can sit the chair after you, and it does not blink unless the invoice is paid. Switch it off and go home, or leave the bulb in the chair.',
    left: s('Switch it off. Go home.', {}, { ending: 'tea' }),
    right: s('Leave the bulb in the chair.', { kursi: 8, janta: -4, kanoon: -6 }, { set: ['bulb'] })
  },
  {
    id: 'fill_power',
    era: 'now',
    repeat: true,
    weight: 1,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Prime Minister, the cabinet room loses power from four to five, which is when you like to decide. Decide by candle, or wait for the tube light and I will tell the press we waited.',
    left: s('Decide by candle. Keep it short.', { kanoon: 4 }),
    right: s('Wait for the light. Announce the wait.', { kursi: 2, janta: -2 })
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
    text: 'Boss, rain delay, and the country is staring at a tarpaulin. Say nothing, or thank the rain before the other side does.',
    left: s('Say nothing. It is rain.', { kanoon: 2 }),
    right: s('Thank the rain. Post it.', { janta: 4, kursi: 2 })
  },
  {
    id: 'fill_biscuit',
    era: 'later',
    repeat: true,
    weight: 1,
    face: 'mausi',
    speaker: 'Mausi',
    role: 'Party treasurer',
    text: 'Beta, the canteen still serves the same biscuit, and it is older than two ministries. Change it quietly, or I will call it heritage and charge for it.',
    left: s('Change the biscuit quietly.', { khazana: -2, janta: 2 }),
    right: s('Call the biscuit heritage. Charge for it.', { kursi: 4, janta: 2, khazana: 2 })
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
    text: 'Sir, your condolence went out three times because of the lag. Apologise once and cut the loop, or I will say the repeats show how deeply you grieve.',
    left: s('Apologise once. Cut the loop.', { janta: 2, kanoon: 2 }),
    right: s('Say the repeats show grief.', { kursi: 4, janta: -4 })
  },
  {
    id: 'fill_oxygen',
    era: 'later',
    repeat: true,
    weight: 1,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Prime Minister, your rally used more oxygen than the hospital wing, and both lines are on this invoice. Pay the wing first, or tell them the rally was also essential.',
    left: s('Pay the hospital wing first.', { khazana: -6, janta: 4, kursi: -2 }),
    right: s('Call the rally essential too.', { kursi: 4, janta: -4, kanoon: -2 })
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
