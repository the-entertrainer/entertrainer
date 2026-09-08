/**
 * Home rotating lines — authentic classical Sanskrit (IAST romanization).
 * Well-known traditional phrases only; not modern paraphrases.
 */

export const KNOWLEDGE_QUOTES: readonly string[] = [
  // Mundaka Upanishad 3.1.6
  'satyam eva jayate',
  // Maha Upanishad / Hitopadesha
  'vasudhaiva kuṭumbakam',
  // Bhagavad Gita 2.50
  'yogaḥ karmasu kauśalam',
  // Bṛhadāraṇyaka Upanishad 1.3.28
  'tamaso mā jyotir gamaya',
  // Bṛhadāraṇyaka Upanishad 1.3.28
  'asato mā sad gamaya',
  // Bṛhadāraṇyaka Upanishad 1.3.28
  'mṛtyor mā amṛtaṃ gamaya',
  // Bṛhadāraṇyaka Upanishad 1.4.10
  'ahaṃ brahmāsmi',
  // Chāndogya Upanishad 6.8.7
  'tat tvam asi',
  // Aitareya Upanishad 3.3
  'prajñānaṃ brahma',
  // Māṇḍūkya Upanishad 2
  'ayam ātmā brahma',
  // Chāndogya Upanishad 3.14.1
  'sarvaṃ khalv idaṃ brahma',
  // Īśā Upanishad 1
  'īśāvāsyam idaṃ sarvam',
  // Bhagavad Gita 2.47
  'karmaṇy evādhikāras te mā phaleṣu kadācana',
  // Bhagavad Gita 2.48
  'yogasthaḥ kuru karmāṇi',
  // Bhagavad Gita 6.5
  'uddhared ātmanātmānaṃ',
  // Bhagavad Gita 4.39
  'śraddhāvān labhate jñānam',
  // Bhagavad Gita 4.38
  'na hi jñānena sadṛśaṃ pavitram iha vidyate',
  // Bhagavad Gita 2.23
  'nainaṃ chindanti śastrāṇi',
  // Bhagavad Gita 3.35
  'śreyān svadharmo viguṇaḥ',
  // Mahābhārata (traditional maxim)
  'ahiṃsā paramo dharmaḥ',
  // Hitopadeśa / traditional
  'vidyā dadāti vinayam',
  // Traditional maṅgala / peace invocation
  'sarve bhavantu sukhinaḥ',
  // Traditional continuation of the peace invocation
  'sarve santu nirāmayāḥ',
  // Ṛgveda 1.164.46
  'ekaṃ sad viprā bahudhā vadanti',
  // Taittirīya Upanishad 1.11.1
  'satyaṃ vada dharmaṃ cara',
  // Taittirīya Upanishad 1.11.2
  'mātṛdevo bhava',
  // Taittirīya Upanishad 1.11.2
  'pitṛdevo bhava',
  // Taittirīya Upanishad 1.11.2
  'ācāryadevo bhava',
  // Manusmṛti 3.56
  'yatra nāryas tu pūjyante ramante tatra devatāḥ',
  // Viṣṇu Purāṇa (traditional)
  'sā vidyā yā vimuktaye',
  // Īśā / Bṛhadāraṇyaka śānti mantra
  'oṃ pūrṇam adaḥ pūrṇam idam',
  // Taittirīya śānti mantra
  'saha nāv avatu',
  // Traditional proverb (subhāṣita)
  'paropakārāya phalanti vṛkṣāḥ',
  // Bhagavad Gita 2.38
  'sukha-duḥkhe same kṛtvā',
  // Bhagavad Gita 6.29 (essence line traditionally cited)
  'sarva-bhūtastham ātmānaṃ',
  // Bhagavad Gita 18.66 (traditional citation)
  'sarva-dharmān parityajya',
  // Hitopadeśa / Pañcatantra tradition
  'udyamaṃ sāhasaṃ dhairyam',
  // Subhāṣita tradition
  'vinayaṃ bhūṣaṇaṃ satām',
  // Traditional maxim on speech
  'satyaṃ brūyāt priyaṃ brūyāt',
  // Kaṭha Upanishad 1.3.14
  'uttiṣṭhata jāgrata',
] as const

export function pickKnowledgeQuote(seed?: number): string {
  if (!KNOWLEDGE_QUOTES.length) return ''
  const i = seed == null
    ? Math.floor(Math.random() * KNOWLEDGE_QUOTES.length)
    : Math.abs(Math.floor(seed)) % KNOWLEDGE_QUOTES.length
  return KNOWLEDGE_QUOTES[i]!
}
