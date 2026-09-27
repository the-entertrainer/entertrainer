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
    text: '{you}, booth workers from {party} are in the front row with their families. High Command wants every name read on camera before the national address. The address can wait.',
    left: s('Address the country. Skip the list.', { janta: 6, kursi: -6 }),
    right: s('Read High Command\'s list live.', { kursi: 8, janta: -4 }, { set: ['troll_voice'], queue: [['names_due', 2]] })
  },
  {
    id: 'oath_later',
    era: 'later',
    spine: true,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: '{you}, the oxygen tender is forty minutes late and the hospital is on the line. I have a dome plate with the {party} mark ready. News will run the plate first.',
    left: s('Table the oxygen tender.', { janta: 6, kanoon: 4, kursi: -6 }),
    right: s('Put {party} on the dome first.', { janta: 6, kursi: 6, kanoon: -6 }, { set: ['dome_face'], queue: [['vent_due', 2]] })
  },
  {
    id: 'hundred',
    era: 'now',
    minTerm: 1,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Cameras want a hundred-day list. I drafted one drain with a completion date. High Command wants the whole list tonight, dates or not.',
    left: s('One drain. Gazette the date.', { kanoon: 6, kursi: -4 }, { set: ['one_date'], queue: [['drain_due', 2]] }),
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
    text: 'Day one hundred. The file still says day one. I have a press note calling it a scheduling error. The ticker is already live.',
    left: s('Admit the date slipped.', { janta: -4, kanoon: 8, kursi: -4 }),
    right: s('Issue the scheduling-error note.', { kursi: 6, kanoon: -8, janta: -2 })
  },
  {
    id: 'rename_road',
    era: 'now',
    minTerm: 1,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'Fixer',
    text: "This stretch is famous for one crater. The paint crew is here to stencil your name. PWD did not roster the fill gang today.",
    left: s('Roster the fill gang. Pay them.', { khazana: -6, janta: 8, kursi: -4 }),
    right: s('Stencil the name. Leave the crater.', { kursi: 8, janta: -4 }, { set: ['renamed'], queue: [['hole_due', 2]] })
  },
  {
    id: 'broom',
    era: 'now',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Five leaves on the hotel steps. The sanitation tender is still unspent. My camera is in slow motion and High Command wants you in the frame with a broom.',
    left: s('Clear the tender. Kill the clip.', { khazana: -6, kanoon: 6, kursi: -4 }),
    right: s('Pick up the broom for the shot.', { janta: 8, kursi: 6, kanoon: -4 }, { set: ['broom'], queue: [['clip_due', 2]] })
  },
  {
    id: 'statue',
    era: 'now',
    minTerm: 2,
    face: 'lalaji',
    speaker: 'Aditya Singhania',
    role: 'Tenders and cement',
    text: 'Cement is already on site for a statue taller than the last one. The PHC roof tender is not in this drawing. I bill by the drawing.',
    left: s('Divert the cement to the PHC.', { janta: 8, kursi: -6, kanoon: 4 }),
    right: s('Pour the taller statue.', { kursi: 8, janta: 2, kanoon: -6 }, { set: ['statue'], queue: [['statue_bill', 2]] })
  },
  {
    id: 'statue_bill',
    era: 'any',
    queueOnly: true,
    need: ['statue'],
    face: 'lalaji',
    speaker: 'Aditya Singhania',
    role: 'Tenders and cement',
    text: 'The statue ate the PHC allocation. I can stop the pour at the knees if you sign phase two as a variation. Phase two is the knees.',
    left: s('Stop at the knees. Fund the PHC.', { khazana: -8, janta: 6, kursi: -4 }),
    right: s('Sign phase two as a variation.', { khazana: -10, kursi: 8, kanoon: -6 })
  },
  {
    id: 'foreign',
    era: 'now',
    minTerm: 2,
    face: 'envoy',
    speaker: 'The envoy',
    role: 'Trade draft',
    text: 'I have the trade draft and one pen. {party} seated thirty-eight essential staff on the aircraft. Protocol listed every cousin as a note-taker.',
    left: s('Two seats. Send the rest home.', { kursi: -6, kanoon: 4, khazana: 6 }),
    right: s('Fly all thirty-eight. Film the pen.', { khazana: -10, kursi: 6, kanoon: -4 }, { set: ['trip'], queue: [['mou', 2]] })
  },
  {
    id: 'mou',
    era: 'any',
    queueOnly: true,
    need: ['trip'],
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'The signed page says the two sides will meet again. Nothing else. The PIB draft calls it a historic handshake. The PDF does not.',
    left: s('Release the PDF as signed.', { kanoon: 6, janta: -2, kursi: -2 }),
    right: s('Issue the handshake line.', { janta: 4, kursi: 6, kanoon: -6 })
  },
  {
    id: 'tiger',
    era: 'now',
    minTerm: 1,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: "Your uncle's voice note says you wrestled a tiger before breakfast. One tap pins it on the {party} page. Legal has not seen it.",
    left: s('Delete it before Legal wakes.', { kursi: -6, kanoon: 6 }),
    right: s('Pin it. Add a second tiger.', { janta: 6, kursi: 6, kanoon: -6 }, { set: ['tiger'] })
  },
  {
    id: 'onions',
    era: 'now',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Onions hit 140 a kilo. Buffer stock can move today. My 9pm package already blames a foreign cartel. The mandi rate is not in the script.',
    left: s('Release buffer stock. Quote the rate.', { janta: 6, khazana: -8, kursi: -4 }),
    right: s('Run the foreign-cartel package.', { kursi: 6, kanoon: -6, janta: -4 })
  },
  {
    id: 'urea',
    era: 'now',
    minTerm: 2,
    face: 'kisan',
    speaker: 'The farmer',
    role: 'Farmer union',
    text: 'Urea reached the field. The second invoice reached us too. Your last speech called a double bill a reform. The union is at the gate.',
    left: s('Cancel the second invoice.', { khazana: -10, janta: 8, kursi: -4 }, { set: ['bill_cut'] }),
    right: s('Call the double bill a reform.', { kursi: 6, janta: -8, kanoon: -4 })
  },
  {
    id: 'cylinder',
    era: 'now',
    minTerm: 2,
    face: 'mausi',
    speaker: 'Aunty',
    role: 'Party treasurer',
    text: 'You already issued this cylinder. People know the colour. I have a fresh scheme name for the same steel and a function booked under it.',
    left: s('Deliver the cylinder as promised.', { khazana: -10, janta: 6, kursi: -2 }),
    right: s('Rebrand it. Hold the function.', { janta: 2, kursi: 6, khazana: -6, kanoon: -4 }, { set: ['acronym'], queue: [['gas_due', 2]] })
  },
  {
    id: 'nephew',
    era: 'now',
    minTerm: 3,
    face: 'mausi',
    speaker: 'Aunty',
    role: 'Party treasurer',
    text: "Your sister's boy failed the UPSC prelims a third time. State Mining needs an MD. The appointment file is inked. High Command is waiting.",
    left: s('Send him back to the exam.', { kursi: -6, kanoon: 8 }),
    right: s('Notify the MD order. No press.', { kursi: 8, khazana: -8, kanoon: -8 }, { set: ['nephew'] })
  },
  {
    id: 'cricket',
    era: 'now',
    minTerm: 1,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'The match is won. My graphic gives the cup to your scheme. The other party has not posted. Optics will not wait.',
    left: s('Type well played. Stop there.', { janta: 2, kursi: -4 }),
    right: s('Credit the cup to the scheme.', { janta: 4, kursi: 6, kanoon: -4 })
  },
  {
    id: 'ribbon',
    era: 'now',
    minTerm: 2,
    face: 'lalaji',
    speaker: 'Aditya Singhania',
    role: 'Tenders and cement',
    text: 'The bridge is ready for a ribbon, not a scooter. My camera truck will not wait for the safety certificate. The tender already billed the inauguration.',
    left: s('Hold the cut until a scooter crosses.', { khazana: -8, janta: 6, kursi: -6 }),
    right: s('Cut the ribbon. Drag a scooter.', { janta: 2, kursi: 8, kanoon: -6 }, { set: ['ribbon'], queue: [['scooter_due', 2]] })
  },
  {
    id: 'committee',
    era: 'now',
    minTerm: 2,
    face: 'justice',
    speaker: 'Justice Rao',
    role: 'Show-cause notices',
    text: 'A show-cause on the fallen bridge names your campaign contractor in paragraph four. Your office asked me to constitute a committee to examine the committee.',
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
    text: 'At eight the country stops. The file is one sentence and one real job. {party} socials already booked an app launch in that slot.',
    left: s('Read the one real job.', { kanoon: 6, kursi: -4 }, { set: ['plain_speech'], queue: [['line_due', 2]] }),
    right: s('Launch the app in that slot.', { janta: 2, kursi: 6, kanoon: -6, khazana: -4 }, { set: ['the_app'], queue: [['app_morning', 1]] })
  },
  {
    id: 'app_morning',
    era: 'any',
    queueOnly: true,
    need: ['the_app'],
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'The app dies when someone types your name. The morning caption says masterstroke. The office note says users are holding the phone wrong.',
    left: s('Pull the app until it opens.', { kanoon: 6, kursi: -6, janta: 2 }),
    right: s('Blame how they hold the phone.', { kursi: 6, janta: -6, kanoon: -6 })
  },
  {
    id: 'mango',
    era: 'now',
    minTerm: 2,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'Onions are the story in the mandi. My rundown is twenty minutes on mangoes. The price crawl is not on the page unless you force it.',
    left: s('Lead with the onion rate.', { janta: 6, kursi: -4 }),
    right: s('Keep the mango rundown.', { kursi: 6, janta: -6 })
  },
  {
    id: 'garland',
    era: 'now',
    minTerm: 1,
    face: 'mausi',
    speaker: 'Aunty',
    role: 'Party treasurer',
    text: 'This garland weighs more than the file under it. The live shot is lit for flowers. The file stays off camera if you wear it.',
    left: s('Take it off. Read the file.', { kanoon: 6, janta: -2, kursi: -2 }),
    right: s('Wear it. Go live.', { janta: 6, kursi: 4, kanoon: -4 })
  },
  {
    id: 'survey',
    era: 'now',
    minTerm: 3,
    face: 'netaji',
    speaker: 'Netaji',
    role: 'Twelve MPs',
    text: 'The budget vote needs my twelve members. They have been shown a happiness figure of 112 percent. The real CSO number is on the other phone.',
    left: s('Send them the CSO number.', { kursi: -8, kanoon: 6, janta: 2 }),
    right: s('Print 112. In bold.', { kursi: 8, janta: -8, kanoon: -6 })
  },
  {
    id: 'poem',
    era: 'now',
    minTerm: 2,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'The opposition set a poem on your silence. It is ahead of your speech. I have a PIL draft and a couplet ready as the reply.',
    left: s('Leave the poem alone.', { kanoon: 4, kursi: -4 }),
    right: s('File the PIL. Send the couplet.', { kursi: 6, janta: -2, kanoon: -8 }, { set: ['couplet'], queue: [['poem_due', 2]] })
  },
  {
    id: 'millet',
    era: 'now',
    minTerm: 2,
    face: 'envoy',
    speaker: 'The envoy',
    role: 'Trade draft',
    text: "Dinner is millet, as the circular said. Singhania's chef, a fountain, and a drone are idling in the lot. Protocol has stopped plating.",
    left: s('Serve the millet. Send them home.', { janta: 4, kursi: -4, khazana: 2 }),
    right: s('Bring in the chef and the fountain.', { khazana: -10, kursi: 6, janta: -2 })
  },
  {
    id: 'forty_stops',
    era: 'now',
    minTerm: 3,
    face: 'netaji',
    speaker: 'Netaji',
    role: 'Twelve MPs',
    text: 'Forty stops this week. Stop three is a school with no roof, in a seat I do not own. Stop twelve is mine: a drone and a ribbon. My twelve are counting.',
    left: s('Fix the roof. Cut the tour.', { khazana: -8, janta: 8, kursi: -8 }),
    right: s('Keep all forty. Drone at twelve.', { janta: 2, kursi: 8, khazana: -6 })
  },
  {
    id: 'baba_box',
    era: 'now',
    minTerm: 3,
    face: 'baba',
    speaker: 'Swami Anandeshwar',
    role: 'Votes and land',
    text: "Thursday's live blessing is already promoted. I need the land deed in the trust's name and the slot. The box is a donation, not the blessing.",
    left: s('No deed. Thursday stays cabinet.', { kursi: -6, kanoon: 6, janta: -4 }),
    right: s('Sign the deed. Give him the slot.', { janta: 6, kursi: 8, kanoon: -8, khazana: -6 }, { set: ['blessed'], queue: [['ashram_due', 2]] })
  },
  {
    id: 'convoy',
    era: 'now',
    minTerm: 1,
    face: 'pinky',
    speaker: 'Pinky',
    role: 'Fixer',
    text: 'The rally convoy is two kilometres. An ambulance has been on the horn for twenty minutes. The motorcade is the top stream in the country.',
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
    text: 'Power died last night. Not on your lane. My banner already names the last government. I go on in three minutes and I will not rewrite it myself.',
    left: s('Say it died on our lane too.', { kanoon: 6, kursi: -6, janta: 2 }),
    right: s('Read the banner as printed.', { janta: -4, kursi: 6, kanoon: -6 })
  },
  {
    id: 'blame',
    era: 'now',
    minTerm: 2,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Rain hit the rally. The graphic behind you shows the last government holding the cloud. If that plate comes down, the shot dies.',
    left: s('Call it weather. Kill the plate.', { kanoon: 4, kursi: -6 }),
    right: s('Leave the cloud on the last lot.', { janta: 4, kursi: 8, kanoon: -6 }, { set: ['blamed'], queue: [['cloud_due', 2]] })
  },
  {
    id: 'yoga',
    era: 'now',
    minTerm: 1,
    face: 'baba',
    speaker: 'Swami Anandeshwar',
    role: 'Votes and land',
    text: 'Cameras are closer than the devotees. The onion file is waiting on this lawn. The pose is what my vote bank came to see.',
    left: s('Leave the lawn. Take the file.', { kanoon: 6, janta: -4, kursi: -2 }),
    right: s('Hold the pose until it trends.', { janta: 8, kursi: 4, kanoon: -4 })
  },
  {
    id: 'no_questions',
    era: 'now',
    minTerm: 2,
    face: 'justice',
    speaker: 'Justice Rao',
    role: 'Show-cause notices',
    text: 'The press is seated. Your podium note says no questions and it is longer than the speech. The record still needs three answers on the tender.',
    left: s('Take the three questions.', { kanoon: 8, kursi: -6 }),
    right: s('Read the note and walk.', { kursi: 6, janta: -4, kanoon: -6 })
  },
  {
    id: 'the_flip',
    era: 'later',
    spine: true,
    need: ['crossed'],
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'The year flipped. The crater did not. PWD\'s brief now calls it a sector. The ribbon is in the glove box.',
    left: s('Fill the crater. Keep the old name.', { khazana: -8, janta: 8, kursi: -4 }),
    right: s('Inaugurate the hover sector.', { kursi: 8, janta: -2, kanoon: -6 }, { set: ['hover'], queue: [['sector_due', 2]] })
  },
  {
    id: 'hologram',
    era: 'later',
    minTerm: 1,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'I can stand your face in four hundred cities tonight. The mouth arrives three seconds late. One city still has a wooden stage with you on it.',
    left: s('Speak in one city, yourself.', { janta: 4, kursi: -6 }),
    right: s('Send four hundred. Keep the lag.', { janta: 6, kursi: 6, kanoon: -6 }, { set: ['hologram'] })
  },
  {
    id: 'seventh',
    era: 'later',
    minTerm: 1,
    face: 'lalaji',
    speaker: 'Aditya Singhania',
    role: 'Tenders and cement',
    text: 'Seventh ribbon on the same metro. The first six were historic too. The rake moves when two interns shove it, cameras off.',
    left: s('Shove it off-camera. Skip the ribbon.', { kanoon: 6, kursi: -4, khazana: -2 }),
    right: s('Cut a seventh. Invite the rest.', { kursi: 8, janta: 2, kanoon: -4, khazana: -4 })
  },
  {
    id: 'mars_stone',
    era: 'later',
    minTerm: 2,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: "The dome is too small for the statue. The engineer's note is one line. Raising the dome keeps that note out of the file.",
    left: s('Shrink the statue. Keep the note.', { kanoon: 6, khazana: -4, kursi: -4 }),
    right: s('Raise the dome. Lose the note.', { khazana: -8, kursi: 8, kanoon: -6 })
  },
  {
    id: 'noon_model',
    era: 'later',
    minTerm: 1,
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'At noon a model read your speech. She was clearer than you. My producer wants the writer fired and the applause left on your name.',
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
    text: 'Notes are finished. UPI wants a code and this stall has no signal. A coin still works. The circular will not, not before the tea is cold.',
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
    text: 'The river is still a drain. The LEDs are on, so at night it looks finished. I have footage, not water. The board I was told to order says riverfront.',
    left: s('Lights off. Fund the interceptor.', { khazana: -8, janta: 6, kanoon: 4, kursi: -4 }),
    right: s('Caption the footage riverfront.', { janta: 2, kursi: 6, kanoon: -6 })
  },
  {
    id: 'generator',
    era: 'later',
    minTerm: 2,
    face: 'envoy',
    speaker: 'The envoy',
    role: 'Trade draft',
    text: 'The climate paper is ready for a signature. The stage generator is louder than the speech. The same ministry hired the generator and wrote the paper.',
    left: s('Sign it. Kill the generator.', { kanoon: 6, kursi: -4, khazana: 2 }),
    right: s('Sign over the generator noise.', { kursi: 6, kanoon: -6, khazana: -4, janta: -2 })
  },
  {
    id: 'buffer',
    era: 'later',
    minTerm: 3,
    face: 'mausi',
    speaker: 'Aunty',
    role: 'Party treasurer',
    text: 'Your nephew is a year-long consultant on a PSU retainer. He freezes when he must say thank you. The chairman stamp is the same one as last time.',
    left: s('Cancel the retainer.', { kursi: -8, kanoon: 6, khazana: 4 }),
    right: s('Stamp him chairman.', { kursi: 8, kanoon: -8, khazana: -8 }, { set: ['nephew'] })
  },
  {
    id: 'crater',
    era: 'later',
    minTerm: 2,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'A lunar crater has no name. One of your schemes has no outcome. The naming file is on my desk. The moon will not file a PIL.',
    left: s('Leave the crater unnamed.', { kanoon: 4, kursi: -4 }),
    right: s('Gazette the scheme name on it.', { kursi: 8, janta: 2, kanoon: -6 })
  },
  {
    id: 'blink',
    era: 'later',
    minTerm: 2,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: "I can put Aunty's face on the budget speech. She blinks on every comma. People trust a blink more than the CSO table. The table is in the other file.",
    left: s('Send Aunty with the real table.', { kanoon: 6, kursi: -4 }),
    right: s('Let the blink run the speech.', { janta: 2, kursi: 6, kanoon: -8 })
  },
  {
    id: 'robot_bill',
    era: 'later',
    minTerm: 2,
    face: 'kisan',
    speaker: 'The farmer',
    role: 'Farmer union',
    text: 'The subsidy arrived as a notification. It cannot be eaten. The field robot billed us again. The union is in the lane with the second invoice.',
    left: s('Pay the union. Ground the robot.', { khazana: -8, janta: 8, kursi: -4 }, { set: ['bill_cut'] }),
    right: s('Call the robot the reform.', { janta: -8, kursi: 6, kanoon: -4 })
  },
  {
    id: 'weightless',
    era: 'later',
    minTerm: 3,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Gravity failed in the new colony. The committee I formed is floating with it. An engineer is on the ground floor. The work order is unsigned.',
    left: s('Sign the engineer down.', { kanoon: 8, kursi: -4, khazana: -4 }),
    right: s('Keep them up for the still.', { kursi: 6, janta: -4, kanoon: -6 })
  },
  {
    id: 'two_clocks',
    era: 'later',
    minTerm: 2,
    face: 'netaji',
    speaker: 'Netaji',
    role: 'Twelve MPs',
    text: "Two clocks were printed for your rally. One is IST. One is mine, so you arrive while my twelve are still in their seats. They do not wait.",
    left: s("Run IST. Let them wait.", { kursi: -6, kanoon: 6 }),
    right: s('Run both. Call the gap a mood.', { janta: 2, kursi: 6, kanoon: -6 })
  },
  {
    id: 'blame_later',
    era: 'later',
    minTerm: 2,
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'A meteor took the ribbon tent. The graphic on the stream already shows the last century holding the rock.',
    left: s('Call it a rock. Kill the plate.', { kanoon: 4, kursi: -6 }),
    right: s('Leave the last century on it.', { janta: 2, kursi: 8, kanoon: -6 })
  },
  {
    id: 'convoy_later',
    era: 'later',
    minTerm: 1,
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Your holograms are standing in the sky lane. A medical drone is blinking red behind them. The frame is on the hologram. The drone is not.',
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
    text: 'The old voice note landed again. Same tiger, before breakfast. It is queued for the dome before dinner. Legal still has not seen it.',
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
    text: 'Three of you are trending: the tiger, the noon speech, and the late hologram. The two extras are still on the payroll. The salary file is unsigned.',
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
    text: 'The chair can outlast the body. A bulb carries the smile and blinks when the invoice clears. The socket is empty. High Command wants the bulb seated.',
    left: s('Switch it off. Go home.', {}, { ending: 'tea' }),
    right: s('Seat the bulb. Keep the invoice.', { kursi: 8, janta: -4, kanoon: -6 }, { set: ['bulb'] })
  },
  {
    id: 'names_due',
    era: 'any',
    queueOnly: true,
    need: ['troll_voice'],
    face: 'chintu',
    speaker: 'Chintu',
    role: 'Party socials',
    text: 'Ramesh was not on the list you read. His son is outside on a live stream and he has not stopped. High Command says the list was complete.',
    left: s('Add Ramesh on camera.', { janta: 6, kursi: -6 }),
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
    text: 'The date you gazetted has arrived. The drain has not. News is running your date next to the same puddle. I can move the date in the file.',
    left: s('Say the drain was never built.', { janta: -4, kanoon: 8, kursi: -4 }),
    right: s('Move the date in the gazette.', { kursi: 4, kanoon: -6, janta: -4 })
  },
  {
    id: 'hole_due',
    era: 'any',
    queueOnly: true,
    need: ['renamed'],
    face: 'pinky',
    speaker: 'Pinky',
    role: 'Fixer',
    text: 'The new name is on the board. This morning that crater took a scooter. The painter is still on the clock with room for one more line.',
    left: s('Fill the crater today.', { khazana: -8, janta: 6, kursi: -4 }),
    right: s('Stencil my name on the crater.', { kursi: 6, janta: -8, kanoon: -4 })
  },
  {
    id: 'clip_due',
    era: 'any',
    queueOnly: true,
    need: ['broom'],
    face: 'nandini',
    speaker: 'Nandini',
    role: 'Prime-time anchor',
    text: 'The broom clip is on every channel. The sanitation tender is still sitting. My producer wants another week of the same clip.',
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
    text: 'The new name is printed on the cylinder. There is no gas in it. A function for a third name is already booked and the caterer has been paid.',
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
    text: 'The dragged scooter is on every channel. The bridge still will not take its weight. Legal notices against those channels are drafted.',
    left: s('Open the bridge for real.', { khazana: -8, janta: 6, kursi: -6 }),
    right: s('Send the legal notices.', { kursi: 6, kanoon: -8, janta: -4 })
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
    left: s('Admit it was weather.', { kanoon: 6, kursi: -6, janta: 2 }),
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
    text: 'The deed is registered and the wall is up. Thursday\'s live needs the parking deed next. The crowd is already standing outside that wall.',
    left: s('No second deed. Cancel the live.', { kursi: -6, kanoon: 6, janta: -6 }),
    right: s('Sign the parking deed too.', { janta: 4, kursi: 6, kanoon: -8, khazana: -6 })
  },
  {
    id: 'poem_due',
    era: 'any',
    queueOnly: true,
    need: ['couplet'],
    face: 'justice',
    speaker: 'Justice Rao',
    role: 'Show-cause notices',
    text: 'The poem PIL has reached my list. More people can recite the couplet than your speech. Your office has sent a request for a second case.',
    left: s('Withdraw the PIL.', { kanoon: 6, kursi: -4, janta: 2 }),
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
    text: "That one line from eight o'clock is the only clip my producers will run. The other side has been reading it since morning. The office wants a misquote.",
    left: s('Stand by the line.', { kanoon: 6, janta: 4, kursi: -4 }),
    right: s('Call it a misquote on air.', { kursi: 4, kanoon: -6, janta: -6 })
  },
  {
    id: 'vent_due',
    era: 'any',
    queueOnly: true,
    need: ['dome_face'],
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'Your face is on the dome and it is covering the oxygen vent. The hospital bill for that hour is filed under a different head.',
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
    text: 'The hover is inaugurated. The hanging crater still will not take a scooter. A second sector is in the brief, with its own ribbon.',
    left: s('Bring it down and fill it.', { khazana: -8, janta: 6, kursi: -4 }),
    right: s('Cut a ribbon on sector two.', { kursi: 6, janta: -4, kanoon: -6, khazana: -4 })
  },
  {
    id: 'hole_flip',
    era: 'later',
    spine: true,
    need: ['crossed', 'renamed'],
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'The year flipped. So did the road\'s name. The same crater hangs under the new board. The ribbon for it is in the truck.',
    left: s('It is the same crater. Fill it.', { khazana: -8, janta: 8, kursi: -4 }),
    right: s('Cut the ribbon. Leave the crater.', { kursi: 8, janta: -4, kanoon: -4 }, { set: ['hover'], queue: [['sector_due', 2]] })
  },
  {
    id: 'bridge_flip',
    era: 'later',
    spine: true,
    need: ['crossed', 'ribbon'],
    face: 'captain',
    speaker: 'Captain',
    role: 'Dome and convoys',
    text: 'The year flipped. The bridge where a scooter was dragged is in the air now. The scooter still does not run. A second ribbon is packed.',
    left: s('Certify the bridge. No ribbon.', { khazana: -8, janta: 8, kursi: -4 }),
    right: s('Cut again. Drag the scooter again.', { kursi: 8, janta: -4, kanoon: -6 })
  },
  {
    id: 'fill_power',
    era: 'now',
    repeat: true,
    weight: 1,
    face: 'hakim',
    speaker: 'Hakim',
    role: 'Cabinet secretary',
    text: 'Between four and five the cabinet lights die. That is your usual hour. There is a candle. The press note I was handed says we waited for the tube.',
    left: s('Decide in the dark. Keep it small.', { kanoon: 4, kursi: -2 }),
    right: s('Wait for the tube. Send the note.', { kursi: 4, janta: -2, kanoon: -2 })
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
    text: 'The match has stopped for rain. The country is watching a tarpaulin. A thank-you to the rain is drafted, ahead of the other party.',
    left: s('Stay off the feed.', { kanoon: 2, kursi: -2 }),
    right: s('Thank the rain. Post it first.', { janta: 2, kursi: 4, kanoon: -2 })
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
    left: s('Change the biscuit. No press.', { khazana: -4, janta: 4, kursi: -2 }),
    right: s('Charge heritage rates for it.', { kursi: 4, janta: -4, khazana: 4 })
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
    text: 'Your condolence arrived three seconds late, then again, then a third time. The loop is cut. The office wants the repeats described as grief.',
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
    text: 'Oxygen is on the bill again. The rally drew more of it than the hospital wing. The hospital line is marked. The rally line was shifted under another head.',
    left: s('Pay the hospital first.', { khazana: -6, janta: 4, kursi: -4 }),
    right: s('Keep the rally under that head.', { kursi: 4, janta: -4, kanoon: -4 })
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
