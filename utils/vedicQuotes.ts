/**
 * Hero quotes: short, well-attested lines from the Vedas, the Upanishads and
 * the Gita. English is a plain modern rendering; the Sanskrit is IAST. Each
 * carries the verse it comes from. The first entry is the one the server
 * renders, so the page is identical for every first paint.
 */
export interface VedicQuote { en: string; src: string; sa: string }

export const VEDIC_QUOTES: readonly VedicQuote[] = [
  { en: 'The sun is the soul of all that moves and all that stands still.', src: 'Rig Veda 1.115.1', sa: 'sūrya ātmā jagatas tasthuṣaś ca' },
  { en: 'Let noble thoughts come to us from every side.', src: 'Rig Veda 1.89.1', sa: 'ā no bhadrāḥ kratavo yantu viśvataḥ' },
  { en: 'Truth is one; the wise speak of it in many ways.', src: 'Rig Veda 1.164.46', sa: 'ekaṃ sad viprā bahudhā vadanti' },
  { en: 'We meditate on the radiant light of the divine sun. May it awaken our minds.', src: 'Rig Veda 3.62.10', sa: 'tat savitur vareṇyaṃ bhargo devasya dhīmahi' },
  { en: 'His rays carry up the all-knowing sun, that every creature may see.', src: 'Rig Veda 1.50.1', sa: 'ud u tyaṃ jātavedasaṃ devaṃ vahanti ketavaḥ' },
  { en: 'Who truly knows? Who can say where this creation came from?', src: 'Rig Veda 10.129.6', sa: 'ko addhā veda ka iha pra vocat' },
  { en: 'Let us move together, speak together, and let our minds be one.', src: 'Rig Veda 10.191.2', sa: 'saṃ gacchadhvaṃ saṃ vadadhvaṃ saṃ vo manāṃsi jānatām' },
  { en: 'May all beings look upon me with the eye of a friend.', src: 'Yajur Veda 36.18', sa: 'mitrasya mā cakṣuṣā sarvāṇi bhūtāni samīkṣantām' },
  { en: 'May my mind hold only good and gentle resolve.', src: 'Yajur Veda 34.1', sa: 'tan me manaḥ śivasaṅkalpam astu' },
  { en: 'May we see a hundred autumns. May we live a hundred autumns.', src: 'Yajur Veda 36.24', sa: 'paśyema śaradaḥ śataṃ jīvema śaradaḥ śatam' },
  { en: 'All that moves in this moving world is wrapped in the divine.', src: 'Isha Upanishad 1 (Yajur Veda 40.1)', sa: 'īśāvāsyam idaṃ sarvaṃ yat kiñca jagatyāṃ jagat' },
  { en: 'The face of truth is veiled by a golden disc. Unveil it, O Sun, that I may see.', src: 'Isha Upanishad 15', sa: 'hiraṇmayena pātreṇa satyasyāpihitaṃ mukham' },
  { en: 'Come, Agni, to the feast, hymned and welcomed, to carry our offerings.', src: 'Sama Veda 1.1', sa: 'agna ā yāhi vītaye gṛṇāno havyadātaye' },
  { en: 'The earth is my mother; I am her child.', src: 'Atharva Veda 12.1.12', sa: 'mātā bhūmiḥ putro ’haṃ pṛthivyāḥ' },
  { en: 'I make your hearts one, your minds in harmony, free of hatred.', src: 'Atharva Veda 3.30.1', sa: 'sahṛdayaṃ sāmanasyam avidveṣaṃ kṛṇomi vaḥ' },
  { en: 'Truth, order, discipline, austerity and knowledge uphold the earth.', src: 'Atharva Veda 12.1.1', sa: 'satyaṃ bṛhad ṛtam ugraṃ dīkṣā tapo brahma' },
  { en: 'Lead me from the unreal to the real, from darkness to light.', src: 'Brihadaranyaka Upanishad 1.3.28', sa: 'asato mā sad gamaya, tamaso mā jyotir gamaya' },
  { en: 'Truth alone prevails, never falsehood.', src: 'Mundaka Upanishad 3.1.6', sa: 'satyam eva jayate nānṛtam' },
  { en: 'Arise, awake; seek out the wise and learn.', src: 'Katha Upanishad 1.3.14', sa: 'uttiṣṭhata jāgrata prāpya varān nibodhata' },
  { en: 'May our learning shine, and may we never quarrel.', src: 'Katha Upanishad, peace invocation', sa: 'tejasvi nāv adhītam astu mā vidviṣāvahai' },
  { en: 'Speak the truth. Walk the right path. Never neglect your own learning.', src: 'Taittiriya Upanishad 1.11.1', sa: 'satyaṃ vada, dharmaṃ cara, svādhyāyān mā pramadaḥ' },
  { en: 'Revere your mother, your father, your teacher, your guest.', src: 'Taittiriya Upanishad 1.11.2', sa: 'mātṛdevo bhava, pitṛdevo bhava, ācāryadevo bhava' },
  { en: 'That you are.', src: 'Chandogya Upanishad 6.8.7', sa: 'tat tvam asi' },
  { en: 'All this, truly, is Brahman.', src: 'Chandogya Upanishad 3.14.1', sa: 'sarvaṃ khalv idaṃ brahma' },
  { en: 'I am Brahman, the boundless.', src: 'Brihadaranyaka Upanishad 1.4.10', sa: 'aham brahmāsmi' },
  { en: 'Yours is the right to act, never to the fruits of action.', src: 'Bhagavad Gita 2.47', sa: 'karmaṇy evādhikāras te mā phaleṣu kadācana' },
  { en: 'Lift yourself by your own effort; never let yourself sink.', src: 'Bhagavad Gita 6.5', sa: 'uddhared ātmanātmānaṃ nātmānam avasādayet' },
  { en: 'Nothing in this world purifies like knowledge.', src: 'Bhagavad Gita 4.38', sa: 'na hi jñānena sadṛśaṃ pavitram iha vidyate' }
]
