/** Netagiri — you are Prime Minister. Left is the straight answer. Right is the one you say out loud. */

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
    headline: 'Changed the channel',
    epitaph: 'The nation changed the channel. Your handle kept posting to an empty room.'
  },
  janta_high: {
    id: 'janta_high',
    headline: 'The selfie',
    epitaph: 'They came for a selfie. The stage ran out of floor.'
  },
  janta_high_bulb: {
    id: 'janta_high_bulb',
    headline: 'The bulb',
    epitaph: 'The bulb kept smiling through the crush. Someone unplugged it, out of mercy.'
  },
  khazana_low: {
    id: 'khazana_low',
    headline: 'The bill',
    epitaph: 'The coalition sent a bill. You sent a slogan. The bill won.'
  },
  khazana_high: {
    id: 'khazana_high',
    headline: 'The machines',
    epitaph: 'The counting machines asked for a minister of their own.'
  },
  kursi_low: {
    id: 'kursi_low',
    headline: 'Unfollowed',
    epitaph: 'The party handle unfollowed you, on television, slowly.'
  },
  kursi_low_nephew: {
    id: 'kursi_low_nephew',
    headline: 'One line',
    epitaph: 'Your nephew kept the chair. He thanks you in the speech, in one line, near the end.'
  },
  kursi_high: {
    id: 'kursi_high',
    headline: 'You became the party',
    epitaph: 'You became the party. The party then booked a ticket out.'
  },
  kanoon_low: {
    id: 'kanoon_low',
    headline: 'Sealed cover',
    epitaph: 'A sealed cover grew legs and used them.'
  },
  kanoon_high: {
    id: 'kanoon_high',
    headline: 'A form to wave',
    epitaph: 'Every form needs a form. You now need a form to wave.'
  },
  tea: {
    id: 'tea',
    headline: 'The bulb, off',
    epitaph: 'You left the chair while it still had a bulb. For one evening the nation talked about traffic.'
  },
  copies: {
    id: 'copies',
    headline: 'Resigned from yourself',
    epitaph: 'You resigned from the extra yous. The tiger voice note kept campaigning.'
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
    text: 'The count is done. Pinky has two speeches and a jacket that reflects the lights. One speech thanks the nation. The other thanks the WhatsApp group by name.',
    left: s('Thank the nation. Sit down.', { janta: 6, kursi: -4 }),
    right: s('Thank the group. By name.', { janta: 4, kursi: 8, kanoon: -6 }, { set: ['troll_voice'] })
  },
  {
    id: 'oath_later',
    era: 'later',
    spine: true,
    face: 'captain',
    speaker: 'Captain',
    role: 'Still the general secretary',
    text: 'The count finished forty minutes late, which everyone calls progress. Captain has two speeches. One is about oxygen. One is your face, very large, on the dome.',
    left: s('Talk about oxygen.', { janta: 6, kanoon: 4, kursi: -4 }),
    right: s('The face. Make it larger.', { janta: 8, kursi: 6, kanoon: -6 }, { set: ['dome_face'] })
  },
  {
    id: 'hundred',
    era: 'now',
    minTerm: 1,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Say it will all be done in a hundred days. The hundred days, Pinky notes, start when you stop talking.',
    left: s('Name one thing and a date.', { kanoon: 6, kursi: -4 }, { set: ['one_date'] }),
    right: s('Promise all of it.', { janta: 8, kursi: 6 }, { set: ['hundred'], queue: [['hundred_due', 2]] })
  },
  {
    id: 'hundred_due',
    era: 'any',
    queueOnly: true,
    need: ['hundred'],
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Day one hundred. Hakim puts a calendar on your desk. The file under it is still labelled day one. He does not blink. He is too tired to blink.',
    left: s('Admit the date slipped.', { janta: -4, kanoon: 8, kursi: -4 }),
    right: s('Those were lunar days.', { kursi: 6, kanoon: -8, janta: 2 })
  },
  {
    id: 'rename_road',
    era: 'now',
    minTerm: 1,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'The road has a pothole with its own landmark. Pinky wants a new name for the road. The pothole, he says, can keep the old one.',
    left: s('Fill the hole. Keep the name.', { khazana: -6, janta: 8, kursi: -4 }),
    right: s('New name. Same hole.', { janta: 4, kursi: 8 }, { set: ['renamed'] })
  },
  {
    id: 'broom',
    era: 'now',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'The debate',
    text: 'Four cameras are charged. The footpath needs one minute of you and a broom. Nandini has already picked the slow-motion angle.',
    left: s('Sweep for a minute. Leave.', { janta: 4 }),
    right: s('Sweep until the slow motion ends.', { janta: 6, kursi: 4 }, { set: ['broom'] })
  },
  {
    id: 'statue',
    era: 'now',
    minTerm: 2,
    face: 'lalaji',
    speaker: 'Lalaji',
    role: 'He pours concrete',
    text: 'Lalaji asks how tall you should be, in stone. He has a tape. The tape is optimistic. The clinic next door is not in the drawing.',
    left: s('No stone. Roof the clinic.', { khazana: -6, janta: 6, kursi: -6 }),
    right: s('Taller than the last one.', { kursi: 8, janta: 4, kanoon: -6 }, { set: ['statue'], queue: [['statue_bill', 2]] })
  },
  {
    id: 'statue_bill',
    era: 'any',
    queueOnly: true,
    need: ['statue'],
    face: 'lalaji',
    speaker: 'Lalaji',
    role: 'He pours concrete',
    text: 'The stone has eaten the clinic budget. Lalaji says the knees can be phase two. The knees, in the drawing, are very expensive.',
    left: s('Stop at the knees.', { khazana: -8, janta: 2, kursi: -4 }),
    right: s('Phase two. Obviously.', { khazana: 4, kursi: 6, kanoon: -6 })
  },
  {
    id: 'foreign',
    era: 'now',
    minTerm: 2,
    face: 'envoy',
    speaker: 'The envoy',
    role: 'He brought a pen',
    text: 'He brought one pen. You are bringing thirty-eight people and a photographer who calls himself essential staff.',
    left: s('You and the pen.', { kursi: -4, kanoon: 4 }),
    right: s('All thirty-eight. Frame the pen.', { khazana: -6, kursi: 6, janta: 4 }, { set: ['trip'], queue: [['mou', 2]] })
  },
  {
    id: 'mou',
    era: 'any',
    queueOnly: true,
    need: ['trip'],
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'The memorandum is a PDF. Hakim has opened it. It hopes you will meet again. That is the whole document.',
    left: s('Publish the PDF as it is.', { kanoon: 6, janta: -2 }),
    right: s('Call it a historic handshake.', { janta: 6, kursi: 6 })
  },
  {
    id: 'tiger',
    era: 'now',
    minTerm: 1,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Two phones, one job',
    text: 'An uncle forwarded a voice note. It says you wrestled a tiger before breakfast. Chintu can pin it before lunch.',
    left: s('Tell him to delete it.', { kursi: -4, kanoon: 6 }),
    right: s('Pin it. Add a tiger.', { janta: 8, kursi: 4, kanoon: -6 }, { set: ['tiger'] })
  },
  {
    id: 'onions',
    era: 'now',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'The debate',
    text: 'Nandini has a question about the price of onions. She also has a graphic of your face, slightly on fire. She asks which one you prefer to answer.',
    left: s('Onions. The actual number.', { janta: 2, kanoon: 6, kursi: -4 }),
    right: s('Ask who paid for the fire.', { janta: 6, kursi: 6, kanoon: -4 })
  },
  {
    id: 'urea',
    era: 'now',
    minTerm: 2,
    face: 'kisan',
    speaker: 'The farmer',
    role: 'He brought the bill',
    text: 'The urea came. The bill came twice. He does not want a slogan. He wants the second bill to go back where it was invented.',
    left: s('Cancel the second bill.', { khazana: -8, janta: 8, kursi: -4 }, { set: ['bill_cut'] }),
    right: s('Tell him the bill is a reform.', { kursi: 4, janta: -8 })
  },
  {
    id: 'cylinder',
    era: 'now',
    minTerm: 2,
    face: 'mausi',
    speaker: 'Mausi',
    role: 'Party treasurer',
    text: 'Announce free gas, Mausi says. You announced it last year. The cylinders remember. The acronym can be new, if you are shy.',
    left: s('Deliver the ones already promised.', { khazana: -8, janta: 6 }),
    right: s('New acronym. Same cylinder.', { janta: 6, kursi: 6, khazana: -2 }, { set: ['acronym'] })
  },
  {
    id: 'nephew',
    era: 'now',
    minTerm: 3,
    face: 'mausi',
    speaker: 'Mausi',
    role: 'Party treasurer',
    text: 'Your nephew has a CV. It is one page. The page says your surname in a large font. He would like a public company to practice on.',
    left: s('The exam is on Tuesday.', { kursi: -6, kanoon: 8 }),
    right: s('He can learn as chairman.', { kursi: 8, kanoon: -10, khazana: 4 }, { set: ['nephew'] })
  },
  {
    id: 'cricket',
    era: 'now',
    minTerm: 1,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Two phones, one job',
    text: 'We won. At cricket. Chintu has a graphic and a sentence that makes the win your policy. He is very proud of the sentence.',
    left: s('Say well played. Sit down.', { janta: 2 }),
    right: s('Dedicate the win to the scheme.', { janta: 8, kursi: 4 })
  },
  {
    id: 'ribbon',
    era: 'now',
    minTerm: 2,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'The bridge is ready to be opened. It is not ready to be driven on. Pinky has done the maths. Ribbon is cheaper than concrete.',
    left: s('No ribbon until a scooter crosses.', { khazana: -6, janta: 6, kursi: -6 }),
    right: s('Cut it. Tow the scooter.', { janta: 4, kursi: 8, kanoon: -6 }, { set: ['ribbon'] })
  },
  {
    id: 'committee',
    era: 'now',
    minTerm: 2,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'The last committee has asked for a committee. Hakim can chair it, or he can become very difficult to find.',
    left: s('You chair it. Bring a date.', { kanoon: 8, kursi: -4 }),
    right: s('Let them chair each other.', { kursi: 4, kanoon: -6 })
  },
  {
    id: 'eight_pm',
    era: 'now',
    minTerm: 3,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'The nation will stop at eight. Pinky wants either one real change, said in one sentence, or an app that will change everything by morning.',
    left: s('One rule. One sentence.', { kanoon: 6, kursi: -2 }, { set: ['plain_speech'] }),
    right: s('The app. Obviously the app.', { janta: 6, kursi: 6, kanoon: -6 }, { set: ['the_app'], queue: [['app_morning', 1]] })
  },
  {
    id: 'app_morning',
    era: 'any',
    queueOnly: true,
    need: ['the_app'],
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Two phones, one job',
    text: 'The app crashes if you type your own name. Trending has already called this a masterstroke. Chintu would like you to agree with trending.',
    left: s('Take it down until it opens.', { kanoon: 6, kursi: -6, janta: 2 }),
    right: s('People are using it wrong.', { kursi: 6, janta: -4, kanoon: -4 })
  },
  {
    id: 'mango',
    era: 'now',
    minTerm: 2,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'She has the clip',
    text: 'Your weekly address. The mangoes are good this year. So are the prices, which are not good. Nandini will clip whichever half you feed her.',
    left: s('Talk about the prices.', { janta: 6, kursi: -2 }),
    right: s('Describe the mango. Twenty minutes.', { kursi: 4, janta: 2 })
  },
  {
    id: 'garland',
    era: 'now',
    minTerm: 1,
    face: 'mausi',
    speaker: 'Mausi',
    role: 'Party treasurer',
    text: 'The garland has its own security detail. The agenda is under it. Mausi thinks the agenda can wait. Roses, she says, do not wait.',
    left: s('Take it off. Read the agenda.', { kanoon: 4, janta: -2 }),
    right: s('Wear it. Smell like a decision.', { janta: 6, kursi: 4 })
  },
  {
    id: 'survey',
    era: 'now',
    minTerm: 3,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Two phones, one job',
    text: 'Internal survey. One hundred and twelve percent are thrilled. Chintu rounded up. He rounded up past one hundred, which took courage.',
    left: s('Show the real sample.', { kursi: -6, kanoon: 6 }),
    right: s('Print 112. In bold.', { kursi: 8, janta: 4, kanoon: -6 })
  },
  {
    id: 'poem',
    era: 'now',
    minTerm: 2,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'The debate',
    text: 'The opposition tweeted a poem about your silence. It rhymes. Nandini thinks the rhyme is the real offence.',
    left: s('Ignore a poem.', { kanoon: 2 }),
    right: s('A case, and a couplet back.', { kursi: 6, janta: 2, kanoon: -8 }, { set: ['couplet'] })
  },
  {
    id: 'millet',
    era: 'now',
    minTerm: 2,
    face: 'envoy',
    speaker: 'The envoy',
    role: 'Looking at his plate',
    text: 'State dinner. The envoy has millet and a polite face. Lalaji has an imported chef waiting in the parking lot, also with a polite face.',
    left: s('Millet. Explain it once.', { janta: 4, khazana: 2 }),
    right: s('The chef. The fountain. The drone.', { khazana: -8, kursi: 6, janta: 2 })
  },
  {
    id: 'forty_stops',
    era: 'now',
    minTerm: 3,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Forty stops this week. The school at stop three has no roof. Stop twelve has a drone and a ribbon. Pinky has booked the drone.',
    left: s('Roof first. Cancel the rest.', { khazana: -6, janta: 8, kursi: -6 }),
    right: s('All forty. Drone at twelve.', { janta: 6, kursi: 8, khazana: -4 })
  },
  {
    id: 'baba_box',
    era: 'now',
    minTerm: 3,
    face: 'baba',
    speaker: 'Babaji',
    role: 'The box has a slot',
    text: 'Babaji will bless the government on Thursday. He needs a plot, a camera, and the front row. The box in his hands is not for blessings.',
    left: s('Thursday is a cabinet day.', { kursi: -6, kanoon: 6 }),
    right: s('Front row. And the plot.', { janta: 6, kursi: 6, kanoon: -8, khazana: 4 }, { set: ['blessed'] })
  },
  {
    id: 'convoy',
    era: 'now',
    minTerm: 1,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'General secretary',
    text: 'Your cars take the whole road. An ambulance is behind them, using the horn like a prayer. Pinky says the cameras are only pointed at the cars.',
    left: s('Pull over. Let it pass.', { janta: 8, kursi: -4 }),
    right: s('The nation is watching the cars.', { kursi: 6, janta: -6 })
  },
  {
    id: 'anchor',
    era: 'now',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'The nation wants to know',
    text: 'Nandini leans in until the microphone squeaks. She has one question. The banner behind you has already answered it, in a larger font.',
    left: s('Answer the question she asked.', { kanoon: 6, kursi: -4 }),
    right: s('Read the banner back to her.', { janta: 6, kursi: 6 })
  },
  {
    id: 'blame',
    era: 'now',
    minTerm: 2,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Two phones, one job',
    text: 'It rained on the rally. Chintu has a graphic of the previous government holding a cloud. He wants you to point at the cloud.',
    left: s('It is weather. Say so.', { kanoon: 4, kursi: -4 }),
    right: s('Point at the cloud.', { janta: 6, kursi: 8, kanoon: -4 }, { set: ['blamed'] })
  },
  {
    id: 'yoga',
    era: 'now',
    minTerm: 1,
    face: 'baba',
    speaker: 'Babaji',
    role: 'Already cross-legged',
    text: 'Sunrise on the lawn. Babaji will sit in front. The cameras will sit closer. The meeting about onions is booked for the same minute.',
    left: s('Skip the lawn. Take the meeting.', { kanoon: 6, janta: -2 }),
    right: s('Hold the pose until it trends.', { janta: 8, kursi: 4 })
  },
  {
    id: 'no_questions',
    era: 'now',
    minTerm: 2,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'The press is in the room. Hakim has taped a note to the podium. It says you will not be taking questions. The note is larger than the speech.',
    left: s('Take three questions.', { kanoon: 6, kursi: -4 }),
    right: s('Read the note. Then leave.', { kursi: 6, janta: -2, kanoon: -4 })
  },
  {
    id: 'the_flip',
    era: 'later',
    priority: true,
    need: ['crossed'],
    face: 'captain',
    speaker: 'Captain',
    role: 'Same man, new collar',
    text: 'The year flipped. The pothole did not. It hovers now, which Captain is already calling a sector. He has a ribbon in the glove box of the hover.',
    left: s('It is still a hole. Fill it.', { khazana: -6, janta: 8, kursi: -4 }),
    right: s('Inaugurate the hover.', { kursi: 8, janta: 4 }, { set: ['hover'] })
  },
  {
    id: 'hologram',
    era: 'later',
    minTerm: 1,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'The phones got worse',
    text: 'You can stand in four hundred places tonight. Your mouth will arrive three seconds after your face. Chintu says people will call the gap charisma.',
    left: s('One city. Your real mouth.', { janta: 4, kursi: -4 }),
    right: s('All four hundred. Late on purpose.', { janta: 8, kursi: 6, kanoon: -4 }, { set: ['hologram'] })
  },
  {
    id: 'seventh',
    era: 'later',
    minTerm: 1,
    face: 'lalaji',
    speaker: 'Lalaji',
    role: 'Still pouring',
    text: 'This is the seventh opening of the same loop. The first six were also historic. The pod moves if two interns push it and nobody films the pushing.',
    left: s('Push it in private. No ribbon.', { kanoon: 6, kursi: -4, khazana: -2 }),
    right: s('Seventh ribbon. Invite the first six.', { kursi: 8, janta: 4 })
  },
  {
    id: 'mars_stone',
    era: 'later',
    minTerm: 2,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome management',
    text: 'The dome is short. Your statue is not. Physics has sent a note. Captain has not opened the note. He finds notes negative.',
    left: s('Shrink the statue.', { kanoon: 6, khazana: -4, kursi: -2 }),
    right: s('Raise the dome. Leave the note outside.', { khazana: -6, kursi: 8, janta: 4, kanoon: -6 })
  },
  {
    id: 'noon_model',
    era: 'later',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'She clapped too',
    text: 'A model gave your speech at noon. It was cleaner than you. The nation clapped. Nandini wants to know if you will take the clap or give it back.',
    left: s('Say it was not you.', { janta: -4, kanoon: 8, kursi: -4 }),
    right: s('Take the clap. Fire the writer.', { janta: 6, kursi: 6 }, { set: ['took_clap'] })
  },
  {
    id: 'chai_code',
    era: 'later',
    minTerm: 1,
    face: 'kisan',
    speaker: 'The stall',
    role: 'No signal, full kettle',
    text: 'The rupee is a code now. The tea stall has no signal and a full kettle. He will not scan the nation. He will pour, if you can pay in something he can hold.',
    left: s('Pay in whatever the stall holds.', { khazana: -4, janta: 8 }),
    right: s('Tell him to update.', { kursi: 4, janta: -8 })
  },
  {
    id: 'leds',
    era: 'later',
    minTerm: 2,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'The river is still a drain. We added LEDs. At night, Hakim admits, it looks like a decision. He has the footage. He has not got the water.',
    left: s('Kill the lights. Fund the drain.', { khazana: -8, janta: 6, kanoon: 4 }),
    right: s('Film it. Call it a riverfront.', { janta: 6, kursi: 6, kanoon: -6 })
  },
  {
    id: 'generator',
    era: 'later',
    minTerm: 2,
    face: 'envoy',
    speaker: 'The envoy',
    role: 'Trying to hear the pledge',
    text: 'The climate pledge is ready. The stage is cooled by a generator you can hear during the verbs. The envoy keeps leaning in. The generator does not lean back.',
    left: s('Sign, then switch it off.', { kanoon: 6, kursi: -4, janta: 2 }),
    right: s('Sign louder than the generator.', { kursi: 6, janta: 4 })
  },
  {
    id: 'buffer',
    era: 'later',
    minTerm: 3,
    face: 'mausi',
    speaker: 'Mausi',
    role: 'Party treasurer',
    text: 'Your nephew is a subscription now. He still wants the company. He buffers on the word thank you. Mausi has already paid the annual plan.',
    left: s('Cancel the subscription.', { kursi: -8, kanoon: 6 }),
    right: s('Make the buffer chairman.', { kursi: 8, kanoon: -8, khazana: 4 }, { set: ['nephew'] })
  },
  {
    id: 'crater',
    era: 'later',
    minTerm: 2,
    face: 'captain',
    speaker: 'Captain',
    role: 'Naming rights',
    text: 'A crater has no name. One of your schemes also has no result. Captain suggests a wedding between the two. The moon, he adds, cannot object in writing.',
    left: s('Leave the crater alone.', { kanoon: 4 }),
    right: s('Name it after the scheme.', { kursi: 8, janta: 4 })
  },
  {
    id: 'blink',
    era: 'later',
    minTerm: 2,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'He learned to edit faces',
    text: 'Chintu can put Mausi\'s face on the budget speech. She will blink on the commas. People, he says, trust a blink more than a table.',
    left: s('The real Mausi. The real table.', { kanoon: 6, kursi: -4 }),
    right: s('Let her blink.', { janta: 4, kursi: 6, kanoon: -8 })
  },
  {
    id: 'robot_bill',
    era: 'later',
    minTerm: 2,
    face: 'kisan',
    speaker: 'The farmer',
    role: 'The robot sent a bill',
    text: 'The subsidy arrived as a notification. He cannot eat a notification. The robot that farms his field has sent its own bill, and the bill is rude.',
    left: s('Pay him. Stop the robot\'s bill.', { khazana: -8, janta: 8 }, { set: ['bill_cut'] }),
    right: s('Tell him the robot is the reform.', { janta: -6, kursi: 6 })
  },
  {
    id: 'weightless',
    era: 'later',
    minTerm: 3,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Gravity is uneven in the new colony. Hakim has formed a committee. The committee is weightless. This time, he says, that is not a figure of speech.',
    left: s('One engineer. On the ground.', { kanoon: 8, kursi: -4 }),
    right: s('Let them float until the photo.', { kursi: 6, janta: 2 })
  },
  {
    id: 'two_clocks',
    era: 'later',
    minTerm: 2,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'He survived the century',
    text: 'One clock for the country. A second clock for your rallies, so you are never late and also never early. Pinky has already printed both.',
    left: s('One clock.', { kursi: -4, kanoon: 6 }),
    right: s('Rally time is a mood.', { janta: 6, kursi: 6, kanoon: -4 })
  },
  {
    id: 'blame_later',
    era: 'later',
    minTerm: 2,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'The phones got worse',
    text: 'A meteor took the ribbon tent. Chintu has a graphic of the previous century holding the meteor. He would like you to point at the century.',
    left: s('It is a rock. Say so.', { kanoon: 4, kursi: -4 }),
    right: s('Point at the previous century.', { janta: 6, kursi: 8, kanoon: -4 })
  },
  {
    id: 'convoy_later',
    era: 'later',
    minTerm: 1,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome management',
    text: 'Your holograms take the sky lane. A med-drone is behind them, blinking red. Captain says the cameras are only rated for holograms.',
    left: s('Drop the lane. Let it through.', { janta: 8, kursi: -4 }),
    right: s('The nation is watching the lane.', { kursi: 6, janta: -6 })
  },
  {
    id: 'tiger_later',
    era: 'later',
    minTerm: 1,
    block: ['tiger'],
    face: 'chintu',
    speaker: 'Chintu',
    role: 'The phones got worse',
    text: 'An uncle forwarded a voice note from the old century. It says you wrestled a tiger before breakfast. Chintu can pin it on the dome.',
    left: s('Tell him the tiger is retired.', { kursi: -4, kanoon: 6 }),
    right: s('Pin it. The dome likes a tiger.', { janta: 8, kursi: 4, kanoon: -6 }, { set: ['tiger'] })
  },
  {
    id: 'copies',
    era: 'later',
    priority: true,
    minTerm: 8,
    need: ['tiger', 'took_clap', 'hologram'],
    face: 'chintu',
    speaker: 'Chintu',
    role: 'He works for all three of you',
    text: 'Three of you are trending. The tiger, the noon speech, and the one that is late in four hundred cities. Chintu says pick a favorite, or resign from yourself.',
    left: s('Resign from the extras.', {}, { ending: 'copies' }),
    right: s('Let all three keep running.', { janta: 8, kursi: 4, kanoon: -10 })
  },
  {
    id: 'immortal',
    era: 'any',
    spine: true,
    minTerm: 36,
    face: 'captain',
    speaker: 'Captain',
    role: 'Bulb logistics',
    text: 'The chair can outlive you. Captain has a bulb with your smile loaded on it. The smile does not blink unless the invoice clears.',
    left: s('Switch it off. Go home.', {}, { ending: 'tea' }),
    right: s('Leave the bulb on.', { kursi: 8, janta: -4, kanoon: -6 }, { set: ['bulb'] })
  },
  {
    id: 'fill_power',
    era: 'now',
    repeat: true,
    weight: 1,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'The cabinet room has no power from four to five, which is when you like to decide things. Hakim has a candle and a face that has seen this before.',
    left: s('Decide in the dark. Keep it short.', { kanoon: 4 }),
    right: s('Wait for the lights. Announce the wait.', { kursi: 2, janta: -2 })
  },
  {
    id: 'fill_rain',
    era: 'now',
    repeat: true,
    weight: 1,
    minTerm: 1,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'It is raining on the match',
    text: 'Rain delay. The nation is staring at a tarpaulin. Chintu needs you to say something before the other side does. Anything. He is sweating.',
    left: s('Say nothing. It is rain.', { kanoon: 2 }),
    right: s('Thank the rain for the pause.', { janta: 4, kursi: 2 })
  },
  {
    id: 'fill_biscuit',
    era: 'later',
    repeat: true,
    weight: 1,
    face: 'mausi',
    speaker: 'Mausi',
    role: 'Colony canteen',
    text: 'The colony canteen still serves the same biscuit. Mausi finds this stabilizing. The biscuit is older than two of the ministries.',
    left: s('Change the biscuit. Quietly.', { khazana: -2, janta: 2 }),
    right: s('Call the biscuit heritage.', { kursi: 4, janta: 2 })
  },
  {
    id: 'fill_lag',
    era: 'later',
    repeat: true,
    weight: 1,
    minTerm: 2,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Live, technically',
    text: 'Your condolence arrives three seconds late, then again, then a third time. Nandini asks if you meant to grieve in triplicate.',
    left: s('Apologise once. Cut the loop.', { janta: 2, kanoon: 2 }),
    right: s('Say the loop shows sincerity.', { kursi: 4, janta: -4 })
  },
  {
    id: 'fill_oxygen',
    era: 'later',
    repeat: true,
    weight: 1,
    face: 'captain',
    speaker: 'Captain',
    role: 'Invoice attached',
    text: 'Oxygen is on the invoice again. Captain has highlighted the line where your rally used more of it than the hospital wing. He has brought two pens.',
    left: s('Pay the wing first.', { khazana: -6, janta: 4, kursi: -2 }),
    right: s('The rally was also essential.', { kursi: 4, janta: -4, kanoon: -2 })
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
